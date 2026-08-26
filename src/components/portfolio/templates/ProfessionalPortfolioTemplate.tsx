import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const ProfessionalPortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy }) => {
  const { hero, about, projects, experience, education, services, testimonials, contact, social, design, sections } = portfolio;
  const isDark = design.mode === 'dark';
  const primary = design.primaryColor || '#1E3A8A';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#0B0F19' : '#FFFFFF'),
        color: design.textColor || (isDark ? '#F3F4F6' : '#111827'),
        fontFamily: design.fontBody || 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {/* Executive Header */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md border-b px-8 md:px-20 py-4 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? 'rgba(11, 15, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? '#1F2937' : '#E5E7EB',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow" style={{ backgroundColor: primary }}>
            {hero.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">{hero.name}</h1>
            <p className="text-[11px] text-gray-500 font-medium">{hero.title || 'Executive Leader'}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          {isEnabled('about') && <a href="#about" className="hover:text-current transition-colors">Executive Summary</a>}
          {isEnabled('experience') && <a href="#experience" className="hover:text-current transition-colors">Career Leadership</a>}
          {isEnabled('projects') && <a href="#projects" className="hover:text-current transition-colors">Key Initiatives</a>}
          {isEnabled('services') && <a href="#services" className="hover:text-current transition-colors">Advisory</a>}
          {isEnabled('contact') && <a href="#contact" className="hover:text-current transition-colors">Contact</a>}
        </nav>

        <a
          href={hero.ctaLink || '#contact'}
          className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-white shadow-sm transition-all hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          {hero.ctaText || 'Get in Touch'}
        </a>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-8 md:px-20 py-16 md:py-24 space-y-28">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Executive Portfolio & Leadership
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      {hero.name}
                    </h1>

                    <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-snug">
                      {hero.tagline || 'Leading product innovation, systems scale, and multi-disciplinary teams.'}
                    </p>

                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                      {hero.introduction}
                    </p>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                      <a
                        href={hero.ctaLink || '#experience'}
                        className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:-translate-y-0.5"
                        style={{ backgroundColor: primary }}
                      >
                        {hero.ctaText || 'View Career Timeline'}
                      </a>

                      <a
                        href="#projects"
                        className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Selected Initiatives ({projects.length})
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex justify-center">
                    {hero.profileImage ? (
                      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-xs aspect-square">
                        <img src={hero.profileImage} alt={hero.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full max-w-xs aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center text-4xl font-bold text-gray-400">
                        {hero.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="space-y-6 pt-12 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Executive Summary</span>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    {about.heading || 'Leadership & Core Focus'}
                  </h2>
                  <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl">
                    {about.bio}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Total Experience</span>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{about.yearsOfExperience}+ Years</p>
                    </div>
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Location</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1 truncate">{about.location}</p>
                    </div>
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Status</span>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">Available</p>
                    </div>
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Discipline</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">Product & Tech</p>
                    </div>
                  </div>
                </section>
              );

            case 'experience':
              return (
                <section key="experience" id="experience" className="space-y-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Career Trajectory</span>
                    <h2 className="text-2xl md:text-3xl font-bold mt-1" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      Leadership Experience
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm space-y-3">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.role}</h3>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{exp.company} • <span className="text-gray-500 font-normal">{exp.location}</span></p>
                          </div>
                          <span className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {exp.startDate} — {exp.currentPosition ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key="projects" id="projects" className="space-y-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Key Deliverables</span>
                      <h2 className="text-2xl md:text-3xl font-bold mt-1" style={{ fontFamily: design.fontHeading || 'serif' }}>
                        Strategic Initiatives & Case Studies
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project, idx) => (
                      <div key={project.id || idx} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
                        {project.image && (
                          <img src={project.image} alt={project.name} className="w-full h-48 object-cover border-b border-gray-200 dark:border-gray-800" />
                        )}
                        <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{project.role}</span>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mt-1">{project.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2">{project.description}</p>
                          </div>
                          <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                            <button
                              onClick={() => onOpenCaseStudy(project)}
                              className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Read Case Study</span>
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                            {project.projectUrl && (
                              <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                Live Link ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'testimonials':
              return (
                <section key="testimonials" id="testimonials" className="space-y-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Board & Peer Endorsements</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((test, idx) => (
                      <div key={test.id || idx} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 space-y-4">
                        <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">"{test.testimonial}"</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{test.clientName} — <span className="text-gray-500 font-normal">{test.role}, {test.company}</span></p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-6 pt-12 border-t border-gray-200 dark:border-gray-800">
                  <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-4 max-w-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Inquiry & Contact</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{contact.contactCta || 'Reach out for advisory, keynote, or leadership discussions.'}</p>
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <a href={`mailto:${contact.email}`} className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow" style={{ backgroundColor: primary }}>
                        {contact.email}
                      </a>
                      {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline">LinkedIn Profile ↗</a>}
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
      <footer className="max-w-6xl mx-auto px-8 md:px-20 py-8 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs text-gray-500">
        <span>© {new Date().getFullYear()} {hero.name}</span>
        {!portfolio.settings?.removeBranding && <span>LEVELUP Verified</span>}
      </footer>
    </div>
  );
};
