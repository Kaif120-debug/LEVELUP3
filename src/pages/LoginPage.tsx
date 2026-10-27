import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../utils/analytics';
import { isInAppBrowser, getInAppBrowserName, isAndroid, getChromeIntentUrl } from '../utils/browser';

interface LoginPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile } = useApp();
  const { user, isAuthLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(() => {
    if (initialMode) return initialMode;
    return location.pathname === '/signup' ? 'signup' : 'login';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  const inAppBrowser = isInAppBrowser();
  const inAppBrowserName = getInAppBrowserName();

  // 1. Forward OAuth callbacks (?code=...) that land on /login directly to /auth/callback
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('code')) {
      navigate(`/auth/callback${location.search}${location.hash}`, { replace: true });
    }
  }, [location.search, location.hash, navigate]);

  // 2. Auto-redirect if already authenticated and session is ready
  useEffect(() => {
    if (user && !isAuthLoading && !verificationPendingEmail) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, isAuthLoading, verificationPendingEmail, navigate, location.state]);

  // 3. Capture errors from URL query parameters or navigation state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errParam = searchParams.get('error_description') || searchParams.get('error') || (location.state as any)?.error;
    if (errParam) {
      const lower = errParam.toLowerCase();
      if (lower.includes('denied') || lower.includes('cancel')) {
        setErrorMsg('Google sign-in was cancelled. Please try again.');
      } else if (lower.includes('disallowed') || lower.includes('useragent') || lower.includes('webview')) {
        setErrorMsg(
          `Google sign-in is restricted inside ${inAppBrowserName || 'this in-app browser'}. Please tap the menu (•••) and select "Open in Chrome" or "Open in Safari", or sign in with your email and password.`
        );
      } else {
        setErrorMsg(errParam);
      }
    }

    const msgParam = searchParams.get('message') || (location.state as any)?.message;
    if (msgParam) {
      setSuccessMsg(msgParam);
    }
  }, [location.search, location.state, inAppBrowserName]);

  // Sync mode if route changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login' && mode === 'signup') {
      setMode('login');
    }
  }, [location.pathname]);

  // Track page open
  useEffect(() => {
    if (mode === 'signup') {
      trackEvent('signup_form_opened', { source: location.state?.from || 'direct' });
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      trackEvent('signup_submitted', { emailDomain: email.split('@')[1] || 'unknown' });

      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please provide both email and password.');
        setLoading(false);
        trackEvent('signup_failed', { errorMessage: 'Missing credentials' });
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        setLoading(false);
        trackEvent('signup_failed', { errorMessage: 'Password too short' });
        return;
      }

      const { data, error } = await signUp(email.trim(), password, name.trim());
      setLoading(false);

      if (error) {
        const message = error.message || 'Failed to create account.';
        setErrorMsg(message);
        trackEvent('signup_failed', { errorMessage: message });
      } else {
        if (name.trim()) {
          updateProfile({ name: name.trim(), email: email.trim() });
        } else {
          updateProfile({ email: email.trim() });
        }

        // Check if session was created immediately or confirmation is needed
        if (data?.session) {
          trackEvent('signup_successful', { hasImmediateSession: true });
          navigate('/onboarding');
        } else if (data?.user && !data?.session) {
          trackEvent('signup_successful', { hasImmediateSession: false });
          trackEvent('email_verification_sent');
          setVerificationPendingEmail(email.trim());
        } else {
          trackEvent('signup_successful');
          navigate('/onboarding');
        }
      }
    } else if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter your email and password.');
        setLoading(false);
        return;
      }

      const { data, error } = await signIn(email.trim(), password);
      setLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        const userName = data?.user?.user_metadata?.full_name || '';
        if (userName) {
          updateProfile({ name: userName, email: email.trim() });
        } else {
          updateProfile({ email: email.trim() });
        }

        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        setLoading(false);
        return;
      }

      const { error } = await resetPassword(email.trim());
      setLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset email.');
      } else {
        setSuccessMsg(`A secure recovery link has been sent to ${email.trim()}. Please check your inbox.`);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    trackEvent('signup_submitted', { provider: 'google' });
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || 'Google sign in failed.');
      setLoading(false);
      trackEvent('signup_failed', { provider: 'google', errorMessage: error.message });
    }
  };

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1a1c1a]">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md h-16 sm:h-20 border-b border-[#e3e3df] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-8 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#26422e] hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>LEVELUP</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#5f5e5e]">
              {isSignUp ? 'Already registered?' : "New to LEVELUP?"}
            </span>
            <button
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setVerificationPendingEmail(null);
                setMode(isSignUp ? 'login' : 'signup');
              }}
              className="text-xs font-semibold text-[#26422e] hover:text-[#3d5a44] border border-[#26422e]/30 hover:border-[#26422e] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {isSignUp ? 'Log In' : 'Create Account'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#e3e3df] rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* Verification Pending Screen */}
          {verificationPendingEmail ? (
            <div className="text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-[#caebce] text-[#26422e] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
                  Check Your Email
                </h1>
                <p className="text-sm text-[#424842] mt-2 leading-relaxed">
                  We sent a confirmation link to:
                  <br />
                  <strong className="text-[#1a1c1a] break-all">{verificationPendingEmail}</strong>
                </p>
              </div>

              <div className="bg-[#f4f4f0] border border-[#e3e3df] rounded-xl p-4 text-left text-xs text-[#424842] space-y-2">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-[#26422e] shrink-0 mt-0.5">check</span>
                  <span>Click the link in the email to activate your account.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-[#26422e] shrink-0 mt-0.5">check</span>
                  <span>Check your spam or promotions folder if you don't see it within 2 minutes.</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationPendingEmail(null);
                    setMode('login');
                  }}
                  className="w-full bg-[#26422e] text-white py-3 px-4 rounded-xl text-xs font-semibold hover:bg-[#3d5a44] transition-colors cursor-pointer"
                >
                  Proceed to Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationPendingEmail(null);
                    setMode('signup');
                  }}
                  className="text-xs text-[#5f5e5e] hover:text-[#1a1c1a] transition-colors py-1 cursor-pointer"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="text-center mb-6">
                <div className="inline-flex p-1 bg-[#f4f4f0] rounded-xl border border-[#e3e3df] mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('signup');
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSignUp
                        ? 'bg-white text-[#26422e] shadow-sm'
                        : 'text-[#5f5e5e] hover:text-[#1a1c1a]'
                    }`}
                  >
                    Get Started
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('login');
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      !isSignUp && !isForgot
                        ? 'bg-white text-[#26422e] shadow-sm'
                        : 'text-[#5f5e5e] hover:text-[#1a1c1a]'
                    }`}
                  >
                    Log In
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1c1a] tracking-tight">
                  {isForgot
                    ? 'Reset your password'
                    : isSignUp
                    ? 'Start Your LEVELUP Journey.'
                    : 'Welcome back to LEVELUP'}
                </h1>

                <p className="text-xs sm:text-sm text-[#424842] mt-2 leading-relaxed">
                  {isForgot
                    ? 'Enter your account email to receive a secure recovery link.'
                    : isSignUp
                    ? 'Create your account and bring your goals, tools, and progress together.'
                    : 'Enter your credentials to access your dashboard.'}
                </p>
              </div>

              {/* In-App Browser Guidance Banner (Instagram, Facebook, etc.) */}
              {inAppBrowser && (
                <div className="mb-4 p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-left text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">
                      open_in_browser
                    </span>
                    <div className="leading-snug">
                      <strong className="font-semibold block text-amber-950">
                        {inAppBrowserName || 'In-App'} Browser Notice
                      </strong>
                      <span>
                        For seamless Google sign-in and to keep your session saved, tap{' '}
                        <span className="font-bold">•••</span> in the top corner and select{' '}
                        <span className="underline font-medium">Open in Chrome</span> or{' '}
                        <span className="underline font-medium">Open in Safari</span>.
                      </span>
                    </div>
                  </div>
                  {isAndroid() && (
                    <div className="pt-1 text-right">
                      <a
                        href={getChromeIntentUrl(window.location.href)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>Open in Chrome</span>
                        <span className="material-symbols-outlined text-xs">arrow_outward</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 font-medium">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-[#1a1c1a] mb-1.5">
                      Full Name <span className="text-[#5f5e5e] font-normal">(optional)</span>
                    </label>
                    <input
                      className="w-full bg-[#faf9f6] border border-[#c2c8c0] rounded-xl px-3.5 py-2.5 text-sm text-[#1a1c1a] placeholder-[#727972] focus:border-[#26422e] focus:bg-white focus:outline-none transition-colors"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#1a1c1a] mb-1.5">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-[#faf9f6] border border-[#c2c8c0] rounded-xl px-3.5 py-2.5 text-sm text-[#1a1c1a] placeholder-[#727972] focus:border-[#26422e] focus:bg-white focus:outline-none transition-colors"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isForgot && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-[#1a1c1a]">
                        Password
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            setSuccessMsg(null);
                            setMode('forgot');
                          }}
                          className="text-xs text-[#26422e] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        className="w-full bg-[#faf9f6] border border-[#c2c8c0] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#1a1c1a] placeholder-[#727972] focus:border-[#26422e] focus:bg-white focus:outline-none transition-colors"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727972] hover:text-[#1a1c1a] p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#26422e] text-white rounded-xl text-xs font-semibold py-3.5 px-5 hover:bg-[#3d5a44] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <>
                      <span>
                        {isForgot
                          ? 'Send Recovery Link'
                          : isSignUp
                          ? 'Get Started'
                          : 'Log In'}
                      </span>
                      <span className="material-symbols-outlined text-base">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                {isForgot && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('login');
                    }}
                    className="w-full text-xs text-center text-[#5f5e5e] hover:text-[#1a1c1a] pt-2 cursor-pointer"
                  >
                    ← Back to Log In
                  </button>
                )}
              </form>

              {/* Social Login Separator */}
              {!isForgot && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-grow border-[#e3e3df]" />
                    <span className="text-[11px] font-medium text-[#727972] uppercase tracking-wider">
                      Or continue with
                    </span>
                    <hr className="flex-grow border-[#e3e3df]" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full border border-[#c2c8c0] text-[#1a1c1a] rounded-xl text-xs font-medium py-3 px-4 hover:bg-[#f4f4f0] transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.72 17.55V20.31H19.28C21.36 18.39 22.56 15.58 22.56 12.25Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23C14.97 23 17.46 22.02 19.28 20.31L15.72 17.55C14.73 18.21 13.48 18.6 12 18.6C9.12 18.6 6.67 16.65 5.8 14.04H2.14V16.88C3.96 20.48 7.68 23 12 23Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.8 14.04C5.58 13.38 5.46 12.7 5.46 12C5.46 11.3 5.58 10.62 5.8 9.96V7.12H2.14C1.39 8.62 0.96 10.27 0.96 12C0.96 13.73 1.39 15.38 2.14 16.88L5.8 14.04Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.35 3.87C17.45 2.1 14.97 1 12 1C7.68 1 3.96 3.52 2.14 7.12L5.8 9.96C6.67 7.35 9.12 5.38 12 5.38Z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <p className="text-[11px] text-[#727972] text-center mt-5 leading-relaxed">
                    By signing up, you agree to our{' '}
                    <Link to="/#legal" className="text-[#26422e] underline hover:text-[#3d5a44]">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/#legal" className="text-[#26422e] underline hover:text-[#3d5a44]">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
