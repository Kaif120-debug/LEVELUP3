import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const SettingsModal: React.FC = () => {
  const navigate = useNavigate();
  const { isSettingsOpen, closeSettings, state, updateProfile, cancelSubscription, subscribeUser, reconcileSubscription, isDbLoading } = useApp();
  const { user, session, signOut, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'database'>('profile');
  
  const [name, setName] = useState(user?.user_metadata?.full_name || state.profile.name || '');
  const [title, setTitle] = useState(state.profile.title || '');
  const [email, setEmail] = useState(user?.email || state.profile.email || '');
  const [age, setAge] = useState<number | string>(state.profile.age || 26);
  const [goals, setGoals] = useState(state.profile.goals || 'Gain Lean Muscle & Hypertrophy');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Subscription Cancellation Confirmation Dialog
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelFeedback(null);
    const res = await cancelSubscription(false);
    setIsCancelling(false);
    setShowCancelModal(false);
    if (res.success) {
      setCancelFeedback({
        type: 'success',
        message: res.message || 'Subscription cancellation scheduled. You retain full Pro access until your current billing period ends.',
      });
    } else {
      setCancelFeedback({
        type: 'error',
        message: res.error || 'Failed to cancel subscription. Please contact support.',
      });
    }
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    setReconcileResult(null);
    const res = await reconcileSubscription();
    setIsReconciling(false);
    if (res?.success) {
      setReconcileResult('Membership active! Pro access successfully restored.');
    } else {
      setReconcileResult(res?.error || 'No active Razorpay payment record found for this account.');
    }
  };

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
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error text-error text-xs">
                {errorMessage}
              </div>
            )}

            {/* Profile Avatar & Identity Card */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#26422e]/15 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#26422e] text-white flex items-center justify-center font-bold text-lg border-2 border-[#c59b27] shadow-sm shrink-0">
                {(name || 'User')
                  .split(' ')
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'LU'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#1a1f1b] text-base truncate">{name || 'LEVELUP User'}</h4>
                  {isSubActive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c59b27]/15 text-[#c59b27] text-[10px] font-bold uppercase tracking-wider">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5f6962] truncate">{email || user?.email || 'Authenticated User'}</p>
                <span className="text-[11px] text-[#26422e] font-semibold block mt-0.5">
                  {title || 'Life Performance Practitioner'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-[#1a1f1b] text-xs block mb-1.5 uppercase font-semibold">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b]"
                  required
                />
              </div>

              <div>
                <label className="font-label-caps text-[#1a1f1b] text-xs block mb-1.5 uppercase font-semibold">Age (Years)</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 26"
                  className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b]"
                />
              </div>
            </div>

            <div>
              <label className="font-label-caps text-[#1a1f1b] text-xs block mb-1.5 uppercase font-semibold">Professional Title / Focus</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Architect"
                className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b]"
                required
              />
            </div>

            <div>
              <label className="font-label-caps text-[#1a1f1b] text-xs block mb-1.5 uppercase font-semibold">Email Address (Supabase Account)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b]"
                required
              />
              <p className="text-[11px] text-[#5f6962] mt-1">
                Your authenticated login email for LEVELUP cloud persistence.
              </p>
            </div>

            <div>
              <label className="font-label-caps text-[#1a1f1b] text-xs block mb-1.5 uppercase font-semibold">Primary Goals & Growth Focus</label>
              <textarea
                rows={2}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Progressive overload, reach 82kg bodyweight, lead Q4 systems migration"
                className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b] resize-none"
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

            <div className="pt-4 border-t border-[#26422e]/10 flex justify-between items-center">
              {savedMessage ? (
                <span className="text-[#26422e] font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] fill-icon text-[#26422e]">check_circle</span>
                  Saved to Cloud Database!
                </span>
              ) : <div></div>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeSettings}
                  className="px-4 py-2 border border-outline-variant rounded-xl font-label-caps uppercase text-xs hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#26422e] text-white rounded-xl font-label-caps uppercase text-xs hover:bg-[#1a2d1f] transition-colors font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {cancelFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  cancelFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-500/30 text-emerald-800'
                    : 'bg-red-50 border border-red-500/30 text-red-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm mt-0.5">
                  {cancelFeedback.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span className="leading-relaxed">{cancelFeedback.message}</span>
              </div>
            )}

            <div className="border border-[#26422e]/15 rounded-2xl p-5 bg-[#faf9f6]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider text-[#5f6962] block">
                    Current Plan
                  </span>
                  <h4 className="font-headline-sm text-lg font-bold text-[#1a1f1b]">
                    LEVELUP Membership
                  </h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  isSubActive
                    ? 'bg-[#26422e] text-white'
                    : 'bg-error-container text-on-error-container'
                }`}>
                  {isSubActive ? (state.subscription?.cancelAtPeriodEnd ? 'ACTIVE (CANCELLING)' : 'ACTIVE') : 'INACTIVE'}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="font-display-lg text-3xl font-bold text-[#1a1f1b]">₹129</span>
                <span className="text-xs text-[#5f6962]">/ month</span>
              </div>

              <p className="text-xs text-[#5f6962] leading-relaxed">
                Full unrestricted access to Fitness OS, Nutrition Planner, ATS Resume Builder, Student OS, Creator Studio, and Gemini AI.
              </p>

              {state.subscription?.cancelAtPeriodEnd ? (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800">
                  <span className="font-bold block">Cancellation Scheduled</span>
                  You retain full Pro access across all workspaces until{' '}
                  <span className="font-bold">{state.subscription?.nextBillingDate || 'end of current cycle'}</span>.
                  Your subscription will not renew afterwards.
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-[#26422e]/10 flex justify-between text-xs text-[#5f6962]">
                  <span>Next Renewal Date:</span>
                  <span className="font-semibold text-[#1a1f1b]">
                    {state.subscription?.nextBillingDate || 'Nov 1, 2026'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              {isSubActive && !state.subscription?.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 px-4 border border-error/30 text-error rounded-xl font-label-caps uppercase text-xs hover:bg-error-container/20 transition-colors cursor-pointer font-semibold"
                >
                  Cancel Membership
                </button>
              ) : isSubActive && state.subscription?.cancelAtPeriodEnd ? (
                <div className="text-center text-xs text-[#5f6962] py-2">
                  Membership scheduled to end on {state.subscription?.nextBillingDate || 'billing date'}.
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => subscribeUser()}
                    className="flex-1 py-3 px-4 bg-[#26422e] text-white rounded-xl font-label-caps uppercase text-xs font-bold hover:bg-[#1a2d1f] transition-colors cursor-pointer"
                  >
                    Reactivate (₹129/mo)
                  </button>
                  <Link
                    to="/checkout"
                    onClick={closeSettings}
                    className="flex-1 py-3 px-4 border border-[#26422e] text-[#26422e] text-center rounded-xl font-label-caps uppercase text-xs font-bold hover:bg-surface-container-high transition-colors"
                  >
                    Checkout Page
                  </Link>
                </div>
              )}

              {/* Restore Purchases / Reconcile Payment */}
              <div className="pt-2 border-t border-[#26422e]/10 text-center space-y-2">
                <button
                  type="button"
                  onClick={handleReconcile}
                  disabled={isReconciling}
                  className="text-xs text-[#26422e] hover:underline font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isReconciling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#26422e] border-t-transparent rounded-full animate-spin"></span>
                      <span>Restoring from Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">history_edu</span>
                      <span>Already paid? Restore / Reconcile Membership</span>
                    </>
                  )}
                </button>
                {reconcileResult && (
                  <p className="text-[11.5px] text-[#26422e] font-medium">
                    {reconcileResult}
                  </p>
                )}
              </div>

              <p className="text-center text-[11px] text-[#5f6962]">
                Need billing invoice receipt? Contact billing@levelupapp.co.in
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Safety Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#26422e]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-fade-up">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="material-symbols-outlined text-2xl">warning</span>
                <h4 className="font-bold text-[#1a1f1b] text-base">Cancel LEVELUP Pro?</h4>
              </div>

              <p className="text-xs sm:text-sm text-[#5f6962] leading-relaxed">
                Are you sure you want to cancel your membership?
              </p>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#26422e]/15 text-xs text-[#1a1f1b] space-y-1">
                <p className="font-semibold text-[#26422e]">
                  ✓ You keep Pro access until {state.subscription?.nextBillingDate || 'the end of your billing cycle'}.
                </p>
                <p className="text-[#5f6962]">
                  Your card or UPI Autopay will not be charged again. After this period, your account transitions to the Free tier.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-xl border border-[#26422e]/20 text-xs font-bold text-[#1a1f1b] hover:bg-[#faf9f6] transition-colors cursor-pointer"
                >
                  Keep Membership
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Database & Supabase Sync */}
        {activeTab === 'database' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Status Header */}
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isConfigured ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                <span className="material-symbols-outlined text-lg">
                  {isConfigured ? 'cloud_done' : 'cloud_sync'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">Supabase Cloud Database</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isConfigured ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isConfigured ? 'Connected' : 'Local Fallback Mode'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {isConfigured
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
