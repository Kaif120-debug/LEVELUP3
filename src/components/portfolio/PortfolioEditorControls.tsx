import React, { useState } from 'react';
import { PortfolioItem, PortfolioProject, PortfolioExperience, PortfolioEducation, PortfolioService, PortfolioTestimonial } from '../../types';

interface ControlsProps {
  portfolio: PortfolioItem;
  onChange: (updates: Partial<PortfolioItem>) => void;
  onOpenAI: (tool: 'bio' | 'project' | 'case-study' | 'tagline' | 'experience') => void;
}

export const PortfolioEditorControls: React.FC<ControlsProps> = ({ portfolio, onChange, onOpenAI }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'projects' | 'experience' | 'education' | 'services' | 'testimonials' | 'contact'>('hero');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(portfolio.projects[0]?.id || '');

  // Helpers
  const updateHero = (field: keyof PortfolioItem['hero'], value: string) => {
    onChange({ hero: { ...portfolio.hero, [field]: value } });
  };

  const updateAbout = (field: keyof PortfolioItem['about'], value: any) => {
    onChange({ about: { ...portfolio.about, [field]: value } });
  };

  const updateContact = (field: keyof PortfolioItem['contact'], value: string) => {
    onChange({ contact: { ...portfolio.contact, [field]: value } });
  };

  const updateSocial = (field: keyof PortfolioItem['social'], value: string) => {
    onChange({ social: { ...portfolio.social, [field]: value } });
  };

  // Projects operations
  const addProject = () => {
    const newProj: PortfolioProject = {
      id: `proj-${Date.now()}`,
      name: 'New Featured Project',
      role: 'Lead Designer & Developer',
      description: 'A comprehensive digital product designed to solve complex workflow bottlenecks.',
      tools: ['React', 'TypeScript', 'Figma'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      caseStudy: {
        problem: 'Users struggled with disparate toolsets and slow page loads.',
        research: 'Conducted user interviews with 15 workflow specialists.',
        process: 'Iterative prototyping using modular component patterns.',
        solution: 'Built a unified desktop-first dashboard.',
        results: 'Increased daily active usage by 35%.',
      },
    };
    const updated = [newProj, ...portfolio.projects];
    onChange({ projects: updated });
    setSelectedProjectId(newProj.id);
  };

  const updateProject = (id: string, updates: Partial<PortfolioProject>) => {
    const updated = portfolio.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    onChange({ projects: updated });
  };

  const updateProjectCaseStudy = (id: string, field: string, value: string) => {
    const proj = portfolio.projects.find((p) => p.id === id);
    if (!proj) return;
    const updatedCaseStudy = { ...(proj.caseStudy || {}), [field]: value };
    updateProject(id, { caseStudy: updatedCaseStudy });
  };

  const deleteProject = (id: string) => {
    const remaining = portfolio.projects.filter((p) => p.id !== id);
    onChange({ projects: remaining });
    if (selectedProjectId === id && remaining.length > 0) {
      setSelectedProjectId(remaining[0].id);
    }
  };

  // Experience operations
  const addExperience = () => {
    const newExp: PortfolioExperience = {
      id: `exp-${Date.now()}`,
      company: 'Acme Corp',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      startDate: '2023',
      endDate: 'Present',
      currentPosition: true,
      description: 'Spearheading product strategy and multi-platform design architecture.',
    };
    onChange({ experience: [newExp, ...portfolio.experience] });
  };

  const updateExperience = (id: string, updates: Partial<PortfolioExperience>) => {
    const updated = portfolio.experience.map((e) => (e.id === id ? { ...e, ...updates } : e));
    onChange({ experience: updated });
  };

  const deleteExperience = (id: string) => {
    onChange({ experience: portfolio.experience.filter((e) => e.id !== id) });
  };

  // Services operations
  const addService = () => {
    const newServ: PortfolioService = {
      id: `serv-${Date.now()}`,
      title: 'Design Systems Architecture',
      description: 'Building multi-brand tokenized design systems for scalable front-ends.',
      icon: 'design_services',
    };
    onChange({ services: [...portfolio.services, newServ] });
  };

  const updateService = (id: string, updates: Partial<PortfolioService>) => {
    onChange({ services: portfolio.services.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };

  const deleteService = (id: string) => {
    onChange({ services: portfolio.services.filter((s) => s.id !== id) });
  };

  // Testimonials operations
  const addTestimonial = () => {
    const newTest: PortfolioTestimonial = {
      id: `test-${Date.now()}`,
      clientName: 'Sarah Jenkins',
      role: 'Director of Product',
      company: 'Apex Labs',
      testimonial: 'Exceptional craftsmanship and systems-level thinking. Delivered ahead of schedule.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    };
    onChange({ testimonials: [...portfolio.testimonials, newTest] });
  };

  const updateTestimonial = (id: string, updates: Partial<PortfolioTestimonial>) => {
    onChange({ testimonials: portfolio.testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)) });
  };

  const deleteTestimonial = (id: string) => {
    onChange({ testimonials: portfolio.testimonials.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs for content categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border text-xs scrollbar-none">
        {[
          { id: 'hero', label: 'Hero', icon: 'badge' },
          { id: 'about', label: 'About & Skills', icon: 'person' },
          { id: 'projects', label: `Projects (${portfolio.projects.length})`, icon: 'view_cozy' },
          { id: 'experience', label: 'Experience', icon: 'work' },
          { id: 'services', label: 'Services', icon: 'grid_view' },
          { id: 'testimonials', label: 'Testimonials', icon: 'format_quote' },
          { id: 'contact', label: 'Contact', icon: 'mail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. HERO SECTION CONTROLS */}
      {activeTab === 'hero' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Hero Section</h3>
            <button
              onClick={() => onOpenAI('tagline')}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>AI Taglines</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Full Name</label>
              <input
                type="text"
                value={portfolio.hero.name}
                onChange={(e) => updateHero('name', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Alexander Chen"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Professional Title</label>
              <input
                type="text"
                value={portfolio.hero.title}
                onChange={(e) => updateHero('title', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Lead Product Designer & Systems Architect"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Tagline / Headline</label>
              <input
                type="text"
                value={portfolio.hero.tagline || ''}
                onChange={(e) => updateHero('tagline', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Bridging aesthetic craft with architectural engineering."
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Introduction Paragraph</label>
              <textarea
                rows={3}
                value={portfolio.hero.introduction}
                onChange={(e) => updateHero('introduction', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                placeholder="Brief high-impact introduction..."
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Profile / Avatar Image URL</label>
              <input
                type="text"
                value={portfolio.hero.profileImage || ''}
                onChange={(e) => updateHero('profileImage', e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={portfolio.hero.ctaText || 'View My Work'}
                  onChange={(e) => updateHero('ctaText', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">CTA Button Link</label>
                <input
                  type="text"
                  value={portfolio.hero.ctaLink || '#projects'}
                  onChange={(e) => updateHero('ctaLink', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABOUT & SKILLS CONTROLS */}
      {activeTab === 'about' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">About & Competencies</h3>
            <button
              onClick={() => onOpenAI('bio')}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>Improve Bio with AI</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">About Heading</label>
              <input
                type="text"
                value={portfolio.about.heading || ''}
                onChange={(e) => updateAbout('heading', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Background & Philosophy"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Biography / Story</label>
              <textarea
                rows={5}
                value={portfolio.about.bio}
                onChange={(e) => updateAbout('bio', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                placeholder="Write your professional bio, design journey, and core ethos..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={portfolio.about.yearsOfExperience || 5}
                  onChange={(e) => updateAbout('yearsOfExperience', parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Location</label>
                <input
                  type="text"
                  value={portfolio.about.location || ''}
                  onChange={(e) => updateAbout('location', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                Skills & Technologies (comma separated)
              </label>
              <input
                type="text"
                value={portfolio.about.skills.join(', ')}
                onChange={(e) =>
                  updateAbout(
                    'skills',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Figma, React, TypeScript, Tailwind CSS, UI Systems"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. PROJECTS & CASE STUDIES CONTROLS */}
      {activeTab === 'projects' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Projects & Case Studies</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAI('case-study')}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                <span>AI Case Study</span>
              </button>
              <button
                onClick={addProject}
                className="text-[11px] font-mono px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">add</span>
                <span>Add Project</span>
              </button>
            </div>
          </div>

          {/* Project Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {portfolio.projects.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedProjectId === proj.id
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {idx + 1}. {proj.name || 'Untitled'}
              </button>
            ))}
          </div>

          {/* Selected Project Editor */}
          {portfolio.projects
            .filter((p) => p.id === selectedProjectId)
            .map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Editing: {proj.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAI('project')}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                      <span>Improve Summary</span>
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">My Role</label>
                      <input
                        type="text"
                        value={proj.role || ''}
                        onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        placeholder="Lead Designer & Architect"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Live URL (optional)</label>
                      <input
                        type="text"
                        value={proj.projectUrl || ''}
                        onChange={(e) => updateProject(proj.id, { projectUrl: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={proj.image || ''}
                      onChange={(e) => updateProject(proj.id, { image: e.target.value })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Overview Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Tools & Stack (comma separated)</label>
                    <input
                      type="text"
                      value={proj.tools?.join(', ') || ''}
                      onChange={(e) =>
                        updateProject(proj.id, {
                          tools: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="React, Figma, Tailwind CSS"
                    />
                  </div>

                  {/* Case Study Details Accordion */}
                  <div className="pt-2 border-t border-border space-y-3">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold text-foreground block">
                      Case Study Breakdown
                    </span>

                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground block mb-0.5">1. The Problem / Challenge</label>
                      <textarea
                        rows={2}
                        value={proj.caseStudy?.problem || ''}
                        onChange={(e) => updateProjectCaseStudy(proj.id, 'problem', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                        placeholder="What bottleneck or problem existed before this project?"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground block mb-0.5">2. User Research & Discovery</label>
                      <textarea
                        rows={2}
                        value={proj.caseStudy?.research || ''}
                        onChange={(e) => updateProjectCaseStudy(proj.id, 'research', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                        placeholder="User interviews, data audits, metrics..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground block mb-0.5">3. Shipped Solution</label>
                      <textarea
                        rows={2}
                        value={proj.caseStudy?.solution || ''}
                        onChange={(e) => updateProjectCaseStudy(proj.id, 'solution', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                        placeholder="How was the final solution architected and shipped?"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground block mb-0.5">4. Measurable Results</label>
                      <textarea
                        rows={2}
                        value={proj.caseStudy?.results || ''}
                        onChange={(e) => updateProjectCaseStudy(proj.id, 'results', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                        placeholder="e.g. +35% retention, 40% reduction in churn..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 4. EXPERIENCE CONTROLS */}
      {activeTab === 'experience' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Work Experience</h3>
            <button
              onClick={addExperience}
              className="text-[11px] font-mono px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {portfolio.experience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">{exp.role} @ {exp.company}</span>
                  <button onClick={() => deleteExperience(exp.id)} className="text-xs text-destructive hover:underline">
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground block mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground block mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground block mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground block mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground block mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">Impact & Responsibilities</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SERVICES CONTROLS */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Services Offered</h3>
            <button
              onClick={addService}
              className="text-[11px] font-mono px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>Add Service</span>
            </button>
          </div>

          <div className="space-y-3">
            {portfolio.services.map((serv) => (
              <div key={serv.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={serv.title}
                    onChange={(e) => updateService(serv.id, { title: e.target.value })}
                    className="text-xs font-bold px-2 py-1 rounded border border-border bg-background text-foreground flex-1 mr-2"
                  />
                  <button onClick={() => deleteService(serv.id)} className="text-xs text-destructive hover:underline">
                    Remove
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={serv.description}
                  onChange={(e) => updateService(serv.id, { description: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TESTIMONIALS CONTROLS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Client Endorsements</h3>
            <button
              onClick={addTestimonial}
              className="text-[11px] font-mono px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="space-y-3">
            {portfolio.testimonials.map((test) => (
              <div key={test.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex justify-between items-center">
                  <div className="grid grid-cols-3 gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={test.clientName}
                      placeholder="Name"
                      onChange={(e) => updateTestimonial(test.id, { clientName: e.target.value })}
                      className="text-xs font-bold px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                    <input
                      type="text"
                      value={test.role}
                      placeholder="Role"
                      onChange={(e) => updateTestimonial(test.id, { role: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                    <input
                      type="text"
                      value={test.company}
                      placeholder="Company"
                      onChange={(e) => updateTestimonial(test.id, { company: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <button onClick={() => deleteTestimonial(test.id)} className="text-xs text-destructive hover:underline">
                    Remove
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={test.testimonial}
                  onChange={(e) => updateTestimonial(test.id, { testimonial: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground italic"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CONTACT & SOCIALS CONTROLS */}
      {activeTab === 'contact' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground">Contact & Social Links</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Email Address</label>
              <input
                type="email"
                value={portfolio.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Phone Number (optional)</label>
              <input
                type="text"
                value={portfolio.contact.phone || ''}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Contact Call to Action</label>
              <textarea
                rows={2}
                value={portfolio.contact.contactCta || ''}
                onChange={(e) => updateContact('contactCta', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-foreground block">
                Social Profiles
              </span>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={portfolio.social.linkedin || ''}
                  placeholder="LinkedIn URL"
                  onChange={(e) => updateSocial('linkedin', e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  value={portfolio.social.github || ''}
                  placeholder="GitHub URL"
                  onChange={(e) => updateSocial('github', e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  value={portfolio.social.x || ''}
                  placeholder="X / Twitter URL"
                  onChange={(e) => updateSocial('x', e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  value={portfolio.social.dribbble || ''}
                  placeholder="Dribbble URL"
                  onChange={(e) => updateSocial('dribbble', e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
