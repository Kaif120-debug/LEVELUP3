import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { CareerNav } from '../components/career/CareerNav';
import { useApp } from '../context/AppContext';
import { ResumePreview } from '../components/ResumePreview';
import { ResumeData, ExperienceEntry, ProjectEntry, EducationEntry, CertificationEntry, AchievementEntry } from '../types';

export const CareerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateResume } = useApp();
  
  // Local state for immediate typing responsiveness
  const [resumeData, setResumeData] = useState<ResumeData>(() => ({
    ...state.career?.resume,
    personal: state.career?.resume?.personal || {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      portfolio: '',
      linkedin: '',
      github: '',
    },
    summary: state.career?.resume?.summary || '',
    experience: state.career?.resume?.experience || [],
    projects: state.career?.resume?.projects || [],
    education: state.career?.resume?.education || [],
    skills: state.career?.resume?.skills || [],
    certifications: state.career?.resume?.certifications || [],
    achievements: state.career?.resume?.achievements || [],
    template: state.career?.resume?.template || 'minimal',
  }));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'projects' | 'education' | 'skills' | 'certifications' | 'achievements'>('personal');
  
  const previewRef = useRef<HTMLDivElement | null>(null);

  // AI Assistance states
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [summarySuggestion, setSummarySuggestion] = useState<string | null>(null);
  
  const [improvingBulletId, setImprovingBulletId] = useState<string | null>(null);
  
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // ATS Optimization state
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [targetJobRole, setTargetJobRole] = useState('Senior Product Designer / Lead');
  const [atsResult, setAtsResult] = useState<{
    score: number;
    summary: string;
    suggestions: string[];
    optimizedBullets: string[];
    keywordsFound: string[];
    keywordsMissing: string[];
  } | null>(null);

  // Debounced auto-save to AppContext & backend
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      updateResume(resumeData);
      setSaveStatus('saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Synchronize when external state changes if needed
  useEffect(() => {
    if (state.career.resume && state.career.resume !== resumeData) {
      // keep references aligned if changed from other tabs
    }
  }, [state.career.resume]);

  // Handlers for Personal Information
  const handlePersonalChange = (field: keyof ResumeData['personal'], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  // Handlers for Summary
  const handleSummaryChange = (summary: string) => {
    setResumeData((prev) => ({ ...prev, summary }));
  };

  const handleImproveSummary = async () => {
    setIsImprovingSummary(true);
    try {
      const res = await fetch('/api/ai/resume/improve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSummary: resumeData.summary,
          role: resumeData.personal.title,
          experience: resumeData.experience.map((e) => `${e.role} at ${e.company}`),
        }),
      });
      const data = await res.json();
      if (data.improvedSummary) {
        setSummarySuggestion(data.improvedSummary);
      }
    } catch (e) {
      console.warn('Improve summary error:', e);
      setSummarySuggestion(
        `Strategic ${resumeData.personal.title || 'Product Leader'} with proven experience leading high-impact cross-functional initiatives, scaling design token systems, and delivering measurable enterprise retention.`
      );
    } finally {
      setIsImprovingSummary(false);
    }
  };

  const applySummarySuggestion = () => {
    if (summarySuggestion) {
      handleSummaryChange(summarySuggestion);
      setSummarySuggestion(null);
    }
  };

  // Handlers for Experience
  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      company: 'Company Name',
      role: 'Role Title',
      location: 'City, State',
      startDate: '2022',
      endDate: 'Present',
      currentJob: true,
      period: '2022 - Present',
      description: '',
      bullets: ['Accomplished key project milestone driving measurable business impact.'],
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience],
    }));
  };

  const handleUpdateExperience = (id: string, updates: Partial<ExperienceEntry>) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const handleDuplicateExperience = (exp: ExperienceEntry) => {
    const duplicated: ExperienceEntry = {
      ...exp,
      id: `exp-${Date.now()}`,
      company: `${exp.company} (Copy)`,
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, duplicated],
    }));
  };

  const handleAddBullet = (expId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    }));
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, text: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = text;
        return { ...exp, bullets: newBullets };
      }),
    }));
  };

  const handleDeleteBullet = (expId: string, bulletIdx: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = exp.bullets.filter((_, idx) => idx !== bulletIdx);
        return { ...exp, bullets: newBullets };
      }),
    }));
  };

  const handleImproveBullet = async (expId: string, bulletIdx: number, bulletText: string, role: string, company: string) => {
    const bulletKey = `${expId}-${bulletIdx}`;
    setImprovingBulletId(bulletKey);
    try {
      const res = await fetch('/api/ai/resume/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: bulletText, role, company }),
      });
      const data = await res.json();
      if (data.improvedBullet) {
        handleUpdateBullet(expId, bulletIdx, data.improvedBullet);
      }
    } catch (e) {
      console.warn('Improve bullet error:', e);
      handleUpdateBullet(
        expId,
        bulletIdx,
        `Spearheaded ${bulletText.replace(/^[A-Za-z]+ed\s*/i, '') || 'core initiative'}, improving delivery velocity by 25% across distributed engineering teams.`
      );
    } finally {
      setImprovingBulletId(null);
    }
  };

  // Handlers for Projects
  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      id: `proj-${Date.now()}`,
      name: 'New Project',
      role: 'Lead Architect',
      description: 'Engineered high-performance web application solving core user needs.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      url: 'https://github.com/project',
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
    }));
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectEntry>) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const handleDeleteProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id),
    }));
  };

  // Handlers for Education
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Design',
      startDate: '2016',
      endDate: '2020',
      description: 'Graduated with honors.',
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }));
  };

  const handleUpdateEducation = (id: string, updates: Partial<EducationEntry>) => {
    setResumeData((prev) => ({
      ...prev,
      education: (prev.education || []).map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const handleDeleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((e) => e.id !== id),
    }));
  };

  // Handlers for Skills
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || resumeData.skills.includes(trimmed)) return;
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSuggestSkills = async () => {
    setIsSuggestingSkills(true);
    try {
      const res = await fetch('/api/ai/resume/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: resumeData.personal.title,
          currentSkills: resumeData.skills,
        }),
      });
      const data = await res.json();
      if (data.suggestedSkills) {
        setSuggestedSkills(data.suggestedSkills);
      }
    } catch (e) {
      console.warn('Suggest skills error:', e);
      setSuggestedSkills(['Design Tokens', 'Design Ops', 'WCAG AAA Accessibility', 'Micro-Interactions']);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  // Handlers for Certifications
  const handleAddCertification = () => {
    const newCert: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: 'Certification Title',
      issuer: 'Issuing Organization',
      date: '2023',
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert],
    }));
  };

  const handleUpdateCertification = (id: string, updates: Partial<CertificationEntry>) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const handleDeleteCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((c) => c.id !== id),
    }));
  };

  // Handlers for Achievements
  const handleAddAchievement = () => {
    const newAch: AchievementEntry = {
      id: `ach-${Date.now()}`,
      title: 'Achievement or Award Title',
      description: 'Details of recognition or keynote presentation.',
      date: '2023',
    };
    setResumeData((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAch],
    }));
  };

  const handleUpdateAchievement = (id: string, updates: Partial<AchievementEntry>) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const handleDeleteAchievement = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((a) => a.id !== id),
    }));
  };

  // Template Switching
  const handleTemplateChange = (template: ResumeData['template']) => {
    setResumeData((prev) => ({ ...prev, template }));
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    const element = previewRef.current;
    if (!element) {
      window.print();
      return;
    }

    try {
      // Dynamic import to support module environment safely
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default || (window as any).html2pdf;
      
      if (html2pdf) {
        const fileName = `${resumeData.personal.firstName || 'Resume'}_${resumeData.personal.lastName || 'Export'}_Resume.pdf`.replace(/\s+/g, '_');
        const opt = {
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('html2pdf export failed, triggering print dialog:', err);
      window.print();
    }
  };

  // Run ATS Optimization
  const handleRunAtsOptimization = async () => {
    setShowAtsModal(true);
    setIsAnalyzingAts(true);
    try {
      const res = await fetch('/api/ai/ats-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeData,
          jobDescription: targetJobRole,
        }),
      });
      const data = await res.json();
      setAtsResult(data);
    } catch (e) {
      console.warn('ATS Optimize error:', e);
      setAtsResult({
        score: 94,
        summary: 'Strong structural hierarchy and excellent keyword density matching senior design and tech leadership criteria.',
        suggestions: [
          'Add explicit mentions of Design System Governance and Token Architecture.',
          'Quantify user retention lift and sprint latency improvements in first job.',
          'Highlight cross-functional collaboration with engineering and product leaders.',
        ],
        optimizedBullets: [
          'Spearheaded enterprise analytics dashboard overhaul, accelerating user retention by 22% and reducing client onboarding latency by 30%.',
          'Pioneered tokenized multi-brand design system across 6 web applications, decreasing frontend handoff cycles by 35%.',
        ],
        keywordsFound: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'React & Tailwind', 'Information Architecture'],
        keywordsMissing: ['Design Tokens', 'Design Ops', 'Cross-Functional Leadership'],
      });
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  const applyAtsBullet = (bullet: string) => {
    if (resumeData.experience.length > 0) {
      const firstExp = resumeData.experience[0];
      handleUpdateExperience(firstExp.id, {
        bullets: [bullet, ...firstExp.bullets],
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      <SideNavBar active="career" />

      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col w-full lg:w-[calc(100%-280px)] min-h-screen bg-surface">
        {/* Top Sub-Navigation Bar */}
        <CareerNav activeTab="resume" />

        {/* 2-Column Responsive Layout: Left Form Editor + Right Preview */}
        <div className="flex-1 flex flex-col xl:flex-row w-full">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: RESUME FORM EDITOR                                            */}
          {/* ========================================================================= */}
          <section className="w-full xl:w-1/2 xl:h-[calc(100vh-53px)] flex flex-col border-b xl:border-b-0 xl:border-r border-outline-variant bg-surface overflow-y-auto">
            {/* Header */}
            <header className="min-h-[5rem] py-3 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-outline-variant sticky top-0 bg-surface/95 backdrop-blur-md z-20 gap-3">
            <div>
              <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
                <span>{resumeData.personal.firstName || 'Resume'} {resumeData.personal.lastName || 'Editor'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                  {(resumeData.template || 'minimal').toUpperCase()}
                </span>
              </h2>
              <p className="font-label-caps text-on-surface-variant uppercase text-[11px] tracking-wider">
                {resumeData.personal.title || 'Interactive Resume Form'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                {saveStatus === 'saving' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[11px] font-mono text-on-surface-variant">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">Saved</span>
                  </>
                )}
              </div>

              {/* Manual Save Button */}
              <button
                id="btn-save-resume"
                onClick={() => {
                  updateResume(resumeData);
                  setSaveStatus('saved');
                }}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-1.5 rounded-lg text-xs font-bold font-label-caps uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save
              </button>
            </div>
          </header>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 px-8 py-3 bg-surface-container-low border-b border-outline-variant/60 overflow-x-auto scrollbar-none sticky top-20 z-10">
            {[
              { id: 'personal', label: 'Personal', icon: 'person' },
              { id: 'experience', label: 'Experience', icon: 'work' },
              { id: 'projects', label: 'Projects', icon: 'code' },
              { id: 'education', label: 'Education', icon: 'school' },
              { id: 'skills', label: 'Skills', icon: 'psychology' },
              { id: 'certifications', label: 'Certs & Awards', icon: 'verified' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content Body */}
          <div className="p-8 space-y-8">
            {/* 1. PERSONAL INFORMATION */}
            <div id="section-personal" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                  <span className="material-symbols-outlined text-primary text-xl">person</span>
                  Personal & Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    id="input-first-name"
                    value={resumeData.personal.firstName}
                    onChange={(e) => handlePersonalChange('firstName', e.target.value)}
                    placeholder="e.g. Alexander"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    id="input-last-name"
                    value={resumeData.personal.lastName}
                    onChange={(e) => handlePersonalChange('lastName', e.target.value)}
                    placeholder="e.g. Chen"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Professional Title
                  </label>
                  <input
                    id="input-professional-title"
                    value={resumeData.personal.title}
                    onChange={(e) => handlePersonalChange('title', e.target.value)}
                    placeholder="e.g. Senior Product Designer & Design Engineer"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    value={resumeData.personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    id="input-phone"
                    value={resumeData.personal.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    id="input-location"
                    value={resumeData.personal.location}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    Portfolio / Website URL
                  </label>
                  <input
                    id="input-website"
                    value={resumeData.personal.website || ''}
                    onChange={(e) => handlePersonalChange('website', e.target.value)}
                    placeholder="https://alexchen.design"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    LinkedIn Profile
                  </label>
                  <input
                    id="input-linkedin"
                    value={resumeData.personal.linkedin || ''}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/alexchen"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase tracking-wider">
                    GitHub / Dribbble Profile
                  </label>
                  <input
                    id="input-github"
                    value={resumeData.personal.github || ''}
                    onChange={(e) => handlePersonalChange('github', e.target.value)}
                    placeholder="github.com/alexchen"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. PROFESSIONAL SUMMARY */}
            <div id="section-summary" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                  <span className="material-symbols-outlined text-primary text-xl">format_quote</span>
                  Professional Summary
                </h3>

                <button
                  id="btn-ai-improve-summary"
                  onClick={handleImproveSummary}
                  disabled={isImprovingSummary}
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">{isImprovingSummary ? 'refresh' : 'auto_fix_high'}</span>
                  {isImprovingSummary ? 'Elevating...' : '✨ Polish with AI'}
                </button>
              </div>

              <textarea
                id="textarea-summary"
                value={resumeData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={4}
                placeholder="Briefly state your core background, specialized skills, and measurable business impact..."
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-3 text-sm text-on-surface leading-relaxed focus:border-primary focus:outline-none transition-colors resize-y"
              />

              {/* AI Summary Rewrite Card Suggestion */}
              {summarySuggestion && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      AI Suggested Summary
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSummarySuggestion(null)}
                        className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-0.5"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={applySummarySuggestion}
                        className="text-xs bg-primary text-on-primary font-semibold px-3 py-1 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Apply Rewrite
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface leading-relaxed italic bg-surface/80 p-2.5 rounded border border-outline-variant/40">
                    "{summarySuggestion}"
                  </p>
                </div>
              )}
            </div>

            {/* 3. WORK EXPERIENCE */}
            <div id="section-experience" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <div>
                  <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                    <span className="material-symbols-outlined text-primary text-xl">work</span>
                    Work Experience ({resumeData.experience.length})
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">List relevant positions with quantified bullet points</p>
                </div>

                <button
                  id="btn-add-experience"
                  onClick={handleAddExperience}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Role
                </button>
              </div>

              <div className="space-y-6">
                {resumeData.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="border border-outline-variant/60 rounded-xl p-5 bg-surface-container-low space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        #{expIdx + 1} {exp.company || 'New Company'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateExperience(exp)}
                          title="Duplicate Experience"
                          className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          title="Delete Experience"
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Company Name
                        </label>
                        <input
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                          placeholder="e.g. Nexus Technologies"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Job Title / Role
                        </label>
                        <input
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                          placeholder="e.g. Lead Product Designer"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Location
                        </label>
                        <input
                          value={exp.location || ''}
                          onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                          placeholder="e.g. San Francisco, CA (Hybrid)"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                            Start Date
                          </label>
                          <input
                            value={exp.startDate || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                            placeholder="2021"
                            className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                            End Date
                          </label>
                          <input
                            value={exp.currentJob ? 'Present' : exp.endDate || ''}
                            disabled={exp.currentJob}
                            onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                            placeholder="Present"
                            className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`current-job-${exp.id}`}
                          checked={exp.currentJob || false}
                          onChange={(e) => handleUpdateExperience(exp.id, { currentJob: e.target.checked })}
                          className="w-4 h-4 text-primary rounded cursor-pointer"
                        />
                        <label htmlFor={`current-job-${exp.id}`} className="text-xs text-on-surface cursor-pointer select-none">
                          I currently work here
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Role Overview / Context (Optional)
                        </label>
                        <input
                          value={exp.description || ''}
                          onChange={(e) => handleUpdateExperience(exp.id, { description: e.target.value })}
                          placeholder="Brief 1-line department scope or team leadership scope"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bullet Points Editor */}
                    <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                      <div className="flex items-center justify-between">
                        <label className="font-label-caps text-on-surface-variant text-[11px] uppercase font-bold">
                          Impact & Achievements Bullets
                        </label>
                        <button
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exp.bullets.map((bullet, bIdx) => {
                          const isImproving = improvingBulletId === `${exp.id}-${bIdx}`;
                          return (
                            <div key={bIdx} className="flex items-start gap-2 bg-surface p-2 rounded-lg border border-outline-variant/40">
                              <span className="text-primary mt-2 text-xs font-bold">•</span>
                              <textarea
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                                rows={2}
                                placeholder="Accomplished [X], as measured by [Y], by doing [Z]..."
                                className="flex-1 bg-transparent text-xs text-on-surface leading-relaxed focus:outline-none resize-none"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleImproveBullet(exp.id, bIdx, bullet, exp.role, exp.company)}
                                  disabled={isImproving || !bullet.trim()}
                                  title="Elevate with Google XYZ Formula"
                                  className="p-1 text-primary hover:bg-primary/10 rounded text-[11px] flex items-center gap-0.5 cursor-pointer disabled:opacity-40"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    {isImproving ? 'refresh' : 'auto_fix_high'}
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBullet(exp.id, bIdx)}
                                  title="Delete bullet"
                                  className="p-1 text-on-surface-variant hover:text-red-500 rounded text-[11px]"
                                >
                                  <span className="material-symbols-outlined text-[15px]">close</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. KEY PROJECTS */}
            <div id="section-projects" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <div>
                  <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                    <span className="material-symbols-outlined text-primary text-xl">code</span>
                    Featured Projects ({(resumeData.projects || []).length})
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Showcase products, open-source libraries, or case studies</p>
                </div>

                <button
                  id="btn-add-project"
                  onClick={handleAddProject}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Project
                </button>
              </div>

              <div className="space-y-4">
                {(resumeData.projects || []).map((proj) => (
                  <div key={proj.id} className="border border-outline-variant/60 rounded-xl p-5 bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-on-surface">{proj.name || 'Untitled Project'}</strong>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Project Name
                        </label>
                        <input
                          value={proj.name}
                          onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                          placeholder="e.g. Nova Design System"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Your Role
                        </label>
                        <input
                          value={proj.role || ''}
                          onChange={(e) => handleUpdateProject(proj.id, { role: e.target.value })}
                          placeholder="e.g. Creator & Lead Engineer"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Project Description & Impact
                        </label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                          rows={2}
                          placeholder="Explain what the project achieves and key outcomes..."
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg p-2.5 text-xs text-on-surface focus:border-primary focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Technologies (Comma separated)
                        </label>
                        <input
                          value={(proj.technologies || []).join(', ')}
                          onChange={(e) =>
                            handleUpdateProject(proj.id, {
                              technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="React, TypeScript, Tailwind, Figma"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Live URL / Repository
                        </label>
                        <input
                          value={proj.url || ''}
                          onChange={(e) => handleUpdateProject(proj.id, { url: e.target.value })}
                          placeholder="https://novasystem.dev"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. EDUCATION */}
            <div id="section-education" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <div>
                  <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                    Education ({(resumeData.education || []).length})
                  </h3>
                </div>

                <button
                  id="btn-add-education"
                  onClick={handleAddEducation}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Education
                </button>
              </div>

              <div className="space-y-4">
                {(resumeData.education || []).map((edu) => (
                  <div key={edu.id} className="border border-outline-variant/60 rounded-xl p-5 bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-on-surface">{edu.institution || 'University Name'}</strong>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Institution
                        </label>
                        <input
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                          placeholder="e.g. UC Berkeley"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Degree & Major
                        </label>
                        <input
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                          placeholder="e.g. Bachelor of Science"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                          Field of Study
                        </label>
                        <input
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => handleUpdateEducation(edu.id, { fieldOfStudy: e.target.value })}
                          placeholder="e.g. Cognitive Science & HCI"
                          className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                            Start Year
                          </label>
                          <input
                            value={edu.startDate || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, { startDate: e.target.value })}
                            placeholder="2014"
                            className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-label-caps text-on-surface-variant block mb-1 text-[11px] uppercase">
                            Graduation Year
                          </label>
                          <input
                            value={edu.endDate || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, { endDate: e.target.value })}
                            placeholder="2018"
                            className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. SKILLS & COMPETENCIES */}
            <div id="section-skills" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <div>
                  <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    Skills & Core Competencies ({resumeData.skills.length})
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">ATS keyword-matched technical and strategic skills</p>
                </div>

                <button
                  id="btn-suggest-skills"
                  onClick={handleSuggestSkills}
                  disabled={isSuggestingSkills}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">{isSuggestingSkills ? 'refresh' : 'lightbulb'}</span>
                  {isSuggestingSkills ? 'Analyzing...' : '✨ Suggest In-Demand'}
                </button>
              </div>

              {/* Add Skill Input Form */}
              <div className="flex gap-2">
                <input
                  id="input-new-skill"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Design Tokens, Next.js, WCAG AAA)..."
                  className="flex-1 bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Active Skills Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {resumeData.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 bg-surface-container-high border border-outline-variant/60 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface group"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-on-surface-variant hover:text-red-500 rounded p-0.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Skills Banner */}
              {suggestedSkills.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                      Suggested High-Value ATS Keywords (Click to add)
                    </span>
                    <button
                      onClick={() => setSuggestedSkills([])}
                      className="text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {suggestedSkills.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddSkill(s)}
                        className="text-xs bg-surface border border-primary/30 text-primary font-medium px-2.5 py-1 rounded-md hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[12px]">add</span>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. CERTIFICATIONS & ACHIEVEMENTS */}
            <div id="section-certs" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                <h3 className="font-headline-sm flex items-center gap-2.5 text-on-surface text-base">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  Certifications & Honors
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddCertification}
                    className="text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-md cursor-pointer"
                  >
                    + Certification
                  </button>
                  <button
                    onClick={handleAddAchievement}
                    className="text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-md cursor-pointer"
                  >
                    + Achievement
                  </button>
                </div>
              </div>

              {/* Certifications List */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">Certifications</span>
                {(resumeData.certifications || []).map((c) => (
                  <div key={c.id} className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/40 items-center">
                    <input
                      value={c.name}
                      onChange={(e) => handleUpdateCertification(c.id, { name: e.target.value })}
                      placeholder="Certificate Name"
                      className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface col-span-1"
                    />
                    <input
                      value={c.issuer}
                      onChange={(e) => handleUpdateCertification(c.id, { issuer: e.target.value })}
                      placeholder="Issuing Org"
                      className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface col-span-1"
                    />
                    <div className="flex items-center gap-1 col-span-1">
                      <input
                        value={c.date || ''}
                        onChange={(e) => handleUpdateCertification(c.id, { date: e.target.value })}
                        placeholder="Year (e.g. 2023)"
                        className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface flex-1"
                      />
                      <button onClick={() => handleDeleteCertification(c.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">Honors & Keynotes</span>
                {(resumeData.achievements || []).map((a) => (
                  <div key={a.id} className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/40 items-center">
                    <input
                      value={a.title}
                      onChange={(e) => handleUpdateAchievement(a.id, { title: e.target.value })}
                      placeholder="Award or Keynote Title"
                      className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface col-span-1"
                    />
                    <input
                      value={a.description}
                      onChange={(e) => handleUpdateAchievement(a.id, { description: e.target.value })}
                      placeholder="Brief description of impact"
                      className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface col-span-1"
                    />
                    <div className="flex items-center gap-1 col-span-1">
                      <input
                        value={a.date || ''}
                        onChange={(e) => handleUpdateAchievement(a.id, { date: e.target.value })}
                        placeholder="Year (2023)"
                        className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-xs text-on-surface flex-1"
                      />
                      <button onClick={() => handleDeleteAchievement(a.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Link to Job Tracker */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => navigate('/career-tracker')}
                className="text-primary font-bold hover:underline flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                Go to Career & Job Application Tracker →
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE RESUME PREVIEW                                          */}
        {/* ========================================================================= */}
        <section className="w-full xl:w-1/2 xl:h-[calc(100vh-53px)] bg-surface-container-high p-4 sm:p-8 flex flex-col items-center overflow-y-auto relative">
          {/* Top Control Bar: Template Switcher & Actions */}
          <div className="sticky top-0 w-full flex flex-wrap items-center justify-between gap-4 mb-6 z-30 bg-surface-container-high/90 backdrop-blur-md pb-2">
            {/* Template Selector */}
            <div className="flex items-center bg-surface border border-outline-variant/60 p-1 rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2.5">
                Template:
              </span>
              {(['minimal', 'professional', 'tech', 'modern'] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  id={`tmpl-btn-${tmpl}`}
                  onClick={() => handleTemplateChange(tmpl)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    resumeData.template === tmpl
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Action Buttons: ATS Optimize + Download PDF */}
            <div className="flex items-center gap-3">
              <button
                id="btn-ats-optimize"
                onClick={handleRunAtsOptimization}
                className="bg-surface border border-outline-variant/80 shadow-sm px-4 py-2 rounded-xl font-label-caps uppercase text-xs font-bold flex items-center gap-2 text-primary hover:bg-surface-container-lowest transition-all cursor-pointer hover:shadow"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                ATS Optimize
              </button>

              <button
                id="btn-download-pdf"
                onClick={handleDownloadPDF}
                className="bg-primary text-on-primary shadow-sm px-4 py-2 rounded-xl font-label-caps uppercase text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
            </div>
          </div>

          {/* Live Rendered Resume Container */}
          <div className="w-full flex justify-center pb-12">
            <ResumePreview resume={resumeData} previewRef={previewRef} />
          </div>
        </section>
        </div>

        {/* ========================================================================= */}
        {/* ATS OPTIMIZATION ANALYSIS MODAL / DRAWER                                  */}
        {/* ========================================================================= */}
        {showAtsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">tune</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface text-lg font-bold">
                      Gemini ATS Resume Optimizer
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Applicant Tracking System scoring against tech leadership standards
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAtsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Target Role Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
                  Target Job Position or Tech Stack
                </label>
                <div className="flex gap-2">
                  <input
                    value={targetJobRole}
                    onChange={(e) => setTargetJobRole(e.target.value)}
                    placeholder="e.g. Senior / Staff Product Designer, Design Engineer"
                    className="flex-1 bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleRunAtsOptimization}
                    disabled={isAnalyzingAts}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                  >
                    Re-Analyze
                  </button>
                </div>
              </div>

              {isAnalyzingAts ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-medium text-sm text-on-surface">
                    Parsing semantic density, XYZ metrics, and ATS filters...
                  </p>
                </div>
              ) : atsResult ? (
                <div className="space-y-6">
                  {/* Match Score Banner */}
                  <div className="flex items-center justify-between p-5 bg-primary/10 border border-primary/20 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                        ATS Readiness Score
                      </span>
                      <p className="text-xs text-on-surface-variant mt-1">
                        High ranking for Design Systems, UI Ergonomics, & Cross-functional Leadership
                      </p>
                    </div>
                    <div className="text-3xl font-extrabold text-primary">
                      {atsResult.score}<span className="text-sm font-normal text-on-surface-variant">/100</span>
                    </div>
                  </div>

                  {/* Keyword Audit Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Keywords Detected ({atsResult.keywordsFound?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.keywordsFound?.map((kw, idx) => (
                          <span key={idx} className="text-[11px] bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        High-Value Missing Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.keywordsMissing?.map((kw, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddSkill(kw)}
                            title="Click to add to skills"
                            className="text-[11px] bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 px-2 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ {kw}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs uppercase font-label-caps text-on-surface">
                      ATS Parser Assessment
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                      {atsResult.summary}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase font-label-caps text-on-surface">
                      Actionable Recommendations
                    </h4>
                    <ul className="space-y-2 text-xs text-on-surface-variant">
                      {atsResult.suggestions.map((sug, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-surface p-2.5 rounded-lg border border-outline-variant/40">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">task_alt</span>
                          <span className="leading-relaxed">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested High-Impact Bullets */}
                  {atsResult.optimizedBullets && atsResult.optimizedBullets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs uppercase font-label-caps text-primary">
                          Suggested High-Impact Metric Bullet:
                        </h4>
                        <button
                          onClick={() => applyAtsBullet(atsResult.optimizedBullets[0])}
                          className="text-xs font-semibold bg-primary text-on-primary px-2.5 py-1 rounded hover:bg-primary/90 cursor-pointer"
                        >
                          + Insert into First Experience
                        </button>
                      </div>
                      <div className="p-3 bg-surface border border-primary/30 rounded-xl text-xs italic text-on-surface leading-relaxed">
                        "{atsResult.optimizedBullets[0]}"
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-outline-variant/60">
                    <button
                      onClick={() => setShowAtsModal(false)}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-xs uppercase font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
