import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Copy,
  Check,
  Palette,
  Type,
  Volume2,
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  Sliders,
  Eye,
  ShieldCheck,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface CustomColor {
  name: string;
  hex: string;
  role?: string;
}

export const CreatorBrandPage: React.FC = () => {
  const { state, updateBrandKit } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewText, setPreviewText] = useState('Compound execution builds unstoppable momentum.');
  const [activeTab, setActiveTab] = useState<'palette' | 'typography' | 'logos' | 'voice'>('palette');

  // Custom Color State
  const [showColorModal, setShowColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#26422e');

  const brand = state.creator.brandKit;

  // LEVELUP Brand Core Identity Specs
  const officialPalette: CustomColor[] = [
    { name: 'Forest Green (Primary)', hex: '#26422e', role: 'Main branding, navigation & primary CTAs' },
    { name: 'Warm Gold (Accent)', hex: '#c59b27', role: 'Pro milestones, achievements & badges' },
    { name: 'Warm Cream (Canvas)', hex: '#faf9f6', role: 'App background, page canvases' },
    { name: 'Surface White', hex: '#ffffff', role: 'Cards, elevated surfaces & modals' },
    { name: 'Deep Charcoal', hex: '#1a1f1b', role: 'High-contrast typography & headings' },
    { name: 'Muted Slate', hex: '#5f6962', role: 'Secondary descriptions & borders' },
    { name: 'Emerald Success', hex: '#34774d', role: 'Positive deltas, progress & streaks' },
    { name: 'Terracotta Focus', hex: '#e07a5f', role: 'Ascent badges, highlights & warnings' },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleSaveGuidelines = async () => {
    updateBrandKit({
      colors: brand.colors,
      displayFont: brand.displayFont || 'Hanken Grotesk',
      headlineFont: brand.headlineFont || 'Plus Jakarta Sans',
      bodyFont: brand.bodyFont || 'Plus Jakarta Sans',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim() || !newColorHex.trim()) return;

    const updated = [...(brand.colors || []), { name: newColorName.trim(), hex: newColorHex.trim() }];
    updateBrandKit({ colors: updated });
    setNewColorName('');
    setNewColorHex('#26422e');
    setShowColorModal(false);
  };

  const handleDeleteColor = (idxToDelete: number) => {
    const updated = (brand.colors || []).filter((_, idx) => idx !== idxToDelete);
    updateBrandKit({ colors: updated });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#faf9f6]">
      <SideNavBar active="creator" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-stack-lg px-4 sm:px-6 lg:px-margin-desktop min-h-screen overflow-y-auto w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-6 sm:space-y-8 animate-fade-up">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#26422e]/10 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#26422e]/10 text-[#26422e]">
                  Brand Design System
                </span>
                <span className="text-xs text-[#5f6962]">· Visual Guidelines v2.4</span>
              </div>
              <h2 className="font-display-xl text-[#1a1f1b] leading-tight">Brand Kit & Identity</h2>
              <p className="text-[#5f6962] text-sm mt-1">
                Official design tokens, interactive typography specimens, color palettes, and copywriting standards.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveGuidelines}
                className="bg-[#26422e] hover:bg-[#1a2d1f] text-white px-5 py-2.5 rounded-xl font-label-caps uppercase text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Guidelines Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Guidelines</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#26422e]/10 scrollbar-none">
            {[
              { id: 'palette', label: 'Color System', icon: Palette },
              { id: 'typography', label: 'Typography Specimen', icon: Type },
              { id: 'logos', label: 'Logo Assets', icon: Layers },
              { id: 'voice', label: 'Tone of Voice', icon: Volume2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#26422e] text-white shadow-sm font-bold'
                      : 'bg-white hover:bg-[#f3f1ea] text-[#5f6962] border border-[#26422e]/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. COLOR SYSTEM TAB */}
          {activeTab === 'palette' && (
            <div className="space-y-6">
              {/* Official Brand Palette */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26422e]/10 pb-4">
                  <div>
                    <h3 className="font-headline-sm text-[#1a1f1b] text-lg font-bold">
                      LEVELUP Official Design Palette
                    </h3>
                    <p className="text-xs text-[#5f6962] mt-0.5">
                      Warm cream background, deep forest green branding, and gold accents. Click swatch to copy hex code.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#5f6962] bg-[#faf9f6] px-2.5 py-1 rounded-md border border-[#26422e]/10 self-start sm:self-auto">
                    WCAG AAA / AA Compliant
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {officialPalette.map((col, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(col.hex, `off-${col.hex}`)}
                      className="group cursor-pointer p-3 rounded-xl border border-[#26422e]/10 hover:border-[#26422e]/40 bg-[#faf9f6] transition-all hover:shadow-sm"
                    >
                      <div
                        className="h-24 rounded-lg mb-3 shadow-inner relative flex items-center justify-center border border-black/5"
                        style={{ backgroundColor: col.hex }}
                      >
                        {copiedKey === `off-${col.hex}` ? (
                          <span className="bg-black/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 text-emerald-400" />
                            Copied!
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            Copy
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#1a1f1b] truncate">{col.name}</h4>
                      <code className="text-xs font-mono font-bold text-[#26422e] block mt-0.5">
                        {col.hex}
                      </code>
                      <p className="text-[11px] text-[#5f6962] mt-1 line-clamp-2 leading-tight">
                        {col.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creator Custom Brand Kit Swatches */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26422e]/10 pb-4">
                  <div>
                    <h3 className="font-headline-sm text-[#1a1f1b] text-lg font-bold">
                      Your Custom Creator Brand Kit
                    </h3>
                    <p className="text-xs text-[#5f6962] mt-0.5">
                      Colors saved here dynamically synchronize across your creator portfolio, invoices, and exported media.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColorModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#26422e]/10 hover:bg-[#26422e]/20 text-[#26422e] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Color</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {brand.colors?.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[#26422e]/10 bg-[#faf9f6] relative group"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColor(idx);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-md bg-white/80 hover:bg-red-50 text-[#5f6962] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-xs"
                        title="Delete swatch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div
                        onClick={() => handleCopy(col.hex, `cust-${idx}`)}
                        className="h-20 rounded-lg mb-2.5 shadow-inner relative flex items-center justify-center cursor-pointer border border-black/5"
                        style={{ backgroundColor: col.hex }}
                      >
                        {copiedKey === `cust-${idx}` && (
                          <span className="bg-black/85 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Copied!
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold block text-[#1a1f1b]">{col.name}</span>
                      <span className="text-[11px] font-mono font-medium text-[#26422e] block">
                        {col.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. TYPOGRAPHY SPECIMEN TAB */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Interactive Live Type Tester */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26422e]/10 pb-4">
                  <div>
                    <h3 className="font-headline-sm text-[#1a1f1b] text-lg font-bold">
                      Interactive Typography Tester
                    </h3>
                    <p className="text-xs text-[#5f6962]">
                      Type custom sample copy to test legibility, optical balance, and hierarchy.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewText('Compound daily execution builds unstoppable momentum.')}
                    className="text-xs text-[#26422e] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Sample</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-[#5f6962] block mb-1.5">
                    Live Sample Text
                  </label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Enter custom preview copy..."
                    className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-3 text-sm focus:border-[#26422e] outline-none text-[#1a1f1b]"
                  />
                </div>
              </div>

              {/* Hierarchy Specimen Cards */}
              <div className="grid grid-cols-1 gap-5">
                {/* Display Font: Hanken Grotesk */}
                <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#26422e]/10 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
                        Display Headline Font
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-base">
                        {brand.displayFont || 'Hanken Grotesk'} (Extra Bold / 800)
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#faf9f6] px-2.5 py-1 rounded text-[#5f6962] border border-[#26422e]/10">
                      font-display-xl / 44px
                    </span>
                  </div>
                  <p
                    className="text-[#1a1f1b] text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight break-words"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    {previewText || 'Everything You Need to Level Up Your Life.'}
                  </p>
                  <p className="text-xs text-[#5f6962]">
                    Primary use: Hero section titles, major life score cards, and landing page banners.
                  </p>
                </div>

                {/* Headline Font: Plus Jakarta Sans */}
                <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#26422e]/10 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#26422e]">
                        Section & Card Headings
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-base">
                        {brand.headlineFont || 'Plus Jakarta Sans'} (Bold / 700)
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#faf9f6] px-2.5 py-1 rounded text-[#5f6962] border border-[#26422e]/10">
                      font-headline-sm / 22px
                    </span>
                  </div>
                  <p
                    className="text-[#26422e] text-xl sm:text-2xl font-bold leading-snug break-words"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {previewText || 'Everything You Need to Level Up Your Life.'}
                  </p>
                  <p className="text-xs text-[#5f6962]">
                    Primary use: Workspace section headers, feature cards, modal titles, and navigation labels.
                  </p>
                </div>

                {/* Body Font: Plus Jakarta Sans Regular */}
                <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#26422e]/10 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f6962]">
                        Body & Paragraph Copy
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-base">
                        {brand.bodyFont || 'Plus Jakarta Sans'} (Regular / 400)
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#faf9f6] px-2.5 py-1 rounded text-[#5f6962] border border-[#26422e]/10">
                      font-body-md / 14px / 22px leading
                    </span>
                  </div>
                  <p
                    className="text-[#1a1f1b] text-sm sm:text-base leading-relaxed break-words"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Manage your fitness, career, nutrition, and personal growth from one clean workspace.
                    Spend less time switching between apps and more time building compound momentum.
                  </p>
                  <p className="text-xs text-[#5f6962]">
                    Primary use: Instructional text, notes, workout exercise lists, financial records, and journal logs.
                  </p>
                </div>

                {/* Monospace Code Font */}
                <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#26422e]/10 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f6962]">
                        Monospace Data & Metrics
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-base">
                        JetBrains Mono / SF Mono (Medium / 500)
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#faf9f6] px-2.5 py-1 rounded text-[#5f6962] border border-[#26422e]/10">
                      font-mono / 13px
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 font-mono text-xs sm:text-sm text-[#1a1f1b] space-y-1">
                    <p>SYSTEM.01 // ASCENT_VECTOR : 45°</p>
                    <p>KPI_WEIGHT_TARGET : 74.5 kg [DEFICIT_MET]</p>
                    <p>SUBSCRIPTION_TIER : LEVELUP_PRO (₹129/mo)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. LOGO ASSETS TAB */}
          {activeTab === 'logos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Wordmark / Vector Logo */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#26422e]">
                        Vector Wordmark
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-lg">{brand.primaryLogoName || 'LEVELUP Main Wordmark'}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#faf9f6] text-[10px] font-mono text-[#5f6962] border border-[#26422e]/10">
                      SVG · Vector
                    </span>
                  </div>
                  
                  {/* Visual Preview */}
                  <div className="h-44 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[#26422e] text-white flex items-center justify-center font-extrabold text-base tracking-tighter">
                        ▲
                      </span>
                      <span className="text-2xl font-extrabold text-[#1a1f1b] tracking-tight">
                        LEVEL<span className="text-[#26422e]">UP</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5f6962] mt-2 font-medium">
                      Primary Master Logo on Warm Cream Canvas
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#26422e]/10 flex items-center justify-between text-xs text-[#5f6962]">
                  <span>Resolution: Infinite Vector</span>
                  <button
                    onClick={() => handleCopy('<svg ...>LEVELUP</svg>', 'logo-svg')}
                    className="text-[#26422e] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'logo-svg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'logo-svg' ? 'SVG Copied' : 'Copy SVG'}</span>
                  </button>
                </div>
              </div>

              {/* Logomark & App Icon */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
                        Favicon & App Icon
                      </span>
                      <h4 className="font-bold text-[#1a1f1b] text-lg">{brand.logomarkName || 'Ascent Vector Icon'}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#faf9f6] text-[10px] font-mono text-[#5f6962] border border-[#26422e]/10">
                      512x512 PNG / SVG
                    </span>
                  </div>

                  {/* Visual Preview */}
                  <div className="h-44 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 flex items-center justify-center gap-6 p-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#26422e] text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-2xl font-bold">▲</span>
                      <span className="text-[9px] font-mono tracking-widest font-bold mt-0.5">LVL</span>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-[#c59b27] text-white flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xl font-bold">▲</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      ▲
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#26422e]/10 flex items-center justify-between text-xs text-[#5f6962]">
                  <span>Variants: Forest Green, Gold, Dark</span>
                  <span className="text-[#26422e] font-semibold">Production Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. TONE OF VOICE TAB */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Pillars Banner */}
              <div className="bg-white border border-[#26422e]/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#26422e]" />
                  <h3 className="font-headline-sm text-[#1a1f1b] text-lg font-bold">
                    Tone of Voice & Editorial Constitution
                  </h3>
                </div>
                <p className="text-sm text-[#5f6962] leading-relaxed">
                  LEVELUP speaks with direct, disciplined clarity. We avoid toxic hype, gaming clutter, and hollow motivational buzzwords. We treat the user as a focused high-performer who values truth, data, and daily compound progress.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#26422e]">
                      1. Scientific Rigor
                    </span>
                    <p className="text-xs text-[#5f6962] leading-relaxed">
                      Every nutrition, fitness, and study recommendation is backed by cognitive science and empirical data.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
                      2. Visual Restraint
                    </span>
                    <p className="text-xs text-[#5f6962] leading-relaxed">
                      Warm cream backgrounds, crisp typography, and uncluttered cards over distracting neon gradients.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#26422e]/10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1a1f1b]">
                      3. Action Over Talk
                    </span>
                    <p className="text-xs text-[#5f6962] leading-relaxed">
                      Clear buttons, concise summaries, zero fluff. Give the user immediate momentum to execute.
                    </p>
                  </div>
                </div>
              </div>

              {/* Do vs Don't Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DO */}
                <div className="bg-white border border-emerald-500/25 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="w-5 h-5" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">How LEVELUP Speaks (Do)</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      'Completed 3 of 4 planned sets. Ready for 90s recovery countdown.',
                      '7-day study plan generated with spaced active recall and SQL drills.',
                      'Caloric deficit on track: 2,150 / 2,300 kcal consumed.',
                      'Your membership gives you full unrestricted access to all 5 workspaces.',
                    ].map((example, i) => (
                      <div key={i} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-500/15 text-xs text-[#1a1f1b] flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="leading-relaxed">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONT */}
                <div className="bg-white border border-red-500/25 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="font-bold text-lg">✕</span>
                    <h4 className="font-bold text-sm uppercase tracking-wider">What We Avoid (Don't)</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      'Supercharge your life with magical 10x synergistic lifehacks!',
                      'Epic gamer XP unlocked! You leveled up to Level 99 Warrior!',
                      'Crush your goals or be a loser! No pain no gain bro!',
                      'Confusing jargon without actionable steps or data backing.',
                    ].map((example, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-50/50 border border-red-500/15 text-xs text-[#5f6962] flex items-start gap-2">
                        <span className="text-red-500 font-bold">✕</span>
                        <span className="leading-relaxed line-through">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Color Modal */}
          {showColorModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-[#26422e]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-fade-up">
                <div className="flex justify-between items-center border-b border-[#26422e]/10 pb-3">
                  <h4 className="font-bold text-[#1a1f1b] text-base">Add Custom Swatch</h4>
                  <button
                    onClick={() => setShowColorModal(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#faf9f6] text-[#5f6962] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCustomColor} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-[#5f6962] block mb-1">
                      Color Name
                    </label>
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="e.g. Electric Sapphire, Editorial Sage"
                      className="w-full bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-2.5 text-xs text-[#1a1f1b] outline-none focus:border-[#26422e]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-[#5f6962] block mb-1">
                      Hex Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#26422e]/20 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#26422e"
                        className="flex-1 bg-[#faf9f6] border border-[#26422e]/15 rounded-xl p-2.5 text-xs font-mono text-[#1a1f1b] outline-none focus:border-[#26422e]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowColorModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#26422e]/15 text-xs font-semibold text-[#5f6962] hover:bg-[#faf9f6] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#26422e] text-white text-xs font-semibold hover:bg-[#1a2d1f] transition-colors cursor-pointer"
                    >
                      Add Swatch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
