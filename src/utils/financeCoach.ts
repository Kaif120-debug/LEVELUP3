import {
  FinancialHealthAnalysis,
  ExpenseItem,
  SavingsGoal,
  BudgetRecommendationPlan,
  ScenarioSimulationResult,
} from '../types';

export function calculateLocalFinancialAnalysis(
  income: number,
  budget: number,
  expenses: ExpenseItem[],
  savingsGoals: SavingsGoal[] = []
): FinancialHealthAnalysis {
  const expenseList = Array.isArray(expenses) ? expenses : [];
  const goalsList = Array.isArray(savingsGoals) ? savingsGoals : [];

  const totalSpent = expenseList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netSavings = Math.max(0, income - totalSpent);
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
  const daysInMonth = Math.max(1, new Date().getDate());
  const dailyBurn = Math.round(totalSpent / daysInMonth);
  const projectedMonthEnd = Math.round(dailyBurn * 30);
  const isOverBudget = budget > 0 && totalSpent > budget;
  const budgetAdherence = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {
    Food: 0,
    Travel: 0,
    Education: 0,
    Shopping: 0,
    Subscriptions: 0,
    Other: 0,
  };

  expenseList.forEach((e) => {
    const cat = e.category || 'Other';
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += Number(e.amount) || 0;
    } else {
      categoryTotals['Other'] = (categoryTotals['Other'] || 0) + (Number(e.amount) || 0);
    }
  });

  const calculatedHealthScore = Math.min(
    100,
    Math.max(25, Math.round(savingsRate * 1.4 + (isOverBudget ? 10 : 35) + (income > 0 ? 20 : 0)))
  );

  const healthStatus =
    calculatedHealthScore >= 80
      ? 'Excellent'
      : calculatedHealthScore >= 65
      ? 'Good'
      : calculatedHealthScore >= 45
      ? 'Caution'
      : 'Action Needed';

  const defaultCategoryInsights = (
    ['Food', 'Travel', 'Education', 'Shopping', 'Subscriptions', 'Other'] as const
  ).map((cat) => {
    const spent = categoryTotals[cat] || 0;
    const pctOfTotal = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
    const pctOfIncome = income > 0 ? Math.round((spent / income) * 100) : 0;
    const benchmark =
      cat === 'Food'
        ? 20
        : cat === 'Travel'
        ? 12
        : cat === 'Shopping'
        ? 10
        : cat === 'Subscriptions'
        ? 5
        : cat === 'Education'
        ? 15
        : 8;
    const isHigh = pctOfIncome > benchmark + 5;
    return {
      category: cat,
      spent,
      percentageOfTotal: pctOfTotal,
      percentageOfIncome: pctOfIncome,
      benchmarkPercentage: benchmark,
      riskLevel: (isHigh ? (pctOfIncome > benchmark + 12 ? 'High' : 'Medium') : 'Low') as
        | 'Low'
        | 'Medium'
        | 'High',
      insight:
        spent > 0
          ? `${cat} accounts for ${pctOfTotal}% of your total outlays.`
          : `No expenses recorded for ${cat} this period.`,
      recommendation: isHigh
        ? `Aim to trim discretionary ${cat} expenses by 15% to safeguard your monthly savings rate.`
        : `Keep current spending discipline maintained in ${cat}.`,
    };
  });

  const needsSpent = (categoryTotals.Food || 0) + (categoryTotals.Travel || 0);
  const wantsSpent =
    (categoryTotals.Shopping || 0) +
    (categoryTotals.Subscriptions || 0) +
    (categoryTotals.Other || 0);

  return {
    id: `fin-analysis-local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    healthScore: calculatedHealthScore,
    healthStatus,
    summaryHeadline: isOverBudget
      ? `Monthly spending has exceeded the target budget by ₹${(totalSpent - budget).toLocaleString('en-IN')}.`
      : `Maintaining a healthy ${savingsRate}% savings rate with ₹${netSavings.toLocaleString('en-IN')} net surplus.`,
    executiveSummary: `Your current cash flow shows ₹${totalSpent.toLocaleString('en-IN')} in expenses against an income of ₹${income.toLocaleString('en-IN')}. With a daily burn rate of ₹${dailyBurn.toLocaleString('en-IN')}/day, your projected month-end outlay is ₹${projectedMonthEnd.toLocaleString('en-IN')}.`,
    cashFlowSummary: {
      totalIncome: income,
      totalExpenses: totalSpent,
      netSavings,
      savingsRatePercent: savingsRate,
      dailyBurnRate: dailyBurn,
      projectedMonthEndExpenses: projectedMonthEnd,
      budgetAdherencePercent: budgetAdherence,
      isOverBudget,
    },
    categoryInsights: defaultCategoryInsights,
    rule50_30_20: {
      needs: {
        actualAmount: needsSpent,
        actualPercentage: income > 0 ? Math.round((needsSpent / income) * 100) : 0,
        targetPercentage: 50,
        targetAmount: Math.round(income * 0.5),
        status: needsSpent / (income || 1) <= 0.55 ? 'Optimal' : 'High',
        categoriesIncluded: ['Food & Groceries', 'Travel & Transit'],
      },
      wants: {
        actualAmount: wantsSpent,
        actualPercentage: income > 0 ? Math.round((wantsSpent / income) * 100) : 0,
        targetPercentage: 30,
        targetAmount: Math.round(income * 0.3),
        status: wantsSpent / (income || 1) <= 0.35 ? 'Optimal' : 'Over',
        categoriesIncluded: ['Shopping', 'Subscriptions & Entertainment', 'Other Discretionary'],
      },
      savings: {
        actualAmount: netSavings,
        actualPercentage: savingsRate,
        targetPercentage: 20,
        targetAmount: Math.round(income * 0.2),
        status: savingsRate >= 20 ? 'Ahead' : savingsRate >= 12 ? 'On Track' : 'Behind',
      },
      overallEvaluation:
        savingsRate >= 20
          ? 'Your savings rate satisfies the gold-standard 50/30/20 financial rule.'
          : 'Focus on trimming discretionary shopping & dining to lift your savings rate towards 20%.',
    },
    spendingPatterns: [
      {
        id: 'pat-1',
        title: 'Subscription & Digital Outlays',
        category: 'Subscriptions',
        type: 'recurring_subscription',
        description: `Current subscriptions total ₹${(categoryTotals.Subscriptions || 0).toLocaleString('en-IN')}. Auditing unused recurring apps can unlock immediate monthly cash.`,
        severity: (categoryTotals.Subscriptions || 0) > 3000 ? 'warning' : 'info',
        impactAmount: Math.round((categoryTotals.Subscriptions || 0) * 0.3),
        suggestedAction: 'Review active subscriptions list and cancel non-essential memberships.',
      },
      {
        id: 'pat-2',
        title: 'Dining & Food Outflow',
        category: 'Food',
        type: 'impulse_spike',
        description: `Food accounts for ₹${(categoryTotals.Food || 0).toLocaleString('en-IN')} (${totalSpent > 0 ? Math.round(((categoryTotals.Food || 0) / totalSpent) * 100) : 0}% of overall expenditure).`,
        severity: (categoryTotals.Food || 0) > 20000 ? 'warning' : 'positive',
        impactAmount: Math.round((categoryTotals.Food || 0) * 0.15),
        suggestedAction: 'Set a weekly meal prep schedule to reduce on-demand food delivery spikes.',
      },
    ],
    savingsOpportunities: [
      {
        id: 'sav-1',
        title: 'Discretionary Dining & Takeout Cap',
        category: 'Food',
        estimatedMonthlySavings: Math.max(1500, Math.round((categoryTotals.Food || 10000) * 0.2)),
        estimatedAnnualSavings: Math.max(18000, Math.round((categoryTotals.Food || 10000) * 0.2 * 12)),
        difficulty: 'Easy',
        actionStep: 'Limit restaurant deliveries to twice a week and batch-cook staples.',
        impactScore: 88,
      },
      {
        id: 'sav-2',
        title: 'Subscription Pruning & Plan Consolidation',
        category: 'Subscriptions',
        estimatedMonthlySavings: Math.max(800, Math.round((categoryTotals.Subscriptions || 3000) * 0.35)),
        estimatedAnnualSavings: Math.max(9600, Math.round((categoryTotals.Subscriptions || 3000) * 0.35 * 12)),
        difficulty: 'Easy',
        actionStep: 'Cancel redundant streaming tiers and switch to annual student/family rates.',
        impactScore: 92,
      },
    ],
    actionPlan: [
      {
        id: 'act-1',
        title: `Establish a ₹${Math.max(500, Math.round((budget || 45000) / 30)).toLocaleString('en-IN')}/day maximum spending ceiling`,
        timeline: 'This Week',
        category: 'Daily Budgeting',
        potentialBenefit: 'Prevents mid-month budget depletion.',
        priority: 'High',
      },
      {
        id: 'act-2',
        title: 'Automate transfer of net surplus to primary savings goal',
        timeline: 'This Month',
        category: 'Wealth Building',
        potentialBenefit: `Secures ₹${netSavings.toLocaleString('en-IN')} before impulse leaks occur.`,
        priority: 'High',
      },
    ],
    goalImpacts: goalsList.map((g) => {
      const remaining = Math.max(0, (g.targetAmount || 50000) - (g.currentAmount || 0));
      const monthlyPace = Math.max(1000, Math.round(netSavings * 0.6));
      const origMonths = Math.ceil(remaining / monthlyPace);
      const accelMonths = Math.max(1, Math.ceil(remaining / (monthlyPace + 2500)));
      return {
        goalName: g.name || 'Savings Goal',
        targetAmount: g.targetAmount || 50000,
        currentAmount: g.currentAmount || 0,
        originalEstimatedMonths: origMonths,
        acceleratedEstimatedMonths: accelMonths,
        monthsSaved: Math.max(0, origMonths - accelMonths),
        monthlyRequiredSaving: monthlyPace,
        statusRecommendation: `Saving an additional ₹2,500/month accelerates "${g.name || 'Goal'}" by ${Math.max(1, origMonths - accelMonths)} month(s).`,
      };
    }),
    keyStrengths: [
      `Net positive cash flow with ${savingsRate}% savings retention.`,
      `Tracked ${expenseList.length} expenses for real-time visibility.`,
    ],
    primaryRisks: [
      isOverBudget
        ? `Total spending has surpassed your set limit of ₹${budget.toLocaleString('en-IN')}.`
        : `Category concentration monitoring recommended.`,
    ],
    disclaimer:
      'Educational financial insights. LEVELUP AI Financial Coach provides cash flow intelligence and does not provide regulated financial advice, investment securities promotion, tax filing advice, or loan approvals.',
  };
}
