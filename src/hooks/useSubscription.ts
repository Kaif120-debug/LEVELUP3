import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FREE_LIMITS, FeatureLimitKey, DbSubscription } from '../types';

export type ProFeature =
  | 'ai_assistant'
  | 'ai_workout_generator'
  | 'ai_diet_generator'
  | 'ai_meal_coach'
  | 'ai_fitness_recommendations'
  | 'ai_nutrition_recommendations'
  | 'ai_resume_improvement'
  | 'ai_resume_optimization'
  | 'ai_cover_letter_generator'
  | 'ai_interview_coach'
  | 'ai_career_recommendations'
  | 'ai_content_ideas'
  | 'ai_progress_insights'
  | 'advanced_fitness_analytics'
  | 'progress_analytics'
  | 'advanced_nutrition_analytics'
  | 'macro_recommendations'
  | 'advanced_finance_insights'
  | 'business_pro'
  | 'creator_pro'
  | 'advanced_portfolio_customization'
  | 'advanced_brand_kit';

export interface LimitCheckResult {
  allowed: boolean;
  isUnlimited: boolean;
  limit: number;
  current: number;
  remaining: number;
  message?: string;
}

export function useSubscription() {
  const {
    state,
    dbSubscription,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModal,
    closeUpgradeModal,
    subscribeUser,
    cancelSubscription,
    isDbLoading,
  } = useApp();
  const { isAuthLoading, user } = useAuth();

  const isSubscriptionLoading = isAuthLoading || isDbLoading;

  // A user is Pro if and only if they have an active database subscription with Pro plan in Supabase
  const isPro = Boolean(
    dbSubscription &&
      (dbSubscription.status === 'active' || dbSubscription.status === 'trial') &&
      (dbSubscription.plan === 'pro' || dbSubscription.plan_tier === 'pro' || dbSubscription.plan === 'LEVELUP_PRO')
  );

  const isFree = !isPro;
  const tier: 'pro' | 'free' = isPro ? 'pro' : 'free';
  const planName = isPro ? 'LEVELUP PRO' : 'LEVELUP Free';

  /**
   * Checks whether the user can create another resource according to their tier limit.
   */
  const checkLimit = (limitKey: FeatureLimitKey, currentCount: number): LimitCheckResult => {
    if (isPro) {
      return {
        allowed: true,
        isUnlimited: true,
        limit: Infinity,
        current: currentCount,
        remaining: Infinity,
      };
    }

    const maxLimit = FREE_LIMITS[limitKey] ?? 0;
    const allowed = currentCount < maxLimit;
    const remaining = Math.max(0, maxLimit - currentCount);

    return {
      allowed,
      isUnlimited: false,
      limit: maxLimit,
      current: currentCount,
      remaining,
      message: allowed
        ? `${remaining} of ${maxLimit} remaining on Free tier`
        : `Free tier limit of ${maxLimit} reached. Upgrade to Pro for unlimited access.`,
    };
  };

  /**
   * Enforces feature access: if Pro, runs onAllowed; if Free, opens upgrade modal with feature name.
   */
  const requirePro = (featureTitle: string, onAllowed?: () => void): boolean => {
    if (isPro) {
      if (onAllowed) onAllowed();
      return true;
    }
    // Prevent opening modal if still resolving auth or database subscription state
    if (isSubscriptionLoading) {
      return false;
    }
    openUpgradeModal(featureTitle);
    return false;
  };

  /**
   * Enforces limit check: if count is within limit or user is Pro, runs onAllowed; otherwise opens upgrade modal.
   */
  const enforceLimit = (
    limitKey: FeatureLimitKey,
    currentCount: number,
    featureTitle: string,
    onAllowed?: () => void
  ): boolean => {
    const res = checkLimit(limitKey, currentCount);
    if (res.allowed) {
      if (onAllowed) onAllowed();
      return true;
    }
    if (isSubscriptionLoading) {
      return false;
    }
    openUpgradeModal(`${featureTitle} (Limit: ${res.limit})`);
    return false;
  };

  return {
    isPro,
    isFree,
    tier,
    planName,
    isSubscriptionLoading,
    subscription: dbSubscription || state.subscription,
    limits: FREE_LIMITS,
    checkLimit,
    requirePro,
    enforceLimit,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModal,
    closeUpgradeModal,
    subscribeUser,
    cancelSubscription,
  };
}
