import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StudyPlanResponse, StudyLevel, StudyGoal } from '../../types';
import * as db from '../../services/supabaseService';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ListPlus,
  Target,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  Plus,
  Loader2,
} from 'lucide-react';

interface StudyPlanGeneratorProps {
  initialSubject?: string;
  onOpenExplainTopic: (topic: string, subject: string) => void;
  onOpenQuizTopic: (topic: string, subject: string) => void;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({
  initialSubject,
  onOpenExplainTopic,
  onOpenQuizTopic,
}) => {
  const { state, studentCourses, addPriority, openUpgradeModal } = useApp();
  const { user } = useAuth();
  const isPro = state.subscription.status === 'active' && state.subscription.plan === 'LEVELUP_PRO';

  // Form State
  const defaultCourse = studentCourses[0]?.name || initialSubject || 'Computer Science';
  const [subject, setSubject] = useState(initialSubject || defaultCourse);
  const [courseName, setCourseName] = useState(defaultCourse);
  const [level, setLevel] = useState<StudyLevel>('Intermediate');
  const [targetGoal, setTargetGoal] = useState<StudyGoal>('Ace Exam (90%+)' as StudyGoal);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(60);
  const [daysCount, setDaysCount] = useState(7);
  const [examDate, setExamDate] = useState(() => {
    // Attempt auto-population from milestone or assignments
    if (state.student?.milestoneDays) {
      const target = new Date();
      target.setDate(target.getDate() + state.student.milestoneDays);
      return target.toISOString().split('T')[0];
    }
    const today = new Date();
    today.setDate(today.getDate() + 14);
    return today.toISOString().split('T')[0];
  });

  // Generation & Results State
  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<StudyPlanResponse | null>(null);
  const [expandedDays, setExpandedDays] = useState<{ [day: number]: boolean }>({ 1: true });
  const [syncedTasksCount, setSyncedTasksCount] = useState<number | null>(null);
  const [isGoalSaved, setIsGoalSaved] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Sync with prop changes if passed
  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
    }
  }, [initialSubject]);

  const handleDaysChange = (days: number) => {
    if (days > 5 && !isPro) {
      openUpgradeModal('Multi-Week AI Study Plans');
      return;
    }
    setDaysCount(days);
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    if (daysCount > 5 && !isPro) {
      openUpgradeModal('Multi-Week AI Study Plans');
      return;
    }

    setIsLoading(true);
    setNotificationMsg(null);
    setSyncedTasksCount(null);
    setIsGoalSaved(false);

    try {
      const response = await fetch('/api/ai/study/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          courseName,
          examDate,
          level,
          dailyStudyMinutes,
          daysCount,
          targetGoal,
          existingAssignments: state.student.assignments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const plan: StudyPlanResponse = await response.json();
      setActivePlan(plan);
      setExpandedDays({ 1: true, 2: true });
    } catch (err: any) {
      console.error('Study plan generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDayExpanded = (day: number) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Sync to Planner (create real tasks in tasks table)
  const handleAddToPlanner = async () => {
    if (!activePlan) return;

    let addedCount = 0;
    for (const day of activePlan.days) {
      for (const task of day.tasks) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (day.dayNumber - 1));
        const dateStr = dueDate.toISOString().split('T')[0];

        // Add priority to planner state and Supabase
        await addPriority(
          `[${activePlan.subject}] ${task.title} (${task.durationMinutes}m)`,
          task.type === 'quiz' || task.type === 'practice' ? 'High' : 'Medium'
        );

        if (user?.id) {
          await db.createTask(user.id, {
            title: `[Day ${day.dayNumber}] ${task.title}`,
            description: `${task.description} - Focus: ${day.focusArea}`,
            priority: task.type === 'quiz' ? 'High' : 'Medium',
            status: 'pending',
            due_date: dateStr,
            category: 'Study',
          });
        }
        addedCount++;
      }
    }

    setSyncedTasksCount(addedCount);
    setNotificationMsg(`Successfully added ${addedCount} study blocks to your Planner!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Set as Study Goal (creates real goal in goals table)
  const handleSetAsGoal = async () => {
    if (!activePlan) return;

    const goalTitle = `Master ${activePlan.subject}: ${activePlan.targetGoal}`;
    const targetDate = activePlan.examDate || new Date(Date.now() + activePlan.totalDays * 86400000).toISOString().split('T')[0];

    if (user?.id) {
      await db.createGoal(user.id, {
        title: goalTitle,
        description: `Complete ${activePlan.totalDays}-day study roadmap (${activePlan.dailyStudyMinutes} mins/day). ${activePlan.overview}`,
        status: 'active',
        category: 'Academics',
        target_date: targetDate,
      });
    }

    setIsGoalSaved(true);
    setNotificationMsg(`Goal set! Tracked under Academic Goals.`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Form */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <Calendar className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Study Plan Generator</h3>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              Construct a personalized, day-by-day spaced repetition learning plan tailored to your timeline.
            </p>
          </div>

          {!isPro && (
            <button
              onClick={() => openUpgradeModal('Multi-Week AI Study Plans')}
              className="px-3 py-1.5 rounded-lg bg-secondary-container/20 border border-secondary text-secondary text-xs font-semibold hover:bg-secondary-container/30 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock 30-Day Pro Plans</span>
            </button>
          )}
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Course Selection */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Select Course
              </label>
              <select
                value={courseName}
                onChange={(e) => {
                  setCourseName(e.target.value);
                  setSubject(e.target.value);
                }}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                {studentCourses.length > 0 ? (
                  studentCourses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.credits || 3} Credits)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Computer Science">Computer Science & Algorithms</option>
                    <option value="Database Systems (DBMS)">Database Systems (DBMS)</option>
                    <option value="Calculus II">Calculus II & Applied Math</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Physics">Physics & Electromagnetism</option>
                  </>
                )}
                <option value="Custom Subject">Custom / Other Subject...</option>
              </select>
            </div>

            {/* Subject / Topic Focus */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Subject or Specific Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Relational Normalization & SQL"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Target Objective
              </label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value as StudyGoal)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value="Ace Exam (90%+)">Ace Exam (90%+)</option>
                <option value="Master Fundamentals">Master Fundamentals</option>
                <option value="Quick Revision & Practice">Quick Revision & Practice</option>
                <option value="Pass Course">Pass Course & Core Homework</option>
                <option value="Complete Homework / Project">Complete Final Project</option>
              </select>
            </div>

            {/* Understanding Level */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Current Understanding Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as StudyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      level === lvl
                        ? 'bg-primary-container text-on-primary border-primary'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Study Time */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Daily Study Budget
              </label>
              <select
                value={dailyStudyMinutes}
                onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value={30}>30 mins / day (Light)</option>
                <option value={45}>45 mins / day (Balanced)</option>
                <option value={60}>60 mins / day (Recommended)</option>
                <option value={90}>90 mins / day (Intensive)</option>
                <option value={120}>120 mins / day (Hardcore Prep)</option>
              </select>
            </div>

            {/* Duration / Days */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Study Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '3 Days', val: 3 },
                  { label: '5 Days', val: 5 },
                  { label: '7 Days', val: 7, isProOnly: !isPro },
                  { label: '14 Days', val: 14, isProOnly: !isPro },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleDaysChange(item.val)}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all relative cursor-pointer ${
                      daysCount === item.val
                        ? 'bg-primary-container text-on-primary border-primary'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isProOnly && (
                      <span className="absolute -top-1.5 -right-1 text-[9px] bg-secondary text-on-secondary px-1 rounded font-bold uppercase">
                        Pro
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                Total commitment: <strong>{Math.round((dailyStudyMinutes * daysCount) / 60)} hours</strong> across{' '}
                <strong>{daysCount} days</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Pedagogical Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Study Plan</span>
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

      {/* Results View */}
      {activePlan && (
        <div className="space-y-6 animate-fade-up">
          {/* Plan Header Card */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-xs font-bold uppercase tracking-wider">
                    {activePlan.subject}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                    {activePlan.totalDays} Days · {activePlan.dailyStudyMinutes} min/day
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs font-semibold">
                    Target: {activePlan.targetGoal}
                  </span>
                </div>
                <h3 className="font-headline-md text-on-surface">{activePlan.planTitle}</h3>
                <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
                  {activePlan.overview}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  onClick={handleAddToPlanner}
                  className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm cursor-pointer"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>{syncedTasksCount ? 'Update Planner' : 'Add to My Plan'}</span>
                </button>

                <button
                  onClick={handleSetAsGoal}
                  disabled={isGoalSaved}
                  className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase font-label-caps transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isGoalSaved
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                      : 'border-outline-variant/60 text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>{isGoalSaved ? 'Goal Created' : 'Set as Study Goal'}</span>
                </button>
              </div>
            </div>

            {/* Strategic Highlights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <p className="text-xs font-label-caps uppercase text-primary font-bold">Strategic Methodology</p>
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {activePlan.strategyHighlights.map((sh, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                      <span>{sh}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <p className="text-xs font-label-caps uppercase text-secondary font-bold">Cognitive Study Hacks</p>
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {activePlan.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Day by Day Roadmap Accordion */}
          <div className="space-y-4">
            <h4 className="font-headline-sm text-on-surface flex items-center gap-2">
              <span>Day-by-Day Learning Roadmap</span>
              <span className="text-xs text-on-surface-variant font-normal">({activePlan.days.length} Daily Modules)</span>
            </h4>

            <div className="space-y-3">
              {activePlan.days.map((day) => {
                const isExpanded = expandedDays[day.dayNumber] ?? false;

                return (
                  <div
                    key={day.dayNumber}
                    className="bg-surface border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm transition-all"
                  >
                    {/* Day Header Accordion Toggle */}
                    <button
                      onClick={() => toggleDayExpanded(day.dayNumber)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                          D{day.dayNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-primary uppercase font-label-caps">
                              Day {day.dayNumber}
                            </span>
                            <span className="text-xs text-on-surface-variant">· {day.estimatedMinutes} Mins</span>
                          </div>
                          <h5 className="font-title-md text-on-surface font-semibold mt-0.5">{day.theme}</h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                          {day.tasks.length} Tasks
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-on-surface-variant" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                        )}
                      </div>
                    </button>

                    {/* Day Details */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-outline-variant/30 space-y-4 bg-surface-container-lowest/50 animate-fade-up">
                        <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 text-xs">
                          <span className="text-on-surface-variant">
                            <strong>Daily Milestone:</strong> {day.keyMilestone}
                          </span>
                          {day.quizTopicSuggestion && (
                            <button
                              onClick={() => onOpenQuizTopic(day.quizTopicSuggestion || day.focusArea, activePlan.subject)}
                              className="text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Quiz this Module</span>
                            </button>
                          )}
                        </div>

                        {/* Task List */}
                        <div className="space-y-2.5">
                          {day.tasks.map((task, tIdx) => (
                            <div
                              key={task.id || tIdx}
                              className="p-3.5 rounded-lg bg-surface border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      task.type === 'quiz'
                                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                        : task.type === 'practice'
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-primary-fixed/20 text-primary'
                                    }`}
                                  >
                                    {task.type}
                                  </span>
                                  <span className="text-xs font-semibold text-on-surface">{task.title}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant pl-0.5">{task.description}</p>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
                                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                                  {task.durationMinutes} mins
                                </span>
                                <button
                                  onClick={() => onOpenExplainTopic(task.title, activePlan.subject)}
                                  className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-primary-fixed/20 hover:text-primary transition-colors text-[11px] font-semibold text-on-surface-variant flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Explain</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
