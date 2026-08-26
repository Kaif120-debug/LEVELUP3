import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to update password. Link may have expired.');
    } else {
      setSuccessMsg('Your password has been successfully updated!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <header className="bg-surface h-20 border-b border-outline-variant flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full">
        <Link to="/" className="font-display-lg text-display-lg text-primary">
          LEVELUP
        </Link>
        <Link
          to="/login"
          className="font-label-caps text-label-caps text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
        >
          Back to Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-desktop">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 sm:p-12 shadow-sm flex flex-col gap-stack-lg relative overflow-hidden">
          <div className="flex flex-col gap-stack-sm text-center z-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Set New Password
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter and confirm your new secure password.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-primary-fixed/30 text-primary text-xs rounded-lg flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form className="flex flex-col gap-stack-md z-10" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface">New Password</label>
              <input
                className="w-full bg-transparent border-b border-outline-variant py-2 px-1 focus:border-primary focus:ring-0 outline-none text-sm text-on-surface"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface">Confirm Password</label>
              <input
                className="w-full bg-transparent border-b border-outline-variant py-2 px-1 focus:border-primary focus:ring-0 outline-none text-sm text-on-surface"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-container text-on-primary rounded font-label-caps text-label-caps py-4 px-6 hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  Updating...
                </span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
