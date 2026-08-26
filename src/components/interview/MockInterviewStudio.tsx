import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  X,
  Target,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Building2,
  FolderGit2,
  Lock,
  History,
  FileText,
  Check,
  Play,
  Flame,
  Lightbulb,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Keyboard,
  Radio,
  RefreshCw,
  AudioLines,
  Square,
} from 'lucide-react';
import {
  InterviewType,
  MockInterviewDifficulty,
  MockInterviewQuestionCount,
  MockInterviewMode,
  MockInterviewConfig,
  MockInterviewTurn,
  MockInterviewReport,
  MockInterviewSession,
  ResumeProject,
  ResumeExperience,
} from '../../types';
import { useSubscription } from '../../hooks/useSubscription';
import { useVoiceInterview, VoiceState } from '../../hooks/useVoiceInterview';

interface MockInterviewStudioProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultExperienceLevel?: string;
  defaultInterviewType?: InterviewType;
  defaultTargetCompany?: string;
  defaultJobDescription?: string;
  userProjects?: ResumeProject[];
  userExperience?: ResumeExperience[];
  candidateSkills?: string[];
  candidateName?: string;
  candidateSummary?: string;
  weakAreas?: string[];
  activeWeakAreas?: string[];
  activePlanQuestions?: any[];
  onApplyWeakAreasToPlan?: (weakestArea: string, revisionTopics: string[]) => void;
}

const STORAGE_KEY_CURRENT_SESSION = 'levelup_mock_interview_active_session_v1';
const STORAGE_KEY_HISTORY = 'levelup_mock_interviews_history_v1';
const STORAGE_KEY_USAGE_COUNT = 'levelup_mock_interview_free_usage_count_v1';

export const MockInterviewStudio: React.FC<MockInterviewStudioProps> = ({
  isOpen,
  onClose,
  defaultRole = 'Full Stack Developer',
  defaultExperienceLevel = '1–3 years',
  defaultInterviewType = 'Mixed',
  defaultTargetCompany = '',
  defaultJobDescription = '',
  userProjects = [],
  userExperience = [],
  candidateSkills = [],
  candidateName = 'Candidate',
  candidateSummary = '',
  weakAreas = [],
  onApplyWeakAreasToPlan,
}) => {
  const { isPro, isFree, openUpgradeModal } = useSubscription();

  // Session State
  const [viewState, setViewState] = useState<'setup' | 'interview' | 'evaluating' | 'report' | 'history'>('setup');
  const [interviewMode, setInterviewMode] = useState<MockInterviewMode>('text');
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [interviewType, setInterviewType] = useState<InterviewType>(defaultInterviewType);
  const [difficulty, setDifficulty] = useState<MockInterviewDifficulty>('Intermediate');
  const [questionCount, setQuestionCount] = useState<MockInterviewQuestionCount>(5);
  const [useJobDescription, setUseJobDescription] = useState(Boolean(defaultJobDescription));
  const [useResumeProjects, setUseResumeProjects] = useState(userProjects.length > 0);

  // Active Interview State
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<{
    questionId: string;
    question: string;
    category: string;
    difficulty: string;
    evaluates?: string;
    projectRef?: string;
  } | null>(null);
  const [turns, setTurns] = useState<MockInterviewTurn[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceSpeechNotice, setVoiceSpeechNotice] = useState<string | null>(null);

  // Voice Hook
  const {
    voiceState,
    setVoiceState,
    transcript,
    setTranscript,
    interimTranscript,
    isListening,
    isSpeaking,
    micPermission,
    setMicPermission,
    isSupported: isVoiceSupported,
    audioLevel,
    speakingDuration,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    requestMicPermission,
  } = useVoiceInterview();

  // Evaluation & Final Report
  const [report, setReport] = useState<MockInterviewReport | null>(null);
  const [pastReports, setPastReports] = useState<MockInterviewReport[]>([]);
  const [selectedReviewQuestionIdx, setSelectedReviewQuestionIdx] = useState<number>(0);
  const [evaluatingStep, setEvaluatingStep] = useState(0);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Free Tier Usage
  const [freeUsageCount, setFreeUsageCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USAGE_COUNT);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Cleanup voice when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen, stopSpeaking, stopListening]);

  // Initialize and load persisted session if any
  useEffect(() => {
    if (!isOpen) return;

    // Load past reports
    try {
      const savedReports = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedReports) {
        setPastReports(JSON.parse(savedReports));
      }
    } catch (e) {
      console.warn('Failed to load past mock interview reports:', e);
    }

    // Check active session
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
      if (savedSession) {
        const session: MockInterviewSession = JSON.parse(savedSession);
        if (session.status === 'in_progress' && session.currentQuestion) {
          setTargetRole(session.config.targetRole);
          setInterviewType(session.config.interviewType);
          setDifficulty(session.config.difficulty);
          setQuestionCount(session.config.questionCount);
          setInterviewMode(session.config.mode || 'text');
          setUseJobDescription(session.config.useJobDescription);
          setUseResumeProjects(session.config.useResumeProjects);
          setCurrentQuestionNumber(session.currentQuestionNumber);
          setCurrentQuestion(session.currentQuestion);
          setTurns(session.turns || []);
          setViewState('interview');
          setIsTimerRunning(true);
        } else if (session.status === 'completed' && session.report) {
          setReport(session.report);
          setViewState('report');
        }
      }
    } catch (e) {
      console.warn('Failed to load active session:', e);
    }
  }, [isOpen]);

  // Sync default parameters when modal opens
  useEffect(() => {
    if (defaultRole && viewState === 'setup') {
      setTargetRole(defaultRole);
    }
    if (defaultInterviewType && viewState === 'setup') {
      setInterviewType(defaultInterviewType);
    }
    if (defaultJobDescription && viewState === 'setup') {
      setUseJobDescription(true);
    }
  }, [defaultRole, defaultInterviewType, defaultJobDescription, viewState]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && viewState === 'interview') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, viewState]);

  // Auto-scroll when new question or turn arrives
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentQuestion, turns, isSubmittingAnswer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to trigger AI voice reading for a question
  const triggerVoiceQuestion = useCallback(
    (questionText: string) => {
      setVoiceSpeechNotice(null);
      resetTranscript();
      setVoiceState('ai_speaking');
      speakText(questionText, () => {
        setVoiceState('listening');
        startListening();
      });
    },
    [speakText, startListening, resetTranscript, setVoiceState]
  );

  // Start Interview Flow
  const handleStartInterview = async () => {
    // Check Free tier limit
    if (isFree && freeUsageCount >= 2) {
      openUpgradeModal('AI Mock Interview (2 free monthly sessions limit reached)');
      return;
    }

    if (interviewMode === 'voice' && !isVoiceSupported) {
      setErrorMessage('Voice mock interview is not supported in this browser. Please use Text Interview mode.');
      return;
    }

    if (interviewMode === 'voice' && micPermission !== 'granted') {
      const granted = await requestMicPermission();
      if (!granted) {
        setErrorMessage('Microphone access is required for Voice Interview. Please grant permission or switch to Text mode.');
        return;
      }
    }

    setErrorMessage(null);
    setVoiceSpeechNotice(null);
    setIsSubmittingAnswer(true);
    setViewState('interview');
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setTurns([]);
    setCurrentQuestionNumber(1);
    resetTranscript();

    try {
      const response = await fetch('/api/ai/mock-interview/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          experienceLevel: defaultExperienceLevel,
          interviewType,
          difficulty,
          questionCount,
          currentQuestionNumber: 1,
          targetCompany: defaultTargetCompany,
          jobDescription: defaultJobDescription,
          useJobDescription,
          useResumeProjects,
          userProjects,
          userExperience,
          candidateSkills,
          candidateName,
          candidateSummary,
          weakAreas,
          previousTurns: [],
          lastAnswer: '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setCurrentQuestionNumber(1);

        // Save active session
        const session: MockInterviewSession = {
          id: `session-${Date.now()}`,
          status: 'in_progress',
          config: {
            targetRole,
            interviewType,
            difficulty,
            questionCount,
            mode: interviewMode,
            targetCompany: defaultTargetCompany,
            jobDescription: defaultJobDescription,
            useJobDescription,
            useResumeProjects,
            weakAreas,
          },
          currentQuestionNumber: 1,
          totalQuestions: questionCount,
          currentQuestion: data.nextQuestion,
          turns: [],
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));

        // If voice mode, speak question 1
        if (interviewMode === 'voice') {
          triggerVoiceQuestion(data.nextQuestion.question);
        }
      } else {
        throw new Error('Could not generate the opening question.');
      }
    } catch (err: any) {
      console.error('Failed to start mock interview:', err);
      setErrorMessage('Unable to start the interview session. Please try again.');
      setViewState('setup');
    } finally {
      setIsSubmittingAnswer(false);
      if (interviewMode === 'text') {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  };

  // Submit Answer & Request Next Question (supports text and voice)
  const handleSubmitAnswer = async (explicitAnswerText?: string) => {
    const rawAnswer = (explicitAnswerText !== undefined ? explicitAnswerText : userAnswer).trim();

    if (!rawAnswer || isSubmittingAnswer || !currentQuestion) {
      if (interviewMode === 'voice' && !rawAnswer) {
        setVoiceSpeechNotice("I didn't catch that. Please speak your answer clearly into your microphone.");
      }
      return;
    }

    const wordCount = rawAnswer.split(/\s+/).filter(Boolean).length;
    if (wordCount < 2) {
      setVoiceSpeechNotice("I didn't catch that. Please try again with a more detailed response.");
      return;
    }

    // Stop speaking & listening during processing
    stopSpeaking();
    stopListening();
    setVoiceState('processing');
    setIsSubmittingAnswer(true);
    setErrorMessage(null);
    setVoiceSpeechNotice(null);

    const activeTurnNumber = currentQuestionNumber;
    const isFinalQuestion = activeTurnNumber >= questionCount;

    try {
      // 1. Fetch next question and evaluation from server
      const response = await fetch('/api/ai/mock-interview/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          experienceLevel: defaultExperienceLevel,
          interviewType,
          difficulty,
          questionCount,
          currentQuestionNumber: activeTurnNumber + 1,
          targetCompany: defaultTargetCompany,
          jobDescription: defaultJobDescription,
          useJobDescription,
          useResumeProjects,
          userProjects,
          userExperience,
          candidateSkills,
          candidateName,
          candidateSummary,
          weakAreas,
          previousTurns: [
            ...turns,
            {
              questionId: currentQuestion.questionId,
              questionNumber: activeTurnNumber,
              question: currentQuestion.question,
              category: currentQuestion.category,
              difficulty: currentQuestion.difficulty,
              evaluates: currentQuestion.evaluates,
              projectRef: currentQuestion.projectRef,
              userAnswer: rawAnswer,
            },
          ],
          lastAnswer: rawAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer and fetch next turn');
      }

      const data = await response.json();

      // Record completed turn
      const completedTurn: MockInterviewTurn = {
        questionId: currentQuestion.questionId,
        questionNumber: activeTurnNumber,
        question: currentQuestion.question,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        evaluates: currentQuestion.evaluates,
        projectRef: currentQuestion.projectRef,
        userAnswer: rawAnswer,
        internalEvaluation: data.internalEvaluation || undefined,
        answeredAt: new Date().toISOString(),
      };

      const updatedTurns = [...turns, completedTurn];
      setTurns(updatedTurns);
      setUserAnswer('');
      resetTranscript();

      if (isFinalQuestion) {
        // Complete the interview and generate final report
        await handleConcludeInterview(updatedTurns);
      } else {
        // Advance to next question
        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
          setCurrentQuestionNumber(activeTurnNumber + 1);

          // Update persisted session
          const updatedSession: MockInterviewSession = {
            id: `session-${Date.now()}`,
            status: 'in_progress',
            config: {
              targetRole,
              interviewType,
              difficulty,
              questionCount,
              mode: interviewMode,
              targetCompany: defaultTargetCompany,
              jobDescription: defaultJobDescription,
              useJobDescription,
              useResumeProjects,
              weakAreas,
            },
            currentQuestionNumber: activeTurnNumber + 1,
            totalQuestions: questionCount,
            currentQuestion: data.nextQuestion,
            turns: updatedTurns,
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(updatedSession));

          // If voice mode, speak next question
          if (interviewMode === 'voice') {
            triggerVoiceQuestion(data.nextQuestion.question);
          }
        } else {
          throw new Error('Missing next question from AI response');
        }
      }
    } catch (err: any) {
      console.error('Error in interview turn:', err);
      setErrorMessage('Unable to process your answer. Please try submitting again.');
    } finally {
      setIsSubmittingAnswer(false);
      if (interviewMode === 'text') {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  };

  // Conclude Interview & Generate Full Report
  const handleConcludeInterview = async (completedTurns: MockInterviewTurn[]) => {
    stopSpeaking();
    stopListening();
    setIsTimerRunning(false);
    setViewState('evaluating');
    setEvaluatingStep(0);

    const stepInterval = setInterval(() => {
      setEvaluatingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/ai/mock-interview/evaluate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          experienceLevel: defaultExperienceLevel,
          interviewType,
          difficulty,
          totalQuestions: completedTurns.length,
          candidateName,
          targetCompany: defaultTargetCompany,
          jobDescription: defaultJobDescription,
          turns: completedTurns,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('Failed to generate session evaluation report');
      }

      const data = await response.json();
      if (data.report) {
        const finalReport: MockInterviewReport = {
          ...data.report,
          mode: interviewMode,
          durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        };

        setReport(finalReport);
        setViewState('report');

        // Increment Free usage count if free user
        if (isFree) {
          const nextCount = freeUsageCount + 1;
          setFreeUsageCount(nextCount);
          try {
            localStorage.setItem(STORAGE_KEY_USAGE_COUNT, nextCount.toString());
          } catch {}
        }

        // Save to history
        try {
          const updatedHistory = [finalReport, ...pastReports.filter((r) => r.id !== finalReport.id)].slice(0, 20);
          setPastReports(updatedHistory);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
        } catch (e) {
          console.warn('Failed to save report to history:', e);
        }

        // Clear active session storage
        try {
          localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
        } catch {}
      } else {
        throw new Error('Invalid evaluation report format');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Failed to conclude interview:', err);
      setErrorMessage('Unable to finalize interview evaluation. Please retry.');
      setViewState('interview');
    }
  };

  // Reset and Return to Setup
  const handleResetSession = () => {
    stopSpeaking();
    stopListening();
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
    } catch {}
    setViewState('setup');
    setTurns([]);
    setCurrentQuestion(null);
    setCurrentQuestionNumber(1);
    setUserAnswer('');
    resetTranscript();
    setReport(null);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setErrorMessage(null);
    setVoiceSpeechNotice(null);
  };

  // Switch between Voice & Text mode mid-session
  const handleToggleInterviewMode = async (newMode: MockInterviewMode) => {
    if (newMode === interviewMode) return;

    if (newMode === 'voice') {
      if (!isVoiceSupported) {
        setErrorMessage('Voice mock interview is not supported in this browser.');
        return;
      }
      if (micPermission !== 'granted') {
        const granted = await requestMicPermission();
        if (!granted) {
          setErrorMessage('Microphone access is required for Voice Interview.');
          return;
        }
      }
      setInterviewMode('voice');
      // If there is existing text in userAnswer, copy to transcript
      if (userAnswer.trim()) {
        setTranscript(userAnswer.trim());
      }
      // Read the current question
      if (currentQuestion) {
        triggerVoiceQuestion(currentQuestion.question);
      }
    } else {
      // Switching to text
      stopSpeaking();
      stopListening();
      const combined = (transcript + ' ' + interimTranscript).trim();
      if (combined) {
        setUserAnswer(combined);
      }
      setInterviewMode('text');
    }
  };

  if (!isOpen) return null;

  const currentFullSpokenText = (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();

  return (
    <div
      id="mock-interview-studio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl bg-surface border border-outline-variant rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ========================================================================= */}
        {/* MODAL TOP HEADER BAR                                                      */}
        {/* ========================================================================= */}
        <header className="px-5 py-4 bg-surface-container-low border-b border-outline-variant flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
                  LEVELUP AI
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Interactive Interviewer</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                AI Mock Interview Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switchers */}
            {viewState !== 'interview' && viewState !== 'evaluating' && pastReports.length > 0 && (
              <button
                type="button"
                onClick={() => setViewState(viewState === 'history' ? 'setup' : 'history')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-outline-variant hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span>{viewState === 'history' ? 'New Interview' : `History (${pastReports.length})`}</span>
              </button>
            )}

            {viewState === 'interview' && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-surface border border-outline-variant font-mono text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('End interview early and generate evaluation report based on answers so far?')) {
                      handleConcludeInterview(turns);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-error/10 hover:bg-error/20 text-error transition-colors cursor-pointer"
                >
                  End & Evaluate
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close mock interview studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* BODY WORKSPACE BY VIEW STATE                                              */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-surface">
          {/* ========================================================================= */}
          {/* VIEW 1: SETUP SCREEN                                                      */}
          {/* ========================================================================= */}
          {viewState === 'setup' && (
            <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
              {/* Header Title */}
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                  SESSION CONFIGURATION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
                  Configure Your Live AI Interview
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                  The AI interviewer will grill you sequentially one question at a time, probe follow-ups based on your exact answers, and evaluate your technical and behavioral performance.
                </p>
              </div>

              {/* Context Summary Badges */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">{candidateName}</span>
                    <span className="text-[11px] text-on-surface-variant">
                      {userProjects.length} Verified Projects Synced • {userExperience.length} Past Roles
                    </span>
                  </div>
                </div>

                {defaultTargetCompany && (
                  <div className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Target: {defaultTargetCompany}</span>
                  </div>
                )}
              </div>

              {/* Setup Configuration Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Interview Mode Selector */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps flex items-center justify-between">
                    <span>INTERVIEW MODE</span>
                    <span className="text-[11px] font-mono text-primary font-bold">
                      {interviewMode === 'voice' ? '🎙️ Conversational Audio Experience' : '⌨️ Interactive Text Chat'}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInterviewMode('text')}
                      className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                        interviewMode === 'text'
                          ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                          : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Keyboard className="w-4 h-4" />
                      <div className="text-left">
                        <span className="block font-bold">TEXT INTERVIEW</span>
                        <span className="text-[10px] opacity-80 font-normal">Type answers in real-time</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setInterviewMode('voice');
                        if (micPermission !== 'granted') {
                          await requestMicPermission();
                        }
                      }}
                      className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                        interviewMode === 'voice'
                          ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                          : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <div className="text-left">
                        <span className="block font-bold">🎙️ VOICE INTERVIEW</span>
                        <span className="text-[10px] opacity-80 font-normal">AI speaks & listens to speech</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Target Role */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps">
                    TARGET ROLE
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, UI/UX Designer"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-on-surface font-medium"
                  />
                </div>

                {/* Interview Focus Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps">
                    INTERVIEW TYPE
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-on-surface font-medium cursor-pointer"
                  >
                    <option value="Mixed">Mixed (Comprehensive Technical & Behavioral)</option>
                    <option value="Technical">Technical (Architecture, Deep Code & System Concepts)</option>
                    <option value="Behavioral">Behavioral (STAR Method, Conflict, Leadership)</option>
                    <option value="HR">HR & Cultural Fit (Career Goals, Values)</option>
                    <option value="Case Study">Case Study / Scenario Problem Solving</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps">
                    INTERVIEW DIFFICULTY
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Beginner', 'Intermediate', 'Advanced'] as MockInterviewDifficulty[]).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          difficulty === diff
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps">
                    NUMBER OF QUESTIONS
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([5, 10, 15] as MockInterviewQuestionCount[]).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          questionCount === count
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {count} Questions
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Context Toggles (Job Description & Resume Projects) */}
              <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface font-label-caps">
                  INTELLIGENCE GROUNDING
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* JD Toggle */}
                  <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    useJobDescription
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-surface-container-low border-outline-variant opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={useJobDescription}
                      onChange={(e) => setUseJobDescription(e.target.checked)}
                      disabled={!defaultJobDescription}
                      className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-on-surface block">Prioritize Job Description</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {defaultJobDescription
                          ? 'Prioritizes questions on specific required tech and qualifications.'
                          : 'No job description provided (paste one in Interview Prep to enable).'}
                      </span>
                    </div>
                  </label>

                  {/* Resume Projects Toggle */}
                  <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    useResumeProjects
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-surface-container-low border-outline-variant opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={useResumeProjects}
                      onChange={(e) => setUseResumeProjects(e.target.checked)}
                      disabled={userProjects.length === 0}
                      className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-on-surface block">Grill Real Resume Projects</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {userProjects.length > 0
                          ? `Asks technical architecture questions about your ${userProjects.length} real projects.`
                          : 'No resume projects found.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Weak Areas Detected Banner */}
              {weakAreas.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-on-surface">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 block">
                      Targeting Identified Weak Areas
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      AI will test concepts you recently flagged: <strong>{weakAreas.join(', ')}</strong>
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Start CTA */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="w-full py-4 px-6 rounded-xl font-bold font-label-caps uppercase tracking-wider text-xs bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START MOCK INTERVIEW NOW</span>
                </button>

                {isFree && (
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1">
                    <span>
                      Free monthly sessions: <strong>{Math.max(0, 2 - freeUsageCount)} / 2 remaining</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => openUpgradeModal('AI Mock Interview Pro')}
                      className="text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Upgrade for Unlimited Mocks
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: ACTIVE SEQUENTIAL INTERVIEW                                       */}
          {/* ========================================================================= */}
          {viewState === 'interview' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Progress & Metadata Ribbon */}
              <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                    {targetRole}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-outline-variant font-medium text-on-surface-variant">
                    {interviewType}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-outline-variant font-medium text-on-surface-variant">
                    {difficulty} Bar
                  </span>

                  {/* Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleInterviewMode(interviewMode === 'voice' ? 'text' : 'voice')}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      interviewMode === 'voice'
                        ? 'bg-purple-500/10 text-purple-700 border-purple-500/30 hover:bg-purple-500/20'
                        : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    {interviewMode === 'voice' ? (
                      <>
                        <Mic className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                        <span>🎙️ Voice Mode Active</span>
                        <span className="text-[10px] opacity-70 underline ml-1 font-normal">(Switch to Text)</span>
                      </>
                    ) : (
                      <>
                        <Keyboard className="w-3.5 h-3.5 text-primary" />
                        <span>⌨️ Text Mode Active</span>
                        <span className="text-[10px] opacity-70 underline ml-1 font-normal">(Switch to Voice)</span>
                      </>
                    )}
                  </button>

                  {currentQuestion?.projectRef && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 font-bold flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3" />
                      <span>Project: {currentQuestion.projectRef}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-on-surface">
                    Question {currentQuestionNumber} of {questionCount}
                  </span>
                  <div className="w-28 bg-surface-container-high rounded-full h-2 overflow-hidden border border-outline-variant/60">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${(currentQuestionNumber / questionCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* INTERVIEW MODE 1: VOICE INTERVIEW EXPERIENCE                          */}
              {/* ===================================================================== */}
              {interviewMode === 'voice' ? (
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 max-w-3xl mx-auto w-full">
                  {/* Microphone Permission Required Alert */}
                  {micPermission === 'denied' && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-start gap-2.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <span className="font-bold block">Microphone Access Denied</span>
                          <span className="text-[11px] text-on-surface-variant">
                            Browser microphone permissions are blocked. Click Retry or switch to Text Interview.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={requestMicPermission}
                          className="px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                        >
                          Retry Permission
                        </button>
                        <button
                          type="button"
                          onClick={() => setInterviewMode('text')}
                          className="px-3 py-1.5 rounded-lg font-bold text-xs bg-surface border border-outline-variant hover:bg-surface-container text-on-surface cursor-pointer"
                        >
                          Switch to Text
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Interviewer Question Card */}
                  {currentQuestion && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant flex flex-col gap-4 shadow-sm relative overflow-hidden">
                      {/* Top Bar with Voice State Indicator */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-on-surface block">LEVELUP AI INTERVIEWER</span>
                            <span className="text-[10px] font-mono text-on-surface-variant">Voice Mode</span>
                          </div>
                        </div>

                        {/* Dynamic Voice Status Badge */}
                        <div className="flex items-center gap-2">
                          {isSpeaking ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-2 animate-pulse">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>AI Speaking...</span>
                              <span className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 bg-primary rounded-full animate-bounce h-2"></span>
                                <span className="w-0.5 bg-primary rounded-full animate-bounce h-3" style={{ animationDelay: '0.15s' }}></span>
                                <span className="w-0.5 bg-primary rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.3s' }}></span>
                              </span>
                            </span>
                          ) : isListening ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              <Mic className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Listening...</span>
                            </span>
                          ) : isSubmittingAnswer ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                              <span>Analyzing...</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-on-surface-variant border border-outline-variant">
                              Ready
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-base sm:text-lg font-bold text-on-surface leading-relaxed">
                        {currentQuestion.question}
                      </div>

                      {/* Question Footnote & Action */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/60 text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                          <span className="px-2 py-0.5 rounded bg-surface border border-outline-variant font-mono">
                            {currentQuestion.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface border border-outline-variant font-mono">
                            {currentQuestion.difficulty}
                          </span>
                          {currentQuestion.evaluates && (
                            <span className="hidden sm:inline">Evaluating: {currentQuestion.evaluates}</span>
                          )}
                        </div>

                        {/* Repeat Question Button */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerVoiceQuestion(currentQuestion.question);
                          }}
                          disabled={isSubmittingAnswer}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-primary" />
                          <span>Repeat Question</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Candidate Live Speech Console */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-outline-variant flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xs uppercase tracking-wider text-on-surface font-label-caps">
                          YOUR SPOKEN ANSWER
                        </span>
                      </div>

                      {/* Speech Duration & Word Counter */}
                      <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
                        {isListening && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{formatTimer(speakingDuration)}</span>
                          </div>
                        )}
                        <span>
                          {currentFullSpokenText ? currentFullSpokenText.split(/\s+/).filter(Boolean).length : 0} words
                        </span>
                      </div>
                    </div>

                    {/* Audio Level Equalizer Waveform */}
                    {isListening && (
                      <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <Mic className="w-4 h-4 text-emerald-600 animate-bounce" />
                          <span>Speaking into microphone...</span>
                        </div>
                        {/* 8 Audio Bars */}
                        <div className="flex items-center gap-1 h-6">
                          {[0.3, 0.7, 1.0, 0.6, 0.9, 0.4, 0.8, 0.5].map((factor, i) => (
                            <div
                              key={i}
                              className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
                              style={{
                                height: `${Math.max(4, Math.min(24, (audioLevel * factor * 0.28) + 4))}px`,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Transcript Display Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/80 min-h-[110px] flex flex-col justify-between">
                      {currentFullSpokenText ? (
                        <p className="text-sm sm:text-base text-on-surface font-medium leading-relaxed">
                          {transcript}
                          {interimTranscript && (
                            <span className="text-primary italic"> {interimTranscript}</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
                          {isSpeaking
                            ? 'Listening will start automatically once the AI finishes speaking...'
                            : isListening
                            ? 'Listening... Speak your answer clearly into your microphone.'
                            : 'Click Start Speaking or Speak Again to record your answer.'}
                        </p>
                      )}
                    </div>

                    {/* Speech Notice / Retry Banner */}
                    {voiceSpeechNotice && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 flex items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>{voiceSpeechNotice}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceSpeechNotice(null);
                            startListening();
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shrink-0"
                        >
                          🎙️ Speak Again
                        </button>
                      </div>
                    )}

                    {/* Primary Voice Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {isListening ? (
                          <button
                            type="button"
                            onClick={() => stopListening()}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1.5 cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5 text-error" />
                            <span>Pause Microphone</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startListening()}
                            disabled={isSubmittingAnswer || isSpeaking}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Mic className="w-3.5 h-3.5 text-primary" />
                            <span>Start Speaking</span>
                          </button>
                        )}

                        {currentFullSpokenText && (
                          <button
                            type="button"
                            onClick={() => resetTranscript()}
                            disabled={isSubmittingAnswer}
                            className="px-3 py-2 rounded-xl text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Submit / Finish Turn CTA */}
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(currentFullSpokenText)}
                        disabled={isSubmittingAnswer || isSpeaking || !currentFullSpokenText.trim()}
                        className="px-6 py-3 rounded-xl font-bold font-label-caps uppercase tracking-wider text-xs bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingAnswer ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                            <span>Evaluating Response...</span>
                          </>
                        ) : (
                          <>
                            <span>{isListening ? 'Stop & Submit Answer' : 'Submit Spoken Answer'}</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===================================================================== */
                /* INTERVIEW MODE 2: TEXT INTERVIEW EXPERIENCE                           */
                /* ===================================================================== */
                <>
                  {/* Chat / Question Stream Area */}
                  <div
                    ref={chatScrollRef}
                    className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6"
                  >
                    {/* Past Question History Accordion */}
                    {turns.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                          PREVIOUS CONVERSATION ({turns.length} ANSWERED)
                        </span>
                        <div className="flex flex-col gap-3">
                          {turns.map((turn) => (
                            <div
                              key={turn.questionId}
                              className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col gap-2.5 text-xs opacity-85"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-primary font-mono">
                                  Question #{turn.questionNumber} ({turn.category})
                                </span>
                                <span className="text-on-surface-variant">Answered</span>
                              </div>
                              <p className="font-semibold text-on-surface">{turn.question}</p>
                              <div className="p-3 rounded-xl bg-surface border border-outline-variant/60 text-on-surface-variant font-mono text-[11px] leading-relaxed">
                                "{turn.userAnswer}"
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current Active Interviewer Question */}
                    {currentQuestion && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-primary/5 border border-primary/25 flex flex-col gap-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-bold text-xs">
                            <Bot className="w-4 h-4" />
                            <span>LEVELUP INTERVIEWER</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface text-primary border border-primary/20">
                              {currentQuestion.category}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-on-surface-variant border border-outline-variant">
                              {currentQuestion.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="text-base sm:text-lg font-bold text-on-surface leading-relaxed">
                          {currentQuestion.question}
                        </div>

                        {currentQuestion.evaluates && (
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant pt-2 border-t border-primary/10">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            <span>Evaluating: {currentQuestion.evaluates}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isSubmittingAnswer && (
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-3 text-xs text-on-surface-variant animate-pulse">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {currentQuestionNumber >= questionCount
                            ? 'Finalizing your interview and calculating competency dimension scores...'
                            : 'Analyzing your response and formulating the next adaptive question...'}
                        </span>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSubmitAnswer()}
                          className="px-3 py-1 rounded bg-error text-white font-bold text-[11px] hover:bg-error/90 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Answer Textarea & Submit Console */}
                  <div className="p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-on-surface flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>YOUR ANSWER</span>
                      </label>
                      <span className="text-[11px] text-on-surface-variant">
                        {userAnswer.trim().split(/\s+/).filter(Boolean).length} words • Press Ctrl + Enter to submit
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitAnswer();
                          }
                        }}
                        placeholder="Type your answer... (Be specific, provide real architecture choices, concrete metrics, and structured trade-offs)"
                        rows={4}
                        disabled={isSubmittingAnswer}
                        className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:outline-none text-xs sm:text-sm text-on-surface leading-relaxed resize-none disabled:opacity-60"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setUserAnswer('')}
                        disabled={!userAnswer || isSubmittingAnswer}
                        className="text-xs text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        Clear Answer
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer()}
                        disabled={!userAnswer.trim() || isSubmittingAnswer}
                        className="px-5 py-2.5 rounded-xl font-bold font-label-caps uppercase tracking-wider text-xs bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmittingAnswer ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                            <span>Evaluating...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Answer</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: EVALUATING SCREEN                                                 */}
          {/* ========================================================================= */}
          {viewState === 'evaluating' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 animate-bounce">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
                INTERVIEW COMPLETE
              </span>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                Evaluating Performance & Scoring Dimensions
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                LEVELUP's Bar Raiser engine is synthesizing your responses against technical depth, communication clarity, and problem solving.
              </p>

              <div className="w-full flex flex-col gap-2.5 text-xs text-left">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  evaluatingStep >= 0 ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Auditing Technical Accuracy & Architecture Depth</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  evaluatingStep >= 1 ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assessing Communication Clarity & STAR Framework</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  evaluatingStep >= 2 ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Synthesizing Question-by-Question Coaching Critiques</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  evaluatingStep >= 3 ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generating Tailored Revision Roadmap</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: FINAL INTERVIEW REPORT                                            */}
          {/* ========================================================================= */}
          {viewState === 'report' && report && (
            <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fadeIn">
              {/* Report Header Card with Overall Score */}
              <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                      {report.targetRole}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-surface text-on-surface-variant border border-outline-variant">
                      {report.interviewType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-surface text-on-surface-variant border border-outline-variant">
                      {report.difficulty} Level
                    </span>
                    {report.mode === 'voice' ? (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-purple-500/10 text-purple-700 border border-purple-500/20 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-purple-600" />
                        <span>🎙️ Voice Interview</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-500/10 text-blue-700 border border-blue-500/20 flex items-center gap-1">
                        <Keyboard className="w-3 h-3 text-blue-600" />
                        <span>⌨️ Text Interview</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
                    Mock Interview Performance Report
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                    Completed {report.totalQuestions} questions in ~{report.durationMinutes || 8} mins on {new Date(report.completedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-outline-variant shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-2xl border border-primary/20">
                    {report.overallScore}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant block">
                      OVERALL SCORE
                    </span>
                    <span className="text-base font-bold text-on-surface">
                      {report.overallScore >= 80 ? 'Hiring Bar Passed' : report.overallScore >= 65 ? 'Competitive Candidate' : 'Revision Required'}
                    </span>
                    <span className="text-[11px] text-on-surface-variant block">
                      Scale: 0 – 100
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Competency Dimension Score Bars */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col gap-4">
                <h4 className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Competency Dimension Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Technical Knowledge */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface border border-outline-variant/60">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Technical Knowledge</span>
                      <span className="font-mono text-primary">{report.dimensionScores.technicalKnowledge}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${report.dimensionScores.technicalKnowledge}%` }}></div>
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface border border-outline-variant/60">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Communication & Clarity</span>
                      <span className="font-mono text-primary">{report.dimensionScores.communication}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${report.dimensionScores.communication}%` }}></div>
                    </div>
                  </div>

                  {/* Problem Solving */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface border border-outline-variant/60">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Problem Solving & Analytical Rigor</span>
                      <span className="font-mono text-primary">{report.dimensionScores.problemSolving}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${report.dimensionScores.problemSolving}%` }}></div>
                    </div>
                  </div>

                  {/* Role Knowledge */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface border border-outline-variant/60">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Role-Specific Mastery</span>
                      <span className="font-mono text-primary">{report.dimensionScores.roleKnowledge}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${report.dimensionScores.roleKnowledge}%` }}></div>
                    </div>
                  </div>

                  {/* Behavioral */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface border border-outline-variant/60 sm:col-span-2">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Behavioral & Culture Fit (STAR Alignment)</span>
                      <span className="font-mono text-primary">{report.dimensionScores.behavioral}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${report.dimensionScores.behavioral}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You Did Well vs Areas to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs font-label-caps uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>WHAT YOU DID WELL</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    {report.whatYouDidWell.map((strength, i) => (
                      <div key={i} className="flex items-start gap-2 text-on-surface leading-relaxed">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas to Improve */}
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs font-label-caps uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>AREAS TO IMPROVE</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    {report.areasToImprove.map((weakness, i) => (
                      <div key={i} className="flex items-start gap-2 text-on-surface leading-relaxed">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strongest vs Weakest Answer Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.strongestAnswer && (
                  <div className="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1.5 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-600">
                      STRONGEST ANSWER (Q#{report.strongestAnswer.questionNumber})
                    </span>
                    <span className="font-bold text-on-surface">"{report.strongestAnswer.question}"</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                      {report.strongestAnswer.explanation}
                    </p>
                  </div>
                )}

                {report.weakestAnswer && (
                  <div className="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1.5 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-600">
                      WEAKEST ANSWER (Q#{report.weakestAnswer.questionNumber})
                    </span>
                    <span className="font-bold text-on-surface">"{report.weakestAnswer.question}"</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                      {report.weakestAnswer.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Question-by-Question Deep Review Accordion */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Question-By-Question Detailed Critique</span>
                  </span>
                  <span className="text-[11px] font-normal text-on-surface-variant">
                    {report.questionReviews.length} Questions Reviewed
                  </span>
                </h4>

                <div className="flex flex-col gap-3">
                  {report.questionReviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col gap-3.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-primary/10 text-primary">
                            Q#{review.questionNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-surface text-on-surface-variant border border-outline-variant">
                            {review.category}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-surface border border-outline-variant text-on-surface">
                          Score: <strong className="text-primary">{review.score}</strong> / 10
                        </span>
                      </div>

                      <div className="font-bold text-sm text-on-surface">
                        {review.question}
                      </div>

                      {/* User Answer Quotation */}
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/60 text-on-surface-variant font-mono text-[11px] leading-relaxed">
                        <span className="font-bold text-[10px] uppercase text-on-surface block mb-0.5">Your Submitted Answer:</span>
                        "{review.userAnswer}"
                      </div>

                      {/* Feedback Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">What Was Good:</span>
                          <p className="text-[11px] text-on-surface leading-relaxed">{review.whatWasGood}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">What Was Missing:</span>
                          <p className="text-[11px] text-on-surface leading-relaxed">{review.whatWasMissing}</p>
                        </div>
                      </div>

                      {/* Stronger Model Answer Framework */}
                      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">How To Make This A 10/10 Answer:</span>
                        <p className="text-[11px] text-on-surface leading-relaxed">{review.strongerAnswerAdvice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Next Steps Card */}
              {report.personalizedNextSteps && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-low border border-primary/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-bold font-label-caps uppercase tracking-wider text-on-surface">
                        YOUR NEXT STEPS & REVISION BLUEPRINT
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary text-on-primary">
                      {report.personalizedNextSteps.recommendedPrepDays} Days Recommended
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
                      Identified Primary Focus Area:
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {report.personalizedNextSteps.weakestArea}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <span className="font-bold text-on-surface font-label-caps uppercase text-[11px]">
                      Recommended Action Sequence:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.personalizedNextSteps.actionSteps.map((step, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface border border-outline-variant flex items-start gap-2">
                          <span className="font-mono font-bold text-primary">{i + 1}.</span>
                          <span className="text-[11px] text-on-surface leading-tight">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {onApplyWeakAreasToPlan && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyWeakAreasToPlan(
                            report.personalizedNextSteps.weakestArea,
                            report.personalizedNextSteps.recommendedRevisionTopics
                          );
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply to 14-Day Study Roadmap</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetSession}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-container text-on-surface border border-outline-variant transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Take Another Mock Interview</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: HISTORY LIST                                                      */}
          {/* ========================================================================= */}
          {viewState === 'history' && (
            <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                    PAST SESSIONS
                  </span>
                  <h3 className="text-xl font-bold text-on-surface">
                    Mock Interview History ({pastReports.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewState('setup')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Start New Session
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {pastReports.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-on-surface">{item.targetRole}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-outline-variant">
                          {item.interviewType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-outline-variant">
                          {item.difficulty}
                        </span>
                        {item.mode === 'voice' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
                            🎙️ Voice
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                            ⌨️ Text
                          </span>
                        )}
                      </div>
                      <span className="text-on-surface-variant text-[11px]">
                        {item.totalQuestions} Questions • Completed on {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-mono font-bold text-sm">
                        {item.overallScore} / 100
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReport(item);
                          setViewState('report');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-outline-variant hover:bg-surface-container text-on-surface transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
