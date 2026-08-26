import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface ProBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  featureName?: string;
  showLock?: boolean;
  inline?: boolean;
}

export const ProBadge: React.FC<ProBadgeProps> = ({
  className = '',
  size = 'xs',
  featureName = 'Pro Feature',
  showLock = true,
  inline = true,
}) => {
  const { isPro, openUpgradeModal } = useSubscription();

  if (isPro) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-primary/10 text-primary uppercase tracking-widest ${
          size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <span className="material-symbols-outlined text-[11px] leading-none">star</span>
        PRO
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        openUpgradeModal(featureName);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          openUpgradeModal(featureName);
        }
      }}
      title={`Upgrade to Pro to unlock ${featureName}`}
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border border-amber-500/30 uppercase tracking-widest transition-all cursor-pointer select-none shadow-2xs ${
        size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      {showLock ? (
        <span className="material-symbols-outlined text-[11px] leading-none text-amber-600">lock</span>
      ) : (
        <span className="material-symbols-outlined text-[11px] leading-none text-amber-600">auto_awesome</span>
      )}
      PRO
    </span>
  );
};
