import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';

export const CreatorBrandPage: React.FC = () => {
  const { state, updateBrandKit } = useApp();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const brand = state.creator.brandKit;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleSaveGuidelines = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1200);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="creator" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-stack-lg px-4 sm:px-6 lg:px-margin-desktop bg-background min-h-screen overflow-y-auto w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          {/* Header */}
          <header className="mb-stack-lg flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-outline-variant pb-4 gap-4">
            <div>
              <h2 className="font-display-xl text-primary leading-tight">Brand Kit</h2>
              <p className="text-on-surface-variant font-body-md">Manage your creator identity.</p>
            </div>
            <button
              onClick={handleSaveGuidelines}
              className="bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps uppercase text-xs hover:bg-primary transition-colors cursor-pointer"
            >
              {saveSuccess ? 'Guidelines Saved!' : 'Save Guidelines'}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-stack-md">
              {/* Logo Assets */}
              <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-sm">
                <h3 className="font-headline-sm text-primary mb-6">Logo Assets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-outline-variant rounded-xl h-48 flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer p-4 text-center group">
                    <span className="material-symbols-outlined text-4xl mb-2 text-primary group-hover:scale-110 transition-transform">
                      upload_file
                    </span>
                    <span className="text-xs uppercase font-label-caps text-on-surface font-bold">
                      {brand.primaryLogoName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1">SVG, PNG (Max 5MB)</span>
                  </div>

                  <div className="border-2 border-dashed border-outline-variant rounded-xl h-48 flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer p-4 text-center group">
                    <span className="material-symbols-outlined text-4xl mb-2 text-primary group-hover:scale-110 transition-transform">
                      upload_file
                    </span>
                    <span className="text-xs uppercase font-label-caps text-on-surface font-bold">
                      {brand.logomarkName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1">Vector Icon & Favicon</span>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-sm text-primary">Color Palette</h3>
                  <span className="text-xs text-on-surface-variant">Click swatch to copy HEX</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {brand.colors.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopyHex(c.hex)}
                      className="cursor-pointer group"
                    >
                      <div
                        className="h-20 rounded-lg border border-outline-variant/40 mb-2 transition-transform group-hover:scale-105 shadow-xs relative flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {copiedHex === c.hex && (
                          <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Copied!
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold block text-on-surface">{c.name}</span>
                      <span className="text-[10px] block font-mono text-on-surface-variant font-medium">
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-stack-md">
              {/* Typography */}
              <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-sm">
                <h3 className="font-headline-sm text-primary mb-6">Typography</h3>
                <div className="space-y-6">
                  <div className="border-b border-outline-variant/40 pb-4">
                    <p className="text-xs text-on-surface-variant uppercase font-label-caps">
                      Display / {brand.displayFont}
                    </p>
                    <p className="font-display-lg text-primary mt-1">Aa</p>
                    <p className="text-xs text-on-surface-variant mt-1">Used for major headlines and milestones</p>
                  </div>

                  <div className="border-b border-outline-variant/40 pb-4">
                    <p className="text-xs text-on-surface-variant uppercase font-label-caps">
                      Headline / {brand.headlineFont}
                    </p>
                    <p className="font-headline-sm text-primary mt-1 font-bold text-2xl">Aa</p>
                    <p className="text-xs text-on-surface-variant mt-1">Used for cards, sections, and callouts</p>
                  </div>

                  <div>
                    <p className="text-xs text-on-surface-variant uppercase font-label-caps">
                      Body / {brand.bodyFont}
                    </p>
                    <p className="text-base text-on-surface mt-1 font-normal">
                      Sphinx of black quartz, judge my vow. (16px / 24px line height)
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Voice Guide */}
              <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-sm">
                <h3 className="font-headline-sm text-primary mb-3">Tone of Voice</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Direct, disciplined, minimalist, and action-oriented. We favor clarity over buzzwords, compound daily execution over quick fixes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container-high text-xs px-2.5 py-1 rounded font-bold">Scientific</span>
                  <span className="bg-surface-container-high text-xs px-2.5 py-1 rounded font-bold">Minimalist</span>
                  <span className="bg-surface-container-high text-xs px-2.5 py-1 rounded font-bold">High-Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
