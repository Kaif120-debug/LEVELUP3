import { useSubscription, ProFeature } from './useSubscription';
import { FeatureLimitKey } from '../types';

export function useFeatureAccess() {
  const sub = useSubscription();

  return {
    ...sub,

    // AI Feature Checks
    canUseAI: sub.isPro,
    canGenerateWorkoutAI: sub.isPro,
    canGenerateDietAI: sub.isPro,
    canUseAICoach: sub.isPro,
    canOptimizeResumeAI: sub.isPro,
    canGenerateCoverLetterAI: sub.isPro,
    canUseAIInterviewCoach: sub.isPro,
    canGenerateContentIdeasAI: sub.isPro,

    // Business Checks
    canCreateClient: (currentCount: number) => sub.checkLimit('clients', currentCount),
    canCreateProposal: (currentCount: number) => sub.checkLimit('proposals', currentCount),
    canCreateInvoice: (currentCount: number) => sub.checkLimit('invoices', currentCount),

    // Fitness & Nutrition Checks
    canCreateWorkoutPlan: (currentCount: number) => sub.checkLimit('workoutPlans', currentCount),
    canCreateDietPlan: (currentCount: number) => sub.checkLimit('dietPlans', currentCount),

    // Career Checks
    canCreateResume: (currentCount: number) => sub.checkLimit('resumes', currentCount),
    canAddJobApplication: (currentCount: number) => sub.checkLimit('jobApplications', currentCount),
    canSaveCoverLetter: (currentCount: number) => sub.checkLimit('coverLetters', currentCount),
    canCreatePortfolio: (currentCount: number) => sub.checkLimit('portfolios', currentCount),
  };
}
