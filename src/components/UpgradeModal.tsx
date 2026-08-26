import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, upgradeModalFeature, closeUpgradeModal, subscribeUser } = useSubscription();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const rlsFixSql = `ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage subscriptions" ON public.subscriptions 
FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsFixSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleQuickUpgrade = async () => {
    setIsUpgrading(true);
    setErrorMessage(null);
    const res = await subscribeUser();
    setIsUpgrading(false);
    if (res?.success) {
      closeUpgradeModal();
    } else if (res?.error) {
      setErrorMessage(res.error);
    }
  };

  const handleGoToCheckout = () => {
    closeUpgradeModal();
    navigate('/checkout');
  };

  const perks = [
    { title: 'Unlimited AI Generation', desc: 'AI Workout Builder, Diet Generator, Macro Coach & Copilot' },
    { title: 'AI Career Intelligence', desc: 'ATS Resume Optimization, Cover Letter Generator & Mock Interview Coach' },
    { title: 'Business Pro & CRM', desc: 'Unlimited Clients, Proposals, and Automated Invoices (No 3/mo cap)' },
    { title: 'Creator Studio & Portfolios', desc: 'Unlimited Custom Portfolios, Advanced Brand Kit & AI Content Hooks' },
    { title: 'Advanced Analytics', desc: 'Deep progressive overload charts, macro breakdowns & finance projections' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-surface border border-outline-variant rounded-2xl sm:rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-primary-container/80 via-surface-container-high to-surface p-5 sm:p-8 border-b border-outline-variant/60 relative shrink-0">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary font-bold text-[11px] uppercase tracking-wider mb-2 sm:mb-3">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            PRO MEMBERSHIP
          </div>

          <h2 className="font-headline-lg text-xl sm:text-3xl font-bold text-on-surface leading-tight">
            {upgradeModalFeature ? `Unlock ${upgradeModalFeature}` : 'Level Up with PRO'}
          </h2>
          <p className="text-on-surface-variant font-body-md text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-md">
            Unleash full AI intelligence, unlimited pipelines, and advanced analytics across your entire operating system.
          </p>

          <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-extrabold text-primary">₹129</span>
            <span className="text-xs sm:text-sm text-on-surface-variant font-semibold">/ month (Cancel anytime)</span>
          </div>
        </div>

        {/* Error Banner if Supabase operation failed */}
        {errorMessage && (
          <div className="mx-4 sm:mx-8 mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-2xl bg-error-container/40 border border-error/40 text-on-error-container text-xs space-y-2 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2 font-bold text-error">
              <span className="material-symbols-outlined text-base">error</span>
              Supabase Subscription Write Blocked (RLS)
            </div>
            <p className="text-[11px] text-on-error-container opacity-90 leading-relaxed">
              PostgreSQL Row Level Security (RLS) requires an INSERT/UPDATE policy on table <code className="bg-surface/50 px-1 py-0.5 rounded font-mono">public.subscriptions</code> for authenticated users.
            </p>
            <div className="p-2.5 rounded-xl bg-surface/80 border border-outline-variant font-mono text-[10.5px] text-on-surface overflow-x-auto space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-outline-variant pb-1.5">
                <span className="font-bold text-[10px] uppercase text-on-surface-variant font-sans">Run in Supabase SQL Editor</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">{copiedSql ? 'check' : 'content_copy'}</span>
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{rlsFixSql}</pre>
            </div>
            <pre className="font-mono text-[10px] whitespace-pre-wrap break-all opacity-80 pt-1 border-t border-error/20">
              {errorMessage}
            </pre>
          </div>
        )}

        {/* Perks List */}
        <div className="p-4 sm:p-8 space-y-3 sm:space-y-3.5 bg-surface-container-lowest overflow-y-auto flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Included in LEVELUP Pro:
          </p>
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-start gap-2.5 sm:gap-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">{perk.title}</p>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-center order-2 sm:order-1"
          >
            Stay on Free Plan
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={handleGoToCheckout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface hover:bg-surface-container border border-outline-variant transition-all cursor-pointer text-center"
            >
              View Plan Details
            </button>
            <button
              type="button"
              disabled={isUpgrading}
              onClick={handleQuickUpgrade}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              {isUpgrading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Upgrading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Upgrade to Pro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
