import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TopicExplanationResponse, StudyLevel } from '../../types';
import {
  Lightbulb,
  Search,
  Sparkles,
  BookOpen,
  Code2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flame,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

interface TopicExplainerProps {
  initialTopic?: string;
  initialSubject?: string;
  onLaunchQuiz: (topic: string, subject: string) => void;
}

export const TopicExplainer: React.FC<TopicExplainerProps> = ({
  initialTopic = 'Relational Database Normalization',
  initialSubject = 'Computer Science / DBMS',
  onLaunchQuiz,
}) => {
  const { studentCourses } = useApp();
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [level, setLevel] = useState<StudyLevel>('Intermediate');
  const [mode, setMode] = useState<'standard' | 'simpler' | 'deep_example' | 'common_mistakes'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<TopicExplanationResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTopic, initialSubject]);

  const handleExplain = async (overrideMode?: 'standard' | 'simpler' | 'deep_example' | 'common_mistakes') => {
    if (!topic.trim()) return;
    const activeMode = overrideMode || mode;
    setMode(activeMode);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/study/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          level,
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topic explanation');
      }

      const data: TopicExplanationResponse = await response.json();
      setExplanation(data);
    } catch (err: any) {
      console.error('Explanation request failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically on first mount if initialTopic provided
  useEffect(() => {
    if (initialTopic && !explanation) {
      handleExplain('standard');
    }
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Search & Topic Prompt Bar */}
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <Lightbulb className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Topic Explainer</h3>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              Ask anything you are studying to receive intuitive explanations, real-world practical code, and exam takeaways.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Topic to Master
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                  placeholder="e.g. BCNF Normalization, Red-Black Trees, Dijkstra Algorithm, Fourier Transform..."
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                Academic Field / Subject
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
                <option value="Operating Systems & Networks">Operating Systems & Networks</option>
                <option value="Physics & Engineering">Physics & Engineering</option>
                <option value="Artificial Intelligence / ML">Artificial Intelligence / ML</option>
              </select>
            </div>
          </div>

          {/* Quick Preset Topics */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-on-surface-variant font-medium">Quick Topics:</span>
            {[
              '1NF, 2NF, 3NF & BCNF',
              'ACID Transactions & Locks',
              'B-Tree vs Hash Indexing',
              'Dynamic Programming Memoization',
              'Deadlock Coffman Conditions',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTopic(preset);
                  handleExplain('standard');
                }}
                className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary-fixed/20 hover:text-primary transition-colors text-on-surface-variant cursor-pointer text-[11px]"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
            {/* Level Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Depth:</span>
              {(['Beginner', 'Intermediate', 'Advanced'] as StudyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                    level === lvl
                      ? 'bg-primary-container text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleExplain('standard')}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Explanation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Explanation Output */}
      {explanation && (
        <div className="space-y-6 animate-fade-up">
          {/* Mode Switcher Bar */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-on-surface-variant font-medium">Perspective:</span>
              <button
                onClick={() => handleExplain('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  mode === 'standard'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Comprehensive
              </button>
              <button
                onClick={() => handleExplain('simpler')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'simpler'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Explain Simpler (ELI5)</span>
              </button>
              <button
                onClick={() => handleExplain('deep_example')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'deep_example'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code & Diagram Heavy</span>
              </button>
              <button
                onClick={() => handleExplain('common_mistakes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'common_mistakes'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Exam Traps & Mistakes</span>
              </button>
            </div>

            <button
              onClick={() => onLaunchQuiz(explanation.topic, explanation.subject)}
              className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-dim text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Flame className="w-4 h-4" />
              <span>Test Me on This</span>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Title & 1-Line Definition */}
            <div className="space-y-2 pb-5 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-fixed/20 text-primary">
                  {explanation.subject}
                </span>
                <span className="text-xs text-on-surface-variant">· {explanation.level} Level</span>
              </div>
              <h3 className="font-headline-md text-on-surface">{explanation.topic}</h3>
              <p className="text-base text-primary font-medium italic">
                "{explanation.oneLineSummary}"
              </p>
            </div>

            {/* Simple Core Explanation */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-on-surface leading-relaxed whitespace-pre-line">
              {explanation.simpleExplanation}
            </div>

            {/* Key Concepts Breakdown */}
            {explanation.keyConcepts && explanation.keyConcepts.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Key Principles & Invariants</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {explanation.keyConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1.5"
                    >
                      <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider text-secondary">
                        {concept.name}
                      </h5>
                      <p className="text-xs text-on-surface-variant leading-normal">{concept.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real World Practical Example / Code */}
            {explanation.realWorldExample && (
              <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                <h4 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>{explanation.realWorldExample.title}</span>
                </h4>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                  <p className="text-xs font-medium text-on-surface">
                    <strong>Scenario:</strong> {explanation.realWorldExample.scenario}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {explanation.realWorldExample.explanation}
                  </p>

                  {explanation.realWorldExample.codeOrDiagram && (
                    <div className="relative mt-2 rounded-lg bg-surface-container-lowest border border-outline-variant/60 overflow-hidden font-mono text-xs">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-high border-b border-outline-variant/40 text-[11px] text-on-surface-variant">
                        <span>{explanation.realWorldExample.language || 'code'}</span>
                        <button
                          onClick={() => handleCopyCode(explanation.realWorldExample.codeOrDiagram!)}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-on-surface text-xs leading-relaxed">
                        <code>{explanation.realWorldExample.codeOrDiagram}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* High-Yield Exam Memory Points & Common Pitfalls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
              {/* Important Points */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2.5">
                <p className="text-xs font-bold font-label-caps uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>High-Yield Exam Invariants</span>
                </p>
                <ul className="space-y-1.5 text-xs text-on-surface-variant">
                  {explanation.importantPointsToRemember.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Traps */}
              <div className="p-4 rounded-xl bg-error-container/10 border border-error/30 space-y-2.5">
                <p className="text-xs font-bold font-label-caps uppercase text-error flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Exam Traps & Misconceptions</span>
                </p>
                <div className="space-y-2">
                  {explanation.commonMistakesAndPitfalls.map((pitfall, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="text-error font-medium">⚠️ {pitfall.mistake}</p>
                      <p className="text-on-surface-variant pl-4">✓ Correction: {pitfall.correction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 30-Second Quick Recap */}
            <div className="p-4 rounded-xl bg-primary-fixed/20 border border-primary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary font-label-caps uppercase">
                  30-Second Rapid Summary
                </p>
                <div className="flex items-center gap-4 flex-wrap text-xs text-on-surface">
                  {explanation.quickSummary.map((sum, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>{sum}</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onLaunchQuiz(explanation.topic, explanation.subject)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-dim transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Take Diagnostic Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
