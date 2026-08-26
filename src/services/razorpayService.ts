import { supabase } from '../lib/supabase';
import { DbSubscription } from '../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically loads the official Razorpay Checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: { full_name?: string };
  };
  onSuccess: (data: DbSubscription) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Initiates Razorpay Test Mode Subscription Flow:
 * 1. Calls server POST /api/payments/create-subscription to get subscription_id & key_id
 * 2. Launches Razorpay modal with subscription_id
 * 3. On payment completion, calls server POST /api/payments/verify-subscription
 * 4. Updates database state and returns verified DbSubscription
 */
export async function startRazorpaySubscription({
  user,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutOptions): Promise<void> {
  try {
    // 1. Get Supabase auth session token for authorized server request
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    // 2. Request backend to create Razorpay subscription
    const createRes = await fetch('/api/payments/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
      throw new Error(createData.error || 'Failed to create Razorpay subscription session');
    }

    const {
      subscription_id,
      key_id,
      amount = 12900,
      currency = 'INR',
      name = 'LEVELUP',
      description = 'LEVELUP PRO Subscription (₹129/month)',
      is_test_simulation = false,
    } = createData;

    // 3. If in test simulation mode (e.g. Razorpay keys not yet set in environment)
    if (is_test_simulation) {
      console.info('[Razorpay Test Mode] Simulating test payment completion...');
      
      const verifyRes = await fetch('/api/payments/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_subscription_id: subscription_id,
          razorpay_signature: `sig_sim_${Date.now()}`,
          is_simulation: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Failed to verify simulated subscription');
      }

      onSuccess(verifyData.data);
      return;
    }

    // 4. Load Razorpay Checkout SDK
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !window.Razorpay) {
      throw new Error('Razorpay Checkout SDK could not be loaded. Please check your internet connection.');
    }

    // 5. Open Razorpay Checkout modal for recurring subscription
    // Note: For Razorpay Subscriptions, amount and interval are dictated by subscription_id / plan_id
    const options: any = {
      key: key_id,
      subscription_id: subscription_id,
      name: name,
      description: description,
      image: '/icon.png',
      currency: currency,
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      },
      notes: {
        user_id: user.id,
      },
      theme: {
        color: '#2e6930', // LEVELUP primary forest green
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_subscription_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 6. Verify signature on backend
          const verifyRes = await fetch('/api/payments/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              userId: user.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Razorpay subscription signature verification failed');
          }

          onSuccess(verifyData.data);
        } catch (verifyErr: any) {
          console.error('[Razorpay Verification Error]', verifyErr);
          onError(verifyErr.message || 'Verification failed after payment');
        }
      },
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on('payment.failed', (response: any) => {
      console.error('[Razorpay Payment Failed]', response.error);
      onError(response.error?.description || 'Payment was unsuccessful. Please try again.');
    });

    rzpInstance.open();
  } catch (err: any) {
    console.error('[Razorpay Checkout Exception]', err);
    onError(err.message || 'An error occurred during Razorpay checkout initialization');
  }
}
