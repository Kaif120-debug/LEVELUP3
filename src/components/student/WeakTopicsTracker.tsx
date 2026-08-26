import React from 'react';
import { WeakTopicRecord } from '../../types';
import { AlertCircle, CheckCircle2, HelpCircle, ArrowRight, Sparkles, BookOpen, Flame } from 'lucide-react';

interface WeakTopicsTrackerProps {
  weakTopics: WeakTopicRecord[];
  onReviseTopic: (topic: string, subject: string) => void;
  onQuizTopic: (topic: string, subject: string) => void;
}

export const WeakTopicsTracker: React.FC<WeakTopicsTrackerProps> = ({
  weakTopics,
  onReviseTopic,
  onQuizTopic,
}) => {
  const weakCount = weakTopics.filter((t) => t.status === 'weak').length;
  const moderateCount = weakTopics.filter((t) => t.status === 'moderate').length;
  const strongCount = weakTopics.filter((t) => t.status === 'strong').length;

  const totalAttempts = weakTopics.reduce((acc, t) => acc + t.totalAttempts, 0);
  const avgAccuracy = weakTopics.length > 0
    ? Math.round(weakTopics.reduce((acc, t) => acc + t.accuracy, 0) / weakTopics.length)
    : 0;

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="font-headline-sm text-on-surface">Weak Topic Radar & Mastery Tracker</h3>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time adaptive diagnosis based on your AI quiz results and practice performance.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span>{weakCount} Needs Attention</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{moderateCount} In Progress</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{strongCount} Mastered</span>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <p className="text-xs font-label-caps uppercase text-on-surface-variant">Tracked Concepts</p>
          <p className="text-2xl font-bold text-on-surface mt-1">{weakTopics.length}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Across active courses</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <p className="text-xs font-label-caps uppercase text-on-surface-variant">Overall Accuracy</p>
          <p className="text-2xl font-bold text-primary mt-1">{avgAccuracy}%</p>
          <div className="w-full bg-surface-container-high h-1.5 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                avgAccuracy >= 75 ? 'bg-emerald-500' : avgAccuracy >= 50 ? 'bg-amber-500' : 'bg-error'
              }`}
              style={{ width: `${avgAccuracy}%` }}
            ></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <p className="text-xs font-label-caps uppercase text-on-surface-variant">Questions Attempted</p>
          <p className="text-2xl font-bold text-secondary mt-1">{totalAttempts}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Adaptive diagnostic drills</p>
        </div>
      </div>

      {/* Topics List */}
      {weakTopics.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant/60">
          <HelpCircle className="w-10 h-10 text-on-surface-variant mx-auto mb-3 opacity-60" />
          <h4 className="font-title-md text-on-surface">No topic diagnosis yet</h4>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mt-1">
            Take an AI Quiz or practice problem set. LEVELUP will automatically map your strong and weak concepts in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weakTopics.map((item) => {
            const isWeak = item.status === 'weak';
            const isModerate = item.status === 'moderate';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isWeak
                    ? 'bg-error-container/10 border-error/30 hover:border-error/50'
                    : isModerate
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/40'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isWeak
                          ? 'bg-error text-on-error'
                          : isModerate
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isWeak ? '🔴 < 50% Weak' : isModerate ? '🟡 50-75% Review' : '🟢 > 75% Mastered'}
                    </span>
                    <span className="text-xs font-semibold text-secondary">{item.subject}</span>
                    <span className="text-xs text-on-surface-variant">· {item.totalAttempts} questions</span>
                  </div>

                  <h4 className="font-title-md text-on-surface font-semibold">{item.topic}</h4>
                  <p className="text-xs text-on-surface-variant">{item.recommendedAction}</p>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <button
                    onClick={() => onReviseTopic(item.topic, item.subject)}
                    className="px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary-fixed/20 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain Topic</span>
                  </button>
                  <button
                    onClick={() => onQuizTopic(item.topic, item.subject)}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Test Weakness</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
