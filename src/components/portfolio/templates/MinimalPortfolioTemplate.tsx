import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const MinimalPortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy, isStandalone }) => {
  const { hero, about, projects, experience, education, services, testimonials, contact, social, design, sections } = portfolio;
  const isDark = design.mode === 'dark';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  const getButtonStyle = () => {
    switch (design.buttonStyle) {
      case 'pill': return 'rounded-full px-7 py-3';
      case 'square': return 'rounded-none px-6 py-3';
      case 'minimal': return 'border-b-2 rounded-none px-2 py-1 bg-transparent';
      default: return 'rounded-xl px-6 py-3';
    }
  };

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#121214' : '#FBF9F5'),
        color: design.textColor || (isDark ? '#F4F4F5' : '#1F2421'),
        fontFamily: design.fontBody || 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {/* Top Floating Mini Header */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md border-b px-6 md:px-12 py-4 flex items-center justify-between transition-colors"
        style={{
          backgroundColor: isDark ? 'rgba(18, 18, 20, 0.85)' : 'rgba(251, 249, 245, 0.85)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <a href="#hero" className="font-bold text-sm tracking-tight hover:opacity-80" style={{ fontFamily: design.fontHeading || 'serif' }}>
          {hero.name}
        </a>

        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-medium opacity-80">
          {isEnabled('about') && <a href="#about" className="hover:opacity-100 transition-opacity">About</a>}
          {isEnabled('projects') && <a href="#projects" className="hover:opacity-100 transition-opacity">Works</a>}
          {isEnabled('experience') && <a href="#experience" className="hover:opacity-100 transition-opacity">Experience</a>}
          {isEnabled('services') && <a href="#services" className="hover:opacity-100 transition-opacity">Services</a>}
          {isEnabled('contact') && <a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a>}
        </nav>

        <a
          href={hero.ctaLink || '#contact'}
          className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${getButtonStyle()}`}
          style={{
            backgroundColor: design.buttonStyle === 'minimal' ? 'transparent' : (design.primaryColor || '#2D4B3E'),
            color: design.buttonStyle === 'minimal' ? (design.primaryColor || '#2D4B3E') : '#FFFFFF',
            borderColor: design.buttonStyle === 'minimal' ? (design.primaryColor || '#2D4B3E') : undefined,
          }}
        >
          {hero.ctaText || 'Get in Touch'}
        </a>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-24">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="space-y-8 pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
                    <div className="space-y-4 max-w-2xl">
                      <span 
                        className="text-xs uppercase font-mono tracking-widest font-bold block"
                        style={{ color: design.primaryColor || '#2D4B3E' }}
                      >
                        {hero.title || 'Product Designer'}
                      </span>
                      <h1 
                        className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]"
                        style={{ fontFamily: design.fontHeading || 'Newsreader, serif' }}
                      >
                        {hero.name}
                      </h1>
                      {hero.tagline && (
                        <p className="text-lg md:text-xl font-medium opacity-90 leading-snug">
                          {hero.tagline}
                        </p>
                      )}
                      <p className="text-base md:text-lg opacity-75 leading-relaxed pt-2">
                        {hero.introduction}
                      </p>

                      <div className="pt-4 flex flex-wrap items-center gap-4">
                        <a
                          href={hero.ctaLink || '#projects'}
                          className={`text-xs font-bold uppercase tracking-wider shadow-sm transition-transform hover:-translate-y-0.5 ${getButtonStyle()}`}
                          style={{
                            backgroundColor: design.buttonStyle === 'minimal' ? 'transparent' : (design.primaryColor || '#2D4B3E'),
                            color: design.buttonStyle === 'minimal' ? (design.primaryColor || '#2D4B3E') : '#FFFFFF',
                            borderColor: design.buttonStyle === 'minimal' ? (design.primaryColor || '#2D4B3E') : undefined,
                          }}
                        >
                          {hero.ctaText || 'View My Work'}
                        </a>

                        {social.github && (
                          <a href={social.github} target="_blank" rel="noreferrer" className="p-2.5 rounded-full border opacity-70 hover:opacity-100 hover:scale-105 transition-all">
                            <span className="text-xs font-mono font-bold">GitHub</span>
                          </a>
                        )}
                        {social.linkedin && (
                          <a href={social.linkedin} target="_blank" rel="noreferrer" className="p-2.5 rounded-full border opacity-70 hover:opacity-100 hover:scale-105 transition-all">
                            <span className="text-xs font-mono font-bold">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {hero.profileImage && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={hero.profileImage}
                          alt={hero.name}
                          className="w-36 h-36 md:w-48 md:h-48 object-cover rounded-2xl border shadow-lg"
                          style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                        />
                        <div 
                          className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow"
                          style={{ backgroundColor: design.primaryColor || '#2D4B3E', color: '#FFFFFF' }}
                        >
                          Available
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">About & Background</span>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    {about.heading || 'Background & Philosophy'}
                  </h2>
                  <p className="text-base md:text-lg opacity-80 leading-relaxed max-w-3xl whitespace-pre-line">
                    {about.bio}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
                    <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <span className="text-xs uppercase font-mono opacity-60 block">Experience</span>
                      <p className="text-2xl font-bold mt-1" style={{ color: design.primaryColor }}>{about.yearsOfExperience}+ Years</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <span className="text-xs uppercase font-mono opacity-60 block">Location</span>
                      <p className="text-base font-bold mt-1 truncate">{about.location || 'San Francisco, CA'}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <span className="text-xs uppercase font-mono opacity-60 block">Status</span>
                      <p className="text-base font-bold mt-1 text-emerald-600 dark:text-emerald-400">Open to Roles</p>
                    </div>
                  </div>
                </section>
              );

            case 'skills':
              return (
                <section key="skills" id="skills" className="space-y-4 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Competencies</span>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Skills & Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {about.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors hover:border-current"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key="projects" id="projects" className="space-y-8 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Portfolio</span>
                      <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                        Selected Work
                      </h2>
                    </div>
                    <span className="text-xs font-mono opacity-60">{projects.length} Projects</span>
                  </div>

                  <div className="space-y-12">
                    {projects.map((project, idx) => (
                      <div 
                        key={project.id || idx}
                        className="group border rounded-2xl overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-200 hover:shadow-lg"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {project.image && (
                          <div className="overflow-hidden rounded-xl h-64 md:h-80 w-full relative bg-stone-200 dark:bg-stone-800">
                            <img
                              src={project.image}
                              alt={project.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xl md:text-2xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                              {project.name}
                            </h3>
                            <span className="text-xs font-mono opacity-70 px-2.5 py-1 rounded bg-black/5 dark:bg-white/5">
                              {project.role}
                            </span>
                          </div>

                          <p className="text-sm md:text-base opacity-80 leading-relaxed">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tools?.map((tool, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded text-[11px] font-mono opacity-70 border"
                                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                              >
                                {tool}
                              </span>
                            ))}
                          </div>

                          <div className="pt-4 flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => onOpenCaseStudy(project)}
                              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                              style={{
                                backgroundColor: design.primaryColor || '#2D4B3E',
                                color: '#FFFFFF',
                              }}
                            >
                              <span>Read Case Study</span>
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                            </button>

                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
                                style={{ borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}
                              >
                                <span>Live Demo</span>
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'experience':
              return (
                <section key="experience" id="experience" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Career</span>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Experience
                  </h2>

                  <div className="space-y-6 pt-2">
                    {experience.map((exp, idx) => (
                      <div 
                        key={exp.id || idx}
                        className="p-5 rounded-xl border space-y-2 transition-colors"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <div className="flex flex-wrap justify-between items-baseline gap-2">
                          <h3 className="font-bold text-base md:text-lg">{exp.role}</h3>
                          <span className="text-xs font-mono opacity-60">{exp.startDate} — {exp.currentPosition ? 'Present' : exp.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: design.primaryColor }}>
                          <span>{exp.company}</span>
                          <span>•</span>
                          <span className="opacity-70 font-normal">{exp.location}</span>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'education':
              return (
                <section key="education" id="education" className="space-y-4 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Background</span>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Education
                  </h2>
                  <div className="space-y-4 pt-2">
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="border-l-2 pl-4 space-y-1" style={{ borderColor: design.primaryColor }}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-sm md:text-base">{edu.degree} in {edu.field}</h3>
                          <span className="text-xs font-mono opacity-60">{edu.startDate} - {edu.endDate}</span>
                        </div>
                        <p className="text-xs font-semibold opacity-80">{edu.institution}</p>
                        {edu.description && <p className="text-xs opacity-70 pt-1">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'services':
              return (
                <section key="services" id="services" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Offerings</span>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Services
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {services.map((serv, idx) => (
                      <div 
                        key={serv.id || idx}
                        className="p-5 rounded-xl border space-y-2"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${design.primaryColor}20`, color: design.primaryColor }}>
                          <span className="material-symbols-outlined text-lg">{serv.icon || 'design_services'}</span>
                        </div>
                        <h3 className="font-bold text-base">{serv.title}</h3>
                        <p className="text-xs md:text-sm opacity-75 leading-relaxed">{serv.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'testimonials':
              return (
                <section key="testimonials" id="testimonials" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Endorsements</span>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    What Colleagues & Clients Say
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {testimonials.map((test, idx) => (
                      <div 
                        key={test.id || idx}
                        className="p-6 rounded-2xl border space-y-4 relative"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        <span className="text-4xl opacity-20 font-serif leading-none block">“</span>
                        <p className="text-sm italic opacity-85 leading-relaxed -mt-4">
                          {test.testimonial}
                        </p>
                        <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                          {test.profileImage && (
                            <img src={test.profileImage} alt={test.clientName} className="w-10 h-10 rounded-full object-cover" />
                          )}
                          <div>
                            <p className="font-bold text-xs">{test.clientName}</p>
                            <p className="text-[11px] opacity-60">{test.role}, {test.company}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-6 pt-12 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-60">Get In Touch</span>
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Let's Connect
                  </h2>
                  <p className="text-base md:text-lg opacity-80 max-w-xl">
                    {contact.contactCta || 'Interested in collaborating or discussing new design and engineering opportunities?'}
                  </p>

                  <div className="p-6 md:p-8 rounded-2xl border space-y-4 max-w-lg" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)' }}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg" style={{ color: design.primaryColor }}>mail</span>
                      <a href={`mailto:${contact.email}`} className="text-sm md:text-base font-bold hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg" style={{ color: design.primaryColor }}>call</span>
                        <span className="text-sm opacity-80">{contact.phone}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg" style={{ color: design.primaryColor }}>location_on</span>
                        <span className="text-sm opacity-80">{contact.location}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                      {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:opacity-70">LinkedIn ↗</a>}
                      {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:opacity-70">GitHub ↗</a>}
                      {social.dribbble && <a href={social.dribbble} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:opacity-70">Dribbble ↗</a>}
                      {social.x && <a href={social.x} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:opacity-70">X ↗</a>}
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
      <footer className="max-w-4xl mx-auto px-6 md:px-12 py-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <p>© {new Date().getFullYear()} {hero.name}. All rights reserved.</p>
        {!portfolio.settings?.removeBranding && (
          <p className="flex items-center gap-1">
            <span>Built with</span>
            <span className="font-bold tracking-wider text-primary">LEVELUP</span>
          </p>
        )}
      </footer>
    </div>
  );
};
