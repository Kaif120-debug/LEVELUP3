import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const CreativePortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy }) => {
  const { hero, about, projects, experience, services, testimonials, contact, social, design, sections } = portfolio;
  const isDark = design.mode === 'dark';
  const accent = design.primaryColor || '#E11D48';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#0F0F12' : '#FAF8F5'),
        color: design.textColor || (isDark ? '#FFFFFF' : '#111113'),
        fontFamily: design.fontBody || 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {/* Dynamic Header */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md border-b px-6 md:px-16 py-5 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? 'rgba(15, 15, 18, 0.85)' : 'rgba(250, 248, 245, 0.85)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <a href="#hero" className="font-extrabold text-lg tracking-tighter" style={{ fontFamily: design.fontHeading || 'serif' }}>
          {hero.name}<span style={{ color: accent }}>*</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          {isEnabled('about') && <a href="#about" className="hover:opacity-60 transition-opacity">Manifesto</a>}
          {isEnabled('projects') && <a href="#projects" className="hover:opacity-60 transition-opacity">Work</a>}
          {isEnabled('services') && <a href="#services" className="hover:opacity-60 transition-opacity">Discipline</a>}
          {isEnabled('contact') && <a href="#contact" className="hover:opacity-60 transition-opacity">Contact</a>}
        </nav>

        <a
          href={hero.ctaLink || '#contact'}
          className="text-xs font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: accent }}
        >
          {hero.ctaText || "Let's Talk"}
        </a>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-32">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="space-y-8 pt-4">
                  <div className="space-y-4 max-w-4xl">
                    <span 
                      className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border inline-block"
                      style={{ borderColor: `${accent}40`, color: accent, backgroundColor: `${accent}10` }}
                    >
                      {hero.title || 'Creative Director & Multi-Disciplinary Designer'}
                    </span>

                    <h1 
                      className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]"
                      style={{ fontFamily: design.fontHeading || 'Newsreader, serif' }}
                    >
                      {hero.name}
                    </h1>

                    <p className="text-2xl md:text-3xl font-light opacity-90 leading-snug pt-2">
                      {hero.tagline || 'Designing distinct visual identities, expressive interactions, and boundary-pushing software.'}
                    </p>

                    <p className="text-base md:text-lg opacity-75 leading-relaxed max-w-2xl pt-2">
                      {hero.introduction}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <a
                      href={hero.ctaLink || '#projects'}
                      className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-1"
                      style={{ backgroundColor: accent }}
                    >
                      <span>Explore Works</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">LI</a>}
                      {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">GH</a>}
                      {social.dribbble && <a href={social.dribbble} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">DR</a>}
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="md:col-span-4">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-50 block">Manifesto</span>
                    <h2 className="text-3xl font-black mt-2" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      {about.heading || 'Craft Without Compromise'}
                    </h2>
                  </div>
                  <div className="md:col-span-8 space-y-6">
                    <p className="text-xl md:text-2xl font-normal leading-relaxed opacity-90">
                      {about.bio}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-4">
                      {about.skills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 rounded-full border text-xs font-bold tracking-wide" style={{ borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key="projects" id="projects" className="space-y-12 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-50 block">Showcase</span>
                      <h2 className="text-4xl md:text-5xl font-black mt-1" style={{ fontFamily: design.fontHeading || 'serif' }}>
                        Selected Works
                      </h2>
                    </div>
                    <span className="text-xs font-mono opacity-50">{projects.length} artifacts</span>
                  </div>

                  <div className="space-y-16">
                    {projects.map((project, idx) => (
                      <div 
                        key={project.id || idx}
                        className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border rounded-3xl p-6 md:p-10 transition-all hover:shadow-2xl"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          backgroundColor: isDark ? '#17171C' : '#FFFFFF',
                        }}
                      >
                        <div className="lg:col-span-7 overflow-hidden rounded-2xl aspect-[16/10] bg-stone-200 dark:bg-stone-800">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>

                        <div className="lg:col-span-5 space-y-4">
                          <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: accent }}>
                            {project.role}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-black" style={{ fontFamily: design.fontHeading || 'serif' }}>
                            {project.name}
                          </h3>
                          <p className="text-sm opacity-80 leading-relaxed">
                            {project.description}
                          </p>

                          <div className="pt-4 flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => onOpenCaseStudy(project)}
                              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow transition-transform hover:scale-105 cursor-pointer"
                              style={{ backgroundColor: accent }}
                            >
                              Read Case Study
                            </button>
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider hover:opacity-75 transition-opacity"
                                style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                              >
                                View Live ↗
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
                <section key="testimonials" id="testimonials" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-50 block">Validation</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((test, idx) => (
                      <div key={test.id || idx} className="p-8 rounded-3xl border space-y-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? '#17171C' : '#FFFFFF' }}>
                        <p className="text-lg italic opacity-90 leading-relaxed font-serif">"{test.testimonial}"</p>
                        <p className="font-bold text-xs pt-2">{test.clientName} — <span className="opacity-60 font-normal">{test.role}, {test.company}</span></p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="p-10 md:p-16 rounded-3xl border space-y-6 text-center" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? '#17171C' : '#FFFFFF' }}>
                    <h2 className="text-4xl md:text-6xl font-black" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      Ready to build something unforgettable?
                    </h2>
                    <p className="text-base opacity-75 max-w-xl mx-auto">
                      {contact.contactCta || 'Drop a line to discuss upcoming projects, creative direction, or design advisory.'}
                    </p>
                    <div className="pt-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-block px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest text-white shadow-2xl transition-transform hover:scale-105"
                        style={{ backgroundColor: accent }}
                      >
                        {contact.email}
                      </a>
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
      <footer className="max-w-6xl mx-auto px-6 md:px-16 py-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono opacity-50" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <p>© {new Date().getFullYear()} {hero.name}. All creative rights reserved.</p>
        {!portfolio.settings?.removeBranding && <p>Powered by LEVELUP</p>}
      </footer>
    </div>
  );
};
