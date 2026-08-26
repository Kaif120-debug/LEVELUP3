import React, { useState } from 'react';
import {
  FinancialHealthAnalysis,
  SavingsOpportunityItem,
  GoalAccelerationImpact,
  SavingsGoal,
} from '../../types';
import {
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  Clock,
  Coins,
  ShieldAlert,
} from 'lucide-react';

interface SavingsOpportunitiesStudioProps {
  analysis: FinancialHealthAnalysis;
  formatCurrency: (amount: number) => string;
  savingsGoals: SavingsGoal[];
  onAddMoneyToGoal?: (goalId: string, amount: number) => void;
  onOpenAddGoalModal?: () => void;
}

export const SavingsOpportunitiesStudio: React.FC<SavingsOpportunitiesStudioProps> = ({
  analysis,
  formatCurrency,
  savingsGoals,
  onAddMoneyToGoal,
  onOpenAddGoalModal,
}) => {
  const [appliedOpportunities, setAppliedOpportunities] = useState<Record<string, boolean>>({});
  const [activeSavingsBoost, setActiveSavingsBoost] = useState<number>(3000);

  const opportunities = analysis.savingsOpportunities || [];
  const totalPotentialMonthly = opportunities.reduce((s, o) => s + (o.estimatedMonthlySavings || 0), 0);
  const totalPotentialAnnual = opportunities.reduce((s, o) => s + (o.estimatedAnnualSavings || 0), 0);

  const handleToggleOpportunity = (id: string) => {
    setAppliedOpportunities((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDifficultyBadge = (diff: SavingsOpportunityItem['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Easy Fix</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">Challenging</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Captured / Opportunity Metrics */}
      <div className="p-6 rounded-2xl bg-surface border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Coins className="w-5 h-5" />
              </span>
              <h3 className="font-title-lg text-on-surface font-bold">
                Identified Savings Leaks & Wealth Accelerators
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              High-leverage micro-adjustments identified from your actual recurring spend and transactions.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-on-surface-variant">Monthly Potential</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalPotentialMonthly)}
                <span className="text-xs font-normal text-on-surface-variant">/mo</span>
              </p>
            </div>
            <div className="h-8 w-px bg-outline-variant/60 hidden sm:block" />
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-on-surface-variant">Annual Compound</span>
              <p className="text-xl font-bold text-primary">
                +{formatCurrency(totalPotentialAnnual)}
                <span className="text-xs font-normal text-on-surface-variant">/yr</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Concrete Savings Opportunity Cards */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Prioritized Leak Fixes
            </h4>
            <p className="text-xs text-on-surface-variant">
              Click to mark implemented or track captured surplus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => {
            const isApplied = appliedOpportunities[opp.id];
            return (
              <div
                key={opp.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isApplied
                    ? 'bg-emerald-500/5 border-emerald-500/40'
                    : 'bg-surface-container-lowest border-outline-variant/40 hover:border-outline'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant">Category: {opp.category}</span>
                        {getDifficultyBadge(opp.difficulty)}
                      </div>
                      <h5 className="font-semibold text-sm text-on-surface">{opp.title}</h5>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(opp.estimatedMonthlySavings)}/mo
                      </span>
                      <p className="text-[10px] text-on-surface-variant">
                        {formatCurrency(opp.estimatedAnnualSavings)}/yr
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    👉 <strong>Action:</strong> {opp.actionStep}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant">
                    Impact Score: <strong className="text-on-surface">{opp.impactScore}/100</strong>
                  </span>
                  <button
                    onClick={() => handleToggleOpportunity(opp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Applied' : 'Mark as Implemented'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Acceleration Impact Simulator */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Active Goal Acceleration Timeline
            </h4>
            <p className="text-xs text-on-surface-variant">
              How redirecting your captured monthly leaks accelerates completion of your actual savings goals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">Boost Monthly Savings By:</span>
            <select
              value={activeSavingsBoost}
              onChange={(e) => setActiveSavingsBoost(Number(e.target.value))}
              aria-label="Select monthly savings boost amount"
              className="text-xs px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-semibold"
            >
              <option value={1500}>+₹1,500/mo</option>
              <option value={3000}>+₹3,000/mo</option>
              <option value={5000}>+₹5,000/mo</option>
              <option value={8000}>+₹8,000/mo</option>
              <option value={10000}>+₹10,000/mo</option>
            </select>
          </div>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-6 space-y-3 text-on-surface-variant">
            <Target className="w-8 h-8 mx-auto text-primary opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">No Active Savings Goals Found</p>
              <p className="text-xs">Add a Savings Goal to see AI-powered timeline acceleration analytics.</p>
            </div>
            {onOpenAddGoalModal && (
              <button
                onClick={onOpenAddGoalModal}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase flex items-center gap-1.5 mx-auto cursor-pointer hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Create Savings Goal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {savingsGoals.map((goal) => {
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const basePace = Math.max(2000, Math.round(analysis.cashFlowSummary.netSavings * 0.5));
              const origMonths = Math.max(1, Math.ceil(remaining / basePace));
              const accelMonths = Math.max(1, Math.ceil(remaining / (basePace + activeSavingsBoost)));
              const monthsSaved = Math.max(0, origMonths - accelMonths);
              const progressPct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-sm text-on-surface">{goal.name}</h5>
                        <span className="text-xs font-bold text-primary">{progressPct}% funded</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        Target: {formatCurrency(goal.targetAmount)} • Balance: {formatCurrency(goal.currentAmount)} • Remaining: {formatCurrency(remaining)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-2 rounded-lg bg-emerald-500/15 text-right">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                          Timeline Accelerated
                        </span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400">
                          {monthsSaved > 0 ? `Saves ${monthsSaved} Months!` : 'On Track'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant pt-1">
                    <span>
                      Standard timeline: <strong>~{origMonths} months</strong> ➔ Accelerated timeline: <strong className="text-emerald-600 dark:text-emerald-400">~{accelMonths} months</strong>
                    </span>
                    {onAddMoneyToGoal && (
                      <button
                        onClick={() => onAddMoneyToGoal(goal.id, activeSavingsBoost)}
                        className="text-xs text-primary font-bold hover:underline self-start sm:self-auto cursor-pointer"
                      >
                        + Deposit {formatCurrency(activeSavingsBoost)} to this goal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
