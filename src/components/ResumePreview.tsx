import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  resume: ResumeData;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, previewRef }) => {
  const personal = resume?.personal || { firstName: '', lastName: '', title: '', email: '', phone: '', location: '' };
  const summary = resume?.summary || '';
  const experience = resume?.experience || [];
  const projects = resume?.projects || [];
  const education = resume?.education || [];
  const skills = resume?.skills || [];
  const certifications = resume?.certifications || [];
  const achievements = resume?.achievements || [];
  const template = resume?.template || 'minimal';

  const fullName = `${personal.firstName || ''} ${personal.lastName || ''}`.trim() || 'Your Name';

  // 1. MINIMAL TEMPLATE
  if (template === 'minimal') {
    return (
      <div
        ref={previewRef}
        id="resume-paper"
        className="w-full max-w-[800px] min-h-[1050px] bg-white text-[#1A1C1A] p-12 sm:p-14 shadow-lg border border-outline-variant/40 rounded-sm font-sans flex flex-col justify-between"
      >
        <div className="space-y-6">
          {/* Header */}
          <header className="border-b border-[#1A1C1A]/20 pb-5 text-center">
            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#1A1C1A] uppercase font-normal">
              {fullName}
            </h1>
            {personal.title && (
              <p className="text-xs tracking-widest uppercase font-semibold text-[#3D5A44] mt-1.5">
                {personal.title}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#555] mt-2 font-mono">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>• {personal.phone}</span>}
              {personal.location && <span>• {personal.location}</span>}
              {personal.website && (
                <span>
                  • <a href={personal.website} className="underline text-[#3D5A44]">{personal.website.replace(/^https?:\/\//, '')}</a>
                </span>
              )}
              {personal.linkedin && <span>• {personal.linkedin}</span>}
              {personal.github && <span>• {personal.github}</span>}
            </div>
          </header>

          {/* Summary */}
          {summary && (
            <section className="text-sm leading-relaxed text-[#333]">
              <p>{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-sm">
                      <div>
                        <strong className="font-bold text-[#1A1C1A]">{exp.company}</strong>
                        {exp.role && <span className="text-[#555] font-medium"> — {exp.role}</span>}
                        {exp.location && <span className="text-xs text-[#777] ml-2">({exp.location})</span>}
                      </div>
                      <span className="text-xs text-[#777] font-mono whitespace-nowrap">
                        {exp.startDate || ''} {exp.startDate && (exp.endDate || exp.currentJob) ? '–' : ''} {exp.currentJob ? 'Present' : exp.endDate || exp.period || ''}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-[#444] italic mb-1">{exp.description}</p>
                    )}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-1 text-xs text-[#444] leading-relaxed">
                        {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-sm">
                      <div>
                        <strong className="font-bold text-[#1A1C1A]">{proj.name}</strong>
                        {proj.role && <span className="text-xs text-[#555]"> • {proj.role}</span>}
                      </div>
                      {proj.url && (
                        <a href={proj.url} className="text-xs text-[#3D5A44] underline font-mono">
                          {proj.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-[#444] leading-relaxed">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-[11px] text-[#666] font-mono">
                        Tech: {proj.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between text-sm">
                      <strong className="text-[#1A1C1A]">{edu.institution}</strong>
                      <span className="text-xs text-[#777] font-mono">
                        {edu.startDate} {edu.startDate && edu.endDate ? '–' : ''} {edu.endDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#444]">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </p>
                    {edu.description && <p className="text-xs text-[#666] mt-0.5">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.filter(Boolean).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#F4F4F2] border border-[#DDD] px-2.5 py-0.5 rounded text-[#222]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications & Achievements */}
          {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {certifications && certifications.length > 0 && (
                <section className="space-y-1.5">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                    Certifications
                  </h2>
                  <ul className="space-y-1 text-xs text-[#444]">
                    {certifications.map((c) => (
                      <li key={c.id}>
                        <strong>{c.name}</strong> — {c.issuer} {c.date && `(${c.date})`}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {achievements && achievements.length > 0 && (
                <section className="space-y-1.5">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1C1A] border-b border-[#1A1C1A]/15 pb-1">
                    Achievements
                  </h2>
                  <ul className="space-y-1 text-xs text-[#444]">
                    {achievements.map((a) => (
                      <li key={a.id}>
                        <strong>{a.title}</strong>: {a.description}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. PROFESSIONAL TEMPLATE
  if (template === 'professional') {
    return (
      <div
        ref={previewRef}
        id="resume-paper"
        className="w-full max-w-[800px] min-h-[1050px] bg-white text-[#111827] p-12 sm:p-14 shadow-lg border-t-8 border-t-[#1E3A8A] border border-outline-variant/40 rounded-sm font-serif"
      >
        <div className="space-y-6">
          <header className="border-b-2 border-[#1E3A8A]/20 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] tracking-tight">{fullName}</h1>
            {personal.title && <p className="text-sm font-sans uppercase font-bold text-[#4B5563] mt-1">{personal.title}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4B5563] font-sans mt-2">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>• {personal.phone}</span>}
              {personal.location && <span>• {personal.location}</span>}
              {personal.website && <span>• {personal.website}</span>}
              {personal.linkedin && <span>• {personal.linkedin}</span>}
            </div>
          </header>

          {summary && (
            <section className="text-sm leading-relaxed text-[#374151] font-sans italic border-l-4 border-[#1E3A8A]/40 pl-4 py-1">
              <p>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-sans uppercase font-bold tracking-wider text-[#1E3A8A] border-b border-[#1E3A8A]/20 pb-1">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-sans">
                      <strong className="text-sm font-bold text-[#111827]">{exp.role}</strong>
                      <span className="text-xs text-[#6B7280]">
                        {exp.startDate} {exp.startDate && (exp.endDate || exp.currentJob) ? '–' : ''} {exp.currentJob ? 'Present' : exp.endDate || exp.period || ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5563] font-sans font-medium">
                      {exp.company} {exp.location ? `| ${exp.location}` : ''}
                    </p>
                    {exp.description && <p className="text-xs text-[#374151] font-sans mt-1">{exp.description}</p>}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-1 text-xs font-sans text-[#374151] leading-relaxed mt-1">
                        {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects && projects.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-sans uppercase font-bold tracking-wider text-[#1E3A8A] border-b border-[#1E3A8A]/20 pb-1">
                Key Projects
              </h2>
              <div className="space-y-3 font-sans">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between text-xs font-bold text-[#111827]">
                      <span>{proj.name} {proj.role ? `(${proj.role})` : ''}</span>
                      {proj.url && <span className="text-[#1E3A8A] font-normal underline">{proj.url}</span>}
                    </div>
                    <p className="text-xs text-[#4B5563] mt-0.5">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-[11px] text-[#6B7280] mt-0.5 font-medium">
                        Technologies: {proj.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education && education.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-sans uppercase font-bold tracking-wider text-[#1E3A8A] border-b border-[#1E3A8A]/20 pb-1">
                Education & Credentials
              </h2>
              <div className="space-y-2 font-sans">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-xs">
                    <div>
                      <strong className="text-[#111827]">{edu.degree} in {edu.fieldOfStudy}</strong>
                      <p className="text-[#6B7280]">{edu.institution}</p>
                    </div>
                    <span className="text-[#6B7280]">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills && skills.length > 0 && (
            <section className="space-y-2 font-sans">
              <h2 className="text-sm uppercase font-bold tracking-wider text-[#1E3A8A] border-b border-[#1E3A8A]/20 pb-1">
                Expertise & Core Competencies
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.filter(Boolean).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#EFF6FF] text-[#1E3A8A] font-semibold px-2.5 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // 3. TECH TEMPLATE
  if (template === 'tech') {
    return (
      <div
        ref={previewRef}
        id="resume-paper"
        className="w-full max-w-[800px] min-h-[1050px] bg-[#0F172A] text-[#F8FAFC] p-10 sm:p-12 shadow-2xl border border-slate-700 rounded-lg font-mono text-xs"
      >
        <div className="space-y-6">
          {/* Terminal-style header */}
          <header className="border-b border-slate-700 pb-5">
            <div className="text-emerald-400 font-bold text-xl sm:text-2xl tracking-tight">
              &gt; {fullName}
            </div>
            <p className="text-slate-400 text-sm mt-1">{personal.title}</p>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
              {personal.email && <span className="text-sky-400">email: {personal.email}</span>}
              {personal.location && <span>loc: {personal.location}</span>}
              {personal.github && <span className="text-purple-400">github: {personal.github}</span>}
              {personal.website && <span className="text-emerald-400">web: {personal.website}</span>}
            </div>
          </header>

          {summary && (
            <section className="bg-slate-900/80 p-4 rounded border border-slate-800 text-slate-300 leading-relaxed">
              <span className="text-slate-500 block mb-1 font-bold">// ABOUT</span>
              {summary}
            </section>
          )}

          {/* Skills Grid */}
          {skills && skills.length > 0 && (
            <section className="space-y-2">
              <div className="text-emerald-400 font-bold uppercase tracking-wider">// TECH STACK</div>
              <div className="flex flex-wrap gap-1.5">
                {skills.filter(Boolean).map((skill, idx) => (
                  <span key={idx} className="bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="space-y-4">
              <div className="text-emerald-400 font-bold uppercase tracking-wider">// EXPERIENCE</div>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="bg-slate-900/60 p-3.5 rounded border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-slate-100 font-bold text-sm">{exp.role} @ {exp.company}</strong>
                      <span className="text-slate-400 text-[10px]">
                        {exp.startDate} - {exp.currentJob ? 'PRESENT' : exp.endDate || exp.period}
                      </span>
                    </div>
                    {exp.description && <p className="text-slate-400 italic">{exp.description}</p>}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="space-y-1 text-slate-300 pl-3 border-l-2 border-slate-700">
                        {exp.bullets.filter(Boolean).map((b, bIdx) => (
                          <li key={bIdx}>* {b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="space-y-3">
              <div className="text-emerald-400 font-bold uppercase tracking-wider">// PROJECTS</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-sky-300">
                      <span>{proj.name}</span>
                      {proj.url && <span className="text-[10px] underline">{proj.url.replace(/^https?:\/\//, '')}</span>}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-[10px] text-purple-300 font-bold">
                        [{proj.technologies.join(', ')}]
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="space-y-2">
              <div className="text-emerald-400 font-bold uppercase tracking-wider">// EDUCATION</div>
              <div className="space-y-1">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-slate-300">
                    <span>{edu.degree} in {edu.fieldOfStudy}, {edu.institution}</span>
                    <span className="text-slate-500">{edu.endDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // 4. MODERN TEMPLATE (DEFAULT)
  return (
    <div
      ref={previewRef}
      id="resume-paper"
      className="w-full max-w-[800px] min-h-[1050px] bg-white text-[#1A1C1A] p-10 sm:p-12 shadow-xl border border-outline-variant/40 rounded-sm font-sans flex flex-col justify-between"
    >
      <div className="space-y-6">
        {/* Modern Header with Badge */}
        <header className="bg-[#FAF9F6] border border-[#E4E2DC] p-6 rounded-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D5A44] bg-[#3D5A44]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Curriculum Vitae
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] tracking-tight uppercase">
                {fullName}
              </h1>
              <p className="text-sm font-semibold text-[#3D5A44] mt-0.5">{personal.title}</p>
            </div>
            <div className="text-xs text-[#555] space-y-1 text-left sm:text-right font-medium">
              {personal.email && <p>{personal.email}</p>}
              {personal.phone && <p>{personal.phone}</p>}
              {personal.location && <p>{personal.location}</p>}
              {personal.website && <p className="text-[#3D5A44] underline">{personal.website.replace(/^https?:\/\//, '')}</p>}
            </div>
          </div>
        </header>

        {summary && (
          <section className="text-sm leading-relaxed text-[#333] px-1">
            <p>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-2">
              <span className="w-2 h-2 rounded-full bg-[#3D5A44]"></span>
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#1A1C1A]">Experience</h2>
            </div>
            <div className="space-y-4 pl-3 border-l-2 border-[#3D5A44]/20">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1 relative">
                  <div className="flex justify-between items-baseline text-sm">
                    <div>
                      <strong className="font-bold text-[#1A1C1A]">{exp.role}</strong>
                      <span className="text-[#666] font-medium"> • {exp.company}</span>
                    </div>
                    <span className="text-xs bg-[#FAF9F6] border border-[#E4E2DC] px-2 py-0.5 rounded text-[#555] font-mono">
                      {exp.startDate} {exp.startDate && (exp.endDate || exp.currentJob) ? '–' : ''} {exp.currentJob ? 'Present' : exp.endDate || exp.period || ''}
                    </span>
                  </div>
                  {exp.description && <p className="text-xs text-[#555] italic">{exp.description}</p>}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1 text-xs text-[#444] leading-relaxed pt-1">
                      {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-2">
              <span className="w-2 h-2 rounded-full bg-[#3D5A44]"></span>
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#1A1C1A]">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#FAF9F6] border border-[#E4E2DC] p-3.5 rounded-lg space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="text-xs font-bold text-[#1A1C1A]">{proj.name}</strong>
                    {proj.url && (
                      <a href={proj.url} className="text-[10px] text-[#3D5A44] underline font-mono">
                        View ↗
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#555] leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-[#DDD] px-1.5 py-0.2 rounded text-[#444]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-2">
              <span className="w-2 h-2 rounded-full bg-[#3D5A44]"></span>
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#1A1C1A]">Core Competencies</h2>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.filter(Boolean).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#3D5A44]/10 text-[#3D5A44] font-semibold px-2.5 py-1 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Education & Credentials */}
        {education && education.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-2">
              <span className="w-2 h-2 rounded-full bg-[#3D5A44]"></span>
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#1A1C1A]">Education</h2>
            </div>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start text-xs">
                  <div>
                    <strong className="text-sm font-bold text-[#1A1C1A]">{edu.institution}</strong>
                    <p className="text-[#555]">{edu.degree} in {edu.fieldOfStudy}</p>
                    {edu.description && <p className="text-[#777] mt-0.5">{edu.description}</p>}
                  </div>
                  <span className="text-[#777] font-mono">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
