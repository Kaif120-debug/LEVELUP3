import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, ensureSupabaseReady, getIsSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isInAppBrowser, getInAppBrowserName } from '../utils/browser';

// Module-level set to prevent duplicate code exchange in React StrictMode
const processedCodes = new Set<string>();

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user } = useAuth();

  const [statusText, setStatusText] = useState('Verifying your Google session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const handleOAuthCallback = async () => {
      if (attemptedRef.current) return;
      attemptedRef.current = true;

      try {
        await ensureSupabaseReady();

        // 1. Inspect search params and hash fragment for errors or authorization code
        const searchParams = new URLSearchParams(location.search);
        let hashParams = new URLSearchParams();
        if (location.hash && location.hash.startsWith('#')) {
          hashParams = new URLSearchParams(location.hash.substring(1));
        }

        const oauthError = searchParams.get('error') || hashParams.get('error');
        const oauthErrorDesc = searchParams.get('error_description') || hashParams.get('error_description');
        const code = searchParams.get('code');
        const targetNext = searchParams.get('next') || '/dashboard';

        // 2. Handle provider or configuration errors returned in URL
        if (oauthError || oauthErrorDesc) {
          const rawDesc = (oauthErrorDesc || oauthError || '').toLowerCase();
          console.warn('[OAuth Callback] Provider returned error:', { oauthError, oauthErrorDesc });

          let userFacingError = 'Google sign-in was not completed.';

          if (rawDesc.includes('denied') || rawDesc.includes('cancel')) {
            userFacingError = 'Sign-in was cancelled. Please try again.';
          } else if (rawDesc.includes('disallowed') || rawDesc.includes('useragent') || rawDesc.includes('webview')) {
            const browserName = getInAppBrowserName() || 'this browser';
            userFacingError = `Google blocks sign-ins inside ${browserName}. Please tap the three dots (•••) and select "Open in Chrome" or "Open in Safari" to sign in.`;
          } else if (rawDesc.includes('invalid_grant') || rawDesc.includes('expired')) {
            userFacingError = 'The authentication link has expired. Please sign in again.';
          } else {
            userFacingError = `Google sign-in error: ${oauthErrorDesc || oauthError}`;
          }

          if (isMounted) {
            setErrorMessage(userFacingError);
            setTimeout(() => {
              navigate('/login', { state: { error: userFacingError }, replace: true });
            }, 1200);
          }
          return;
        }

        // 3. If user is already authenticated via session or context
        if (user || session) {
          cleanUrlAndNavigate(targetNext);
          return;
        }

        // 4. If PKCE code is present, ensure it is exchanged
        if (code) {
          if (processedCodes.has(code)) {
            // Already processed this code in another listener/tick
            const { data } = await supabase.auth.getSession();
            if (data?.session && isMounted) {
              cleanUrlAndNavigate(targetNext);
              return;
            }
          }

          processedCodes.add(code);
          if (isMounted) setStatusText('Completing secure authorization...');

          // Attempt explicit exchange if Supabase client has not already consumed it
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.warn('[OAuth Callback] exchangeCodeForSession note:', error.message);
              // In some versions of supabase-js, detectSessionInUrl may have already completed it
              const { data: currentSessionData } = await supabase.auth.getSession();
              if (currentSessionData?.session && isMounted) {
                cleanUrlAndNavigate(targetNext);
                return;
              }
            } else if (data?.session && isMounted) {
              cleanUrlAndNavigate(targetNext);
              return;
            }
          } catch (exchangeErr: any) {
            console.warn('[OAuth Callback] Exchange exception:', exchangeErr);
          }
        }

        // 5. Poll/Wait briefly for onAuthStateChange to confirm active session
        let checkCount = 0;
        const maxChecks = 10; // 5 seconds total (500ms intervals)

        const interval = setInterval(async () => {
          checkCount++;
          if (!isMounted) {
            clearInterval(interval);
            return;
          }

          const { data: activeSessionData } = await supabase.auth.getSession();
          if (activeSessionData?.session) {
            clearInterval(interval);
            cleanUrlAndNavigate(targetNext);
            return;
          }

          if (checkCount >= maxChecks) {
            clearInterval(interval);
            if (isMounted) {
              const inApp = isInAppBrowser();
              const failMessage = inApp
                ? 'Your in-app browser restricted the authentication session. Please tap the menu (•••) and open in Chrome or Safari, or log in with your email and password.'
                : 'Session could not be established. Please try signing in again.';
              setErrorMessage(failMessage);
              setTimeout(() => {
                navigate('/login', { state: { error: failMessage }, replace: true });
              }, 1800);
            }
          }
        }, 500);

      } catch (err: any) {
        console.error('[OAuth Callback] Unexpected error:', err);
        if (isMounted) {
          const message = err.message || 'Authentication failed. Please try again.';
          setErrorMessage(message);
          setTimeout(() => {
            navigate('/login', { state: { error: message }, replace: true });
          }, 1500);
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [location, navigate, user, session]);

  const cleanUrlAndNavigate = (targetPath: string) => {
    // Strip query parameters (?code=..., ?state=..., etc.) and hash from history
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, targetPath);
    }
    navigate(targetPath, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] px-4">
      <div className="w-full max-w-sm bg-white border border-[#e3e3df] rounded-2xl p-8 shadow-sm text-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-full bg-[#eaf4ec] text-[#26422e] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl animate-spin">
            {errorMessage ? 'error' : 'sync'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-[#1a1c1a] tracking-tight mb-2">
          {errorMessage ? 'Sign-in Notice' : 'LEVELUP'}
        </h2>

        <p className="text-xs text-[#5f5e5e] leading-relaxed">
          {errorMessage || statusText}
        </p>

        {errorMessage && (
          <div className="mt-5">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-[#26422e] text-white py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-[#3d5a44] transition-colors cursor-pointer"
            >
              Return to Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
