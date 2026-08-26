import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyToolTab, WeakTopicRecord } from '../../types';
import {
  Calendar,
  Lightbulb,
  Flame,
  FileCode,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
} from 'lucide-react';
import { StudyPlanGenerator } from './StudyPlanGenerator';
import { TopicExplainer } from './TopicExplainer';
import { AIQuizStudio } from './AIQuizStudio';
import { PracticeQuestionsStudio } from './PracticeQuestionsStudio';
import { ExamPrepStudio } from './ExamPrepStudio';
import { WeakTopicsTracker } from './WeakTopicsTracker';

interface StudyCoachDashboardProps {
  onBackToOverview?: () => void;
}

export const StudyCoachDashboard: React.FC<StudyCoachDashboardProps> = ({ onBackToOverview }) => {
  const { state, studentCourses } = useApp();
  const [activeTab, setActiveTab] = useState<StudyToolTab>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<string>('Database Normalization & ACID');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    studentCourses[0]?.name || 'Database Systems (DBMS)'
  );

  // Weak Topics Tracker in local session state (can also be saved to profile/student)
  const [weakTopics, setWeakTopics] = useState<WeakTopicRecord[]>([
    {
      id: 'wt-1',
      topic: 'BCNF vs 3NF Decomposition',
      subject: 'Database Systems (DBMS)',
      accuracy: 45,
      totalAttempts: 12,
      correctAttempts: 5,
      status: 'weak',
      lastTestedDate: 'Today',
      recommendedAction: 'Study functional dependency loss & multi-valued dependencies',
    },
    {
      id: 'wt-2',
      topic: 'Two-Phase Locking (2PL) Protocols',
      subject: 'Database Systems (DBMS)',
      accuracy: 65,
      totalAttempts: 10,
      correctAttempts: 6,
      status: 'moderate',
      lastTestedDate: 'Yesterday',
      recommendedAction: 'Practice strict vs rigorous 2PL serializability graphs',
    },
    {
      id: 'wt-3',
      topic: 'B-Tree Node Splits & Depth Balancing',
      subject: 'Data Structures',
      accuracy: 88,
      totalAttempts: 16,
      correctAttempts: 14,
      status: 'strong',
      lastTestedDate: '2 days ago',
      recommendedAction: 'Mastered! Ready for secondary B+ tree index questions',
    },
  ]);

  const handleUpdateWeakTopic = (newRecord: WeakTopicRecord) => {
    setWeakTopics((prev) => {
      const existingIdx = prev.findIndex(
        (t) => t.topic.toLowerCase() === newRecord.topic.toLowerCase()
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const old = updated[existingIdx];
        const total = old.totalAttempts + newRecord.totalAttempts;
        const correct = old.correctAttempts + newRecord.correctAttempts;
        const accuracy = Math.round((correct / total) * 100);
        updated[existingIdx] = {
          ...old,
          accuracy,
          totalAttempts: total,
          correctAttempts: correct,
          status: accuracy >= 75 ? 'strong' : accuracy >= 50 ? 'moderate' : 'weak',
          lastTestedDate: 'Just now',
          recommendedAction: newRecord.recommendedAction,
        };
        return updated;
      }
      return [newRecord, ...prev];
    });
  };

  const handleLaunchExplain = (topic: string, subject: string) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab('explain');
  };

  const handleLaunchQuiz = (topic: string, subject: string) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab('quiz');
  };

  const handleLaunchPlan = (topic: string, subject: string) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab('plan');
  };

  const handleLaunchPractice = (topic: string, subject: string) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab('practice');
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/40 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Coach Hub', icon: Sparkles },
          { id: 'plan', label: 'Study Plan', icon: Calendar },
          { id: 'explain', label: 'Explain Topic', icon: Lightbulb },
          { id: 'quiz', label: 'AI Quiz', icon: Flame },
          { id: 'practice', label: 'Practice Problems', icon: FileCode },
          { id: 'exam', label: 'Exam Prep', icon: GraduationCap },
          { id: 'weaknesses', label: 'Weak Topics', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudyToolTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                  : 'bg-surface hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. COACH HUB VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-xs font-bold uppercase tracking-wider">
                  Adaptive AI Academic Strategist
                </span>
                <span className="text-xs text-on-surface-variant">· Study Smarter, Not Just Longer</span>
              </div>
              <h2 className="font-headline-lg text-on-surface">
                What are you studying today?
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                Tell LEVELUP your course or target milestone, and let AI structure your day-by-day study roadmap, break down tricky concepts, and test your retention.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="relative z-10 mt-6 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setActiveTab('plan')}
                className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Create Study Plan</span>
              </button>
              <button
                onClick={() => setActiveTab('explain')}
                className="px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary-fixed/20 font-label-caps text-xs uppercase font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Explain a Topic</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-dim font-label-caps text-xs uppercase font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Quiz Me</span>
              </button>
            </div>
          </div>

          {/* Core 5 Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. AI Study Plan */}
            <div
              onClick={() => setActiveTab('plan')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                  AI Study Plan
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Personalized day-by-day learning roadmap tailored to your available time, target grade, and exam date.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Configure Roadmap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Topic Explanation */}
            <div
              onClick={() => setActiveTab('explain')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-amber-500 transition-colors">
                  Topic Explainer
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Crystal-clear explanations with intuitive analogies, real-world code, formulas, and common exam traps.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Ask Anything</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. AI Quiz */}
            <div
              onClick={() => setActiveTab('quiz')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-secondary transition-colors">
                  Interactive Quiz
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Test retention one question at a time with instant answer analysis and adaptive weak topic detection.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-secondary">
                <span>Start Quiz</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Practice Questions */}
            <div
              onClick={() => setActiveTab('practice')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileCode className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-emerald-600 transition-colors">
                  Practice Problems
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Coding drills, SQL queries, and conceptual problem sets with progressive hints and model solutions.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Solve Problems</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 5. Exam Preparation */}
            <div
              onClick={() => setActiveTab('exam')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-purple-600 transition-colors">
                  Exam Prep Blueprint
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Syllabus weight distribution (High/Med/Low priority), countdown roadmap, and last-24-hours protocol.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Prepare for Exam</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 6. Weak Topic Radar */}
            <div
              onClick={() => setActiveTab('weaknesses')}
              className="bg-surface border border-outline-variant/60 hover:border-primary/60 rounded-xl p-6 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-error-container/20 text-error flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-title-lg text-on-surface font-semibold group-hover:text-error transition-colors">
                  Weak Topics Radar
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Tracks struggling concepts across your courses with 1-click targeted revision and diagnostic tests.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-semibold text-error">
                <span>View Diagnosis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Weak Topics Quick Widget */}
          <WeakTopicsTracker
            weakTopics={weakTopics}
            onReviseTopic={(t, s) => handleLaunchExplain(t, s)}
            onQuizTopic={(t, s) => handleLaunchQuiz(t, s)}
          />
        </div>
      )}

      {/* 2. STUDY PLAN VIEW */}
      {activeTab === 'plan' && (
        <StudyPlanGenerator
          initialSubject={selectedSubject}
          onOpenExplainTopic={(t, s) => handleLaunchExplain(t, s)}
          onOpenQuizTopic={(t, s) => handleLaunchQuiz(t, s)}
        />
      )}

      {/* 3. TOPIC EXPLAINER VIEW */}
      {activeTab === 'explain' && (
        <TopicExplainer
          initialTopic={selectedTopic}
          initialSubject={selectedSubject}
          onLaunchQuiz={(t, s) => handleLaunchQuiz(t, s)}
        />
      )}

      {/* 4. AI QUIZ VIEW */}
      {activeTab === 'quiz' && (
        <AIQuizStudio
          initialTopic={selectedTopic}
          initialSubject={selectedSubject}
          onExplainTopic={(t, s) => handleLaunchExplain(t, s)}
          onCreatePlanForTopic={(t, s) => handleLaunchPlan(t, s)}
          onUpdateWeakTopic={handleUpdateWeakTopic}
        />
      )}

      {/* 5. PRACTICE QUESTIONS VIEW */}
      {activeTab === 'practice' && (
        <PracticeQuestionsStudio
          initialTopic={selectedTopic}
          initialSubject={selectedSubject}
          onExplainTopic={(t, s) => handleLaunchExplain(t, s)}
          onLaunchQuiz={(t, s) => handleLaunchQuiz(t, s)}
        />
      )}

      {/* 6. EXAM PREP VIEW */}
      {activeTab === 'exam' && (
        <ExamPrepStudio
          initialSubject={selectedSubject}
          onLaunchQuiz={(t, s) => handleLaunchQuiz(t, s)}
          onExplainTopic={(t, s) => handleLaunchExplain(t, s)}
        />
      )}

      {/* 7. WEAK TOPICS VIEW */}
      {activeTab === 'weaknesses' && (
        <WeakTopicsTracker
          weakTopics={weakTopics}
          onReviseTopic={(t, s) => handleLaunchExplain(t, s)}
          onQuizTopic={(t, s) => handleLaunchQuiz(t, s)}
        />
      )}
    </div>
  );
};
