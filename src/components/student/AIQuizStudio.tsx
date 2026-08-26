import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QuizQuestion, QuizUserAnswer, QuizResultSummary, StudyLevel, WeakTopicRecord } from '../../types';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Calendar,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface AIQuizStudioProps {
  initialTopic?: string;
  initialSubject?: string;
  onExplainTopic: (topic: string, subject: string) => void;
  onCreatePlanForTopic: (topic: string, subject: string) => void;
  onUpdateWeakTopic: (record: WeakTopicRecord) => void;
}

export const AIQuizStudio: React.FC<AIQuizStudioProps> = ({
  initialTopic = 'Database Normalization & ACID Properties',
  initialSubject = 'Computer Science / DBMS',
  onExplainTopic,
  onCreatePlanForTopic,
  onUpdateWeakTopic,
}) => {
  const { state, studentCourses, openUpgradeModal } = useApp();
  const isPro = state.subscription.status === 'active' && state.subscription.plan === 'LEVELUP_PRO';

  // Setup State
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [level, setLevel] = useState<StudyLevel>('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  // Active Quiz State
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userAnswers, setUserAnswers] = useState<QuizUserAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResultSummary | null>(null);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTopic, initialSubject]);

  const handleStartQuiz = async () => {
    if (!topic.trim()) return;

    if (questionCount > 5 && !isPro) {
      openUpgradeModal('10-Question Deep Diagnostic Quizzes');
      return;
    }

    setIsGenerating(true);
    setQuizResult(null);
    setUserAnswers([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setShowHint(false);

    try {
      const response = await fetch('/api/ai/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          level,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err: any) {
      console.error('Quiz creation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerRevealed) return; // Prevent changing after submission
    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    const isCorrect = optionIndex === currentQ.correctOptionIndex;
    const answerRecord: QuizUserAnswer = {
      questionId: currentQ.id,
      questionNumber: currentIndex + 1,
      selectedOptionIndex: optionIndex,
      isCorrect,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setShowHint(false);
    } else {
      // Complete quiz and evaluate summary
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const total = questions.length;
    const correct = userAnswers.filter((a) => a.isCorrect).length;
    const scorePct = Math.round((correct / total) * 100);

    let grade: QuizResultSummary['grade'] = 'Needs Revision';
    if (scorePct >= 90) grade = 'A+';
    else if (scorePct >= 80) grade = 'A';
    else if (scorePct >= 70) grade = 'B';
    else if (scorePct >= 55) grade = 'C';

    const weakConcepts: string[] = [];
    const strongConcepts: string[] = [];

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans && ans.isCorrect) {
        if (!strongConcepts.includes(q.conceptTested)) strongConcepts.push(q.conceptTested);
      } else {
        if (!weakConcepts.includes(q.conceptTested)) weakConcepts.push(q.conceptTested);
      }
    });

    const summary: QuizResultSummary = {
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: total - correct,
      scorePercentage: scorePct,
      subject,
      topic,
      level,
      grade,
      strongConcepts,
      weakConcepts,
      revisionRecommendations: [
        `Review fundamental definitions of ${weakConcepts.length > 0 ? weakConcepts[0] : topic}.`,
        `Practice solving 3-5 application problems without reviewing notes.`,
        `Test again in 48 hours to lock in spaced recall memory.`,
      ],
      completedAt: new Date().toISOString(),
    };

    setQuizResult(summary);

    // Update Weak Topic in persistent tracker
    onUpdateWeakTopic({
      id: `wt-${Date.now()}`,
      topic,
      subject,
      accuracy: scorePct,
      totalAttempts: total,
      correctAttempts: correct,
      status: scorePct >= 75 ? 'strong' : scorePct >= 50 ? 'moderate' : 'weak',
      lastTestedDate: new Date().toLocaleDateString(),
      recommendedAction:
        scorePct >= 75
          ? 'Consolidated - ready for advanced problems'
          : scorePct >= 50
          ? 'Review key edge cases & exam traps'
          : 'Urgent: re-study core fundamentals with AI Explainer',
    });
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Quiz Setup Header (when not taking a quiz) */}
      {!currentQ || quizResult ? (
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                  <Flame className="w-5 h-5" />
                </span>
                <h3 className="font-headline-sm text-on-surface">AI Interactive Quiz Studio</h3>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                Test your knowledge with step-by-step diagnostic questions. Questions adapt to your skill level.
              </p>
            </div>

            {!isPro && (
              <button
                onClick={() => openUpgradeModal('10-Question Diagnostic Quizzes')}
                className="px-3 py-1.5 rounded-lg bg-secondary-container/20 border border-secondary text-secondary text-xs font-semibold hover:bg-secondary-container/30 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock 10-Question Pro Quizzes</span>
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1.5 font-semibold">
                  Quiz Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Relational Calculus, B-Trees, Dynamic Programming..."
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
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
                  <option value="Physics">Physics</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Difficulty:</span>
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

                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Length:</span>
                  {[
                    { count: 5, label: '5 Questions' },
                    { count: 10, label: '10 Questions (Pro)', pro: !isPro },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => {
                        if (item.pro) {
                          openUpgradeModal('10-Question Diagnostic Quizzes');
                          return;
                        }
                        setQuestionCount(item.count);
                      }}
                      className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                        questionCount === item.count
                          ? 'bg-primary-container text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Formulating Quiz Questions...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Launch Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive Active Quiz Interface */}
      {currentQ && !quizResult && (
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-up">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
              <span className="text-primary font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{currentQ.difficulty} Difficulty · {currentQ.conceptTested}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="font-headline-sm text-on-surface leading-snug">{currentQ.question}</h3>
          </div>

          {/* Hint Trigger */}
          {currentQ.hint && !showHint && (
            <div>
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-secondary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a hint?</span>
              </button>
            </div>
          )}

          {showHint && currentQ.hint && (
            <div className="p-3 rounded-lg bg-secondary-container/20 border border-secondary/40 text-secondary text-xs flex items-start gap-2 animate-fade-up">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Hint:</strong> {currentQ.hint}
              </span>
            </div>
          )}

          {/* Options (A, B, C, D) */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((optionText, optIdx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQ.correctOptionIndex;

              let optionStyle = 'bg-surface-container-low border-outline-variant/50 hover:border-primary/50 text-on-surface';

              if (isAnswerRevealed) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-error-container/20 border-error text-error';
                } else {
                  optionStyle = 'opacity-50 border-outline-variant/30 text-on-surface-variant';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswerRevealed}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAnswerRevealed && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isAnswerRevealed && isSelected && !isCorrect
                          ? 'bg-error text-on-error'
                          : isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">{optionText}</span>
                  </div>

                  {isAnswerRevealed && (
                    <div className="shrink-0">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-error" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner (when answered) */}
          {isAnswerRevealed && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 animate-fade-up">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-label-caps uppercase text-primary">
                  Explanation & Key Insight:
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls */}
          {isAnswerRevealed && (
            <div className="flex items-center justify-end pt-4 border-t border-outline-variant/40 animate-fade-up">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase rounded-lg transition-all flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Full Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final Quiz Score Report */}
      {quizResult && (
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-up">
          {/* Header Score Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-outline-variant/40">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                  <Award className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Diagnostic Quiz Complete
                </span>
              </div>
              <h3 className="font-headline-md text-on-surface">{quizResult.topic}</h3>
              <p className="text-on-surface-variant text-sm">
                You answered <strong>{quizResult.correctCount}</strong> out of{' '}
                <strong>{quizResult.totalQuestions}</strong> questions correctly.
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-label-caps uppercase text-on-surface-variant">Grade</p>
                <p
                  className={`text-3xl font-extrabold ${
                    quizResult.scorePercentage >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : quizResult.scorePercentage >= 60
                      ? 'text-amber-500'
                      : 'text-error'
                  }`}
                >
                  {quizResult.grade}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  quizResult.scorePercentage >= 80
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                    : quizResult.scorePercentage >= 60
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40'
                    : 'bg-error-container/20 text-error border border-error/40'
                }`}
              >
                {quizResult.scorePercentage}%
              </div>
            </div>
          </div>

          {/* Concepts Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strong Concepts */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
              <p className="text-xs font-bold font-label-caps uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strong Concepts Mastered</span>
              </p>
              {quizResult.strongConcepts.length > 0 ? (
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  {quizResult.strongConcepts.map((sc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{sc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-on-surface-variant italic">No strong concepts recorded yet.</p>
              )}
            </div>

            {/* Weak Concepts */}
            <div className="p-4 rounded-xl bg-error-container/10 border border-error/30 space-y-2">
              <p className="text-xs font-bold font-label-caps uppercase text-error flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Areas Needing Revision</span>
              </p>
              {quizResult.weakConcepts.length > 0 ? (
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  {quizResult.weakConcepts.map((wc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span>{wc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Zero weak concepts detected! Outstanding performance.
                </p>
              )}
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <p className="text-xs font-label-caps uppercase text-primary font-bold">
              AI Study Coach Recommendations
            </p>
            <ul className="space-y-1.5 text-xs text-on-surface-variant">
              {quizResult.revisionRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Final Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/40">
            <button
              onClick={() => {
                setQuizResult(null);
                handleStartQuiz();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-outline-variant/60 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => onExplainTopic(quizResult.topic, quizResult.subject)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary-fixed/20 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explain Weak Concepts</span>
              </button>

              <button
                onClick={() => onCreatePlanForTopic(quizResult.topic, quizResult.subject)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Study Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
