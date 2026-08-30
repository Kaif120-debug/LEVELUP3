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
    user_metadata?: { full_name?: string; phone?: string };
  };
  name?: string;
  email?: string;
  contact?: string;
  vpa?: string;
  method?: 'upi' | 'card' | 'netbanking';
  onSuccess: (data: DbSubscription) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Safely executes a fetch request and parses JSON or returns a clean descriptive error
 * without throwing "Unexpected end of JSON input".
 */
async function safeApiRequest<T = any>(
  url: string,
  options: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, options);
    const rawText = await res.text();
    let parsed: any = null;

    if (rawText && rawText.trim()) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }
    }

    if (!res.ok) {
      const serverErrMsg =
        parsed?.error ||
        parsed?.message ||
        (res.status === 404
          ? `API endpoint (${url}) was not found (404). Please ensure backend routes are deployed.`
          : res.status === 500
          ? `Server error (500) while processing payment request.`
          : `Payment request failed with status ${res.status}`);
      return { ok: false, status: res.status, data: parsed, error: serverErrMsg };
    }

    if (!parsed) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `Server returned an empty or invalid response from ${url}`,
      };
    }

    return { ok: true, status: res.status, data: parsed };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: netErr?.message || 'Network connection failed during payment request',
    };
  }
}

/**
 * Initiates Razorpay Live Mode Subscription Flow:
 * 1. Calls server POST /api/payment/create-subscription to get live subscription_id & live key_id
 * 2. Launches official Razorpay Checkout modal for recurring subscription (UPI Autopay, UPI QR, Cards, Net Banking)
 * 3. On payment authorization, sends signatures to server POST /api/payment/verify-subscription
 * 4. Updates Supabase subscription state and returns verified DbSubscription
 */
export async function startRazorpaySubscription({
  user,
  name: customName,
  email: customEmail,
  contact: customContact,
  vpa: customVpa,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutOptions): Promise<void> {
  try {
    // 1. Get Supabase auth session token for authorized server request
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const effectiveName = customName || user.user_metadata?.full_name || '';
    const effectiveEmail = customEmail || user.email || '';
    const effectiveContact = customContact || user.user_metadata?.phone || '';

    // 2. Request backend to create live Razorpay subscription
    let createResult = await safeApiRequest<{
      success: boolean;
      subscription_id: string;
      key_id: string;
      currency?: string;
      name?: string;
      description?: string;
      error?: string;
    }>('/api/payment/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: user.id,
        email: effectiveEmail,
        name: effectiveName,
      }),
    });

    if (!createResult.ok && createResult.status === 404) {
      // Fallback to /api/payments/create-subscription if needed
      createResult = await safeApiRequest<{
        success: boolean;
        subscription_id: string;
        key_id: string;
        currency?: string;
        name?: string;
        description?: string;
        error?: string;
      }>('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          email: effectiveEmail,
          name: effectiveName,
        }),
      });
    }

    if (!createResult.ok || !createResult.data?.success || !createResult.data?.subscription_id) {
      throw new Error(createResult.error || createResult.data?.error || 'Failed to create Razorpay subscription session');
    }

    const {
      subscription_id,
      key_id,
      currency = 'INR',
      name = 'LEVELUP',
      description = 'LEVELUP PRO Subscription (₹129/month)',
    } = createResult.data;

    // 3. Load Razorpay Checkout SDK
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !window.Razorpay) {
      throw new Error('Razorpay Checkout SDK could not be loaded. Please check your internet connection.');
    }

    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : undefined;

    // 4. Open Razorpay Checkout modal in LIVE mode for recurring subscription
    // Per Razorpay Subscriptions documentation:
    // When subscription_id is provided, plan details, amount, and currency are derived directly from subscription_id.
    // Razorpay standard checkout dynamically renders UPI Autopay (GPay, PhonePe, Paytm, BHIM, UPI QR mandate), Cards, and Net Banking.
    const options: any = {
      key: key_id,
      subscription_id: subscription_id,
      name: name || 'LEVELUP',
      description: description || 'LEVELUP PRO Subscription (₹129/month)',
      ...(logoUrl ? { image: logoUrl } : {}),
      prefill: {
        ...(effectiveName ? { name: effectiveName } : {}),
        ...(effectiveEmail ? { email: effectiveEmail } : {}),
        ...(effectiveContact ? { contact: effectiveContact } : {}),
      },
      notes: {
        user_id: user.id,
      },
      theme: {
        color: '#2e6930', // LEVELUP primary forest green
      },
      modal: {
        confirm_close: true,
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
          // 5. Verify HMAC SHA-256 signature on backend (Live Secret verification)
          let verifyResult = await safeApiRequest<{
            success: boolean;
            data: DbSubscription;
            error?: string;
          }>('/api/payment/verify-subscription', {
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

          if (!verifyResult.ok && verifyResult.status === 404) {
            verifyResult = await safeApiRequest<{
              success: boolean;
              data: DbSubscription;
              error?: string;
            }>('/api/payments/verify-subscription', {
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
          }

          if (!verifyResult.ok || !verifyResult.data?.success) {
            throw new Error(verifyResult.error || verifyResult.data?.error || 'Razorpay subscription signature verification failed');
          }

          const subscriptionPayload: DbSubscription = (verifyResult.data?.data as DbSubscription) || {
            id: `sub_${Date.now()}`,
            user_id: user.id,
            plan: 'pro',
            plan_tier: 'pro',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            cancel_at_period_end: false,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // 6. Guarantee Client-Side Authenticated Supabase Write (bypasses server RLS boundary)
          try {
            await supabase.from('subscriptions').upsert({
              user_id: user.id,
              plan: 'pro',
              status: 'active',
              started_at: subscriptionPayload.started_at || new Date().toISOString(),
            });
          } catch (clientWriteErr) {
            console.warn('[Client Subscriptions Upsert Note]', clientWriteErr);
          }

          onSuccess(subscriptionPayload);
        } catch (verifyErr: any) {
          console.error('[Razorpay Live Verification Error]', verifyErr);
          onError(verifyErr.message || 'Verification failed after payment');
        }
      },
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on('payment.failed', (response: any) => {
      console.error('[Razorpay Payment Failed]', response.error);
      onError(response.error?.description || response.error?.reason || 'Payment was unsuccessful. Please try again.');
    });

    rzpInstance.open();
  } catch (err: any) {
    console.error('[Razorpay Checkout Exception]', err);
    onError(err.message || 'An error occurred during Razorpay checkout initialization');
  }
}

/**
 * Reconcile an existing captured Razorpay payment with the current authenticated user.
 * Queries Razorpay API directly using live server credentials to safely recover Pro status.
 */
export async function reconcileUserPayment(params?: {
  userId?: string;
  email?: string;
  paymentId?: string;
  subscriptionId?: string;
}): Promise<{
  success: boolean;
  reconciled?: boolean;
  alreadyActive?: boolean;
  data?: DbSubscription;
  error?: string;
}> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const authUser = sessionData?.session?.user;

    const effectiveUserId = params?.userId || authUser?.id;
    const effectiveEmail = params?.email || authUser?.email;

    if (!effectiveUserId) {
      return { success: false, error: 'User must be authenticated to reconcile payment' };
    }

    let reconcileResult = await safeApiRequest<{
      success: boolean;
      reconciled?: boolean;
      alreadyActive?: boolean;
      data?: DbSubscription;
      error?: string;
      message?: string;
    }>('/api/payment/reconcile-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        email: effectiveEmail,
        paymentId: params?.paymentId,
        subscriptionId: params?.subscriptionId,
      }),
    });

    if (!reconcileResult.ok && reconcileResult.status === 404) {
      reconcileResult = await safeApiRequest<{
        success: boolean;
        reconciled?: boolean;
        alreadyActive?: boolean;
        data?: DbSubscription;
        error?: string;
        message?: string;
      }>('/api/subscription/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          email: effectiveEmail,
          paymentId: params?.paymentId,
          subscriptionId: params?.subscriptionId,
        }),
      });
    }

    if (!reconcileResult.ok || !reconcileResult.data?.success) {
      return {
        success: false,
        error: reconcileResult.error || reconcileResult.data?.error || 'No captured payment found to reconcile',
      };
    }

    const subData = reconcileResult.data.data;

    // Guarantee client-side write to Supabase if reconciled
    if (subData && effectiveUserId) {
      try {
        await supabase.from('subscriptions').upsert({
          user_id: effectiveUserId,
          plan: 'pro',
          status: 'active',
          started_at: subData.started_at || new Date().toISOString(),
        });
      } catch (upsertErr) {
        console.warn('[Reconcile Client DB Upsert Note]', upsertErr);
      }
    }

    return {
      success: true,
      reconciled: reconcileResult.data.reconciled,
      alreadyActive: reconcileResult.data.alreadyActive,
      data: subData,
    };
  } catch (err: any) {
    console.error('[Reconcile Payment Exception]', err);
    return { success: false, error: err.message || 'Payment reconciliation failed' };
  }
}

