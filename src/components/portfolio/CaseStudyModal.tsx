import React from 'react';
import { PortfolioProject, PortfolioDesign } from '../../types';

interface CaseStudyModalProps {
  project: PortfolioProject | null;
  design: PortfolioDesign;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, design, onClose }) => {
  if (!project) return null;

  const caseStudy = project.caseStudy;
  const isDark = design.mode === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fade-up border"
        style={{
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          color: isDark ? '#F4F4F5' : '#18181B',
          borderColor: isDark ? '#27272A' : '#E4E4E7',
          fontFamily: design.fontBody || 'sans-serif',
        }}
      >
        {/* Header Bar */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-20 backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? '#27272A' : '#E4E4E7',
          }}
        >
          <div>
            <span 
              className="text-[11px] font-mono uppercase tracking-wider font-bold block"
              style={{ color: design.primaryColor || '#2D4B3E' }}
            >
              Case Study Breakdown
            </span>
            <h3 
              className="text-lg md:text-xl font-bold"
              style={{ fontFamily: design.fontHeading || 'serif' }}
            >
              {project.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              backgroundColor: isDark ? '#27272A' : '#F4F4F5',
              color: isDark ? '#F4F4F5' : '#18181B',
            }}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-8">
          {/* Main Hero Visual & Meta */}
          <div>
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-md mb-6"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: isDark ? '#27272A' : '#E4E4E7' }}>
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-widest block font-medium">My Role</span>
                <p className="font-semibold text-sm md:text-base">{project.role || 'Lead Product Designer'}</p>
              </div>

              <div>
                <span className="text-xs text-stone-500 uppercase tracking-widest block font-medium">Tools & Technologies</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.tools?.map((tool, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium"
                      style={{
                        backgroundColor: isDark ? '#27272A' : '#F4F4F5',
                        color: isDark ? '#E4E4E7' : '#3F3F46',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform hover:scale-105"
                  style={{
                    backgroundColor: design.primaryColor || '#2D4B3E',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Live Project</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </a>
              )}
            </div>
          </div>

          {/* Project Summary */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-2 font-bold">Executive Overview</h4>
            <p className="text-base md:text-lg leading-relaxed text-stone-700 dark:text-stone-300">
              {project.description}
            </p>
          </div>

          {/* Structured Case Study Modules */}
          {caseStudy ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* 1. Problem */}
              {caseStudy.problem && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>1</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">The Challenge & Problem</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.problem}</p>
                </div>
              )}

              {/* 2. Research */}
              {caseStudy.research && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>2</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">User Research & Discovery</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.research}</p>
                </div>
              )}

              {/* 3. Process */}
              {caseStudy.process && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>3</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">Process & Methodology</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.process}</p>
                </div>
              )}

              {/* 4. Wireframes & Architecture */}
              {caseStudy.wireframes && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>4</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">Information Architecture</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.wireframes}</p>
                </div>
              )}

              {/* 5. Design & Execution */}
              {caseStudy.design && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>5</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">Design Craft & UI Systems</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.design}</p>
                </div>
              )}

              {/* 6. Shipped Solution */}
              {caseStudy.solution && (
                <div 
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: design.primaryColor, color: '#fff' }}>6</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">Shipped Solution</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.solution}</p>
                </div>
              )}

              {/* 7. Measurable Results (Full Width Highlight) */}
              {caseStudy.results && (
                <div 
                  className="col-span-1 md:col-span-2 p-6 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? 'rgba(45, 75, 62, 0.2)' : 'rgba(45, 75, 62, 0.05)',
                    borderColor: design.primaryColor || '#2D4B3E',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-xl" style={{ color: design.primaryColor }}>trending_up</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide" style={{ color: design.primaryColor }}>Measurable Impact & Results</h5>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed font-medium">{caseStudy.results}</p>
                </div>
              )}

              {/* 8. Retrospective Learnings */}
              {caseStudy.learnings && (
                <div 
                  className="col-span-1 md:col-span-2 p-5 rounded-xl border"
                  style={{
                    backgroundColor: isDark ? '#202024' : '#FDFCFB',
                    borderColor: isDark ? '#2D2D32' : '#ECE8E1',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg text-stone-400">lightbulb</span>
                    <h5 className="font-bold text-sm uppercase tracking-wide">Key Takeaways & Retrospective</h5>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{caseStudy.learnings}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed rounded-xl text-stone-500 text-sm">
              No detailed case study breakdown provided for this project.
            </div>
          )}

          {/* Additional Project Gallery */}
          {project.additionalImages && project.additionalImages.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-4 font-bold">Project Gallery</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.additionalImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${project.name} artifact ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border shadow-sm"
                    style={{ borderColor: isDark ? '#27272A' : '#E4E4E7' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex justify-end items-center"
          style={{
            backgroundColor: isDark ? '#1C1C1F' : '#F9F8F6',
            borderColor: isDark ? '#27272A' : '#E4E4E7',
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
            style={{
              backgroundColor: isDark ? '#27272A' : '#E4E4E7',
              color: isDark ? '#F4F4F5' : '#18181B',
            }}
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
};
