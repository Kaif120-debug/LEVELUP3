import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const EditorialPortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy }) => {
  const { hero, about, projects, experience, services, testimonials, contact, social, design, sections } = portfolio;
  const isDark = design.mode === 'dark';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#141416' : '#F9F7F1'),
        color: design.textColor || (isDark ? '#F0EEE9' : '#1C1A17'),
        fontFamily: design.fontBody || 'Newsreader, Georgia, serif',
      }}
    >
      {/* Magazine Masthead */}
      <header 
        className="border-b-2 px-6 md:px-16 py-8 text-center space-y-3"
        style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}
      >
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest opacity-60 max-w-5xl mx-auto">
          <span>Vol. {new Date().getFullYear()}</span>
          <span>Personal Folio & Essays</span>
          <span>{about.location || 'San Francisco'}</span>
        </div>

        <h1 
          className="text-4xl md:text-7xl font-bold tracking-tight uppercase"
          style={{ fontFamily: design.fontHeading || 'Playfair Display, serif' }}
        >
          {hero.name}
        </h1>

        <div className="flex justify-center items-center gap-6 text-xs font-mono uppercase tracking-widest pt-2 border-t max-w-2xl mx-auto" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
          {isEnabled('about') && <a href="#about" className="hover:underline">Essay & Bio</a>}
          <span>•</span>
          {isEnabled('projects') && <a href="#projects" className="hover:underline">Folio Works</a>}
          <span>•</span>
          {isEnabled('experience') && <a href="#experience" className="hover:underline">Chronicle</a>}
          <span>•</span>
          {isEnabled('contact') && <a href="#contact" className="hover:underline">Correspondence</a>}
        </div>
      </header>

      {/* Main Reading Column */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-24">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="space-y-8 text-center md:text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8 space-y-6">
                      <span className="text-xs font-mono uppercase tracking-widest italic opacity-70 block">
                        Featured Introduction — {hero.title}
                      </span>

                      <h2 
                        className="text-3xl md:text-5xl font-normal leading-tight italic"
                        style={{ fontFamily: design.fontHeading || 'Playfair Display, serif' }}
                      >
                        "{hero.tagline || 'On crafting enduring systems, considered interfaces, and thoughtful digital artifacts.'}"
                      </h2>

                      <p className="text-lg opacity-85 leading-relaxed font-serif">
                        {hero.introduction}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-4">
                        <a
                          href={hero.ctaLink || '#projects'}
                          className="px-6 py-2.5 rounded-none border-b-2 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-60 transition-opacity"
                          style={{ borderColor: design.primaryColor || '#000' }}
                        >
                          {hero.ctaText || 'Inspect Projects →'}
                        </a>
                      </div>
                    </div>

                    <div className="md:col-span-4">
                      {hero.profileImage && (
                        <div className="p-2 border" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                          <img src={hero.profileImage} alt={hero.name} className="w-full aspect-[3/4] object-cover grayscale contrast-125" />
                          <p className="text-[11px] font-mono opacity-50 mt-2 text-center">Fig 1.0 — {hero.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Chapter I. Background</span>
                    <span className="text-xs font-mono opacity-50">{about.yearsOfExperience} years in practice</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    {about.heading || 'A Considered Approach to Digital Craft'}
                  </h3>

                  <div className="text-lg md:text-xl leading-relaxed opacity-90 space-y-4 font-serif first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                    {about.bio}
                  </div>

                  <div className="pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                    <span className="text-xs font-mono opacity-60 mr-2 py-1">Indices:</span>
                    {about.skills.map((skill, idx) => (
                      <span key={idx} className="text-xs font-mono px-2.5 py-1 border italic opacity-80" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key="projects" id="projects" className="space-y-12 pt-12 border-t" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Chapter II. Selected Case Studies</span>
                    <span className="text-xs font-mono opacity-50">{projects.length} Entries</span>
                  </div>

                  <div className="space-y-16">
                    {projects.map((project, idx) => (
                      <article key={project.id || idx} className="space-y-6 pb-12 border-b last:border-b-0" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                        {project.image && (
                          <div className="p-2 border" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                            <img src={project.image} alt={project.name} className="w-full h-80 object-cover" />
                          </div>
                        )}

                        <div className="flex flex-wrap justify-between items-baseline gap-2">
                          <h4 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                            {project.name}
                          </h4>
                          <span className="text-xs font-mono opacity-60">{project.role}</span>
                        </div>

                        <p className="text-base md:text-lg opacity-85 leading-relaxed font-serif">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            onClick={() => onOpenCaseStudy(project)}
                            className="font-mono text-xs uppercase tracking-widest font-bold underline cursor-pointer hover:opacity-60"
                          >
                            Read Full Case Study [PDF/Analysis] →
                          </button>

                          {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" rel="noreferrer" className="font-mono text-xs opacity-60 hover:opacity-100">
                              Direct Link ↗
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );

            case 'experience':
              return (
                <section key="experience" id="experience" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Chapter III. The Chronicle</span>

                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                        <div className="md:col-span-4 text-xs font-mono opacity-60">
                          {exp.startDate} — {exp.currentPosition ? 'Present' : exp.endDate}
                          <div className="font-bold text-sm opacity-90 mt-1">{exp.company}</div>
                        </div>
                        <div className="md:col-span-8 space-y-1">
                          <h5 className="font-bold text-base">{exp.role}</h5>
                          <p className="text-sm opacity-80 font-serif leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-6 pt-12 border-t text-center" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Chapter IV. Correspondence</span>
                  <h3 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Open for Intellectual & Creative Discourse
                  </h3>
                  <p className="text-base opacity-80 max-w-xl mx-auto font-serif">
                    {contact.contactCta || 'For editorial commissions, design leadership inquiries, or advisory dialogue.'}
                  </p>
                  <div className="pt-4">
                    <a href={`mailto:${contact.email}`} className="text-lg md:text-xl font-bold font-mono underline hover:opacity-60">
                      {contact.email}
                    </a>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t-2 py-8 text-center text-xs font-mono opacity-50 space-y-1" style={{ borderColor: isDark ? '#2E2D32' : '#E2DCD0' }}>
        <p>Published by {hero.name}. Set in {design.fontHeading || 'Playfair Display'}.</p>
        {!portfolio.settings?.removeBranding && <p>Powered by LEVELUP</p>}
      </footer>
    </div>
  );
};
