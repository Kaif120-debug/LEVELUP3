/**
 * LEVELUP Conversion Analytics Utility
 *
 * Privacy-conscious event tracker for conversion funnel analysis.
 * Automatically forwards events to Meta Pixel (already configured on index.html)
 * and maintains an anonymous in-session log for local conversion inspection.
 *
 * Does NOT collect passwords, tokens, or private identifiable information.
 */

export type ConversionEventName =
  | 'homepage_visit'
  | 'feature_section_viewed'
  | 'product_demo_tab_changed'
  | 'signup_button_clicked'
  | 'signup_form_opened'
  | 'signup_submitted'
  | 'signup_successful'
  | 'signup_failed'
  | 'email_verification_sent'
  | 'email_verification_completed'
  | 'first_dashboard_visit'
  | 'pricing_section_viewed'
  | 'checkout_initiated';

interface AnalyticsPayload {
  source?: string;
  section?: string;
  category?: string;
  mode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

const STORAGE_KEY = 'levelup_analytics_events';
const MAX_LOGS = 100;

// Helper to safely access window.fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    getLevelupAnalytics?: () => Array<{ event: string; timestamp: string; payload?: AnalyticsPayload }>;
    clearLevelupAnalytics?: () => void;
  }
}

export function trackEvent(event: ConversionEventName, payload?: AnalyticsPayload): void {
  try {
    const timestamp = new Date().toISOString();
    
    // 1. Meta Pixel Forwarding (Optimizes Instagram Ads & Reels link tracking)
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      switch (event) {
        case 'homepage_visit':
          window.fbq('track', 'PageView');
          break;
        case 'signup_button_clicked':
          window.fbq('trackCustom', 'SignupButtonClicked', { ...payload });
          break;
        case 'signup_form_opened':
          window.fbq('trackCustom', 'SignupFormOpened', { ...payload });
          break;
        case 'signup_submitted':
          window.fbq('trackCustom', 'SignupSubmitted');
          break;
        case 'signup_successful':
          window.fbq('track', 'CompleteRegistration', { status: 'success' });
          break;
        case 'email_verification_sent':
          window.fbq('track', 'Lead', { step: 'email_verification' });
          break;
        case 'checkout_initiated':
          window.fbq('track', 'InitiateCheckout', { value: 129, currency: 'INR' });
          break;
        case 'feature_section_viewed':
          window.fbq('track', 'ViewContent', { content_name: payload?.category || 'features' });
          break;
        default:
          window.fbq('trackCustom', event, payload);
          break;
      }
    }

    // 2. Local anonymous session storage for debugging & funnel verification
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list: Array<{ event: string; timestamp: string; payload?: AnalyticsPayload }> = raw ? JSON.parse(raw) : [];
        list.push({ event, timestamp, payload });
        if (list.length > MAX_LOGS) {
          list.shift();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        // Ignore storage quotas / disabled localStorage
      }
    }
  } catch (err) {
    // Non-blocking
    console.debug('Analytics event dropped:', err);
  }
}

// Window helper for easy inspection in dev tools
if (typeof window !== 'undefined') {
  window.getLevelupAnalytics = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  window.clearLevelupAnalytics = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  };
}
