import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile } = useApp();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(
    initialMode || (location.pathname === '/signup' ? 'signup' : 'login')
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please provide both email and password.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const { data, error } = await signUp(email.trim(), password, name.trim());
      setLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Failed to create account.');
      } else {
        if (name) {
          updateProfile({ name: name.trim(), email: email.trim() });
        } else {
          updateProfile({ email: email.trim() });
        }

        // Check if session was created immediately or confirmation is needed
        if (data?.session) {
          navigate('/onboarding');
        } else if (data?.user && !data?.session) {
          setSuccessMsg('Account created! A confirmation link has been sent to your email. Please check your inbox.');
        } else {
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
        setSuccessMsg(`Password reset link sent to ${email.trim()}. Check your inbox.`);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || 'Google sign in failed.');
      setLoading(false);
    }
  };

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <header className="bg-surface h-20 border-b border-outline-variant flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full">
        <Link to="/" className="font-display-lg text-display-lg text-primary">
          LEVELUP
        </Link>
        <div className="flex items-center gap-stack-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              setMode(isSignUp ? 'login' : 'signup');
            }}
            className="font-label-caps text-label-caps text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-desktop">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 sm:p-12 shadow-sm flex flex-col gap-stack-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/20 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex flex-col gap-stack-sm text-center z-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {isForgot
                ? 'Reset your password'
                : isSignUp
                ? 'Create your workspace'
                : 'Welcome back'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isForgot
                ? 'Enter your account email to receive a secure recovery link.'
                : isSignUp
                ? 'Join thousands leveling up their life every day.'
                : 'Enter your details to access your workspace.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-error-container text-on-error-container text-xs rounded-lg flex items-start gap-2.5 z-10 animate-fade-up">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-primary-fixed/30 text-primary text-xs rounded-lg flex items-start gap-2.5 z-10 animate-fade-up font-medium">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          <form className="flex flex-col gap-stack-md z-10" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface">Full Name</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant py-2 px-1 focus:border-primary focus:ring-0 outline-none text-sm text-on-surface"
                  type="text"
                  placeholder="Alexander Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface">Email</label>
              <input
                className="w-full bg-transparent border-b border-outline-variant py-2 px-1 focus:border-primary focus:ring-0 outline-none text-sm text-on-surface"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isForgot && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <label className="font-label-caps text-label-caps text-on-surface">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setMode('forgot');
                      }}
                      className="font-label-caps text-label-caps text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  className="w-full bg-transparent border-b border-outline-variant py-2 px-1 focus:border-primary focus:ring-0 outline-none text-sm text-on-surface"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-container text-on-primary rounded font-label-caps text-label-caps py-4 px-6 hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <span>
                    {isForgot
                      ? 'Send Recovery Link'
                      : isSignUp
                      ? 'Create Account'
                      : 'Log In'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
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
                className="text-xs font-label-caps uppercase text-center text-on-surface-variant hover:text-primary mt-2 cursor-pointer"
              >
                ← Back to Log In
              </button>
            )}
          </form>

          {!isForgot && (
            <>
              <div className="flex items-center gap-4 z-10">
                <hr className="flex-grow border-outline-variant" />
                <span className="font-label-caps text-label-caps text-on-surface-variant">OR</span>
                <hr className="flex-grow border-outline-variant" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border border-outline-variant text-on-surface rounded font-label-caps text-label-caps py-3 px-6 hover:bg-surface-container-low transition-colors flex items-center justify-center gap-3 z-10 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};
