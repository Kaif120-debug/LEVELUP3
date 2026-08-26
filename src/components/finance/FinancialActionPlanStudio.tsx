import React, { useState } from 'react';
import { FinancialHealthAnalysis, FinancialActionItem } from '../../types';
import {
  CheckSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Plus,
  BookmarkCheck,
} from 'lucide-react';

interface FinancialActionPlanStudioProps {
  analysis: FinancialHealthAnalysis;
  formatCurrency: (amount: number) => string;
  onAddToPlanner?: (title: string, priority: 'High' | 'Medium' | 'Low', itemId: string) => void;
  addedPlannerItems?: Record<string, boolean>;
}

export const FinancialActionPlanStudio: React.FC<FinancialActionPlanStudioProps> = ({
  analysis,
  formatCurrency,
  onAddToPlanner,
  addedPlannerItems = {},
}) => {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const actionItems = analysis.actionPlan || [];
  const completedCount = Object.values(completedActions).filter(Boolean).length;
  const progressPercent = actionItems.length > 0 ? Math.round((completedCount / actionItems.length) * 100) : 0;

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriorityBadge = (priority: FinancialActionItem['priority']) => {
    switch (priority) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-error/20 text-error">High Priority</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">Low</span>;
    }
  };

  const thisWeekItems = actionItems.filter((a) => a.timeline === 'This Week');
  const thisMonthItems = actionItems.filter((a) => a.timeline === 'This Month' || a.timeline === 'Quarterly');

  return (
    <div className="space-y-6">
      {/* Progress & Milestone Header */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          <div>
            <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              Strategic Financial Action Plan
            </h4>
            <p className="text-xs text-on-surface-variant">
              A sequence of concrete, behavioral steps designed to eliminate cash waste and compound wealth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-on-surface-variant">
              Completed: <strong className="text-on-surface">{completedCount}/{actionItems.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Immediate / This Week */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-title-sm text-on-surface font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                This Week (Immediate Action)
              </h5>
              <span className="text-[11px] text-on-surface-variant">
                {thisWeekItems.filter((i) => completedActions[i.id]).length}/{thisWeekItems.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {thisWeekItems.map((item) => {
                const isDone = completedActions[item.id];
                const isAddedToPlanner = addedPlannerItems[item.id];

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                      isDone
                        ? 'bg-surface-container-low border-outline-variant/30 opacity-70'
                        : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!isDone}
                        onChange={() => toggleAction(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => toggleAction(item.id)}
                            className={`text-xs font-semibold cursor-pointer ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}
                          >
                            {item.title}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          💡 <strong>Benefit:</strong> {item.potentialBenefit}
                        </p>
                      </div>
                    </div>

                    {/* Action button: Add to Planner */}
                    {onAddToPlanner && (
                      <div className="flex justify-end pt-1 border-t border-outline-variant/20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlanner(item.title, item.priority || 'Medium', item.id);
                          }}
                          disabled={isAddedToPlanner}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAddedToPlanner
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/50'
                          }`}
                        >
                          {isAddedToPlanner ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>Added to Planner!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Planner</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* This Month / Ongoing Strategy */}
        <div className="p-5 rounded-2xl bg-surface border border-outline-variant/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-title-sm text-on-surface font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                This Month (System Optimization)
              </h5>
              <span className="text-[11px] text-on-surface-variant">
                {thisMonthItems.filter((i) => completedActions[i.id]).length}/{thisMonthItems.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {thisMonthItems.map((item) => {
                const isDone = completedActions[item.id];
                const isAddedToPlanner = addedPlannerItems[item.id];

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                      isDone
                        ? 'bg-surface-container-low border-outline-variant/30 opacity-70'
                        : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!isDone}
                        onChange={() => toggleAction(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => toggleAction(item.id)}
                            className={`text-xs font-semibold cursor-pointer ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}
                          >
                            {item.title}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          💡 <strong>Benefit:</strong> {item.potentialBenefit}
                        </p>
                      </div>
                    </div>

                    {/* Action button: Add to Planner */}
                    {onAddToPlanner && (
                      <div className="flex justify-end pt-1 border-t border-outline-variant/20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlanner(item.title, item.priority || 'Medium', item.id);
                          }}
                          disabled={isAddedToPlanner}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAddedToPlanner
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/50'
                          }`}
                        >
                          {isAddedToPlanner ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>Added to Planner!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Planner</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Risks Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-surface border border-emerald-500/30 space-y-2">
          <h5 className="font-semibold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Observed Financial Strengths
          </h5>
          <ul className="space-y-1.5 text-xs text-on-surface-variant">
            {analysis.keyStrengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="p-4 rounded-xl bg-surface border border-amber-500/30 space-y-2">
          <h5 className="font-semibold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Primary Vulnerabilities & Risks
          </h5>
          <ul className="space-y-1.5 text-xs text-on-surface-variant">
            {analysis.primaryRisks?.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
