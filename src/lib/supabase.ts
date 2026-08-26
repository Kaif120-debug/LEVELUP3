import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

/**
 * Normalizes and sanitizes Supabase project URLs.
 * Handles cases where a user pastes their project dashboard link
 * (e.g., https://supabase.com/dashboard/project/xyz) instead of the API endpoint.
 */
export function formatSupabaseUrl(raw: string): string {
  if (!raw) return '';
  let url = raw.trim();

  // If user pasted dashboard URL like https://supabase.com/dashboard/project/abcxyz
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user passed just the 20-character project ref
  if (/^[a-zA-Z0-9_-]{20}$/.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // Ensure protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export const supabaseUrl = formatSupabaseUrl(rawUrl);
export const supabaseKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')
);

/**
 * Resolves the base application URL for auth redirects (email confirmation, OAuth, password reset).
 * In production deployment, respects VITE_SITE_URL or VITE_APP_URL if provided.
 * In development and AI Studio preview, dynamically uses window.location.origin.
 */
export function getAppBaseUrl(): string {
  // 1. Check for configured production site URL via environment variables
  const configuredUrl = (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL ||
    ''
  ).trim();

  if (configuredUrl) {
    let clean = configuredUrl.replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  }

  // 2. Fall back to current window origin dynamically
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

/**
 * Builds a full redirect URL for Supabase Auth flows
 */
export function getAuthRedirectUrl(path: string = ''): string {
  const base = getAppBaseUrl();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base}${cleanPath}`;
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);


