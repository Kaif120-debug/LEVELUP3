import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeProblem } from '../../types';
import {
  FileCode,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Flame,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

interface PracticeQuestionsStudioProps {
  initialTopic?: string;
  initialSubject?: string;
  onExplainTopic: (topic: string, subject: string) => void;
  onLaunchQuiz: (topic: string, subject: string) => void;
}

export const PracticeQuestionsStudio: React.FC<PracticeQuestionsStudioProps> = ({
  initialTopic = 'SQL Queries & Normalization',
  initialSubject = 'Computer Science / DBMS',
  onExplainTopic,
  onLaunchQuiz,
}) => {
  const { studentCourses } = useApp();
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [problemType, setProblemType] = useState<'SQL' | 'Coding' | 'Conceptual' | 'Numerical' | 'MCQ'>('SQL');
  const [count, setCount] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [revealedSolutions, setRevealedSolutions] = useState<{ [id: string]: boolean }>({});
  const [revealedHints, setRevealedHints] = useState<{ [id: string]: number }>({});
  const [userDrafts, setUserDrafts] = useState<{ [id: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateProblems = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setRevealedSolutions({});
    setRevealedHints({});

    try {
      const response = await fetch('/api/ai/study/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          difficulty,
          problemType,
          count,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate practice problems');
      }

      const data = await response.json();
      if (data?.problems) {
        setProblems(data.problems);
      }
    } catch (err: any) {
      console.error('Practice generator failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealNextHint = (id: string, maxHints: number) => {
    const current = revealedHints[id] || 0;
    if (current < maxHints) {
      setRevealedHints((prev) => ({ ...prev, [id]: current + 1 }));
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Control Setup Card */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <FileCode className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Practice Questions Studio</h3>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              Generate hands-on practice problems, coding exercises, SQL drills, and conceptual problem sets.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateProblems} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Topic or Problem Focus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 2nd Highest Salary, BCNF Decomposition, Graph BFS..."
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
                Problem Format
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as any)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value="SQL">SQL Queries & Schema</option>
                <option value="Coding">Coding / Algorithm</option>
                <option value="Conceptual">Conceptual Analysis</option>
                <option value="Numerical">Numerical / Calculations</option>
                <option value="MCQ">Multiple Choice</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Difficulty:</span>
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                    difficulty === diff
                      ? 'bg-primary-container text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Exercises...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Practice Set</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Problems List */}
      {problems.length > 0 && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-sm text-on-surface">
              Practice Problem Set ({problems.length} Problems)
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExplainTopic(topic, subject)}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain {topic}</span>
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {problems.map((prob, idx) => {
              const hintsCount = prob.hints?.length || 0;
              const revealedCount = revealedHints[prob.id] || 0;
              const isSolutionOpen = revealedSolutions[prob.id] || false;

              return (
                <div
                  key={prob.id || idx}
                  className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 transition-all"
                >
                  {/* Problem Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {prob.type} Problem
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prob.difficulty === 'Hard'
                              ? 'bg-error-container/20 text-error'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </div>
                      <h5 className="font-title-md text-on-surface font-semibold">{prob.title}</h5>
                    </div>

                    <button
                      onClick={() => onLaunchQuiz(prob.topic || topic, subject)}
                      className="px-3 py-1 rounded-lg border border-secondary text-secondary hover:bg-secondary-container/20 text-xs font-semibold flex items-center gap-1 self-start sm:self-center cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Quiz Similar</span>
                    </button>
                  </div>

                  {/* Question Body */}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                    {prob.question}
                  </div>

                  {/* Code Starter if exists */}
                  {prob.codeStarter && (
                    <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/60 overflow-hidden font-mono text-xs">
                      <div className="px-3 py-1.5 bg-surface-container-high border-b border-outline-variant/40 text-[11px] text-on-surface-variant flex items-center justify-between">
                        <span>Starter Template</span>
                        <button
                          onClick={() => handleCopy(prob.id, prob.codeStarter!)}
                          className="hover:text-primary flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === prob.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === prob.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-3.5 overflow-x-auto text-on-surface">
                        <code>{prob.codeStarter}</code>
                      </pre>
                    </div>
                  )}

                  {/* Student Scratchpad / Attempt Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-label-caps uppercase text-on-surface-variant font-semibold">
                      Your Answer / Notes Scratchpad
                    </label>
                    <textarea
                      rows={3}
                      value={userDrafts[prob.id] || ''}
                      onChange={(e) =>
                        setUserDrafts((prev) => ({ ...prev, [prob.id]: e.target.value }))
                      }
                      placeholder="Type your solution, algorithm steps, or reasoning here before revealing the answer..."
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-3 text-xs font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Hints Section */}
                  {hintsCount > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => revealNextHint(prob.id, hintsCount)}
                          disabled={revealedCount >= hintsCount}
                          className="text-xs text-secondary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>
                            {revealedCount === 0
                              ? 'Need a Hint?'
                              : revealedCount < hintsCount
                              ? `Show Next Hint (${revealedCount}/${hintsCount})`
                              : `All Hints Revealed (${hintsCount}/${hintsCount})`}
                          </span>
                        </button>
                      </div>

                      {revealedCount > 0 && (
                        <div className="space-y-1.5 animate-fade-up">
                          {prob.hints.slice(0, revealedCount).map((hint, hIdx) => (
                            <div
                              key={hIdx}
                              className="p-3 rounded-lg bg-secondary-container/20 border border-secondary/30 text-xs text-secondary flex items-start gap-2"
                            >
                              <span className="font-bold">Hint {hIdx + 1}:</span>
                              <span>{hint}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solution Toggle and Content */}
                  <div className="pt-2 border-t border-outline-variant/30">
                    <button
                      onClick={() => toggleSolution(prob.id)}
                      className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-primary-fixed/20 hover:text-primary transition-colors text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      {isSolutionOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{isSolutionOpen ? 'Hide Solution' : 'Reveal Solution & Walkthrough'}</span>
                    </button>

                    {isSolutionOpen && (
                      <div className="mt-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-4 animate-fade-up">
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold font-label-caps uppercase text-emerald-600 dark:text-emerald-400">
                            Model Solution:
                          </p>
                          <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono text-xs text-on-surface overflow-x-auto">
                            <code>{prob.solution.answer}</code>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-on-surface">Step-by-Step Rationale:</p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {prob.solution.explanation}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-primary-fixed/20 border border-primary/30 text-xs text-primary font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>
                            <strong>Exam Key Takeaway:</strong> {prob.solution.keyTakeaway}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
