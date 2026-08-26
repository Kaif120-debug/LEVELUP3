import React from 'react';
import { PortfolioItem, PortfolioTemplate, PortfolioDesign } from '../../types';

interface DesignPanelProps {
  portfolio: PortfolioItem;
  onChange: (updates: Partial<PortfolioItem>) => void;
  isPro?: boolean;
}

const TEMPLATES: { id: PortfolioTemplate; name: string; tag: string; description: string; previewBg: string; previewAccent: string }[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    tag: 'Swiss Precision',
    description: 'Ultra clean typography, generous whitespace, subtle dividers, refined hierarchy.',
    previewBg: '#FBF9F5',
    previewAccent: '#2D4B3E',
  },
  {
    id: 'designer',
    name: 'Designer',
    tag: 'Visual First',
    description: 'High-impact case studies, visual hero split, floating badges, interactive hover states.',
    previewBg: '#F7F6F2',
    previewAccent: '#2D4B3E',
  },
  {
    id: 'developer',
    name: 'Developer',
    tag: 'Terminal Dark',
    description: 'Monochrome/terminal code aesthetic, repository badges, architecture logs, stack pills.',
    previewBg: '#0B0F17',
    previewAccent: '#10B981',
  },
  {
    id: 'creative',
    name: 'Creative',
    tag: 'Bold & Expressive',
    description: 'Vibrant accent cards, large display typography, energetic asymmetrical layouts.',
    previewBg: '#FAF8F5',
    previewAccent: '#E11D48',
  },
  {
    id: 'professional',
    name: 'Professional',
    tag: 'Executive Corporate',
    description: 'Structured leadership trajectory, board endorsements, measurable ROI metrics.',
    previewBg: '#FFFFFF',
    previewAccent: '#1E3A8A',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tag: 'Publishing & Essays',
    description: 'Magazine masthead, elegant serif headlines, narrative case studies, refined article pacing.',
    previewBg: '#F9F7F1',
    previewAccent: '#1C1A17',
  },
];

const COLOR_PRESETS = [
  { name: 'LEVELUP Forest', primary: '#2D4B3E', secondary: '#C48A44', bg: '#FBF9F5' },
  { name: 'Monochrome Obsidian', primary: '#18181B', secondary: '#71717A', bg: '#FAFAFA' },
  { name: 'Terminal Emerald', primary: '#10B981', secondary: '#059669', bg: '#0B0F17' },
  { name: 'Executive Navy', primary: '#1E3A8A', secondary: '#3B82F6', bg: '#FFFFFF' },
  { name: 'Crimson Creative', primary: '#E11D48', secondary: '#F43F5E', bg: '#FAF8F5' },
  { name: 'Warm Terracotta', primary: '#C2410C', secondary: '#EA580C', bg: '#FFFDF9' },
];

export const PortfolioDesignPanel: React.FC<DesignPanelProps> = ({ portfolio, onChange }) => {
  const { design, template } = portfolio;

  const updateDesign = (updates: Partial<PortfolioDesign>) => {
    onChange({ design: { ...design, ...updates } });
  };

  const handleSelectTemplate = (selectedTemplate: PortfolioTemplate) => {
    let modeUpdates: Partial<PortfolioDesign> = {};
    if (selectedTemplate === 'developer') {
      modeUpdates = {
        mode: 'dark',
        backgroundColor: '#0B0F17',
        textColor: '#E2E8F0',
        primaryColor: '#10B981',
        fontHeading: 'JetBrains Mono',
        fontBody: 'JetBrains Mono',
      };
    } else if (selectedTemplate === 'editorial') {
      modeUpdates = {
        mode: 'light',
        backgroundColor: '#F9F7F1',
        textColor: '#1C1A17',
        primaryColor: '#1C1A17',
        fontHeading: 'Playfair Display',
        fontBody: 'Newsreader',
      };
    } else if (selectedTemplate === 'creative') {
      modeUpdates = {
        primaryColor: '#E11D48',
      };
    }
    onChange({ template: selectedTemplate, design: { ...design, ...modeUpdates } });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Template Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-foreground">Select Website Template</h3>
          <span className="text-xs font-mono text-muted-foreground">{TEMPLATES.length} Styles Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((tmpl) => {
            const isSelected = template === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-muted-foreground/40 hover:bg-secondary/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      {tmpl.name}
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {tmpl.tag}
                    </span>
                  </div>

                  {/* Mini visual mockup bar */}
                  <div 
                    className="h-10 w-full rounded-lg border p-1.5 flex items-center justify-between"
                    style={{ backgroundColor: tmpl.previewBg, borderColor: 'rgba(0,0,0,0.1)' }}
                  >
                    <div className="w-12 h-2 rounded-full" style={{ backgroundColor: tmpl.previewAccent }}></div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                      <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                      <div className="w-4 h-2 rounded-full" style={{ backgroundColor: tmpl.previewAccent }}></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palette & Presets */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Color Palette</h3>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() =>
                updateDesign({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  backgroundColor: preset.bg,
                })
              }
              className="p-2 rounded-lg border border-border bg-card hover:bg-secondary text-left flex items-center gap-2 transition-colors"
            >
              <span className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs border" style={{ backgroundColor: preset.primary }}></span>
              <span className="text-[11px] font-medium text-foreground truncate">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-mono text-muted-foreground block mb-1">Primary Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.primaryColor}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={design.primaryColor}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="w-full text-xs font-mono px-2 py-1.5 rounded border border-border bg-card text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground block mb-1">Secondary Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.secondaryColor || '#C48A44'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={design.secondaryColor || '#C48A44'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="w-full text-xs font-mono px-2 py-1.5 rounded border border-border bg-card text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography & Font Pairings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Typography Pairings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Editorial Serif', heading: 'Newsreader', body: 'Plus Jakarta Sans', desc: 'Refined serif title + crisp geometric body' },
            { name: 'Modern Sans', heading: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans', desc: 'Minimalist tech and SaaS aesthetic' },
            { name: 'Monospace Code', heading: 'JetBrains Mono', body: 'JetBrains Mono', desc: 'Developer, technical, terminal style' },
            { name: 'High-Fashion Classic', heading: 'Playfair Display', body: 'Newsreader', desc: 'Literary & creative magazine style' },
          ].map((pair, idx) => {
            const isMatch = design.fontHeading === pair.heading && design.fontBody === pair.body;
            return (
              <button
                key={idx}
                onClick={() => updateDesign({ fontHeading: pair.heading, fontBody: pair.body })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-secondary'
                }`}
              >
                <p className="text-xs font-bold text-foreground">{pair.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{pair.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Button & Shape Styling */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Button & UI Controls</h3>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'pill', label: 'Pill' },
            { id: 'rounded', label: 'Rounded' },
            { id: 'square', label: 'Square' },
            { id: 'minimal', label: 'Underline' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => updateDesign({ buttonStyle: btn.id as any })}
              className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                design.buttonStyle === btn.id
                  ? 'border-primary bg-primary text-on-primary font-bold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Dark / Light Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
          <div>
            <span className="text-xs font-bold text-foreground block">Theme Appearance</span>
            <span className="text-[11px] text-muted-foreground">Select light canvas or dark background</span>
          </div>

          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border">
            <button
              onClick={() => updateDesign({ mode: 'light', backgroundColor: '#FBF9F5', textColor: '#1F2421' })}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                design.mode === 'light' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => updateDesign({ mode: 'dark', backgroundColor: '#121214', textColor: '#F4F4F5' })}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                design.mode === 'dark' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
