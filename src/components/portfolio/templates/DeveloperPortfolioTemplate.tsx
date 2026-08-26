import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const DeveloperPortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy }) => {
  const { hero, about, projects, experience, education, services, contact, social, design, sections } = portfolio;
  const isDark = design.mode !== 'light'; // Developer template defaults to sleek dark mode
  const accentColor = design.primaryColor || '#10B981';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300 font-mono text-sm selection:bg-emerald-500/30 selection:text-emerald-200"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#0B0F17' : '#F8FAFC'),
        color: design.textColor || (isDark ? '#E2E8F0' : '#1E293B'),
        fontFamily: design.fontBody || 'JetBrains Mono, Menlo, monospace',
      }}
    >
      {/* Code Editor Styled Nav */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md border-b px-6 md:px-12 py-3 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? 'rgba(11, 15, 23, 0.9)' : 'rgba(248, 250, 252, 0.9)',
          borderColor: isDark ? '#1E293B' : '#E2E8F0',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs opacity-60 ml-2">~/{portfolio.settings.slug || 'alexander-chen'}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          {isEnabled('about') && <a href="#about" className="hover:text-emerald-400 transition-colors">./about</a>}
          {isEnabled('skills') && <a href="#skills" className="hover:text-emerald-400 transition-colors">./stack</a>}
          {isEnabled('projects') && <a href="#projects" className="hover:text-emerald-400 transition-colors">./repos</a>}
          {isEnabled('experience') && <a href="#experience" className="hover:text-emerald-400 transition-colors">./career</a>}
          {isEnabled('contact') && <a href="#contact" className="hover:text-emerald-400 transition-colors">./contact</a>}
        </nav>

        <a
          href={`mailto:${contact.email}`}
          className="text-xs px-3.5 py-1.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-500 hover:text-black transition-all font-bold"
        >
          $ contact --open
        </a>
      </header>

      {/* Main Terminal Grid */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 space-y-20">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="space-y-6">
                  <div className="p-6 md:p-8 rounded-xl border bg-black/40 border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs text-slate-500">
                      <span>zsh — 80x24</span>
                      <span className="text-emerald-400">● git:(main)</span>
                    </div>

                    <div className="pt-6 space-y-4 font-mono">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-emerald-400">➜</span>
                        <span className="text-cyan-400">~</span>
                        <span>whoami</span>
                      </div>
                      <div className="pl-4">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                          {hero.name}
                        </h1>
                        <p className="text-lg md:text-xl text-emerald-400 font-semibold mt-1">
                          {hero.title || 'Senior Full-Stack Engineer & Systems Architect'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 pt-2">
                        <span className="text-emerald-400">➜</span>
                        <span className="text-cyan-400">~</span>
                        <span>cat intro.md</span>
                      </div>
                      <p className="pl-4 text-slate-300 text-base leading-relaxed max-w-2xl">
                        {hero.introduction}
                      </p>

                      <div className="flex items-center gap-2 text-slate-400 pt-2">
                        <span className="text-emerald-400">➜</span>
                        <span className="text-cyan-400">~</span>
                        <span>cat status.json</span>
                      </div>
                      <div className="pl-4 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 inline-block">
                        <code>{`{ "status": "Open to high-impact engineering roles", "focus": ["Distributed Systems", "TypeScript", "React", "Rust"] }`}</code>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <a
                          href={hero.ctaLink || '#projects'}
                          className="px-5 py-2.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg"
                        >
                          {hero.ctaText || 'View Repositories & Works'}
                        </a>
                        {social.github && (
                          <a
                            href={social.github}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
                          >
                            GitHub Profile ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="text-emerald-400">##</span>
                    <span className="uppercase tracking-wider font-bold">01. System Architecture & Bio</span>
                  </div>

                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 space-y-4">
                    <h2 className="text-xl font-bold text-white">
                      {about.heading || 'Engineering Philosophy'}
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                      {about.bio}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                      <div>
                        <span className="text-xs text-slate-500 block">Experience</span>
                        <span className="text-lg font-bold text-emerald-400">{about.yearsOfExperience}+ Years</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Location</span>
                        <span className="text-sm font-bold text-slate-200">{about.location}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Environment</span>
                        <span className="text-sm font-bold text-slate-200">Linux / macOS</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Core Language</span>
                        <span className="text-sm font-bold text-emerald-400">TypeScript / Rust</span>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'skills':
              return (
                <section key="skills" id="skills" className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="text-emerald-400">##</span>
                    <span className="uppercase tracking-wider font-bold">02. Stack Dependencies</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {about.skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:border-emerald-500/50 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-200">{skill}</span>
                        <span className="text-[10px] text-emerald-500 font-mono">vLatest</span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key="projects" id="projects" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <span className="text-emerald-400">##</span>
                      <span className="uppercase tracking-wider font-bold">03. Production Code & Deployments</span>
                    </div>
                    <span className="text-xs text-slate-500">[{projects.length} Repositories]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, idx) => (
                      <div 
                        key={project.id || idx}
                        className="border border-slate-800 rounded-xl bg-slate-900/40 p-6 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {project.image && (
                            <img
                              src={project.image}
                              alt={project.name}
                              className="w-full h-40 object-cover rounded-lg border border-slate-800"
                            />
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-base text-white hover:text-emerald-400 transition-colors">
                              {project.name}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-mono">
                              {project.role}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tools?.map((tool, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onOpenCaseStudy(project)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <span>view_architecture.md</span>
                            <span>→</span>
                          </button>

                          {project.projectUrl && (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              <span>deploy ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'experience':
              return (
                <section key="experience" id="experience" className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="text-emerald-400">##</span>
                    <span className="uppercase tracking-wider font-bold">04. Engineering Log & Roles</span>
                  </div>

                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm">{exp.role} <span className="text-emerald-400">@ {exp.company}</span></p>
                          <p className="text-xs text-slate-400 mt-1">{exp.description}</p>
                        </div>
                        <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                          [{exp.startDate} - {exp.currentPosition ? 'HEAD' : exp.endDate}]
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="text-emerald-400">##</span>
                    <span className="uppercase tracking-wider font-bold">05. Connect Protocol</span>
                  </div>

                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                    <p className="text-slate-300 text-sm">{contact.contactCta || 'Send a message to initialize collaboration.'}</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a href={`mailto:${contact.email}`} className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors">
                        mail: {contact.email}
                      </a>
                      {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-emerald-400">gh:{social.github.split('/').pop()} ↗</a>}
                      {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-emerald-400">li:{social.linkedin.split('/').pop()} ↗</a>}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 md:px-12 py-8 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
        <span>sys.exit(0) — {hero.name}</span>
        {!portfolio.settings?.removeBranding && <span>LEVELUP engine v2</span>}
      </footer>
    </div>
  );
};
