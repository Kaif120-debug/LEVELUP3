import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { CareerNav } from '../components/career/CareerNav';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import {
  InterviewExperienceLevel,
  InterviewType,
  InterviewPrepPlan,
} from '../types';
import { generateLocalInterviewPrepPlan } from '../utils/interviewPrepFallback';
import { MockInterviewStudio } from '../components/interview/MockInterviewStudio';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  HelpCircle,
  Code2,
  Users2,
  Wrench,
  Compass,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Target,
  Clock,
  Building2,
  FileText,
  Lock,
  Zap,
  Award,
  FolderGit2,
  GraduationCap,
  Calendar,
  Search,
  CheckSquare,
  Square,
  Edit3,
  Bot,
  Play,
} from 'lucide-react';

const PRESET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'Marketing',
  'Finance',
  'HR',
  'Sales',
  'Cybersecurity',
  'Cloud / DevOps',
  'Custom Role',
] as const;

const ROLE_SKILL_SUGGESTIONS: Record<string, string[]> = {
  'Software Engineer': ['Algorithms & DS', 'System Design', 'Clean Code', 'Git', 'OOP', 'Concurrency'],
  'Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Web Performance', 'Accessibility', 'State Management'],
  'Backend Developer': ['Node.js', 'PostgreSQL', 'REST & GraphQL APIs', 'Redis Caching', 'Microservices', 'Docker', 'Authentication'],
  'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'System Architecture', 'CI/CD', 'API Design'],
  'UI/UX Designer': ['Figma', 'User Research', 'Design Systems', 'Wireframing', 'Interactive Prototyping', 'Usability Testing'],
  'Data Analyst': ['SQL Queries', 'Python / Pandas', 'Tableau / PowerBI', 'Statistical Modeling', 'Business Metrics', 'Data Cleaning'],
  'Data Scientist': ['Machine Learning', 'Python', 'Deep Learning', 'Feature Engineering', 'SQL', 'A/B Testing', 'Statistics'],
  'Product Manager': ['Product Strategy', 'Roadmapping', 'User Persona Research', 'A/B Testing', 'Stakeholder Alignment', 'KPI Definition'],
  'Marketing': ['Content Strategy', 'SEO & SEM', 'Funnel Optimization', 'Growth Analytics', 'Copywriting', 'Campaign Management'],
  'Finance': ['Financial Modeling', 'DCF Valuation', 'Budgeting & Forecasting', 'Excel / Sheets', 'Variance Analysis', 'P&L Management'],
  'HR': ['Talent Acquisition', 'STAR Behavioral Interviewing', 'Employee Relations', 'Onboarding & Retention', 'Performance Reviews'],
  'Sales': ['Discovery Calls', 'Objection Handling', 'B2B SaaS Sales', 'Pipeline Management', 'Closing Techniques', 'CRM (Salesforce)'],
  'Cybersecurity': ['Threat Modeling', 'Network Security', 'OWASP Top 10', 'Penetration Testing', 'SIEM & SOC', 'IAM & Cryptography'],
  'Cloud / DevOps': ['Kubernetes', 'Docker', 'AWS / GCP', 'Terraform', 'CI/CD Pipelines', 'Prometheus & Grafana', 'Linux'],
  'Custom Role': ['Problem Solving', 'Communication', 'Project Execution', 'Domain Fundamentals'],
};

const POPULAR_COMPANIES = ['Google', 'Stripe', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Linear', 'Vercel', 'Notion'];

export const CareerInterviewPrepPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { isPro, isFree, openUpgradeModal } = useSubscription();

  // Extract user candidate profile and resume context
  const candidateName = state.profile?.name || 'Candidate';
  const resumeContext = state.career?.resume;
  const userProjects = resumeContext?.projects || [];
  const userExperience = resumeContext?.experience || [];
  const userSkills = resumeContext?.skills || [];
  const trackedJobs = state.career?.jobs || [];

  // Form State
  const [selectedRolePreset, setSelectedRolePreset] = useState<string>('Software Engineer');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<InterviewExperienceLevel>('1–3 years');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [skills, setSkills] = useState<string[]>(ROLE_SKILL_SUGGESTIONS['Software Engineer'] || []);
  const [skillInput, setSkillInput] = useState<string>('');
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdInput, setShowJdInput] = useState<boolean>(false);
  const [showResumeDrawer, setShowResumeDrawer] = useState<boolean>(false);

  // Generation & Plan State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [plan, setPlan] = useState<InterviewPrepPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // Active Tab in generated plan
  const [activePlanTab, setActivePlanTab] = useState<'roadmap' | 'questions' | 'technical' | 'behavioral' | 'hr' | 'practice'>('roadmap');
  const [questionFilter, setQuestionFilter] = useState<'All' | 'Technical' | 'Behavioral' | 'Project' | 'Role-Specific' | 'Case Study' | 'HR'>('All');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [practicedQuestions, setPracticedQuestions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('levelup_interview_practiced_q');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('levelup_interview_milestones');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [userNotes, setUserNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('levelup_interview_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [freeUsageCount, setFreeUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('levelup_interview_prep_free_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Interactive AI Mock Interview Studio State
  const [isMockInterviewOpen, setIsMockInterviewOpen] = useState<boolean>(false);
  const [activeWeakAreas, setActiveWeakAreas] = useState<string[]>([]);

  const handleApplyWeakAreasToPlan = (weakestArea: string, revisionTopics: string[]) => {
    if (weakestArea) {
      setActiveWeakAreas((prev) => Array.from(new Set([...prev, weakestArea])));
    }
    const noteKey = `roadmap-revision-${Date.now()}`;
    const noteContent = `🎯 Mock Interview Action Item: Focus heavily on ${weakestArea}. Recommended drills: ${revisionTopics.join(', ')}`;
    const updated = { ...userNotes, [noteKey]: noteContent };
    setUserNotes(updated);
    try {
      localStorage.setItem('levelup_interview_notes', JSON.stringify(updated));
    } catch {}
  };

  // Dynamic Skill Suggestions
  const currentRole = selectedRolePreset === 'Custom Role' ? customRoleInput || 'Custom Role' : selectedRolePreset;
  const suggestedSkills = ROLE_SKILL_SUGGESTIONS[selectedRolePreset] || ROLE_SKILL_SUGGESTIONS['Custom Role'];

  const handleSelectRole = (role: string) => {
    setSelectedRolePreset(role);
    if (role !== 'Custom Role') {
      const defaultRoleSkills = ROLE_SKILL_SUGGESTIONS[role] || [];
      setSkills(defaultRoleSkills);
    }
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleToggleMilestone = (milestoneKey: string) => {
    const updated = {
      ...completedMilestones,
      [milestoneKey]: !completedMilestones[milestoneKey],
    };
    setCompletedMilestones(updated);
    try {
      localStorage.setItem('levelup_interview_milestones', JSON.stringify(updated));
    } catch {}
  };

  const handleTogglePracticedQuestion = (questionId: string) => {
    const updated = {
      ...practicedQuestions,
      [questionId]: !practicedQuestions[questionId],
    };
    setPracticedQuestions(updated);
    try {
      localStorage.setItem('levelup_interview_practiced_q', JSON.stringify(updated));
    } catch {}
  };

  const handleNoteChange = (questionId: string, note: string) => {
    const updated = { ...userNotes, [questionId]: note };
    setUserNotes(updated);
    try {
      localStorage.setItem('levelup_interview_notes', JSON.stringify(updated));
    } catch {}
  };

  // Generation Steps animation
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Generate Plan Handler with full User Resume & Projects Context
  const handleGeneratePlan = async () => {
    // Pro check: if free tier and already used 1 complimentary preview
    if (isFree && freeUsageCount >= 1) {
      openUpgradeModal('Interview Prep AI Coach (Unlimited Personalized Plans)');
      return;
    }

    const effectiveRole = selectedRolePreset === 'Custom Role' ? customRoleInput.trim() || 'Software Engineer' : selectedRolePreset;

    setIsGenerating(true);
    setErrorMsg(null);
    setLoadingStep(0);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const response = await fetch('/api/ai/interview-prep/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: effectiveRole,
          experienceLevel,
          interviewType,
          skills,
          targetCompany: targetCompany.trim(),
          jobDescription: jobDescription.trim(),
          candidateSummary: resumeContext?.summary,
          projects: userProjects.map((p) => ({
            name: p.name,
            role: p.role,
            description: p.description,
            technologies: p.technologies,
          })),
          experience: userExperience.map((e) => ({
            company: e.company,
            role: e.role,
            period: e.period,
            bullets: e.bullets,
          })),
          candidateSkills: userSkills,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          setPlan(data.data);
          if (isFree) {
            const newCount = freeUsageCount + 1;
            setFreeUsageCount(newCount);
            localStorage.setItem('levelup_interview_prep_free_count', newCount.toString());
          }
          if (window.innerWidth < 1024) {
            setTimeout(() => {
              document.getElementById('plan-display-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          return;
        }
      }
      throw new Error('API returned invalid data format');
    } catch (err: any) {
      console.warn('Network or AI service unavailable, generating instant high-impact plan locally:', err);
      clearTimeout(timeoutId);

      // Instant high-grade local fallback plan generation
      const fallbackPlan = generateLocalInterviewPrepPlan({
        targetRole: effectiveRole,
        experienceLevel,
        interviewType,
        skills,
        targetCompany: targetCompany.trim(),
        jobDescription: jobDescription.trim(),
        candidateSummary: resumeContext?.summary,
        projects: userProjects.map((p) => ({
          name: p.name,
          role: p.role,
          description: p.description,
          technologies: p.technologies,
        })),
        experience: userExperience.map((e) => ({
          company: e.company,
          role: e.role,
          period: e.period,
          bullets: e.bullets,
        })),
        candidateSkills: userSkills,
      });

      setPlan(fallbackPlan);

      if (isFree) {
        const newCount = freeUsageCount + 1;
        setFreeUsageCount(newCount);
        localStorage.setItem('levelup_interview_prep_free_count', newCount.toString());
      }

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('plan-display-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!plan) return;
    const md = `
# Interview Preparation Plan: ${plan.targetRole} (${plan.experienceLevel})
**Candidate**: ${candidateName}
**Interview Type Focus**: ${plan.interviewType}
${plan.targetCompany ? `**Target Company**: ${plan.targetCompany}\n` : ''}
**Difficulty Level**: ${plan.recommendedDifficulty.level}

## Overview & Strategy
${plan.summary}

${
  plan.jobDescriptionAnalysis
    ? `## Job Description Analysis
- **Key Requirements**: ${plan.jobDescriptionAnalysis.keyRequirements.join(', ')}
- **High Frequency Keywords**: ${plan.jobDescriptionAnalysis.highFrequencyKeywords.join(', ')}
- **Interviewer Focus**: ${plan.jobDescriptionAnalysis.whatInterviewerLooksFor.join(', ')}
`
    : ''
}

## Preparation Priorities
${plan.preparationPriorities.map((p) => `- [${p.weight}] **${p.title}**: ${p.description}`).join('\n')}

## 14-Day Chronological Roadmap
${plan.roadmap
  .map(
    (r) => `
### ${r.phase} (${r.timeline})
*Focus*: ${r.focus}
${r.milestones.map((m) => `  - [ ] ${m}`).join('\n')}`
  )
  .join('\n')}

## Curated Question Bank
${plan.recommendedQuestions
  .map(
    (q, i) => `
### ${i + 1}. [${q.type} - ${q.difficulty}] ${q.question}
- **Evaluates**: ${q.evaluates}
- **Framework**: ${q.sampleFramework}
- **Key Points**:
${q.keyPointsToCover.map((k) => `  - ${k}`).join('\n')}
`
  )
  .join('\n')}
`;

    navigator.clipboard.writeText(md.trim());
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  // Quick Auto-Fill from Tracked Application
  const handleAutoFillFromJob = (job: typeof trackedJobs[0]) => {
    setTargetCompany(job.company);
    const matchedRole = PRESET_ROLES.find((r) => r.toLowerCase() === job.role.toLowerCase());
    if (matchedRole) {
      handleSelectRole(matchedRole);
    } else {
      setSelectedRolePreset('Custom Role');
      setCustomRoleInput(job.role);
    }
    if (job.notes) {
      setJobDescription(`Role: ${job.role} at ${job.company}\nStage: ${job.stage}\nNotes: ${job.notes}`);
      setShowJdInput(true);
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    if (!plan?.recommendedQuestions) return [];
    if (questionFilter === 'All') return plan.recommendedQuestions;
    return plan.recommendedQuestions.filter((q) => {
      if (questionFilter === 'Project') {
        return q.type.toLowerCase().includes('project') || q.category?.toLowerCase() === 'project-specific';
      }
      if (questionFilter === 'Role-Specific') {
        return q.type.toLowerCase().includes('role') || q.category?.toLowerCase() === 'role-specific';
      }
      return q.type.toLowerCase() === questionFilter.toLowerCase();
    });
  }, [plan, questionFilter]);

  // Calculate Interview Readiness Score
  const readinessStats = useMemo(() => {
    if (!plan) return { score: 0, practicedCount: 0, totalQuestions: 0, completedMilestonesCount: 0, totalMilestones: 0 };
    const totalQuestions = plan.recommendedQuestions.length;
    const practicedCount = Object.keys(practicedQuestions).filter((id) => practicedQuestions[id]).length;
    
    let totalMilestones = 0;
    plan.roadmap.forEach((phase) => {
      totalMilestones += phase.milestones.length;
    });

    const completedMilestonesCount = Object.keys(completedMilestones).filter((key) => completedMilestones[key]).length;

    const qScore = totalQuestions > 0 ? (practicedCount / totalQuestions) * 60 : 0;
    const mScore = totalMilestones > 0 ? (completedMilestonesCount / totalMilestones) * 40 : 0;
    const score = Math.min(100, Math.round(qScore + mScore));

    return {
      score,
      practicedCount,
      totalQuestions,
      completedMilestonesCount,
      totalMilestones,
    };
  }, [plan, practicedQuestions, completedMilestones]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface font-body antialiased text-on-surface">
      {/* Global Desktop & Mobile SideNavBar */}
      <SideNavBar active="career" />

      {/* Main Container: Offset by 280px on desktop to perfectly fit the fixed SideNavBar */}
      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen w-full lg:w-[calc(100%-280px)] bg-surface">
        {/* Top Sub-Navigation Bar matching LEVELUP Career Layout */}
        <CareerNav
          activeTab="interview"
          rightContent={
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsMockInterviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-label-caps uppercase tracking-wider bg-primary text-on-primary hover:bg-primary/90 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>START MOCK INTERVIEW</span>
              </button>

              {isPro ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-label-caps uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  <span>Pro Unlimited AI</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => openUpgradeModal('Interview Prep AI Coach')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-label-caps uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>
          }
        />

        {/* Page Header / Context Banner */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-outline-variant/60 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-bold font-label-caps uppercase tracking-widest text-primary">
                  CAREER
                </span>
                <span className="text-outline-variant text-xs">•</span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-on-surface-variant">
                  AI Interview Prep Engine
                </span>
              </div>
              <h1 className="font-headline-sm sm:font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                Interview Prep Studio
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
                Personalized 14-day study roadmaps, resume-grounded question bank, and targeted job description analysis.
              </p>
            </div>

            {/* Candidate Context Pill */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">{candidateName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span>{userProjects.length} Projects</span>
                    <span>•</span>
                    <span>{userExperience.length} Roles Synced</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace: Responsive Two-Column Layout */}
        <div className="flex-1 flex flex-col xl:flex-row min-h-0">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: CONFIGURATION & RESUME CONTEXT                               */}
          {/* ========================================================================= */}
          <section className="w-full xl:w-[440px] 2xl:w-[480px] xl:shrink-0 border-b xl:border-b-0 xl:border-r border-outline-variant bg-surface-container-low p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
            {/* Context Auto-Sync Banner */}
            {userProjects.length > 0 && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Synced with Your Resume</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResumeDrawer(!showResumeDrawer)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{showResumeDrawer ? 'Hide Details' : 'View Context'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showResumeDrawer ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Questions will automatically grill your actual projects (e.g. <strong>{userProjects.slice(0, 2).map((p) => p.name).join(', ')}</strong>) and career highlights.
                </p>

                {showResumeDrawer && (
                  <div className="mt-2 pt-2 border-t border-primary/15 flex flex-col gap-2 text-xs animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface-variant block mb-1">
                        Detected Resume Projects:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {userProjects.map((p) => (
                          <div key={p.id} className="p-2 rounded-lg bg-surface border border-outline-variant/60 text-[11px]">
                            <span className="font-bold text-on-surface">{p.name}</span>
                            <span className="text-on-surface-variant ml-1">({p.role})</span>
                            <p className="text-on-surface-variant/80 mt-0.5 line-clamp-1">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick-Fill From Active Job Applications */}
            {trackedJobs.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>PREP FOR A SAVED APPLICATION</span>
                  </span>
                  <span className="text-[11px] font-normal text-on-surface-variant">{trackedJobs.length} active</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {trackedJobs.slice(0, 4).map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => handleAutoFillFromJob(job)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-variant hover:border-primary/60 hover:bg-surface-container transition-all text-left flex items-center gap-1.5 cursor-pointer"
                      title={`Auto-fill for ${job.role} at ${job.company}`}
                    >
                      <Building2 className="w-3 h-3 text-on-surface-variant" />
                      <span className="font-bold text-on-surface">{job.company}</span>
                      <span className="text-[10px] text-on-surface-variant">({job.role})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Setup Heading */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
                  TARGET CONFIGURATION
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRolePreset('Full Stack Developer');
                    setExperienceLevel('1–3 years');
                    setInterviewType('Mixed');
                    setSkills(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Architecture', 'CI/CD']);
                    setTargetCompany('Stripe');
                    setJobDescription('');
                  }}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset / Sample</span>
                </button>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                What role are you targeting?
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Configure your target parameters to synthesize an actionable 14-day blueprint.
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              {/* Role Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center justify-between">
                  <span>ROLE SELECTION</span>
                  <span className="text-[11px] font-normal text-on-surface-variant">15 roles available</span>
                </label>

                {/* Role Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {PRESET_ROLES.map((role) => {
                    const isSelected = selectedRolePreset === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`px-2.5 py-2 text-xs rounded-lg text-left transition-all cursor-pointer border leading-tight ${
                          isSelected
                            ? 'bg-primary text-on-primary font-bold border-primary shadow-xs'
                            : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50 hover:bg-surface-container-high'
                        }`}
                        title={role}
                      >
                        <span className="line-clamp-2">{role}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role Input */}
                {selectedRolePreset === 'Custom Role' && (
                  <div className="mt-1">
                    <input
                      type="text"
                      placeholder="e.g. Solutions Architect, Staff AI Engineer..."
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface">
                  EXPERIENCE LEVEL
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Fresher', '0–1 years', '1–3 years', '3+ years'] as InterviewExperienceLevel[]).map((level) => {
                    const isSelected = experienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer border truncate ${
                          isSelected
                            ? 'bg-primary text-on-primary font-bold border-primary shadow-xs'
                            : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50 hover:bg-surface-container-high'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interview Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface">
                  INTERVIEW TYPE
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-3 2xl:grid-cols-5 gap-1.5">
                  {(['Technical', 'HR', 'Behavioral', 'Case Study', 'Mixed'] as InterviewType[]).map((type) => {
                    const isSelected = interviewType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInterviewType(type)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium text-center truncate transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-primary text-on-primary font-bold border-primary shadow-xs'
                            : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50 hover:bg-surface-container-high'
                        }`}
                        title={type}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills & Technologies */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center justify-between">
                  <span>SKILLS & FRAMEWORKS</span>
                  <span className="text-[11px] font-normal text-on-surface-variant">{skills.length} selected</span>
                </label>

                {/* Active Skill Tags */}
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-surface border border-outline-variant min-h-[44px]">
                  {skills.length === 0 ? (
                    <span className="text-xs text-on-surface-variant/60 italic py-0.5">
                      No skills added yet. Click suggestions or type below.
                    </span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-surface-container-high text-on-surface border border-outline-variant"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500 transition-colors ml-0.5 text-on-surface-variant cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Skill Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add custom skill or tool..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-surface-container-high hover:bg-surface-container text-on-surface border border-outline-variant transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Suggested Chips */}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-[11px] text-on-surface-variant font-medium mr-1">Suggestions:</span>
                  {suggestedSkills.map((s) => {
                    const isAdded = skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => (isAdded ? handleRemoveSkill(s) : handleAddSkill(s))}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                            : 'bg-surface text-on-surface-variant border-outline-variant/60 hover:border-primary/50'
                        }`}
                      >
                        {isAdded ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Company (Optional) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center justify-between">
                  <span>TARGET COMPANY (OPTIONAL)</span>
                  <span className="text-[11px] font-normal text-on-surface-variant">Optional</span>
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant/60" />
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, Meta, Netflix, Startup..."
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                {/* Popular company pills */}
                <div className="flex flex-wrap gap-1">
                  {POPULAR_COMPANIES.slice(0, 6).map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setTargetCompany(comp)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        targetCompany === comp
                          ? 'bg-primary text-on-primary border-primary font-bold'
                          : 'bg-surface text-on-surface-variant border-outline-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description (Optional) */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="flex items-center justify-between text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>JOB DESCRIPTION (OPTIONAL)</span>
                    {jobDescription.trim().length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </span>
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                    {showJdInput ? 'Collapse' : 'Add text'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showJdInput ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {showJdInput && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <textarea
                      rows={4}
                      placeholder="Paste the full job requirements or tech stack. The AI will extract exact keywords, priority pillars, and tailor question sets."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full p-2.5 rounded-lg text-xs bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all resize-y"
                    />
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span>{jobDescription.length} characters</span>
                      {jobDescription.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setJobDescription('')}
                          className="hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Action Button & Mock Interview Shortcut Card */}
            <div className="mt-auto pt-4 flex flex-col gap-3">
              {/* Interactive Mock Interview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-low to-surface-container border border-primary/20 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <Bot className="w-4 h-4" />
                    <span>Live Mock Interview</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-500/20 flex items-center gap-1">
                      <span>🎙️ VOICE & TEXT</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>ADAPTIVE</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Conversational voice or text interview with real-time speech transcription, audio equalizers, follow-up probing, and 5-dimension scoring.
                </p>
                <button
                  type="button"
                  onClick={() => setIsMockInterviewOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider bg-surface border border-primary/30 text-primary hover:bg-primary hover:text-on-primary active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START MOCK INTERVIEW</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-xl font-bold font-label-caps uppercase tracking-wider text-xs bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>
                      {loadingStep === 0 && 'Analyzing Role & Experience...'}
                      {loadingStep === 1 && 'Extracting Project Insights...'}
                      {loadingStep === 2 && 'Building 14-Day Roadmap...'}
                      {loadingStep === 3 && 'Finalizing Question Bank...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE MY PREPARATION PLAN</span>
                  </>
                )}
              </button>

              {isFree && (
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1">
                  <span>Free preview: {Math.max(0, 1 - freeUsageCount)} / 1 plan remaining</span>
                  <button
                    type="button"
                    onClick={() => openUpgradeModal('Interview Prep AI Coach')}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Unlock Unlimited
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: GENERATED PLAN DISPLAY & INTERACTIVE WORKSPACE              */}
          {/* ========================================================================= */}
          <section
            id="plan-display-section"
            className="flex-1 bg-surface p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col gap-6 min-w-0"
          >
            {/* Empty State when no plan is generated yet */}
            {!plan && !isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 max-w-xl mx-auto min-h-[440px]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
                  AI INTERVIEW PREPARATION ENGINE
                </span>
                <h3 className="font-headline-sm text-lg sm:text-2xl font-bold text-on-surface mb-2">
                  Ready to architect your interview prep?
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed mb-6">
                  Select your target role and goals on the left to synthesize a structured 14-day study roadmap, resume-personalized question bank, and strategic answering frameworks.
                </p>

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <Compass className="w-4 h-4" />
                      <span>14-Day Roadmap</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      Structured daily practice schedule from fundamentals to high-stakes simulation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <FolderGit2 className="w-4 h-4" />
                      <span>Resume-Grounded</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      Questions and behavioral drills generated directly around your actual projects.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <Target className="w-4 h-4" />
                      <span>Readiness Scoring</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      Track practiced questions, completed roadmap tasks, and personal scratchpad notes.
                    </p>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMockInterviewOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider bg-surface border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Start Mock Interview</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider bg-primary text-on-primary hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Generate Preparation Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading Skeleton during generation */}
            {isGenerating && (
              <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-20 bg-surface-container-low rounded-2xl border border-outline-variant"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-28 bg-surface-container-low rounded-xl border border-outline-variant"></div>
                  <div className="h-28 bg-surface-container-low rounded-xl border border-outline-variant"></div>
                  <div className="h-28 bg-surface-container-low rounded-xl border border-outline-variant"></div>
                </div>
                <div className="h-96 bg-surface-container-low rounded-2xl border border-outline-variant"></div>
              </div>
            )}

            {/* Generated Plan Content */}
            {plan && !isGenerating && (
              <div className="flex flex-col gap-6">
                {/* Top Readiness Score Meter & Plan Header Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                          {plan.targetRole}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant">
                          {plan.experienceLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant">
                          {plan.interviewType} Focus
                        </span>
                        {plan.targetCompany && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{plan.targetCompany}</span>
                          </span>
                        )}
                      </div>
                      <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                        Personalized Preparation Blueprint
                      </h2>
                      <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                        {plan.summary}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMockInterviewOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider bg-primary text-on-primary hover:bg-primary/90 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>START MOCK INTERVIEW</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyMarkdown}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface hover:bg-surface-container-high text-on-surface border border-outline-variant transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Copy full plan to clipboard in Markdown format"
                      >
                        {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPlan ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface hover:bg-surface-container-high text-on-surface border border-outline-variant transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  {/* Interview Readiness Meter */}
                  <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                        {readinessStats.score}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">Interview Readiness Score</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              readinessStats.score >= 80
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : readinessStats.score >= 40
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {readinessStats.score >= 80
                              ? 'Mastery Level'
                              : readinessStats.score >= 40
                              ? 'Making Strong Progress'
                              : 'Preparation Just Begun'}
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant">
                          {readinessStats.practicedCount} of {readinessStats.totalQuestions} questions practiced • {readinessStats.completedMilestonesCount} roadmap milestones completed
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-48 bg-surface-container-high rounded-full h-2 overflow-hidden border border-outline-variant/60">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${readinessStats.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Difficulty Assessment & Pitfalls */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-outline-variant/60">
                    <div className="md:col-span-4 p-3 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface-variant">
                          Interview Bar Rigor
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                          {plan.recommendedDifficulty.level}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface leading-relaxed mt-1">
                        {plan.recommendedDifficulty.description}
                      </p>
                    </div>

                    <div className="md:col-span-8 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Critical Pitfalls to Avoid</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-on-surface">
                        {plan.recommendedDifficulty.pitfallsToAvoid.map((pitfall, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] leading-tight">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{pitfall}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description Deep Analysis Banner (If present) */}
                {plan.jobDescriptionAnalysis && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold font-label-caps uppercase tracking-wider text-indigo-900">
                        Job Description Intelligence & Focus Matrix
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Key Requirements
                        </span>
                        <div className="flex flex-col gap-1 mt-1">
                          {plan.jobDescriptionAnalysis.keyRequirements.map((req, i) => (
                            <span key={i} className="text-[11px] text-on-surface flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">✓</span>
                              <span>{req}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          High-Frequency Keywords
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.jobDescriptionAnalysis.highFrequencyKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 border border-indigo-500/20"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface border border-outline-variant flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          What Interviewer Will Prioritize
                        </span>
                        <div className="flex flex-col gap-1 mt-1">
                          {plan.jobDescriptionAnalysis.whatInterviewerLooksFor.map((item, i) => (
                            <span key={i} className="text-[11px] text-on-surface flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preparation Priorities (High-Impact Allocation Matrix) */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    <span>Strategic Focus & Weight Allocation</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plan.preparationPriorities.map((priority) => (
                      <div
                        key={priority.priority}
                        className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold text-primary">
                              PRIORITY #{priority.priority}
                            </span>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {priority.weight}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-on-surface">{priority.title}</h4>
                          <p className="text-[11px] text-on-surface-variant mt-1 leading-normal">
                            {priority.description}
                          </p>
                        </div>
                        <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-outline-variant/60">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: priority.weight }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Tabs Navigation for Deep Content */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1 border-b border-outline-variant pb-1 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setActivePlanTab('roadmap')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'roadmap'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>14-Day Roadmap</span>
                    </button>

                    <button
                      onClick={() => setActivePlanTab('questions')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'questions'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Question Bank ({plan.recommendedQuestions.length})</span>
                    </button>

                    <button
                      onClick={() => setActivePlanTab('technical')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'technical'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Technical Deep-Dives</span>
                    </button>

                    <button
                      onClick={() => setActivePlanTab('behavioral')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'behavioral'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Users2 className="w-3.5 h-3.5" />
                      <span>Behavioral & STAR</span>
                    </button>

                    <button
                      onClick={() => setActivePlanTab('hr')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'hr'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>HR & Culture Fit</span>
                    </button>

                    <button
                      onClick={() => setActivePlanTab('practice')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activePlanTab === 'practice'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Practice Drills</span>
                    </button>
                  </div>

                  {/* TAB 1: 14-DAY ROADMAP & MILESTONES */}
                  {activePlanTab === 'roadmap' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>Chronological milestones designed to systematically build interview confidence.</span>
                        <span className="font-mono font-semibold text-primary">
                          {readinessStats.completedMilestonesCount} completed
                        </span>
                      </div>

                      {/* Day-by-day or phase roadmap */}
                      {plan.dayByDayRoadmap && plan.dayByDayRoadmap.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {plan.dayByDayRoadmap.map((item) => {
                            const milestoneKey = `day_${item.day}`;
                            const isChecked = Boolean(completedMilestones[milestoneKey]);
                            return (
                              <div
                                key={item.day}
                                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                  isChecked
                                    ? 'bg-emerald-500/5 border-emerald-500/30'
                                    : 'bg-surface-container-low border-outline-variant'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                                      Day {item.day}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-variant text-on-surface-variant flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{item.estimatedMinutes}m</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleMilestone(milestoneKey)}
                                        className="text-on-surface-variant hover:text-primary cursor-pointer"
                                      >
                                        {isChecked ? (
                                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                          <Square className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-on-surface">{item.title}</h4>
                                  <p className="text-xs text-on-surface-variant mt-1 leading-normal">
                                    {item.focus}
                                  </p>

                                  <div className="mt-2.5 flex flex-col gap-1">
                                    {item.tasks.map((task, tIdx) => (
                                      <div key={tIdx} className="flex items-start gap-2 text-[11px] text-on-surface">
                                        <span className="text-primary font-bold">•</span>
                                        <span className={isChecked ? 'line-through text-on-surface-variant/70' : ''}>{task}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {plan.roadmap.map((phase, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                                    {phase.timeline}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-variant text-on-surface-variant">
                                    Phase {idx + 1}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-on-surface">{phase.phase}</h4>
                                <p className="text-xs text-on-surface-variant mt-1 leading-normal italic">
                                  "{phase.focus}"
                                </p>

                                <div className="mt-3 flex flex-col gap-2">
                                  {phase.milestones.map((m, mIdx) => {
                                    const milestoneKey = `phase_${idx}_m_${mIdx}`;
                                    const isChecked = Boolean(completedMilestones[milestoneKey]);
                                    return (
                                      <label
                                        key={mIdx}
                                        className={`flex items-start gap-2.5 p-2 rounded-lg transition-all cursor-pointer text-xs ${
                                          isChecked
                                            ? 'bg-emerald-500/10 text-emerald-800 line-through opacity-80'
                                            : 'bg-surface hover:bg-surface-container text-on-surface border border-outline-variant/60'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleMilestone(milestoneKey)}
                                          className="mt-0.5 rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                                        />
                                        <span className="flex-1 leading-tight">{m}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CURATED QUESTION BANK */}
                  {activePlanTab === 'questions' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['All', 'Technical', 'Behavioral', 'Project', 'Role-Specific', 'Case Study', 'HR'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setQuestionFilter(filter)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                              questionFilter === filter
                                ? 'bg-primary text-on-primary border-primary'
                                : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      {/* Questions List */}
                      <div className="flex flex-col gap-3">
                        {filteredQuestions.map((q, idx) => {
                          const isExpanded = expandedQuestionId === q.id || (idx === 0 && !expandedQuestionId);
                          const isPracticed = Boolean(practicedQuestions[q.id]);
                          return (
                            <div
                              key={q.id}
                              className={`rounded-xl border overflow-hidden transition-all ${
                                isPracticed
                                  ? 'bg-emerald-500/5 border-emerald-500/30'
                                  : 'bg-surface-container-low border-outline-variant'
                              }`}
                            >
                              {/* Question Summary Bar */}
                              <div
                                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-surface-container/50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-[10px] font-bold font-label-caps uppercase px-1.5 py-0.5 rounded bg-surface border border-outline-variant text-on-surface">
                                        {q.type}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold font-label-caps uppercase px-1.5 py-0.5 rounded ${
                                          q.difficulty === 'Hard'
                                            ? 'bg-red-500/10 text-red-600'
                                            : q.difficulty === 'Medium'
                                            ? 'bg-amber-500/10 text-amber-600'
                                            : 'bg-emerald-500/10 text-emerald-600'
                                        }`}
                                      >
                                        {q.difficulty}
                                      </span>
                                      {q.relatedProject && (
                                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center gap-1">
                                          <FolderGit2 className="w-3 h-3" />
                                          <span>Project: {q.relatedProject}</span>
                                        </span>
                                      )}
                                      {isPracticed && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                          <Check className="w-3 h-3" />
                                          <span>Practiced</span>
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-on-surface leading-snug">
                                      {q.question}
                                    </h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePracticedQuestion(q.id);
                                    }}
                                    className={`p-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                      isPracticed
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                        : 'bg-surface text-on-surface-variant border-outline-variant hover:text-on-surface'
                                    }`}
                                    title={isPracticed ? 'Mark as unpracticed' : 'Mark as practiced'}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronDown
                                    className={`w-4 h-4 text-on-surface-variant transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Expanded Details & Answering Framework */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-outline-variant/60 bg-surface flex flex-col gap-3">
                                  {/* What Interviewer Evaluates */}
                                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-1">
                                    <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-primary">
                                      What The Interviewer Is Evaluating:
                                    </span>
                                    <p className="text-xs text-on-surface leading-relaxed">{q.evaluates}</p>
                                  </div>

                                  {/* Recommended Structure / Framework */}
                                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-1">
                                    <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface">
                                      Suggested Structure / STAR Formula:
                                    </span>
                                    <p className="text-xs font-mono text-primary font-medium">{q.sampleFramework}</p>
                                  </div>

                                  {/* Key Points to Cover */}
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface-variant">
                                      High-Yield Points to Mention:
                                    </span>
                                    <div className="flex flex-col gap-1">
                                      {q.keyPointsToCover.map((pt, ptIdx) => (
                                        <div key={ptIdx} className="flex items-start gap-2 text-xs text-on-surface">
                                          <span className="text-primary font-bold">✓</span>
                                          <span>{pt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* User Practice Notes Scratchpad */}
                                  <div className="mt-1 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                                        <Edit3 className="w-3 h-3 text-primary" />
                                        <span>Your Personal Talking Points / STAR Scratchpad:</span>
                                      </span>
                                    </div>
                                    <textarea
                                      rows={2}
                                      placeholder="Jot down your STAR story highlights, specific metric numbers, or project names..."
                                      value={userNotes[q.id] || ''}
                                      onChange={(e) => handleNoteChange(q.id, e.target.value)}
                                      className="w-full p-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all resize-y"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TECHNICAL DEEP-DIVES */}
                  {activePlanTab === 'technical' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.technicalTopics.map((tech, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-3"
                          >
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                                Module {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-on-surface mt-0.5">{tech.category}</h4>

                              <div className="mt-2.5 flex flex-col gap-1.5">
                                {tech.topics.map((t, tIdx) => (
                                  <div key={tIdx} className="flex items-start gap-2 text-xs text-on-surface">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                                    <span>{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-surface border border-outline-variant flex flex-col gap-1">
                              <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-primary">
                                Self-Audit Prompt:
                              </span>
                              <p className="text-xs text-on-surface italic leading-relaxed">
                                "{tech.deepDivePrompt}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Important Topics List */}
                      <div className="mt-2 flex flex-col gap-2">
                        <h4 className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface">
                          Core Concepts Cheatsheet
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {plan.importantTopics.map((topic, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-on-surface">{topic.topic}</span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    topic.importance === 'Critical'
                                      ? 'bg-red-500/10 text-red-600'
                                      : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  {topic.importance}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {topic.keyConcepts.map((k, kIdx) => (
                                  <span
                                    key={kIdx}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-outline-variant text-on-surface-variant"
                                  >
                                    {k}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[11px] text-on-surface-variant leading-tight">
                                <strong className="text-on-surface">Pro Tip:</strong> {topic.tips}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BEHAVIORAL & STAR SCENARIOS */}
                  {activePlanTab === 'behavioral' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-2">
                        <h4 className="text-xs font-bold font-label-caps uppercase tracking-wider text-on-surface flex items-center gap-2">
                          <Users2 className="w-4 h-4 text-primary" />
                          <span>The STAR Narrative Framework</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                            <span className="font-bold text-primary block">S - Situation</span>
                            <span className="text-[11px] text-on-surface-variant">Set context, project scope, and constraint.</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                            <span className="font-bold text-primary block">T - Task</span>
                            <span className="text-[11px] text-on-surface-variant">Your specific role and measurable objective.</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                            <span className="font-bold text-primary block">A - Action</span>
                            <span className="text-[11px] text-on-surface-variant">Specific steps you executed (Use "I", not "We").</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                            <span className="font-bold text-primary block">R - Result</span>
                            <span className="text-[11px] text-on-surface-variant">Quantifiable metrics and lessons learned.</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.behavioralTopics.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-3"
                          >
                            <div>
                              <span className="text-[10px] font-mono font-bold text-primary uppercase">
                                Theme #{idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-on-surface mt-0.5">{item.theme}</h4>
                              <p className="text-xs text-on-surface mt-2 font-medium">
                                "{item.starSituationPrompt}"
                              </p>
                            </div>

                            <div className="p-3 rounded-lg bg-surface border border-outline-variant flex flex-col gap-1">
                              <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-emerald-600">
                                Recommended Story Angle:
                              </span>
                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                {item.suggestedStoryAngle}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: HR & CULTURE FIT */}
                  {activePlanTab === 'hr' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(plan.hrTopics || [
                          {
                            topic: 'Compensation & Expectations',
                            typicalQuestion: 'What are your salary expectations and timeline for starting?',
                            guidance: 'Anchor to market benchmarks, emphasize value delivery, and state a flexible range.',
                            pitfallToAvoid: 'Giving an exact low number before knowing full benefits and equity details.',
                          },
                          {
                            topic: 'Culture & Remote Dynamics',
                            typicalQuestion: 'How do you structure your workday and handle asynchronous collaboration?',
                            guidance: 'Showcase proactive documentation, transparent Slack updates, and focus-time blocks.',
                            pitfallToAvoid: 'Saying you need continuous real-time supervision.',
                          },
                        ]).map((hr, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-3"
                          >
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                                HR Pillar {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-on-surface mt-0.5">{hr.topic}</h4>
                              <p className="text-xs text-on-surface mt-2 font-medium">
                                "{hr.typicalQuestion}"
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                                <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-primary block mb-0.5">
                                  Recommended Framing:
                                </span>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{hr.guidance}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 text-[11px] text-red-600">
                                <strong>Avoid:</strong> {hr.pitfallToAvoid}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: PRACTICE DRILLS */}
                  {activePlanTab === 'practice' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.suggestedPracticeAreas.map((area, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 text-primary mb-1">
                                <Wrench className="w-4 h-4" />
                                <h4 className="text-xs font-bold text-on-surface">{area.area}</h4>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                                {area.actionableExercise}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-1">
                                {area.suggestedTools.map((tool, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-variant text-on-surface"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                              <span className="text-[10px] font-bold font-label-caps uppercase tracking-wider text-on-surface-variant block mb-0.5">
                                Target Output:
                              </span>
                              <span className="text-xs text-on-surface font-medium">
                                {area.expectedOutput}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Interactive AI Mock Interview Studio Modal */}
      <MockInterviewStudio
        isOpen={isMockInterviewOpen}
        onClose={() => setIsMockInterviewOpen(false)}
        defaultRole={plan ? plan.targetRole : (selectedRolePreset === 'Custom Role' ? customRoleInput || 'Software Engineer' : selectedRolePreset)}
        defaultExperienceLevel={plan ? plan.experienceLevel : experienceLevel}
        defaultInterviewType={plan ? plan.interviewType : interviewType}
        defaultTargetCompany={plan ? plan.targetCompany : targetCompany}
        defaultJobDescription={jobDescription}
        userProjects={userProjects}
        userExperience={userExperience}
        activePlanQuestions={
          plan
            ? [
                ...plan.technicalQuestions.map((q) => q.question),
                ...plan.projectDeepDives.map((p) => p.deepDiveQuestion),
                ...plan.behavioralScenarios.map((b) => b.question),
              ]
            : undefined
        }
        activeWeakAreas={activeWeakAreas}
        onApplyWeakAreasToPlan={handleApplyWeakAreasToPlan}
      />
    </div>
  );
};
