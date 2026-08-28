import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsModal: React.FC = () => {
  const navigate = useNavigate();
  const { isSettingsOpen, closeSettings, state, updateProfile, cancelSubscription, subscribeUser, isDbLoading } = useApp();
  const { user, session, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'database'>('profile');
  
  const [name, setName] = useState(user?.user_metadata?.full_name || state.profile.name || '');
  const [title, setTitle] = useState(state.profile.title || '');
  const [email, setEmail] = useState(user?.email || state.profile.email || '');
  const [age, setAge] = useState<number | string>(state.profile.age || 26);
  const [goals, setGoals] = useState(state.profile.goals || 'Gain Lean Muscle & Hypertrophy');
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      setName(user?.user_metadata?.full_name || state.profile.name || '');
      setTitle(state.profile.title || '');
      setEmail(user?.email || state.profile.email || '');
      setAge(state.profile.age || 26);
      setGoals(state.profile.goals || 'Gain Lean Muscle & Hypertrophy');
      setErrorMessage(null);
      setSavedMessage(false);
    }
  }, [isSettingsOpen, user, state.profile]);

  if (!isSettingsOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const parsedAge = age ? parseInt(age.toString(), 10) : undefined;
      const res = await updateProfile({
        name,
        title,
        email,
        age: parsedAge,
        goals,
      });

      if (res && !res.success && res.error) {
        setErrorMessage(res.error);
      } else {
        setSavedMessage(true);
        setTimeout(() => {
          setSavedMessage(false);
          closeSettings();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    closeSettings();
    await signOut();
    navigate('/login');
  };

  const isSubActive = state.subscription?.status === 'active';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0">
          <div>
            <h3 className="font-headline-sm text-primary text-base sm:text-lg">Settings & Preferences</h3>
            <p className="text-[11px] sm:text-xs text-on-surface-variant">Manage your account profile, personal goals, and LEVELUP membership</p>
          </div>
          <button
            onClick={closeSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant bg-surface-container-low px-4 sm:px-6 pt-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-label-caps uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Profile & Account
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`pb-3 px-3 text-xs font-label-caps uppercase transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Membership & Billing</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`pb-3 px-3 text-xs font-label-caps uppercase transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">database</span>
            <span>Cloud Database</span>
          </button>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-error-container/30 border border-error text-error text-xs">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-on-surface text-xs block mb-1.5 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-label-caps text-on-surface text-xs block mb-1.5 uppercase">Age (Years)</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 26"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-label-caps text-on-surface text-xs block mb-1.5 uppercase">Professional Title / Focus</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Architect"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="font-label-caps text-on-surface text-xs block mb-1.5 uppercase">Email Address (Supabase Account)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                required
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Changing your email will update your profile in Supabase and send a confirmation to your address.
              </p>
            </div>

            <div>
              <label className="font-label-caps text-on-surface text-xs block mb-1.5 uppercase">Primary Goals & Growth Focus</label>
              <textarea
                rows={2}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Progressive overload, reach 82kg bodyweight, lead Q4 systems migration"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 border border-error/30 text-error rounded-xl font-label-caps uppercase text-xs hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out of LEVELUP</span>
              </button>
            </div>

            <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
              {savedMessage ? (
                <span className="text-primary font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] fill-icon">check_circle</span>
                  Saved to Supabase!
                </span>
              ) : <div></div>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeSettings}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-label-caps uppercase text-xs hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-container text-on-primary rounded-lg font-label-caps uppercase text-xs hover:bg-primary transition-colors font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Subscription & Billing */}
        {activeTab === 'subscription' && (
          <div className="p-6 space-y-5">
            <div className="border border-outline-variant rounded-2xl p-5 bg-surface-container-low">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant block">
                    Current Plan
                  </span>
                  <h4 className="font-headline-sm text-lg font-bold text-on-surface">
                    LEVELUP Membership
                  </h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  isSubActive
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-error-container text-on-error-container'
                }`}>
                  {isSubActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="font-display-lg text-3xl font-bold text-on-surface">₹129</span>
                <span className="text-xs text-on-surface-variant">/ month</span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Full unrestricted access to Fitness OS, Nutrition Planner, ATS Resume Builder, Student OS, Creator Studio, and Gemini AI.
              </p>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex justify-between text-xs text-on-surface-variant">
                <span>Next Billing Date:</span>
                <span className="font-medium text-on-surface">
                  {state.subscription?.nextBillingDate || 'Nov 1, 2026'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              {isSubActive ? (
                <button
                  type="button"
                  onClick={cancelSubscription}
                  className="w-full py-2.5 px-4 border border-error/30 text-error rounded-xl font-label-caps uppercase text-xs hover:bg-error-container/20 transition-colors"
                >
                  Cancel Membership
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => subscribeUser()}
                    className="flex-1 py-3 px-4 bg-primary-container text-on-primary rounded-xl font-label-caps uppercase text-xs font-bold hover:bg-primary transition-colors"
                  >
                    Reactivate (₹129/mo)
                  </button>
                  <Link
                    to="/checkout"
                    onClick={closeSettings}
                    className="flex-1 py-3 px-4 border border-primary text-primary text-center rounded-xl font-label-caps uppercase text-xs font-bold hover:bg-surface-container-high transition-colors"
                  >
                    Checkout Page
                  </Link>
                </div>
              )}

              <p className="text-center text-[11px] text-on-surface-variant">
                Need invoice receipt? Contact billing@levelup.app
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Database & Supabase Sync */}
        {activeTab === 'database' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Status Header */}
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                <span className="material-symbols-outlined text-lg">
                  {isSupabaseConfigured ? 'cloud_done' : 'cloud_sync'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">Supabase Cloud Database</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isSupabaseConfigured ? 'Connected' : 'Local Fallback Mode'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {isSupabaseConfigured
                    ? 'Your frontend is fully configured with Supabase. All workout plans, nutrition data, tasks, invoices, student courses, and subscriptions are synchronized.'
                    : 'Supabase credentials can be configured via environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). All local features remain fully functional.'}
                </p>
              </div>
            </div>

            {/* Sync Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface border border-outline-variant rounded-xl">
                <span className="text-on-surface-variant block mb-1">Authenticated Account</span>
                <span className="font-mono font-medium text-on-surface truncate block">
                  {user?.email || 'Guest / Local Session'}
                </span>
              </div>
              <div className="p-3 bg-surface border border-outline-variant rounded-xl">
                <span className="text-on-surface-variant block mb-1">Cloud Sync Status</span>
                <span className="font-mono font-medium text-on-surface flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isDbLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
                  {isDbLoading ? 'Synchronizing...' : 'Synced in Realtime'}
                </span>
              </div>
            </div>

            {/* SQL Migration Assistant */}
            <div className="p-4 bg-surface-container-high/40 rounded-xl border border-outline-variant">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
                  <span>Supabase Schema SQL Script</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">supabase_schema.sql</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                Execute the schema script in your Supabase SQL Editor to automatically configure all 29 PostgreSQL tables, RLS security policies, and user triggers.
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `-- Run the supabase_schema.sql file located in your project root in Supabase SQL Editor.`
                  );
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="w-full py-2 px-3 rounded-lg bg-surface border border-outline-variant hover:bg-surface-container text-xs font-label-caps uppercase font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedSql ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSql ? 'SQL Instructions Copied!' : 'Copy SQL Setup Instructions'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
