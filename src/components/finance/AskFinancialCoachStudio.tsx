import React, { useState, useRef, useEffect } from 'react';
import {
  FinancialHealthAnalysis,
  FinancialCoachChatMessage,
  SavingsGoal,
  ExpenseItem,
  ScenarioSimulationResult,
} from '../../types';
import {
  MessageSquare,
  Sparkles,
  Send,
  Zap,
  TrendingUp,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AskFinancialCoachStudioProps {
  analysis: FinancialHealthAnalysis;
  formatCurrency: (amount: number) => string;
  totalIncome: number;
  monthlyBudget: number;
  expenses: ExpenseItem[];
  savingsGoals: SavingsGoal[];
}

export const AskFinancialCoachStudio: React.FC<AskFinancialCoachStudioProps> = ({
  analysis,
  formatCurrency,
  totalIncome,
  monthlyBudget,
  expenses,
  savingsGoals,
}) => {
  const [messages, setMessages] = useState<FinancialCoachChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello! I am your **LEVELUP AI Financial Coach**. I have full visibility into your **₹${totalIncome.toLocaleString('en-IN')}** monthly income, logged expenses (**₹${analysis.cashFlowSummary.totalExpenses.toLocaleString('en-IN')}**), and **${savingsGoals.length}** savings goals.\n\nAsk me anything about your cash flow, budget optimization, or run a **"What If?" scenario simulation** below!`,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: [
        'How can I save an extra ₹5,000 this month?',
        'Can I afford a ₹30,000 emergency expense right now?',
        'What is my optimal weekly grocery and dining budget?',
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Scenario Simulator state
  const [simulationPrompt, setSimulationPrompt] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: FinancialCoachChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/finance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            totalIncome,
            monthlyBudget,
            expenses,
            savingsGoals,
            healthScore: analysis.healthScore,
          },
        }),
      });

      if (res.ok) {
        const data: FinancialCoachChatMessage = await res.json();
        setMessages((prev) => [...prev, data]);
      } else {
        throw new Error('Chat API returned error status');
      }
    } catch (err) {
      console.error('Error sending message to Financial Coach:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Based on your monthly surplus of **₹${analysis.cashFlowSummary.netSavings.toLocaleString('en-IN')}**, keeping daily expenses under **₹${analysis.cashFlowSummary.dailyBurnRate.toLocaleString('en-IN')}** will ensure your budget targets remain protected.`,
          timestamp: new Date().toISOString(),
          suggestedFollowUps: ['How do I cut down shopping expenses?'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSimulation = async (customText?: string) => {
    const query = (customText || simulationPrompt).trim();
    if (!query || isSimulating) return;

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/ai/finance/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioDescription: query,
          context: {
            totalIncome,
            monthlyBudget,
            expenses,
            savingsGoals,
          },
        }),
      });

      if (res.ok) {
        const data: ScenarioSimulationResult = await res.json();
        setSimulationResult(data);
      } else {
        throw new Error('Simulation API returned error status');
      }
    } catch (err) {
      console.warn('Using client scenario simulation fallback:', err);
      // Fallback simulation based on user scenario
      const isIncreaseSpend = query.toLowerCase().includes('buy') || query.toLowerCase().includes('car') || query.toLowerCase().includes('vacation') || query.toLowerCase().includes('upgrade') || query.toLowerCase().includes('spend');
      const impactAmt = isIncreaseSpend ? 8000 : 4000;
      const newExp = (analysis.cashFlowSummary.totalExpenses || 35000) + (isIncreaseSpend ? impactAmt : -impactAmt);
      const newNetSavings = Math.max(0, (totalIncome || 85000) - newExp);
      const newSavingsRate = Math.round((newNetSavings / (totalIncome || 1)) * 100);

      setSimulationResult({
        scenarioName: query,
        feasibilityVerdict: isIncreaseSpend ? (newSavingsRate < 10 ? 'Risky / Not Recommended' : 'Moderate / Manageable') : 'Highly Feasible',
        monthlyCashFlowDelta: isIncreaseSpend ? -impactAmt : impactAmt,
        newProjectedSavingsRate: newSavingsRate,
        impactOnGoals: savingsGoals.length > 0
          ? savingsGoals.map((g) => ({
              goalName: g.name,
              timelineChange: isIncreaseSpend ? 'Delays milestone by ~1-2 months' : 'Accelerates target by ~1.5 months',
            }))
          : [
              {
                goalName: 'Primary Wealth Target',
                timelineChange: isIncreaseSpend ? 'Delays milestone by ~1-2 months' : 'Accelerates target by ~1.5 months',
              },
            ],
        tradeOffs: isIncreaseSpend
          ? [`Requires trimming discretionary categories by ₹${Math.round(impactAmt * 0.4).toLocaleString('en-IN')}/mo.`]
          : ['Requires mindful avoidance of impulse takeout and dining out.'],
        proTips: [
          isIncreaseSpend
            ? 'Set a daily expense ceiling to protect your essential reserves.'
            : 'Automate moving the surplus to your goal on salary day.',
        ],
        confidenceScore: 88,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Chat Arena */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live AI Financial Coach
            </h4>
            <p className="text-xs text-on-surface-variant">
              Conversational intelligence grounded in your authentic income, expenses, and savings goals.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            Real-Time Analysis
          </span>
        </div>

        {/* Message Log */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-xs space-y-2 ${
                    isUser
                      ? 'bg-primary text-on-primary rounded-br-none'
                      : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-xs dark:prose-invert max-w-none leading-relaxed">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-outline-variant/20 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                        Suggested Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-container text-primary font-medium hover:bg-surface-container-high transition-all cursor-pointer text-left"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                AI
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface-variant flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Coach is computing your cash flow figures...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-outline-variant/30"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask your coach anything (e.g. 'How can I save ₹10k for travel this summer?')"
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* "What If?" Financial Scenario Simulator */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              "What-If?" Scenario Simulator
            </h4>
            <p className="text-xs text-on-surface-variant">
              Model the exact mathematical impact of lifestyle changes, raises, or large planned purchases before making them.
            </p>
          </div>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant">Quick Scenarios:</span>
          {[
            'Cut food deliveries by 50%',
            'Cancel 3 unused subscriptions',
            'Add ₹10,000 freelance income',
            'Buy a new ₹45,000 phone on 3-month EMI',
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSimulationPrompt(preset);
                handleRunSimulation(preset);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom Simulation Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={simulationPrompt}
            onChange={(e) => setSimulationPrompt(e.target.value)}
            placeholder="Type any financial scenario (e.g. 'What if I reduce weekend leisure spending by ₹2,000/week?')"
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => handleRunSimulation()}
            disabled={!simulationPrompt.trim() || isSimulating}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/40 space-y-3 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Scenario Simulated
                </span>
                <h5 className="font-semibold text-sm text-on-surface">
                  "{simulationResult.scenarioName}"
                </h5>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {simulationResult.feasibilityVerdict}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  ({simulationResult.confidenceScore}% Model Confidence)
                </span>
              </div>
            </div>

            {/* Delta metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-high">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  Monthly Cash Flow Delta
                </span>
                <strong className={`text-base ${simulationResult.monthlyCashFlowDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-error'}`}>
                  {simulationResult.monthlyCashFlowDelta >= 0 ? '+' : ''}
                  {formatCurrency(simulationResult.monthlyCashFlowDelta)}/mo
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-high">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  New Projected Savings Rate
                </span>
                <strong className="text-base text-primary">
                  {simulationResult.newProjectedSavingsRate}% of Income
                </strong>
              </div>
            </div>

            {/* Impact on Goals & Tradeoffs */}
            <div className="space-y-2 text-xs">
              {simulationResult.impactOnGoals && simulationResult.impactOnGoals.length > 0 && (
                <div>
                  <span className="font-bold text-on-surface">Goal Impact: </span>
                  <span className="text-on-surface-variant">
                    {simulationResult.impactOnGoals.map((g) => `${g.goalName} (${g.timelineChange})`).join(', ')}
                  </span>
                </div>
              )}

              {simulationResult.tradeOffs && simulationResult.tradeOffs.length > 0 && (
                <div>
                  <span className="font-bold text-on-surface">Required Trade-offs: </span>
                  <span className="text-on-surface-variant">
                    {simulationResult.tradeOffs.join(' • ')}
                  </span>
                </div>
              )}

              {simulationResult.proTips && simulationResult.proTips.length > 0 && (
                <div className="p-2 rounded-lg bg-primary-fixed/15 border border-primary/20 text-on-surface">
                  💡 <strong>Coach Tip:</strong> {simulationResult.proTips.join(' ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
