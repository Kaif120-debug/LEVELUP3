import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  Code2,
} from 'lucide-react';

interface AssistantStep {
  stepNumber: number;
  title: string;
  explanation: string;
}

interface AssistantResponse {
  answer: string;
  steps: AssistantStep[];
  keyRuleOrFormula?: string;
  exampleSnippet?: {
    title: string;
    content: string;
    language: string;
  };
  commonMisconception?: string;
  suggestedFollowUps?: string[];
}

interface LearningAssistantStudioProps {
  initialTopic?: string;
  initialSubject?: string;
}

export const LearningAssistantStudio: React.FC<LearningAssistantStudioProps> = ({
  initialTopic = 'Algorithms & Problem Solving',
  initialSubject = 'Computer Science',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);

  const sampleQuestions = [
    'How do I calculate recurrence relation time complexity using Master Theorem?',
    'What is the fundamental difference between 2PL and Snapshot Isolation?',
    'Explain how Dijkstra algorithm avoids cycles in negative weight graphs.',
    'How do I structure a dynamic programming transition state equation?',
  ];

  const handleAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || query;
    if (!q.trim()) return;

    setQuery(q);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/study/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          topic,
          subject,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch tutor assistance');
      }

      const data: AssistantResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error('[AI Tutor Assistant Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header and Query Bar */}
      <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Learning Assistant & Problem Solver</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Ask any conceptual blocker, homework theorem, or algorithm question for step-by-step master derivation.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed/20 text-primary self-start sm:self-auto">
            Interactive AI Tutor
          </span>
        </div>

        {/* Input Bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">
                Course Context
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science, Algorithms"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">
                Topic Context
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Normalization"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. How do I balance an AVL tree after right-heavy rotation?)"
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none text-on-surface"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="py-3.5 px-6 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>

          {/* Prompt chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] text-on-surface-variant font-medium">Quick Prompts:</span>
            {sampleQuestions.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(sq)}
                className="text-[11px] bg-surface-container-low hover:bg-surface-container text-on-surface px-2.5 py-1 rounded-lg border border-outline-variant/40 transition-colors text-left cursor-pointer truncate max-w-[280px]"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer View */}
      {result && (
        <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-base sm:text-lg text-on-surface">Tutor Explanation</h4>
          </div>

          {/* Main Answer */}
          <div className="text-sm text-on-surface leading-relaxed space-y-3 p-4 rounded-xl bg-primary-fixed/10 border border-primary/20">
            <p>{result.answer}</p>
          </div>

          {/* Steps */}
          {result.steps?.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Step-by-Step Derivation
              </h5>
              <div className="space-y-3">
                {result.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {st.stepNumber}
                    </span>
                    <div className="space-y-1">
                      <h6 className="font-semibold text-sm text-on-surface">{st.title}</h6>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {st.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Golden Rule */}
          {result.keyRuleOrFormula && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block uppercase">
                  Golden Rule / Theorem
                </span>
                <p className="text-xs sm:text-sm text-on-surface font-semibold mt-0.5">
                  {result.keyRuleOrFormula}
                </p>
              </div>
            </div>
          )}

          {/* Code Example */}
          {result.exampleSnippet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase">
                <Code2 className="w-4 h-4 text-primary" />
                <span>{result.exampleSnippet.title}</span>
              </div>
              <div className="rounded-xl bg-surface-container-highest p-4 font-mono text-xs overflow-x-auto text-on-surface">
                <pre>{result.exampleSnippet.content}</pre>
              </div>
            </div>
          )}

          {/* Common Misconception */}
          {result.commonMisconception && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-error block uppercase">
                  Common Exam Trap & Misconception
                </span>
                <p className="text-xs text-on-surface mt-0.5">{result.commonMisconception}</p>
              </div>
            </div>
          )}

          {/* Follow-up Prompts */}
          {result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
            <div className="pt-2 border-t border-outline-variant/40 space-y-2">
              <span className="text-xs font-semibold text-on-surface-variant block">
                Dive Deeper / Follow-Up Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(fu)}
                    className="text-xs bg-surface-container hover:bg-surface-container-high text-primary px-3 py-1.5 rounded-lg border border-outline-variant/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{fu}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
