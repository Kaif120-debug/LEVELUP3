import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ExamPrepPlan } from '../../types';
import * as db from '../../services/supabaseService';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ListPlus,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface ExamPrepStudioProps {
  initialSubject?: string;
  onLaunchQuiz: (topic: string, subject: string) => void;
  onExplainTopic: (topic: string, subject: string) => void;
}

export const ExamPrepStudio: React.FC<ExamPrepStudioProps> = ({
  initialSubject = 'Computer Science / DBMS',
  onLaunchQuiz,
  onExplainTopic,
}) => {
  const { state, studentCourses, addPriority } = useApp();
  const { user } = useAuth();

  const [examName, setExamName] = useState('Final Semester Examination');
  const [subject, setSubject] = useState(initialSubject || studentCourses[0]?.name || 'Database Systems (DBMS)');
  const [daysRemaining, setDaysRemaining] = useState(14);
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [currentScore, setCurrentScore] = useState(70);

  const [isLoading, setIsLoading] = useState(false);
  const [examPlan, setExamPlan] = useState<ExamPrepPlan | null>(null);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleGenerateExamStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsLoading(true);
    setNotificationMsg(null);
    setSyncedCount(null);

    try {
      const response = await fetch('/api/ai/study/exam-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName,
          subject,
          daysRemaining,
          dailyMinutes,
          currentScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate exam blueprint');
      }

      const plan: ExamPrepPlan = await response.json();
      setExamPlan(plan);
    } catch (err: any) {
      console.error('Exam prep generator failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToPlanner = async () => {
    if (!examPlan) return;

    let addedCount = 0;
    for (const phase of examPlan.revisionSchedule) {
      for (const deliverable of phase.deliverables) {
        await addPriority(`[Exam Prep] ${deliverable} (${phase.timeline})`, 'High');

        if (user?.id) {
          await db.createTask(user.id, {
            title: `[Exam Prep] ${deliverable}`,
            description: `${phase.focus} - ${examPlan.examName}`,
            priority: 'High',
            status: 'pending',
            category: 'Academics',
          });
        }
        addedCount++;
      }
    }

    setSyncedCount(addedCount);
    setNotificationMsg(`Added ${addedCount} exam revision milestones to your Planner!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Configuration Header */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Exam Preparation Blueprint</h3>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              Engineer a weighted revision strategy, syllabus priority breakdown, and mock countdown timeline.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateExamStrategy} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Exam Title
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Finals / Midterm / GRE"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                {studentCourses.length > 0 &&
                  studentCourses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                <option value="Computer Science / DBMS">Computer Science / DBMS</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Mathematics & Calculus">Mathematics & Calculus</option>
                <option value="Operating Systems">Operating Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Days Remaining
              </label>
              <select
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value={3}>3 Days (Emergency Sprint)</option>
                <option value={7}>7 Days (Intensive Prep)</option>
                <option value={14}>14 Days (Standard Runway)</option>
                <option value={30}>30 Days (Comprehensive Mastery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Current Readiness Score
              </label>
              <select
                value={currentScore}
                onChange={(e) => setCurrentScore(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value={50}>50% (Need major catch-up)</option>
                <option value={70}>70% (Average understanding)</option>
                <option value={85}>85% (Solid, targeting 95%+)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                Study allocation: <strong>{dailyMinutes} mins/day</strong> across <strong>{daysRemaining} days</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Syllabus Weights...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Exam Strategy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-primary-fixed/30 border border-primary text-primary flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{notificationMsg}</span>
          </div>
        </div>
      )}

      {/* Strategy Display */}
      {examPlan && (
        <div className="space-y-6 animate-fade-up">
          {/* Executive Strategy Card */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-fixed/20 text-primary">
                    {examPlan.subject}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {examPlan.daysRemaining} Days Out · Target Score: {examPlan.targetScore}
                  </span>
                </div>
                <h3 className="font-headline-md text-on-surface">{examPlan.examName} Blueprint</h3>
                <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
                  {examPlan.executiveSummary}
                </p>
              </div>

              <button
                onClick={handleSyncToPlanner}
                className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm cursor-pointer shrink-0"
              >
                <ListPlus className="w-4 h-4" />
                <span>{syncedCount ? 'Update Revision in Planner' : 'Sync to My Planner'}</span>
              </button>
            </div>

            {/* Topic Priority Matrix */}
            <div className="space-y-4">
              <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Weighted Syllabus Priority Matrix</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examPlan.priorityTopics.map((pt, idx) => {
                  const isHigh = pt.priority === 'High';
                  const isMed = pt.priority === 'Medium';

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border space-y-3 ${
                        isHigh
                          ? 'bg-error-container/10 border-error/40'
                          : isMed
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-surface-container-low border-outline-variant/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isHigh
                              ? 'bg-error text-white'
                              : isMed
                              ? 'bg-amber-500 text-white'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {pt.priority} Priority
                        </span>
                        <span className="text-xs font-semibold text-on-surface">{pt.estimatedWeight}</span>
                      </div>

                      <h5 className="font-title-md text-on-surface font-semibold">{pt.topic}</h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{pt.whyImportant}</p>

                      <div className="space-y-1 pt-2 border-t border-outline-variant/30 text-xs">
                        <span className="font-medium text-on-surface">Key Focus Subtopics:</span>
                        <ul className="space-y-0.5 text-on-surface-variant">
                          {pt.keySubtopics.map((sub, sIdx) => (
                            <li key={sIdx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary"></span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => onExplainTopic(pt.topic, examPlan.subject)}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Explain
                        </button>
                        <span className="text-outline-variant">·</span>
                        <button
                          onClick={() => onLaunchQuiz(pt.topic, examPlan.subject)}
                          className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Quiz</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phased Countdown Timeline */}
            <div className="space-y-4 pt-4 border-t border-outline-variant/30">
              <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Phased Countdown Timeline</span>
              </h4>

              <div className="space-y-3">
                {examPlan.revisionSchedule.map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary uppercase">{phase.timeline}</span>
                        <span className="text-xs text-on-surface-variant font-medium">· {phase.phase}</span>
                      </div>
                      <p className="text-xs text-on-surface font-semibold">{phase.focus}</p>
                    </div>

                    <div className="space-y-1 md:text-right text-xs text-on-surface-variant">
                      <span className="font-medium text-on-surface">Target Deliverables:</span>
                      {phase.deliverables.map((del, dIdx) => (
                        <p key={dIdx}>✓ {del}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Test Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                <p className="text-xs font-bold font-label-caps uppercase text-primary">
                  Mock Test Schedule
                </p>
                <div className="space-y-2.5">
                  {examPlan.mockTestMilestones.map((mock, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-on-surface">{mock.testName}</p>
                        <p className="text-[11px] text-on-surface-variant">{mock.focusTopics.join(', ')}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-primary-fixed/20 text-primary font-bold">
                        {mock.targetDay}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last 24 Hours Strategy */}
              <div className="p-4 rounded-xl bg-primary-fixed/20 border border-primary/30 space-y-2.5">
                <p className="text-xs font-bold font-label-caps uppercase text-primary flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Last 24 Hours Protocol</span>
                </p>
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {examPlan.last24HoursStrategy.map((strat, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                      <span>{strat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
