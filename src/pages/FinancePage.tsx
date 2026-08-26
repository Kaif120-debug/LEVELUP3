import React, { useState, useMemo } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { ExpenseItem, ExpenseCategory, SavingsGoal } from '../types';
import { FinancialCoachDashboard } from '../components/finance/FinancialCoachDashboard';

type FinanceTab = 'overview' | 'ai_coach' | 'budget' | 'expenses' | 'goals';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Education', 'Shopping', 'Subscriptions', 'Other'];

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: 'restaurant',
  Travel: 'commute',
  Education: 'school',
  Shopping: 'shopping_bag',
  Subscriptions: 'subscriptions',
  Other: 'category',
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: 'bg-primary-fixed/30 text-primary',
  Travel: 'bg-secondary-container text-on-secondary-fixed-variant',
  Education: 'bg-surface-tint/20 text-surface-tint',
  Shopping: 'bg-error-container/40 text-on-error-container',
  Subscriptions: 'bg-tertiary-fixed/60 text-tertiary',
  Other: 'bg-surface-container-high text-on-surface-variant',
};

export const FinancePage: React.FC = () => {
  const {
    state,
    updateTotalIncome,
    updateMonthlyBudget,
    deleteMonthlyBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    addSavingsGoal,
    updateSavingsGoal,
    addMoneyToGoal,
    deleteSavingsGoal,
    openAIModal,
  } = useApp();

  const finance = state.finance || {
    totalIncome: 85000,
    monthlyBudget: 45000,
    expenses: [],
    savingsGoals: [],
  };

  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');

  // Modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState(finance.totalIncome.toString());

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(finance.monthlyBudget.toString());

  React.useEffect(() => {
    setIncomeInput(finance.totalIncome.toString());
  }, [finance.totalIncome]);

  React.useEffect(() => {
    setBudgetInput(finance.monthlyBudget.toString());
  }, [finance.monthlyBudget]);

  // Expense Modal (Add / Edit)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Food');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Category Filter in Expenses Tab
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [expenseSearch, setExpenseSearch] = useState('');

  // Savings Goal Modal (Create / Edit)
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  // Add Money to Goal Modal
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [targetGoalForDeposit, setTargetGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Calculations
  const totalExpenses = useMemo(() => {
    return finance.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [finance.expenses]);

  const totalSavings = useMemo(() => {
    return Math.max(0, finance.totalIncome - totalExpenses);
  }, [finance.totalIncome, totalExpenses]);

  const monthlyBudget = finance.monthlyBudget || 0;
  const budgetSpent = totalExpenses;
  const budgetRemaining = Math.max(0, monthlyBudget - budgetSpent);
  const budgetProgressPercent = monthlyBudget > 0 ? Math.min(100, Math.round((budgetSpent / monthlyBudget) * 100)) : 0;
  const isOverBudget = monthlyBudget > 0 && budgetSpent > monthlyBudget;

  const categoryExpenses = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      Food: 0,
      Travel: 0,
      Education: 0,
      Shopping: 0,
      Subscriptions: 0,
      Other: 0,
    };
    finance.expenses.forEach((exp) => {
      if (map[exp.category] !== undefined) {
        map[exp.category] += Number(exp.amount) || 0;
      } else {
        map['Other'] += Number(exp.amount) || 0;
      }
    });
    return map;
  }, [finance.expenses]);

  const filteredExpenses = useMemo(() => {
    return finance.expenses.filter((exp) => {
      const matchCat = selectedCategoryFilter === 'All' || exp.category === selectedCategoryFilter;
      const matchSearch =
        expenseSearch.trim() === '' ||
        exp.name.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(expenseSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [finance.expenses, selectedCategoryFilter, expenseSearch]);

  // Form Handlers
  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val >= 0) {
      updateTotalIncome(val);
    }
    setShowIncomeModal(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      updateMonthlyBudget(val);
    }
    setShowBudgetModal(false);
  };

  const handleDeleteBudgetClick = () => {
    if (confirm('Are you sure you want to reset your monthly budget?')) {
      deleteMonthlyBudget();
    }
  };

  const openAddExpenseModal = () => {
    setEditingExpenseId(null);
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('Food');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseNotes('');
    setShowExpenseModal(true);
  };

  const openEditExpenseModal = (exp: ExpenseItem) => {
    setEditingExpenseId(exp.id);
    setExpenseName(exp.name);
    setExpenseAmount(exp.amount.toString());
    setExpenseCategory(exp.category);
    setExpenseDate(exp.date);
    setExpenseNotes(exp.notes || '');
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim()) return;
    const amountVal = parseFloat(expenseAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        name: expenseName.trim(),
        amount: amountVal,
        category: expenseCategory,
        date: expenseDate,
        notes: expenseNotes.trim() || undefined,
      });
    } else {
      addExpense({
        name: expenseName.trim(),
        amount: amountVal,
        category: expenseCategory,
        date: expenseDate,
        notes: expenseNotes.trim() || undefined,
      });
    }

    setShowExpenseModal(false);
  };

  const openAddGoalModal = () => {
    setEditingGoalId(null);
    setGoalName('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('');
    setGoalTargetDate('');
    setGoalNotes('');
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setGoalName(goal.name);
    setGoalTargetAmount(goal.targetAmount.toString());
    setGoalCurrentAmount(goal.currentAmount.toString());
    setGoalTargetDate(goal.targetDate);
    setGoalNotes(goal.notes || '');
    setShowGoalModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    const targetVal = parseFloat(goalTargetAmount);
    const currentVal = parseFloat(goalCurrentAmount) || 0;
    if (isNaN(targetVal) || targetVal <= 0) return;

    if (editingGoalId) {
      updateSavingsGoal(editingGoalId, {
        name: goalName.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        targetDate: goalTargetDate.trim() || 'No target date',
        notes: goalNotes.trim() || undefined,
      });
    } else {
      addSavingsGoal({
        name: goalName.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        targetDate: goalTargetDate.trim() || 'Ongoing',
        notes: goalNotes.trim() || undefined,
      });
    }

    setShowGoalModal(false);
  };

  const openDepositModal = (goal: SavingsGoal) => {
    setTargetGoalForDeposit(goal);
    setDepositAmount('');
    setShowAddMoneyModal(true);
  };

  const handleAddMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoalForDeposit) return;
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    addMoneyToGoal(targetGoalForDeposit.id, amountVal);
    setShowAddMoneyModal(false);
    setTargetGoalForDeposit(null);
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="finance" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-section-gap px-4 sm:px-6 lg:px-margin-desktop bg-surface-bright min-h-screen overflow-y-auto w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-stack-sm border-b border-outline-variant/50">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Finance</h2>
              <p className="font-body-md text-on-surface-variant">Master your cash flow, expenses, budgets, and wealth goals.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('ai_coach')}
                className="px-4 py-2.5 border border-primary text-primary rounded font-label-caps uppercase text-xs hover:bg-primary-fixed/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                AI Financial Coach
              </button>
              <button
                onClick={openAddExpenseModal}
                className="bg-primary-container text-on-primary px-5 py-2.5 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Expense
              </button>
            </div>
          </header>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-outline-variant gap-2 overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 font-label-caps text-xs uppercase transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-primary text-primary font-bold bg-primary-fixed/10'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('ai_coach')}
              className={`px-5 py-3 font-label-caps text-xs uppercase transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'ai_coach'
                  ? 'border-primary text-primary font-bold bg-primary-fixed/20'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
              AI Financial Coach
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-on-primary uppercase">
                Coach
              </span>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-5 py-3 font-label-caps text-xs uppercase transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'budget'
                  ? 'border-primary text-primary font-bold bg-primary-fixed/10'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              Budget
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-5 py-3 font-label-caps text-xs uppercase transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'expenses'
                  ? 'border-primary text-primary font-bold bg-primary-fixed/10'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Expenses ({finance.expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-5 py-3 font-label-caps text-xs uppercase transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'goals'
                  ? 'border-primary text-primary font-bold bg-primary-fixed/10'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">savings</span>
              Savings Goals ({finance.savingsGoals.length})
            </button>
          </div>

          {/* ========================================================================= */}
          {/* FINANCE OVERVIEW CARDS (Always visible on Overview, or top stats) */}
          {/* ========================================================================= */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-on-surface uppercase tracking-wider text-xs font-bold">
                Finance Overview
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">Monthly Active Period</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {/* Total Income */}
              <div
                onClick={() => {
                  setIncomeInput(finance.totalIncome.toString());
                  setShowIncomeModal(true);
                }}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col justify-between hover:border-primary transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                      payments
                    </span>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase">Total Income</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-60 group-hover:opacity-100">
                    edit
                  </span>
                </div>
                <div>
                  <div className="font-display-lg text-display-lg text-on-surface leading-none mb-1">
                    {formatCurrency(finance.totalIncome)}
                  </div>
                  <p className="text-xs text-primary font-medium">Monthly Cash Inflow</p>
                </div>
              </div>

              {/* Total Expenses */}
              <div
                onClick={() => setActiveTab('expenses')}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col justify-between hover:border-primary transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform">
                      receipt_long
                    </span>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase">Total Expenses</span>
                  </div>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-bold">
                    {finance.expenses.length} logs
                  </span>
                </div>
                <div>
                  <div className="font-display-lg text-display-lg text-on-surface leading-none mb-1">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {finance.totalIncome > 0
                      ? `${Math.round((totalExpenses / finance.totalIncome) * 100)}% of income spent`
                      : 'Total logged this month'}
                  </p>
                </div>
              </div>

              {/* Total Savings */}
              <div
                onClick={() => setActiveTab('goals')}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col justify-between hover:border-primary transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                      savings
                    </span>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase">Total Savings</span>
                  </div>
                  <span className="text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded-full">
                    Net Surplus
                  </span>
                </div>
                <div>
                  <div className="font-display-lg text-display-lg text-primary leading-none mb-1">
                    {formatCurrency(totalSavings)}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {finance.totalIncome > 0
                      ? `${Math.round((totalSavings / finance.totalIncome) * 100)}% net savings rate`
                      : 'Surplus available'}
                  </p>
                </div>
              </div>

              {/* Current Budget */}
              <div
                onClick={() => {
                  setBudgetInput(finance.monthlyBudget.toString());
                  setShowBudgetModal(true);
                }}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col justify-between hover:border-primary transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                      account_balance_wallet
                    </span>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase">Current Budget</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-60 group-hover:opacity-100">
                    edit
                  </span>
                </div>
                <div>
                  <div className="font-display-lg text-display-lg text-on-surface leading-none mb-1">
                    {formatCurrency(monthlyBudget)}
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-on-surface-variant">{formatCurrency(budgetSpent)} spent</span>
                    <span className={`font-bold ${isOverBudget ? 'text-error' : 'text-primary'}`}>
                      {isOverBudget ? 'Over Budget' : `${formatCurrency(budgetRemaining)} left`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW COMPREHENSIVE VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Left Column (7 cols): Budget Visualizer + Recent Expenses */}
              <div className="lg:col-span-7 flex flex-col gap-gutter">
                {/* Budget Progress Box */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-headline-sm text-on-surface">Monthly Budget Tracker</h3>
                      <p className="text-on-surface-variant text-xs mt-0.5">Track spend velocity against monthly target</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('budget')}
                      className="text-primary font-label-caps text-xs uppercase hover:underline cursor-pointer"
                    >
                      Manage Budget
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                      <div>
                        <span className="text-on-surface-variant text-xs block uppercase font-label-caps">Spent / Limit</span>
                        <strong className="text-base text-on-surface">
                          {formatCurrency(budgetSpent)}{' '}
                          <span className="text-on-surface-variant font-normal">/ {formatCurrency(monthlyBudget)}</span>
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-on-surface-variant text-xs block uppercase font-label-caps">Remaining</span>
                        <strong className={`text-base ${isOverBudget ? 'text-error' : 'text-primary'}`}>
                          {isOverBudget ? `-${formatCurrency(budgetSpent - monthlyBudget)} Exceeded` : formatCurrency(budgetRemaining)}
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isOverBudget
                            ? 'bg-error'
                            : budgetProgressPercent > 80
                            ? 'bg-secondary-container'
                            : 'bg-primary-container'
                        }`}
                        style={{ width: `${Math.min(100, budgetProgressPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>0%</span>
                      <span>{budgetProgressPercent}% Used</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Category Spend Distribution Mini */}
                  <div className="mt-8 pt-6 border-t border-outline-variant/40">
                    <h4 className="font-label-caps text-xs text-on-surface-variant uppercase mb-4">Category Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((cat) => {
                        const amount = categoryExpenses[cat] || 0;
                        const catPct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                        return (
                          <div key={cat} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-on-surface flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-primary">{CATEGORY_ICONS[cat]}</span>
                                {cat}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-bold">{catPct}%</span>
                            </div>
                            <p className="text-xs font-bold text-on-surface">{formatCurrency(amount)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Expenses List */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-outline-variant/40 flex justify-between items-center">
                    <div>
                      <h3 className="font-headline-sm text-on-surface">Recent Expenses</h3>
                      <p className="text-on-surface-variant text-xs">Latest recorded transactions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openAddExpenseModal}
                        className="text-primary font-label-caps text-xs border border-primary/40 px-3 py-1.5 rounded hover:bg-primary-fixed/20 transition-colors uppercase cursor-pointer"
                      >
                        + Add
                      </button>
                      <button
                        onClick={() => setActiveTab('expenses')}
                        className="text-on-surface-variant font-label-caps text-xs hover:text-on-surface uppercase cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-outline-variant/30">
                    {finance.expenses.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[exp.category] || 'bg-surface-container'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {CATEGORY_ICONS[exp.category] || 'receipt'}
                            </span>
                          </div>
                          <div>
                            <p className="font-body-md font-medium text-sm text-on-surface">{exp.name}</p>
                            <p className="text-xs text-on-surface-variant">
                              {exp.date} {exp.notes ? `• ${exp.notes}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-on-surface">{formatCurrency(exp.amount)}</span>
                          <span className="block text-[10px] text-on-surface-variant font-label-caps uppercase">{exp.category}</span>
                        </div>
                      </div>
                    ))}
                    {finance.expenses.length === 0 && (
                      <div className="p-8 text-center text-on-surface-variant text-sm">
                        No expenses logged yet. Click "+ Add" to log your first expense.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Savings Goals & AI Tips */}
              <div className="lg:col-span-5 flex flex-col gap-gutter">
                {/* Savings Goals Highlight */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-sm text-on-surface">Savings Goals</h3>
                    <button
                      onClick={openAddGoalModal}
                      className="text-primary font-label-caps text-xs uppercase border border-primary/30 px-3 py-1 rounded hover:bg-primary-fixed/20 transition-colors cursor-pointer"
                    >
                      + New Goal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {finance.savingsGoals.map((goal) => {
                      const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                      return (
                        <div
                          key={goal.id}
                          className="p-4 bg-surface border border-outline-variant/40 rounded-xl hover:border-primary transition-all space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-headline-sm text-sm text-on-surface font-bold">{goal.name}</h4>
                              <p className="text-xs text-on-surface-variant">Target: {goal.targetDate}</p>
                            </div>
                            <button
                              onClick={() => openDepositModal(goal)}
                              className="text-xs bg-primary-container text-on-primary px-3 py-1 rounded font-label-caps uppercase hover:bg-primary transition-colors cursor-pointer"
                            >
                              Add Money
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-primary font-bold">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                              </span>
                              <span className="text-on-surface-variant">{pct}%</span>
                            </div>
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-primary-container h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {finance.savingsGoals.length === 0 && (
                      <div className="p-6 text-center text-on-surface-variant text-sm border border-dashed border-outline-variant rounded-xl">
                        No savings goals created yet. Set up a target to begin building reserves!
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Financial Strategy Card */}
                <div className="bg-surface-container-low border border-surface-variant rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <h3 className="font-headline-sm text-on-surface text-sm">Smart Financial Insights</h3>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                    Based on your active income of {formatCurrency(finance.totalIncome)} and current spend rate,
                    allocating 20% ({formatCurrency(finance.totalIncome * 0.2)}) to high-yield savings accelerates your Emergency Fund milestone by 2.4 months.
                  </p>
                  <button
                    onClick={() => setActiveTab('ai_coach')}
                    className="w-full py-2.5 bg-surface-container-lowest border border-outline-variant hover:border-primary rounded text-xs font-label-caps uppercase text-primary transition-colors cursor-pointer"
                  >
                    Open AI Financial Coach
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: AI FINANCIAL COACH */}
          {/* ========================================================================= */}
          {activeTab === 'ai_coach' && (
            <div className="animate-fade-up">
              <FinancialCoachDashboard
                totalIncome={finance.totalIncome}
                monthlyBudget={monthlyBudget}
                expenses={finance.expenses}
                savingsGoals={finance.savingsGoals}
                onApplyMonthlyBudget={(budget) => {
                  updateMonthlyBudget(budget);
                }}
                onAddMoneyToGoal={(goalId, amount) => {
                  addMoneyToGoal(goalId, amount);
                }}
                onOpenAddExpenseModal={() => {
                  setEditingExpenseId(null);
                  setExpenseName('');
                  setExpenseAmount('');
                  setExpenseCategory('Food');
                  setExpenseDate(new Date().toISOString().split('T')[0]);
                  setExpenseNotes('');
                  setShowExpenseModal(true);
                }}
                onOpenAddGoalModal={openAddGoalModal}
                onNavigateToTab={(tab) => setActiveTab(tab as FinanceTab)}
                formatCurrency={formatCurrency}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BUDGET MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'budget' && (
            <div className="space-y-stack-md animate-fade-up">
              {/* Budget Controls Header Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-headline-lg text-on-surface">Monthly Budget Overview</h3>
                    <p className="text-on-surface-variant text-sm">Control spending limits and monitor remaining balance</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setBudgetInput(monthlyBudget.toString());
                        setShowBudgetModal(true);
                      }}
                      className="bg-primary-container text-on-primary px-5 py-2.5 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      {monthlyBudget > 0 ? 'Edit Budget' : 'Create Budget'}
                    </button>
                    {monthlyBudget > 0 && (
                      <button
                        onClick={handleDeleteBudgetClick}
                        className="border border-error/40 text-error px-4 py-2.5 rounded font-label-caps uppercase text-xs hover:bg-error-container/20 transition-colors cursor-pointer"
                      >
                        Delete Budget
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Metric Highlighters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-6">
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase block mb-1">
                      Monthly Budget
                    </span>
                    <div className="font-display-lg text-on-surface leading-none">
                      {formatCurrency(monthlyBudget)}
                    </div>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase block mb-1">
                      Amount Spent
                    </span>
                    <div className="font-display-lg text-on-surface leading-none">
                      {formatCurrency(budgetSpent)}
                    </div>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase block mb-1">
                      Amount Remaining
                    </span>
                    <div className={`font-display-lg leading-none ${isOverBudget ? 'text-error' : 'text-primary'}`}>
                      {isOverBudget ? `-${formatCurrency(budgetSpent - monthlyBudget)}` : formatCurrency(budgetRemaining)}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-on-surface">
                      Budget Utilization:{' '}
                      <strong className={isOverBudget ? 'text-error' : 'text-primary'}>
                        {budgetProgressPercent}%
                      </strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isOverBudget
                        ? 'bg-error-container text-on-error-container'
                        : budgetProgressPercent > 80
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary-fixed text-on-primary-fixed'
                    }`}>
                      {isOverBudget ? 'Exceeded Limit' : budgetProgressPercent > 80 ? 'Approaching Limit' : 'Within Budget'}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isOverBudget
                          ? 'bg-error'
                          : budgetProgressPercent > 80
                          ? 'bg-secondary-container'
                          : 'bg-primary-container'
                      }`}
                      style={{ width: `${Math.min(100, budgetProgressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Budgets Grid */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8 shadow-sm">
                <h3 className="font-headline-sm text-on-surface mb-6">Category Spending Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const spent = categoryExpenses[cat] || 0;
                    const pctOfTotal = totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0;
                    return (
                      <div
                        key={cat}
                        className="p-5 bg-surface border border-outline-variant/50 rounded-xl space-y-3 hover:border-primary transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[cat]}`}>
                              <span className="material-symbols-outlined text-[18px]">{CATEGORY_ICONS[cat]}</span>
                            </div>
                            <span className="font-headline-sm text-sm text-on-surface font-bold">{cat}</span>
                          </div>
                          <span className="text-xs text-on-surface-variant font-bold">{pctOfTotal}%</span>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-on-surface">{formatCurrency(spent)}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {finance.expenses.filter((e) => e.category === cat).length} recorded items
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXPENSE TRACKER */}
          {/* ========================================================================= */}
          {activeTab === 'expenses' && (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm animate-fade-up">
              {/* Header & Filter Controls */}
              <div className="p-6 border-b border-outline-variant/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Expense Tracker</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">Manage, filter, and audit all recorded expenditures</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search expense or note..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg text-xs bg-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={openAddExpenseModal}
                    className="bg-primary-container text-on-primary px-4 py-2 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-label-caps text-on-surface-variant uppercase mr-2 shrink-0">Filter:</span>
                <button
                  onClick={() => setSelectedCategoryFilter('All')}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                    selectedCategoryFilter === 'All'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  All ({finance.expenses.length})
                </button>
                {CATEGORIES.map((cat) => {
                  const count = finance.expenses.filter((e) => e.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 ${
                        selectedCategoryFilter === cat
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{CATEGORY_ICONS[cat]}</span>
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Expenses Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant/40">
                    <tr>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Expense Name</th>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Category</th>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Date</th>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Notes</th>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant text-right">Amount</th>
                      <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-sm">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="p-4 font-medium text-on-surface">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[18px] text-primary">
                              {CATEGORY_ICONS[exp.category]}
                            </span>
                            <span>{exp.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[exp.category]}`}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-xs">{exp.date}</td>
                        <td className="p-4 text-on-surface-variant text-xs max-w-xs truncate">
                          {exp.notes || '—'}
                        </td>
                        <td className="p-4 text-right font-bold text-on-surface">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditExpenseModal(exp)}
                              className="text-on-surface-variant hover:text-primary p-1.5 rounded transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete expense "${exp.name}"?`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="text-on-surface-variant hover:text-error p-1.5 rounded transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm">
                          No expenses found matching the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SAVINGS GOALS */}
          {/* ========================================================================= */}
          {activeTab === 'goals' && (
            <div className="space-y-stack-md animate-fade-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-headline-lg text-on-surface">Savings Goals</h3>
                  <p className="text-on-surface-variant text-sm">Track milestones, deposit funds, and reach your targets</p>
                </div>
                <button
                  onClick={openAddGoalModal}
                  className="bg-primary-container text-on-primary px-5 py-2.5 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Savings Goal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {finance.savingsGoals.map((goal) => {
                  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                  const isCompleted = goal.currentAmount >= goal.targetAmount;
                  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                  return (
                    <div
                      key={goal.id}
                      className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between hover:border-primary transition-all shadow-sm group space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">
                                {isCompleted ? 'verified' : 'savings'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-headline-sm text-base text-on-surface font-bold leading-tight">
                                {goal.name}
                              </h4>
                              <p className="text-xs text-on-surface-variant mt-0.5">Target Date: {goal.targetDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditGoalModal(goal)}
                              className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors cursor-pointer"
                              title="Edit Goal"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete savings goal "${goal.name}"?`)) {
                                  deleteSavingsGoal(goal.id);
                                }
                              }}
                              className="text-on-surface-variant hover:text-error p-1 rounded transition-colors cursor-pointer"
                              title="Delete Goal"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {goal.notes && (
                          <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                            {goal.notes}
                          </p>
                        )}

                        {/* Progress Section */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-label-caps text-on-surface-variant uppercase">Current Progress</span>
                            <span className="text-xs font-bold text-primary">{pct}%</span>
                          </div>
                          {/* Exact format requested: ₹27,400 / ₹50,000 */}
                          <div className="text-xl font-bold text-on-surface">
                            {formatCurrency(goal.currentAmount)}{' '}
                            <span className="text-on-surface-variant font-normal text-sm">/ {formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCompleted ? 'bg-primary' : 'bg-primary-container'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                            <span>{isCompleted ? 'Goal Achieved!' : `${formatCurrency(remaining)} remaining`}</span>
                            <span>Target: {formatCurrency(goal.targetAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deposit Action */}
                      <button
                        onClick={() => openDepositModal(goal)}
                        className="w-full py-2.5 bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-primary font-label-caps uppercase text-xs rounded-lg transition-colors border border-outline-variant/40 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Add Money
                      </button>
                    </div>
                  );
                })}

                {finance.savingsGoals.length === 0 && (
                  <div className="col-span-full p-12 text-center text-on-surface-variant text-sm bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl">
                    <span className="material-symbols-outlined text-[48px] text-primary/40 block mb-2">savings</span>
                    <p className="font-bold text-on-surface mb-1">No Savings Goals Yet</p>
                    <p className="text-xs mb-4">Set clear targets for emergency funds, major purchases, or travel.</p>
                    <button
                      onClick={openAddGoalModal}
                      className="bg-primary-container text-on-primary px-5 py-2.5 rounded font-label-caps uppercase text-xs cursor-pointer"
                    >
                      + Create First Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL: UPDATE TOTAL INCOME */}
        {/* ========================================================================= */}
        {showIncomeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full animate-fade-up shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary">Update Monthly Income</h3>
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSaveIncome} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Monthly Total Income (₹)
                  </label>
                  <input
                    type="number"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 85000"
                    required
                    min="0"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIncomeModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-caps text-xs text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                  >
                    Save Income
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT BUDGET */}
        {/* ========================================================================= */}
        {showBudgetModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full animate-fade-up shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary">
                  {monthlyBudget > 0 ? 'Edit Monthly Budget' : 'Create Monthly Budget'}
                </h3>
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Monthly Budget Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 45000"
                    required
                    min="0"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBudgetModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-caps text-xs text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                  >
                    Save Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD / EDIT EXPENSE */}
        {/* ========================================================================= */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-md w-full animate-fade-up shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary">
                  {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Expense Name *
                  </label>
                  <input
                    type="text"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Grocery & Essentials"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. 2400"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                      Category *
                    </label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Weekly organic market produce"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-caps text-xs text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                  >
                    {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT SAVINGS GOAL */}
        {/* ========================================================================= */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-md w-full animate-fade-up shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary">
                  {editingGoalId ? 'Edit Savings Goal' : 'Create Savings Goal'}
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSaveGoal} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Emergency Fund"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                      Target Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={goalTargetAmount}
                      onChange={(e) => setGoalTargetAmount(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. 50000"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                      Current Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={goalCurrentAmount}
                      onChange={(e) => setGoalCurrentAmount(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. 27400"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Target Date
                  </label>
                  <input
                    type="text"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Dec 2024 or 2025-06-30"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={goalNotes}
                    onChange={(e) => setGoalNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 6 months buffer for living essentials"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-caps text-xs text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                  >
                    {editingGoalId ? 'Update Goal' : 'Save Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD MONEY TO SAVINGS GOAL */}
        {/* ========================================================================= */}
        {showAddMoneyModal && targetGoalForDeposit && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full animate-fade-up shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-headline-sm text-primary">Add Money to Goal</h3>
                  <p className="text-xs text-on-surface-variant">{targetGoalForDeposit.name}</p>
                </div>
                <button
                  onClick={() => setShowAddMoneyModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg mb-4 text-xs space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Current:</span>
                  <strong className="text-on-surface">{formatCurrency(targetGoalForDeposit.currentAmount)}</strong>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Target:</span>
                  <strong className="text-on-surface">{formatCurrency(targetGoalForDeposit.targetAmount)}</strong>
                </div>
              </div>

              <form onSubmit={handleAddMoneySubmit} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 text-on-surface-variant uppercase">
                    Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 5000"
                    required
                    min="1"
                    autoFocus
                  />
                </div>

                {/* Quick Add Presets */}
                <div className="flex gap-2">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="flex-1 py-1.5 bg-surface-container-high hover:bg-primary-fixed/40 text-on-surface text-[11px] font-bold rounded transition-colors cursor-pointer"
                    >
                      +₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-caps text-xs text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                  >
                    Deposit Funds
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
