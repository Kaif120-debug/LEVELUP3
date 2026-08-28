import { createClient, SupabaseClient } from '@supabase/supabase-js';

function cleanEnvString(raw?: string | null): string {
  if (!raw) return '';
  let s = raw.trim();
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

// Initial environment variable extraction from Vite build
// Uses import.meta.env.VITE_SUPABASE_URL and import.meta.env.VITE_SUPABASE_ANON_KEY
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
 * In production deployment, respects VITE_SITE_URL or VITE_APP_URL if provided.
 * In development and AI Studio preview, dynamically uses window.location.origin.
 */
export function getAppBaseUrl(): string {
  const configuredUrl = cleanEnvString(
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL ||
    ''
  );

  if (configuredUrl) {
    let clean = configuredUrl.replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  }

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

// Instantiate internal Supabase Client
function createSupabaseInstance(url: string, key: string): SupabaseClient {
  const validUrl = (url && !isPlaceholderConfig(url, key)) ? url : 'https://placeholder-project.supabase.co';
  const validKey = (key && !isPlaceholderConfig(url, key)) ? key : 'placeholder-anon-key';

  return createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
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

// Runtime configuration hydration: If Vite build did not have VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY baked in,
// fetch safe public config from backend /api/config (supported on Cloudflare Worker & Express)
if (typeof window !== 'undefined') {
  (async () => {
    try {
      if (!getIsSupabaseConfigured()) {
        const res = await fetch('/api/config');
        if (res.ok) {
          const config = await res.json();
          if (config?.supabaseUrl && config?.supabaseAnonKey) {
            const formatted = formatSupabaseUrl(config.supabaseUrl);
            const key = cleanEnvString(config.supabaseAnonKey);
            if (formatted && key && !isPlaceholderConfig(formatted, key)) {
              supabaseUrl = formatted;
              supabaseKey = key;
              isSupabaseConfigured = true;
              activeSupabaseClient = createSupabaseInstance(formatted, key);
              console.log('[Supabase] Initialized with runtime configuration from /api/config');
              configListeners.forEach((fn) => fn(true));
            }
          }
        }
      }
    } catch (e) {
      // Non-blocking background fetch
    }
  })();
}
