import React, { useState } from 'react';
import {
  FinancialHealthAnalysis,
  BudgetRecommendationPlan,
  ExpenseCategory,
} from '../../types';
import {
  PieChart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface BudgetOptimizerStudioProps {
  analysis: FinancialHealthAnalysis;
  formatCurrency: (amount: number) => string;
  onApplyMonthlyBudget: (amount: number) => void;
  userIncome: number;
  currentBudget: number;
}

export const BudgetOptimizerStudio: React.FC<BudgetOptimizerStudioProps> = ({
  analysis,
  formatCurrency,
  onApplyMonthlyBudget,
  userIncome,
  currentBudget,
}) => {
  const [savingsRateTarget, setSavingsRateTarget] = useState<number>(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState<BudgetRecommendationPlan | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const rule = analysis.rule50_30_20;

  const handleGenerateBudgetPlan = async (rate: number = savingsRateTarget) => {
    setIsGenerating(true);
    setAppliedSuccess(false);
    try {
      const res = await fetch('/api/ai/finance/budget-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncome: userIncome,
          monthlyBudget: currentBudget,
          targetSavingsRate: rate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBudgetPlan(data);
      } else {
        throw new Error('Non-OK response');
      }
    } catch (err) {
      console.warn('Using local calculation for budget plan:', err);
      const targetSavingsAmt = Math.round(userIncome * (rate / 100));
      const recommendedTotalBudget = Math.max(0, userIncome - targetSavingsAmt);

      const localPlan: BudgetRecommendationPlan = {
        id: `plan-local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        recommendedTotalBudget,
        targetSavingsRate: rate,
        projectedMonthlySavings: targetSavingsAmt,
        categoryBudgets: [
          {
            category: 'Food',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Food')?.spent || 12000,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.35),
            percentageOfIncome: 20,
            savingsPotential: Math.max(0, (analysis.categoryInsights?.find((c) => c.category === 'Food')?.spent || 12000) - Math.round(recommendedTotalBudget * 0.35)),
            rationale: 'Benchmark essential grocery and meal allocation.',
          },
          {
            category: 'Travel',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Travel')?.spent || 4000,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.15),
            percentageOfIncome: 10,
            savingsPotential: 0,
            rationale: 'Daily commute and essential transit limit.',
          },
          {
            category: 'Shopping',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Shopping')?.spent || 6000,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.15),
            percentageOfIncome: 10,
            savingsPotential: Math.max(0, (analysis.categoryInsights?.find((c) => c.category === 'Shopping')?.spent || 6000) - Math.round(recommendedTotalBudget * 0.15)),
            rationale: 'Discretionary retail & lifestyle purchases.',
          },
          {
            category: 'Subscriptions',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Subscriptions')?.spent || 2500,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.08),
            percentageOfIncome: 5,
            savingsPotential: Math.max(0, (analysis.categoryInsights?.find((c) => c.category === 'Subscriptions')?.spent || 2500) - Math.round(recommendedTotalBudget * 0.08)),
            rationale: 'Consolidated recurring digital and streaming media.',
          },
          {
            category: 'Education',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Education')?.spent || 3000,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.15),
            percentageOfIncome: 10,
            savingsPotential: 0,
            rationale: 'High-ROI personal and professional skill development.',
          },
          {
            category: 'Other',
            currentSpend: analysis.categoryInsights?.find((c) => c.category === 'Other')?.spent || 2000,
            recommendedBudget: Math.round(recommendedTotalBudget * 0.12),
            percentageOfIncome: 8,
            savingsPotential: 0,
            rationale: 'General miscellaneous and buffer expenditures.',
          },
        ],
        implementationSteps: [
          `Cap overall monthly spending at ₹${recommendedTotalBudget.toLocaleString('en-IN')}.`,
          `Set up an automated monthly transfer of ₹${targetSavingsAmt.toLocaleString('en-IN')} on payday.`,
          'Audit and trim recurring subscriptions and high-frequency food delivery orders.',
        ],
        summary: `Adjusting your monthly budget to ₹${recommendedTotalBudget.toLocaleString('en-IN')} locks in a ${rate}% savings rate, adding ₹${targetSavingsAmt.toLocaleString('en-IN')} monthly (₹${(targetSavingsAmt * 12).toLocaleString('en-IN')}/year) towards your long-term wealth goals.`,
      };

      setBudgetPlan(localPlan);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (amount: number) => {
    onApplyMonthlyBudget(amount);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 50 / 30 / 20 Framework Health Audit */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              The 50/30/20 Wealth Allocation Blueprint
            </h4>
            <p className="text-xs text-on-surface-variant">
              Gold-standard framework balancing Essential Needs (50%), Discretionary Wants (30%), and Wealth Savings (20%).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary self-start sm:self-auto">
            {rule.overallEvaluation ? 'Analysis Grounded' : 'Gold Standard'}
          </span>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs (50%) */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="font-semibold text-sm text-on-surface">Needs (50% Target)</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rule.needs.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                {rule.needs.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Actual Spend:</span>
              <strong className="text-on-surface text-sm">{formatCurrency(rule.needs.actualAmount)} ({rule.needs.actualPercentage}%)</strong>
            </div>
            <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
              <span>50% Target Limit:</span>
              <span>{formatCurrency(rule.needs.targetAmount)}</span>
            </div>

            {/* Bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (rule.needs.actualPercentage / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant pt-1">
              Includes: {rule.needs.categoriesIncluded.join(', ')}
            </p>
          </div>

          {/* Wants (30%) */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-semibold text-sm text-on-surface">Wants (30% Target)</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rule.wants.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-error/20 text-error'}`}>
                {rule.wants.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Actual Spend:</span>
              <strong className="text-on-surface text-sm">{formatCurrency(rule.wants.actualAmount)} ({rule.wants.actualPercentage}%)</strong>
            </div>
            <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
              <span>30% Target Limit:</span>
              <span>{formatCurrency(rule.wants.targetAmount)}</span>
            </div>

            {/* Bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (rule.wants.actualPercentage / 30) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant pt-1">
              Includes: {rule.wants.categoriesIncluded.join(', ')}
            </p>
          </div>

          {/* Savings (20%) */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-semibold text-sm text-on-surface">Savings (20% Target)</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rule.savings.status === 'Ahead' || rule.savings.status === 'On Track' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-error/20 text-error'}`}>
                {rule.savings.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Current Net Savings:</span>
              <strong className="text-on-surface text-sm">{formatCurrency(rule.savings.actualAmount)} ({rule.savings.actualPercentage}%)</strong>
            </div>
            <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
              <span>20% Target Goal:</span>
              <span>{formatCurrency(rule.savings.targetAmount)}</span>
            </div>

            {/* Bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (rule.savings.actualPercentage / 20) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant pt-1">
              {rule.overallEvaluation}
            </p>
          </div>
        </div>
      </div>

      {/* Target Savings Rate Controller & AI Optimizer */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              AI Category Budget Rebalancer
            </h4>
            <p className="text-xs text-on-surface-variant">
              Select your target monthly savings rate to automatically compute realistic category limits.
            </p>
          </div>

          <button
            onClick={() => handleGenerateBudgetPlan(savingsRateTarget)}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Rebalanced Budget
              </>
            )}
          </button>
        </div>

        {/* Savings Rate Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-on-surface mr-2">Target Savings Rate:</span>
          {[15, 20, 25, 30, 35, 40].map((rate) => {
            const isSelected = savingsRateTarget === rate;
            const targetAmt = Math.round(userIncome * (rate / 100));
            return (
              <button
                key={rate}
                onClick={() => {
                  setSavingsRateTarget(rate);
                  handleGenerateBudgetPlan(rate);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                <span>{rate}%</span>
                <span className="text-[10px] opacity-80">({formatCurrency(targetAmt)}/mo)</span>
              </button>
            );
          })}
        </div>

        {appliedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Success! The recommended monthly budget has been updated and applied to your LEVELUP Finance dashboard.</span>
          </div>
        )}

        {/* Generated Plan Display */}
        {budgetPlan && (
          <div className="space-y-4 pt-4 border-t border-outline-variant/40 animate-fade-up">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  AI Recommended Monthly Spending Ceiling
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-on-surface">
                    {formatCurrency(budgetPlan.recommendedTotalBudget)}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    (Secures {formatCurrency(budgetPlan.projectedMonthlySavings)}/mo savings at {budgetPlan.targetSavingsRate}%)
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  {budgetPlan.summary}
                </p>
              </div>

              <button
                onClick={() => handleApply(budgetPlan.recommendedTotalBudget)}
                className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                Apply Budget to LEVELUP
              </button>
            </div>

            {/* Category Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {budgetPlan.categoryBudgets.map((cb) => (
                <div
                  key={cb.category}
                  className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-on-surface">{cb.category}</span>
                      <span className="text-xs font-bold text-primary">
                        {formatCurrency(cb.recommendedBudget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Current: {formatCurrency(cb.currentSpend)}</span>
                      <span>Income Share: {cb.percentageOfIncome}%</span>
                    </div>
                    {cb.savingsPotential > 0 && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>Saves {formatCurrency(cb.savingsPotential)}/mo</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20 leading-tight">
                    {cb.rationale}
                  </p>
                </div>
              ))}
            </div>

            {/* Implementation Steps */}
            <div className="p-4 rounded-xl bg-surface-container-high space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Execution Blueprint
              </h5>
              <div className="space-y-1.5 text-xs text-on-surface-variant">
                {budgetPlan.implementationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
