/**
 * Browser environment & In-App Browser (IAB) utility
 *
 * Detects whether the user is viewing the application inside a restricted
 * WebView or in-app browser (such as Instagram, Facebook, TikTok, LinkedIn, Twitter/X).
 *
 * In-app browsers operate inside isolated sandboxes that:
 * 1. Do not share cookies or saved Google credentials with system browsers (Chrome/Safari).
 * 2. Often block or restrict OAuth 2.0 popups and redirects (Google Disallowed User-Agent policy).
 * 3. Clear localStorage and session cookies when the in-app view is closed.
 */

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /Instagram|FBAN|FBAV|Line|Twitter|Snapchat|MicroMessenger|musical_ly|ByteLocale|TikTok|LinkedInApp/i.test(ua);
}

export function getInAppBrowserName(): string | null {
  if (typeof window === 'undefined' || !navigator) return null;
  const ua = navigator.userAgent || '';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook';
  if (/TikTok|musical_ly|ByteLocale/i.test(ua)) return 'TikTok';
  if (/Twitter|TwitterAndroid|TwitteriPhone/i.test(ua)) return 'Twitter / X';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/Line/i.test(ua)) return 'Line';
  return isInAppBrowser() ? 'In-App Browser' : null;
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  return /Android/i.test(navigator.userAgent || '');
}

export function isIOS(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

/**
 * Generates an intent link on Android to escape the in-app browser and open in Chrome directly.
 */
export function getChromeIntentUrl(targetUrl: string): string {
  try {
    const url = new URL(targetUrl);
    const hostAndPath = `${url.host}${url.pathname}${url.search}${url.hash}`;
    return `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end`;
  } catch {
    return targetUrl;
  }
}
