import React from 'react';
import { PortfolioItem, PortfolioProject } from '../../../types';

interface TemplateProps {
  portfolio: PortfolioItem;
  onOpenCaseStudy: (project: PortfolioProject) => void;
  isStandalone?: boolean;
}

export const DesignerPortfolioTemplate: React.FC<TemplateProps> = ({ portfolio, onOpenCaseStudy }) => {
  const { hero, about, projects, experience, education, services, testimonials, contact, social, design, sections } = portfolio;
  const isDark = design.mode === 'dark';

  const isEnabled = (key: string) => sections.find((s) => s.id === key)?.enabled !== false;
  const sortedSections = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  const getButtonStyle = () => {
    switch (design.buttonStyle) {
      case 'pill': return 'rounded-full px-6 py-3';
      case 'square': return 'rounded-none px-6 py-3';
      case 'minimal': return 'border-b-2 rounded-none px-2 py-1 bg-transparent';
      default: return 'rounded-xl px-6 py-3';
    }
  };

  return (
    <div 
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: design.backgroundColor || (isDark ? '#0C0D0E' : '#F7F6F2'),
        color: design.textColor || (isDark ? '#F5F5F7' : '#1A1A1D'),
        fontFamily: design.fontBody || 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-lg border-b px-6 md:px-16 py-4 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? 'rgba(12, 13, 14, 0.85)' : 'rgba(247, 246, 242, 0.85)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          {hero.profileImage && (
            <img src={hero.profileImage} alt={hero.name} className="w-8 h-8 rounded-full object-cover border" />
          )}
          <a href="#hero" className="font-bold text-sm tracking-tight" style={{ fontFamily: design.fontHeading || 'serif' }}>
            {hero.name}
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider font-semibold opacity-75">
          {isEnabled('about') && <a href="#about" className="hover:opacity-100 transition-opacity">About</a>}
          {isEnabled('projects') && <a href="#projects" className="hover:opacity-100 transition-opacity">Work ({projects.length})</a>}
          {isEnabled('services') && <a href="#services" className="hover:opacity-100 transition-opacity">Services</a>}
          {isEnabled('experience') && <a href="#experience" className="hover:opacity-100 transition-opacity">Career</a>}
          {isEnabled('contact') && <a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a>}
        </nav>

        <a
          href={hero.ctaLink || '#contact'}
          className={`text-xs font-bold uppercase tracking-wider shadow-md transition-transform hover:scale-105 ${getButtonStyle()}`}
          style={{
            backgroundColor: design.primaryColor || '#2D4B3E',
            color: '#FFFFFF',
          }}
        >
          {hero.ctaText || 'Get in Touch'}
        </a>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-28">
        {sortedSections.map((sectionConfig) => {
          switch (sectionConfig.id) {
            case 'hero':
              return (
                <section key="hero" id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold" style={{ borderColor: `${design.primaryColor}40`, backgroundColor: `${design.primaryColor}10`, color: design.primaryColor }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: design.primaryColor }}></span>
                      <span>{hero.title || 'Product Designer & Design Technologist'}</span>
                    </div>

                    <h1 
                      className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
                      style={{ fontFamily: design.fontHeading || 'serif' }}
                    >
                      {hero.name}
                    </h1>

                    <p className="text-xl md:text-2xl font-medium opacity-90 leading-snug">
                      {hero.tagline || 'Crafting transformative digital experiences and scalable design systems.'}
                    </p>

                    <p className="text-base opacity-75 leading-relaxed max-w-xl">
                      {hero.introduction}
                    </p>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                      <a
                        href={hero.ctaLink || '#projects'}
                        className={`text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5 ${getButtonStyle()}`}
                        style={{
                          backgroundColor: design.primaryColor || '#2D4B3E',
                          color: '#FFFFFF',
                        }}
                      >
                        <span>{hero.ctaText || 'View Projects'}</span>
                        <span className="material-symbols-outlined text-[16px]">south</span>
                      </a>

                      <a
                        href="#about"
                        className={`text-xs font-bold uppercase tracking-wider border transition-colors opacity-80 hover:opacity-100 ${getButtonStyle()}`}
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}
                      >
                        About My Practice
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div 
                      className="relative rounded-3xl overflow-hidden shadow-2xl border aspect-[4/5] bg-stone-300 dark:bg-stone-800 group"
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                    >
                      <img
                        src={hero.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'}
                        alt={hero.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-md bg-black/40 text-white border border-white/20">
                        <p className="text-xs uppercase font-mono tracking-wider font-semibold opacity-75">Design Philosophy</p>
                        <p className="text-sm font-medium mt-1">"Simplicity is the ultimate sophistication."</p>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>01 / About</span>
                    <h2 className="text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      {about.heading || 'Design Mindset'}
                    </h2>
                  </div>

                  <div className="md:col-span-8 space-y-6">
                    <p className="text-lg md:text-xl opacity-90 leading-relaxed font-light">
                      {about.bio}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6">
                      <div className="p-5 rounded-2xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <span className="text-xs font-mono uppercase opacity-60">Experience</span>
                        <p className="text-3xl font-bold mt-1" style={{ color: design.primaryColor }}>{about.yearsOfExperience}+ Yrs</p>
                      </div>
                      <div className="p-5 rounded-2xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <span className="text-xs font-mono uppercase opacity-60">Base Location</span>
                        <p className="text-lg font-bold mt-1 truncate">{about.location}</p>
                      </div>
                      <div className="p-5 rounded-2xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <span className="text-xs font-mono uppercase opacity-60">Focus</span>
                        <p className="text-base font-bold mt-1">Design Systems</p>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'skills':
              return (
                <section key="skills" id="skills" className="space-y-6 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>02 / Stack & Skills</span>
                    <span className="text-xs font-mono opacity-60">Core Expertise</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {about.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-semibold border shadow-sm transition-all hover:scale-105"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
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
                <section key="projects" id="projects" className="space-y-12 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>03 / Portfolio</span>
                      <h2 className="text-3xl md:text-4xl font-bold mt-1" style={{ fontFamily: design.fontHeading || 'serif' }}>
                        Selected Visual Case Studies
                      </h2>
                    </div>
                    <p className="text-xs font-mono opacity-60">Click any project to read the full case study</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project, idx) => (
                      <div 
                        key={project.id || idx}
                        onClick={() => onOpenCaseStudy(project)}
                        className="group cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          backgroundColor: isDark ? '#141518' : '#FFFFFF',
                        }}
                      >
                        {/* Image Preview */}
                        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                              <span>Read Case Study</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-xl md:text-2xl font-bold group-hover:underline" style={{ fontFamily: design.fontHeading || 'serif' }}>
                                {project.name}
                              </h3>
                              <span className="material-symbols-outlined text-stone-400 group-hover:text-current transition-colors">
                                north_east
                              </span>
                            </div>
                            <p className="text-xs font-mono font-medium opacity-60">{project.role}</p>
                            <p className="text-sm opacity-80 line-clamp-2 leading-relaxed">
                              {project.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                            {project.tools?.slice(0, 4).map((tool, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium"
                                style={{
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                }}
                              >
                                {tool}
                              </span>
                            ))}
                            {project.tools && project.tools.length > 4 && (
                              <span className="px-2 py-1 rounded-md text-[11px] font-mono opacity-60">
                                +{project.tools.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'services':
              return (
                <section key="services" id="services" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>04 / Capabilities</span>
                    <h2 className="text-3xl font-bold mt-1" style={{ fontFamily: design.fontHeading || 'serif' }}>
                      Design & Architecture Services
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((serv, idx) => (
                      <div 
                        key={serv.id || idx}
                        className="p-6 md:p-8 rounded-3xl border space-y-4 transition-all hover:shadow-lg"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? '#141518' : '#FFFFFF',
                        }}
                      >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${design.primaryColor}18`, color: design.primaryColor }}>
                          <span className="material-symbols-outlined text-2xl">{serv.icon || 'palette'}</span>
                        </div>
                        <h3 className="text-lg font-bold">{serv.title}</h3>
                        <p className="text-xs md:text-sm opacity-75 leading-relaxed">{serv.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'experience':
              return (
                <section key="experience" id="experience" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>05 / Career Trajectory</span>
                  <h2 className="text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Work Experience
                  </h2>

                  <div className="space-y-4">
                    {experience.map((exp, idx) => (
                      <div 
                        key={exp.id || idx}
                        className="p-6 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 transition-colors"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? '#141518' : '#FFFFFF',
                        }}
                      >
                        <div className="space-y-1 max-w-xl">
                          <h3 className="font-bold text-lg">{exp.role}</h3>
                          <p className="text-xs font-semibold" style={{ color: design.primaryColor }}>{exp.company} • <span className="opacity-70 font-normal">{exp.location}</span></p>
                          <p className="text-sm opacity-80 pt-2 leading-relaxed">{exp.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            {exp.startDate} — {exp.currentPosition ? 'Present' : exp.endDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'testimonials':
              return (
                <section key="testimonials" id="testimonials" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>06 / Endorsements</span>
                  <h2 className="text-3xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                    Client & Team Testimonials
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((test, idx) => (
                      <div 
                        key={test.id || idx}
                        className="p-8 rounded-3xl border space-y-4"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          backgroundColor: isDark ? '#141518' : '#FFFFFF',
                        }}
                      >
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[18px] fill-icon">star</span>
                          ))}
                        </div>
                        <p className="text-sm md:text-base italic opacity-90 leading-relaxed font-light">
                          "{test.testimonial}"
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                          {test.profileImage && (
                            <img src={test.profileImage} alt={test.clientName} className="w-11 h-11 rounded-full object-cover border" />
                          )}
                          <div>
                            <p className="font-bold text-sm">{test.clientName}</p>
                            <p className="text-xs opacity-60">{test.role}, {test.company}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key="contact" id="contact" className="space-y-8 pt-16 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <div className="p-8 md:p-12 rounded-3xl border space-y-8 relative overflow-hidden" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? '#141518' : '#FFFFFF' }}>
                    <div className="max-w-2xl space-y-4">
                      <span className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: design.primaryColor }}>07 / Get In Touch</span>
                      <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: design.fontHeading || 'serif' }}>
                        Let's collaborate on your next design system or product.
                      </h2>
                      <p className="text-base opacity-75">
                        {contact.contactCta || 'I am currently available for select advisory, contract, and full-time leadership opportunities.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className={`text-sm font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 ${getButtonStyle()}`}
                        style={{
                          backgroundColor: design.primaryColor || '#2D4B3E',
                          color: '#FFFFFF',
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        <span>{contact.email}</span>
                      </a>

                      {contact.phone && (
                        <span className="text-sm font-mono opacity-80 px-4 py-2 border rounded-xl" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                          {contact.phone}
                        </span>
                      )}
                    </div>

                    <div className="pt-6 border-t flex flex-wrap items-center gap-6" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                      {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:underline">LinkedIn ↗</a>}
                      {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:underline">GitHub ↗</a>}
                      {social.dribbble && <a href={social.dribbble} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:underline">Dribbble ↗</a>}
                      {social.x && <a href={social.x} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:underline">X ↗</a>}
                      {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold hover:underline">Instagram ↗</a>}
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
      <footer className="max-w-6xl mx-auto px-6 md:px-16 py-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono opacity-60" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <p>© {new Date().getFullYear()} {hero.name}. Designed with precision.</p>
        {!portfolio.settings?.removeBranding && (
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-bold tracking-wider text-primary">LEVELUP</span>
          </p>
        )}
      </footer>
    </div>
  );
};
