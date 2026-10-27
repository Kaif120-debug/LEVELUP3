import { createClient, SupabaseClient } from '@supabase/supabase-js';

function cleanEnvString(raw?: string | null): string {
  if (!raw) return '';
  let s = String(raw).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Normalizes and sanitizes Supabase project URLs.
 * Handles cases where a user pastes their project dashboard link
 * (e.g., https://supabase.com/dashboard/project/xyz) or project ID instead of the API endpoint.
 */
export function formatSupabaseUrl(raw: string): string {
  const clean = cleanEnvString(raw);
  if (!clean) return '';
  let url = clean;

  // If user pasted dashboard URL like https://supabase.com/dashboard/project/abcxyz
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user passed just the project ref (e.g. 20-character identifier)
  if (/^[a-zA-Z0-9_-]{15,35}$/.test(url)) {
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

export function isPlaceholderConfig(url: string, key: string): boolean {
  if (!url || !key) return true;
  const lowerUrl = url.toLowerCase();
  const lowerKey = key.toLowerCase();

  return (
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('your-project') ||
    lowerUrl.includes('example.com') ||
    lowerUrl === 'https://' ||
    lowerUrl === 'http://' ||
    lowerKey.includes('placeholder') ||
    lowerKey.includes('your-anon-key') ||
    lowerKey.includes('your-key')
  );
}

// Initial environment variable extraction (if available during build)
const initialRawUrl = cleanEnvString(
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_SUPABASE_URL) ||
  ''
);

const initialRawKey = cleanEnvString(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_SUPABASE_ANON_KEY) ||
  ''
);

export let supabaseUrl = formatSupabaseUrl(initialRawUrl);
export let supabaseKey = cleanEnvString(initialRawKey);

export function getIsSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !isPlaceholderConfig(supabaseUrl, supabaseKey)
  );
}

export let isSupabaseConfigured = getIsSupabaseConfigured();

/**
 * Resolves the base application URL for auth redirects (email confirmation, OAuth, password reset).
 * Protects against accidental Supabase dashboard or API URLs in VITE_SITE_URL,
 * ensuring users return to https://levelupapp.co.in in production or the active preview origin in dev.
 */
export function getAppBaseUrl(): string {
  // If running in browser, determine domain from current location
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    const hostname = window.location.hostname.toLowerCase();

    // If active on the official production domain
    if (hostname === 'levelupapp.co.in' || hostname === 'www.levelupapp.co.in') {
      return 'https://levelupapp.co.in';
    }

    // In local development or AI Studio preview environments, preserve current preview origin
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.run.app') ||
      hostname.endsWith('.pages.dev') ||
      hostname.endsWith('.vercel.app')
    ) {
      return origin;
    }
  }

  // Check configured environment variables with strict sanitation
  const configuredUrl = cleanEnvString(
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL ||
    (typeof process !== 'undefined' && (process.env.VITE_SITE_URL || process.env.SITE_URL || process.env.APP_URL)) ||
    ''
  );

  if (configuredUrl) {
    let clean = configuredUrl.replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }

    const lower = clean.toLowerCase();
    // Reject Supabase dashboard, project URLs, or placeholder values
    const isInvalidSupabaseUrl =
      lower.includes('supabase.co') ||
      lower.includes('supabase.com') ||
      lower.includes('editor/new') ||
      lower.includes('dashboard') ||
      lower.includes('placeholder');

    if (!isInvalidSupabaseUrl) {
      return clean;
    }
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  // Default production origin for LEVELUP
  return 'https://levelupapp.co.in';
}

/**
 * Builds a full redirect URL for Supabase Auth flows
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  const base = getAppBaseUrl();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base}${cleanPath}`;
}

// Instantiate internal Supabase Client with PKCE flow and resilient session handling
function createSupabaseInstance(url: string, key: string): SupabaseClient {
  const validUrl = (url && !isPlaceholderConfig(url, key)) ? url : 'https://placeholder-project.supabase.co';
  const validKey = (key && !isPlaceholderConfig(url, key)) ? key : 'placeholder-anon-key';

  return createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

let activeSupabaseClient: SupabaseClient = createSupabaseInstance(supabaseUrl, supabaseKey);

const configListeners: Array<(configured: boolean) => void> = [];

export function onSupabaseConfigChange(listener: (configured: boolean) => void): () => void {
  configListeners.push(listener);
  return () => {
    const idx = configListeners.indexOf(listener);
    if (idx !== -1) configListeners.splice(idx, 1);
  };
}

// Dynamic proxy so all existing imports `import { supabase } from '../lib/supabase'` stay reactive
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (activeSupabaseClient as any)[prop];
  },
});

let runtimeConfigPromise: Promise<boolean> | null = null;

/**
 * Fetches runtime configuration from /api/config or /config.
 * Safe public variables only (Supabase URL and Anon Key).
 */
export async function fetchRuntimeConfig(): Promise<boolean> {
  if (getIsSupabaseConfigured()) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const endpoints = ['/api/config', '/config', '/api/public-config'];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const config = await res.json();
          const rawUrl = config?.supabaseUrl || config?.SUPABASE_URL || config?.url;
          const rawKey = config?.supabaseAnonKey || config?.supabaseKey || config?.SUPABASE_ANON_KEY || config?.SUPABASE_PUBLISHABLE_KEY || config?.anonKey || config?.key;

          if (rawUrl && rawKey) {
            const formatted = formatSupabaseUrl(rawUrl);
            const key = cleanEnvString(rawKey);

            if (formatted && key && !isPlaceholderConfig(formatted, key)) {
              supabaseUrl = formatted;
              supabaseKey = key;
              isSupabaseConfigured = true;
              activeSupabaseClient = createSupabaseInstance(formatted, key);
              console.log('[Supabase] Initialized with runtime configuration from', endpoint);
              configListeners.forEach((fn) => fn(true));
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[Supabase] Failed to fetch config from ${endpoint}:`, e);
    }
  }

  return getIsSupabaseConfigured();
}

/**
 * Ensures the Supabase client is configured, waiting for runtime config if necessary.
 */
export async function ensureSupabaseReady(): Promise<boolean> {
  if (getIsSupabaseConfigured()) {
    return true;
  }

  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetchRuntimeConfig();
  }

  return runtimeConfigPromise;
}

// Auto-trigger config fetch on client load
if (typeof window !== 'undefined') {
  ensureSupabaseReady().catch((err) => {
    console.warn('[Supabase] Initialization error:', err);
  });
}
