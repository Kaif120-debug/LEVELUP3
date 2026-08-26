import React, { useState } from 'react';
import { FinancialHealthAnalysis, SpendingPatternInsight, ExpenseCategory } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Repeat,
  Zap,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface SpendingPatternStudioProps {
  analysis: FinancialHealthAnalysis;
  formatCurrency: (amount: number) => string;
}

export const SpendingPatternStudio: React.FC<SpendingPatternStudioProps> = ({
  analysis,
  formatCurrency,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [dismissedPatterns, setDismissedPatterns] = useState<Record<string, boolean>>({});

  const patterns = analysis.spendingPatterns || [];
  const filteredPatterns = patterns.filter((p) => {
    if (dismissedPatterns[p.id]) return false;
    if (filterSeverity === 'all') return true;
    return p.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: SpendingPatternInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-error/20 text-error">High Leak</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400">Watch Item</span>;
      case 'positive':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Healthy Habit</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">Insight</span>;
    }
  };

  const getPatternIcon = (type: SpendingPatternInsight['type']) => {
    switch (type) {
      case 'recurring_subscription':
        return <Repeat className="w-5 h-5 text-tertiary" />;
      case 'impulse_spike':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'weekend_trend':
        return <Calendar className="w-5 h-5 text-cyan-500" />;
      case 'positive_habit':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Layers className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Daily Burn Rate</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {formatCurrency(analysis.cashFlowSummary.dailyBurnRate)}
            <span className="text-xs font-normal text-on-surface-variant">/day</span>
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Projected monthly spend: <strong className="text-on-surface">{formatCurrency(analysis.cashFlowSummary.projectedMonthEndExpenses)}</strong>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Detected Pattern Leaks</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {patterns.filter((p) => p.severity === 'warning' || p.severity === 'critical').length}
            <span className="text-xs font-normal text-on-surface-variant"> anomalies</span>
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Total addressable savings:{' '}
            <strong className="text-emerald-500">
              {formatCurrency(patterns.reduce((s, p) => s + (p.impactAmount || 0), 0))}
            </strong>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Budget Run-Rate Status</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className={`text-2xl font-bold ${analysis.cashFlowSummary.isOverBudget ? 'text-error' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {analysis.cashFlowSummary.isOverBudget ? 'Over Budget' : 'Within Budget'}
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Adherence: <strong className="text-on-surface">{analysis.cashFlowSummary.budgetAdherencePercent}%</strong> of set ceiling
          </p>
        </div>
      </div>

      {/* Category Spending Velocity & Breakdown */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Category Spending Velocity & Benchmarks
            </h4>
            <p className="text-xs text-on-surface-variant">
              Actual category allocations compared against prudent financial benchmarks.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {analysis.categoryInsights.map((cat) => {
            const isHighRisk = cat.riskLevel === 'High';
            const isMedRisk = cat.riskLevel === 'Medium';
            const barColor = isHighRisk ? 'bg-error' : isMedRisk ? 'bg-amber-500' : 'bg-primary';

            return (
              <div key={cat.category} className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-on-surface">{cat.category}</span>
                    <span className="text-xs text-on-surface-variant">
                      {formatCurrency(cat.spent)} ({cat.percentageOfTotal}% of total spend)
                    </span>
                    {isHighRisk && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error uppercase">
                        High Concentration
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <span>Income Share: <strong className="text-on-surface">{cat.percentageOfIncome}%</strong></span>
                    <span>•</span>
                    <span>Benchmark: <strong>{cat.benchmarkPercentage}%</strong></span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`${barColor} h-full transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(3, cat.percentageOfTotal))}%` }}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 pt-1">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    💡 <strong>Insight:</strong> {cat.insight}
                  </p>
                  <p className="text-xs text-primary shrink-0 hidden md:block">
                    🎯 {cat.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern Detection Cards */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              AI Detected Patterns & Behavioral Leaks
            </h4>
            <p className="text-xs text-on-surface-variant">
              Automated behavioral heuristics identifying recurring charges, impulse spikes, and saving habits.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              aria-label="Filter spending pattern severity"
              className="text-xs px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant text-on-surface"
            >
              <option value="all">All Severities</option>
              <option value="critical">High Leak</option>
              <option value="warning">Watch Items</option>
              <option value="positive">Healthy Habits</option>
            </select>
          </div>
        </div>

        {filteredPatterns.length === 0 ? (
          <div className="text-center py-8 space-y-2 text-on-surface-variant">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
            <p className="text-sm font-medium text-on-surface">No active leak patterns found</p>
            <p className="text-xs">Your current spending habits are well within target parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatterns.map((pat) => (
              <div
                key={pat.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3 flex flex-col justify-between hover:border-outline transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-surface-container-high shrink-0">
                        {getPatternIcon(pat.type)}
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-on-surface leading-tight">{pat.title}</h5>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          Category: {pat.category}
                        </span>
                      </div>
                    </div>
                    {getSeverityBadge(pat.severity)}
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {pat.description}
                  </p>

                  {pat.impactAmount && pat.impactAmount > 0 && (
                    <div className="p-2 rounded-lg bg-primary-fixed/15 border border-primary/20 text-xs flex items-center justify-between text-on-surface">
                      <span className="text-on-surface-variant">Estimated Monthly Impact:</span>
                      <strong className="text-primary font-bold">~{formatCurrency(pat.impactAmount)}/mo</strong>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-on-surface-variant truncate">
                    👉 <strong>Action:</strong> {pat.suggestedAction}
                  </div>
                  <button
                    onClick={() => setDismissedPatterns((prev) => ({ ...prev, [pat.id]: true }))}
                    className="text-[11px] font-semibold text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
