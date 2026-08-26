import React, { useState, useEffect, useMemo } from 'react';
import {
  FinancialHealthAnalysis,
  ExpenseItem,
  SavingsGoal,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  PieChart,
  Target,
  CheckSquare,
  MessageSquare,
  RefreshCw,
  Coins,
  ArrowUpRight,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  Lock,
  Plus,
  Clock,
  ArrowDownRight,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { SpendingPatternStudio } from './SpendingPatternStudio';
import { BudgetOptimizerStudio } from './BudgetOptimizerStudio';
import { SavingsOpportunitiesStudio } from './SavingsOpportunitiesStudio';
import { FinancialActionPlanStudio } from './FinancialActionPlanStudio';
import { AskFinancialCoachStudio } from './AskFinancialCoachStudio';
import { calculateLocalFinancialAnalysis } from '../../utils/financeCoach';

interface FinancialCoachDashboardProps {
  totalIncome: number;
  monthlyBudget: number;
  expenses: ExpenseItem[];
  savingsGoals: SavingsGoal[];
  onApplyMonthlyBudget: (budget: number) => void;
  onAddMoneyToGoal?: (goalId: string, amount: number) => void;
  onOpenAddExpenseModal?: () => void;
  onOpenAddGoalModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
  formatCurrency: (amount: number) => string;
}

type PeriodFilter = 'current_month' | 'previous_month' | 'all_time';

export const FinancialCoachDashboard: React.FC<FinancialCoachDashboardProps> = ({
  totalIncome,
  monthlyBudget,
  expenses,
  savingsGoals,
  onApplyMonthlyBudget,
  onAddMoneyToGoal,
  onOpenAddExpenseModal,
  onOpenAddGoalModal,
  onNavigateToTab,
  formatCurrency,
}) => {
  const { addPriority } = useApp();
  const { isPro, openUpgradeModal } = useSubscription();

  const [activeTab, setActiveTab] = useState<'spending' | 'optimizer' | 'savings' | 'action_plan' | 'coach_chat'>('spending');
  const [period, setPeriod] = useState<PeriodFilter>('current_month');
  const [analysis, setAnalysis] = useState<FinancialHealthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [addedPlannerItems, setAddedPlannerItems] = useState<Record<string, boolean>>({});

  // 1. Period Filtering
  const currentDate = new Date();
  const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const prevYearMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const filteredExpenses = useMemo(() => {
    if (period === 'current_month') {
      return expenses.filter((e) => e.date?.startsWith(currentYearMonth));
    }
    if (period === 'previous_month') {
      return expenses.filter((e) => e.date?.startsWith(prevYearMonth));
    }
    return expenses;
  }, [expenses, period, currentYearMonth, prevYearMonth]);

  // Previous month expenses for MoM comparison
  const prevMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date?.startsWith(prevYearMonth));
  }, [expenses, prevYearMonth]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date?.startsWith(currentYearMonth));
  }, [expenses, currentYearMonth]);

  // 2. Real calculations for current filtered period
  const periodTotalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const periodNetSavings = useMemo(() => {
    return Math.max(0, totalIncome - periodTotalExpenses);
  }, [totalIncome, periodTotalExpenses]);

  const periodSavingsRate = useMemo(() => {
    return totalIncome > 0 ? Math.round((periodNetSavings / totalIncome) * 100) : 0;
  }, [totalIncome, periodNetSavings]);

  // MoM spending comparison
  const momComparison = useMemo(() => {
    if (currentMonthExpenses.length === 0 || prevMonthExpenses.length === 0) {
      return null;
    }
    const currentTotal = currentMonthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const prevTotal = prevMonthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    if (prevTotal === 0) return null;

    const diff = currentTotal - prevTotal;
    const pctChange = Math.round((diff / prevTotal) * 100);
    return {
      currentTotal,
      prevTotal,
      diff,
      pctChange,
      isHigher: diff > 0,
    };
  }, [currentMonthExpenses, prevMonthExpenses]);

  // Detected recurring expenses
  const recurringExpenses = useMemo(() => {
    const recurringCategories = ['Subscriptions'];
    const recurringKeywords = ['netflix', 'spotify', 'prime', 'apple', 'google', 'gym', 'rent', 'wifi', 'internet', 'broadband', 'hostinger', 'aws', 'subscription', 'membership', 'sip', 'lic', 'insurance', 'emi'];

    return filteredExpenses.filter((e) => {
      const isCat = recurringCategories.includes(e.category);
      const isKeyword = recurringKeywords.some((k) => (e.name || '').toLowerCase().includes(k));
      return isCat || isKeyword;
    });
  }, [filteredExpenses]);

  const totalRecurringMonthly = useMemo(() => {
    return recurringExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }, [recurringExpenses]);

  // Multi-stage progressive loader
  const loadingSteps = [
    'Analyzing your real transaction history & cash flow velocity...',
    'Detecting spending patterns, category concentration & anomalies...',
    'Synthesizing personalized 50/30/20 targets & savings accelerators...',
  ];

  const fetchFinancialAnalysis = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage(0);

      const stageTimer1 = setTimeout(() => setLoadingStage(1), 500);
      const stageTimer2 = setTimeout(() => setLoadingStage(2), 1000);

      const activeExpenses = filteredExpenses.length > 0 ? filteredExpenses : expenses;

      const res = await fetch('/api/ai/finance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncome,
          monthlyBudget,
          expenses: activeExpenses,
          savingsGoals,
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (res.ok) {
        const data: FinancialHealthAnalysis = await res.json();
        setAnalysis(data);
      } else {
        const fallback = calculateLocalFinancialAnalysis(totalIncome, monthlyBudget, activeExpenses, savingsGoals);
        setAnalysis(fallback);
      }
    } catch (err) {
      console.warn('Using client financial intelligence fallback:', err);
      const activeExpenses = filteredExpenses.length > 0 ? filteredExpenses : expenses;
      const fallback = calculateLocalFinancialAnalysis(totalIncome, monthlyBudget, activeExpenses, savingsGoals);
      setAnalysis(fallback);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancialAnalysis();
  }, [totalIncome, monthlyBudget, filteredExpenses.length, savingsGoals.length, period]);

  const handleAddToPlanner = (title: string, priority: 'High' | 'Medium' | 'Low' = 'Medium', itemId: string) => {
    addPriority(title, priority);
    setAddedPlannerItems((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedPlannerItems((prev) => ({ ...prev, [itemId]: false }));
    }, 4000);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (score >= 65) return 'text-primary bg-primary-fixed/20 border-primary/30';
    if (score >= 45) return 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-error bg-error/15 border-error/30';
  };

  // 3. Progressive Loading State
  if (isLoading && !analysis) {
    return (
      <div className="p-12 rounded-2xl bg-surface border border-outline-variant/50 text-center space-y-6 animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center mx-auto animate-pulse shadow-sm">
          <Sparkles className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-title-md font-bold text-on-surface">LEVELUP Financial Coach AI</h3>
          <p className="text-xs text-primary font-semibold transition-all duration-300">
            {loadingSteps[loadingStage]}
          </p>
          <div className="w-48 bg-surface-container-high h-1.5 rounded-full mx-auto overflow-hidden mt-3">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty State: No transactions at all
  if (expenses.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-surface border border-dashed border-outline-variant/70 text-center space-y-5 animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-surface-container text-primary flex items-center justify-center mx-auto">
          <Coins className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="font-title-md font-bold text-on-surface">No Transactions Recorded Yet</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Add some transactions first and LEVELUP will analyze your spending habits, recurring leaks, and category benchmarks with precision AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenAddExpenseModal && (
            <button
              onClick={onOpenAddExpenseModal}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Transaction</span>
            </button>
          )}
          {onOpenAddGoalModal && (
            <button
              onClick={onOpenAddGoalModal}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface border border-outline-variant/60 font-semibold text-xs uppercase flex items-center gap-2 cursor-pointer hover:bg-surface-container-highest transition-colors"
            >
              <Target className="w-4 h-4 text-primary" />
              <span>Create Savings Goal</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 rounded-2xl bg-surface border border-outline-variant/50 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="font-semibold text-on-surface text-sm">Unable to generate financial analysis</h4>
        <button
          onClick={fetchFinancialAnalysis}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase cursor-pointer"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  const hasLimitedData = filteredExpenses.length <= 3;

  return (
    <div className="space-y-6">
      {/* Period Selection & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Analysis Timeframe</span>
            <span className="text-xs font-semibold text-on-surface">
              {period === 'current_month' && `Current Month (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`}
              {period === 'previous_month' && `Previous Month (${prevDate.toLocaleString('default', { month: 'long', year: 'numeric' })})`}
              {period === 'all_time' && `All Time History (${expenses.length} total logged)`}
            </span>
          </div>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/30">
          <button
            onClick={() => setPeriod('current_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'current_month'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('previous_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'previous_month'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'all_time'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Limited Data Notice if <= 3 transactions */}
      {hasLimitedData && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-on-surface">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-semibold text-amber-600 dark:text-amber-400">
              Not enough transaction history to identify a reliable multi-month trend.
            </strong>
            <p className="text-on-surface-variant text-[11px]">
              You have {filteredExpenses.length} transaction(s) in this period. As you log more daily expenses, the AI coach unlocks predictive category drift alerts and behavioral pattern detection.
            </p>
          </div>
        </div>
      )}

      {/* Financial Health Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-surface border border-outline-variant/60 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Health Score + Headline */}
          <div className="flex items-start gap-4">
            <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${getHealthScoreColor(analysis.healthScore)}`}>
              <span className="text-2xl font-black">{analysis.healthScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Score / 100</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-fixed/30 text-primary uppercase">
                  {analysis.healthStatus} Financial Health
                </span>
                <span className="text-xs text-on-surface-variant hidden sm:inline">
                  • AI Grounded in {filteredExpenses.length} Real Logged Outflows
                </span>
              </div>
              <h3 className="font-title-lg text-on-surface font-bold leading-tight">
                {analysis.summaryHeadline}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                {analysis.executiveSummary}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Re-Analyze */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant/40">
            <button
              onClick={fetchFinancialAnalysis}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh AI Analysis'}</span>
            </button>
            <span className="text-[10px] text-on-surface-variant">
              Updated: {new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* 4 Core Financial Vital Signs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/30">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Savings Rate</span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {analysis.cashFlowSummary.savingsRatePercent}%
            </span>
            <span className="text-[10px] text-on-surface-variant block">of monthly income</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Daily Burn Rate</span>
            <span className="text-base sm:text-lg font-bold text-on-surface">
              {formatCurrency(analysis.cashFlowSummary.dailyBurnRate)}
            </span>
            <span className="text-[10px] text-on-surface-variant block">average daily spend</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Net Cash Flow</span>
            <span className="text-base sm:text-lg font-bold text-primary">
              {formatCurrency(analysis.cashFlowSummary.netSavings)}
            </span>
            <span className="text-[10px] text-on-surface-variant block">monthly surplus</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Budget Run Rate</span>
            <span className={`text-base sm:text-lg font-bold ${analysis.cashFlowSummary.isOverBudget ? 'text-error' : 'text-on-surface'}`}>
              {analysis.cashFlowSummary.budgetAdherencePercent}%
            </span>
            <span className="text-[10px] text-on-surface-variant block">
              {analysis.cashFlowSummary.isOverBudget ? 'Exceeding limit' : 'Under budget limit'}
            </span>
          </div>
        </div>

        {/* Month-over-Month Trend Banner if available */}
        {momComparison && (
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              {momComparison.isHigher ? (
                <span className="p-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              )}
              <div>
                <span className="font-semibold text-on-surface">Month-Over-Month Outlay: </span>
                <span className={momComparison.isHigher ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                  {momComparison.pctChange > 0 ? `+${momComparison.pctChange}%` : `${momComparison.pctChange}%`} ({formatCurrency(Math.abs(momComparison.diff))})
                </span>
                <span className="text-on-surface-variant text-[11px] ml-1">
                  compared to previous month ({formatCurrency(momComparison.prevTotal)})
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary uppercase hidden sm:inline">
              MoM Verified
            </span>
          </div>
        )}
      </div>

      {/* Recurring Expenses Card */}
      {recurringExpenses.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-3">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-tertiary/15 text-tertiary">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-title-sm font-bold text-on-surface">Detected Recurring Subscriptions & Fixed Outlays</h4>
                <p className="text-xs text-on-surface-variant">
                  {recurringExpenses.length} recurring item(s) totaling <strong className="text-on-surface">{formatCurrency(totalRecurringMonthly)}/mo</strong> ({formatCurrency(totalRecurringMonthly * 12)}/yr).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {recurringExpenses.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-xs text-on-surface">{rec.name}</p>
                  <span className="text-[10px] text-on-surface-variant uppercase">{rec.category}</span>
                </div>
                <span className="text-xs font-bold text-on-surface">{formatCurrency(rec.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Plan Pro Upgrade Teaser if user is not Pro */}
      {!isPro && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-fixed/20 via-surface-container to-tertiary-fixed/20 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-bold text-xs uppercase tracking-wider text-primary">LEVELUP Pro Financial Coach</span>
            </div>
            <h4 className="font-title-sm text-on-surface font-bold">Unlock Full Predictive AI Trends, Scenario Modeling & Unlimited Chat</h4>
            <p className="text-xs text-on-surface-variant max-w-xl">
              Pro members get personalized 50/30/20 auto-rebalancing, recurring leak elimination, direct task planner integration, and custom what-if scenario simulations.
            </p>
          </div>
          <button
            onClick={() => openUpgradeModal('AI Financial Coach')}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase shrink-0 hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
      )}

      {/* Sub-Feature Tab Navigation */}
      <div className="flex border-b border-outline-variant/40 gap-2 sm:gap-4 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('spending')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'spending'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Spending & Pattern Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('optimizer')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'optimizer'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>50/30/20 & Budget Rebalancer</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'savings'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Savings Leaks & Goal Accelerators</span>
        </button>

        <button
          onClick={() => setActiveTab('action_plan')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'action_plan'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Financial Action Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('coach_chat')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'coach_chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Coach & Scenarios</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'spending' && (
        <SpendingPatternStudio
          analysis={analysis}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'optimizer' && (
        <BudgetOptimizerStudio
          analysis={analysis}
          formatCurrency={formatCurrency}
          onApplyMonthlyBudget={onApplyMonthlyBudget}
          userIncome={totalIncome}
          currentBudget={monthlyBudget}
        />
      )}

      {activeTab === 'savings' && (
        <SavingsOpportunitiesStudio
          analysis={analysis}
          formatCurrency={formatCurrency}
          savingsGoals={savingsGoals}
          onAddMoneyToGoal={onAddMoneyToGoal}
          onOpenAddGoalModal={onOpenAddGoalModal}
        />
      )}

      {activeTab === 'action_plan' && (
        <FinancialActionPlanStudio
          analysis={analysis}
          formatCurrency={formatCurrency}
          onAddToPlanner={handleAddToPlanner}
          addedPlannerItems={addedPlannerItems}
        />
      )}

      {activeTab === 'coach_chat' && (
        <AskFinancialCoachStudio
          analysis={analysis}
          formatCurrency={formatCurrency}
          totalIncome={totalIncome}
          monthlyBudget={monthlyBudget}
          expenses={filteredExpenses.length > 0 ? filteredExpenses : expenses}
          savingsGoals={savingsGoals}
        />
      )}

      {/* Prominent Legal & Regulatory Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface-variant space-y-1">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-on-surface">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Educational Guidance Disclaimer</span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-85">
          {analysis.disclaimer || 'Educational financial intelligence. LEVELUP AI Financial Coach provides cash flow guidance and does not provide regulated securities investment advice, tax filing assistance, or loan approvals.'}
        </p>
      </div>
    </div>
  );
};
