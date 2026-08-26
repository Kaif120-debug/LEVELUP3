import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PortfolioItem, PortfolioTemplate } from '../types';
import { SideNavBar } from '../components/SideNavBar';
import { CareerNav } from '../components/career/CareerNav';
import { PortfolioRenderer } from '../components/portfolio/PortfolioRenderer';
import { PortfolioEditorControls } from '../components/portfolio/PortfolioEditorControls';
import { PortfolioDesignPanel } from '../components/portfolio/PortfolioDesignPanel';
import { PortfolioSectionManager } from '../components/portfolio/PortfolioSectionManager';
import { PortfolioAIPanel } from '../components/portfolio/PortfolioAIPanel';
import { PortfolioSettingsPanel } from '../components/portfolio/PortfolioSettingsPanel';

export const CareerPortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createPortfolio, updatePortfolio, duplicatePortfolio, deletePortfolio, publishPortfolio, unpublishPortfolio, setActivePortfolio } = useApp();

  // Mode: 'dashboard' | 'editor'
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(state.career.activePortfolioId || state.career.portfolios?.[0]?.id || '');
  
  // Editor Viewport: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  // Editor Active Tab: 'content' | 'design' | 'sections' | 'ai' | 'settings'
  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'sections' | 'ai' | 'settings'>('content');
  const [aiInitialTool, setAiInitialTool] = useState<'bio' | 'project' | 'case-study' | 'tagline' | 'experience'>('bio');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioTemplate, setNewPortfolioTemplate] = useState<PortfolioTemplate>('minimal');

  const portfolios = state.career.portfolios || [];
  const currentPortfolio = portfolios.find((p) => p.id === selectedPortfolioId) || portfolios[0];

  const handleCreateNew = () => {
    const id = createPortfolio(newPortfolioTemplate, newPortfolioName || `${state.profile.name}'s Portfolio`);
    setSelectedPortfolioId(id);
    setIsCreateModalOpen(false);
    setNewPortfolioName('');
    setViewMode('editor');
  };

  const handleEditPortfolio = (id: string) => {
    setSelectedPortfolioId(id);
    setActivePortfolio(id);
    setViewMode('editor');
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicatePortfolio(id);
    if (newId) {
      setSelectedPortfolioId(newId);
    }
  };

  const handleOpenAIFromControl = (tool: 'bio' | 'project' | 'case-study' | 'tagline' | 'experience') => {
    setAiInitialTool(tool);
    setEditorTab('ai');
  };

  const handleOpenPreviewTab = (portfolio: PortfolioItem) => {
    const slug = portfolio.settings?.slug || portfolio.id;
    window.open(`/p/${slug}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground animate-fade-in">
      {/* ========================================================================= */}
      {/* DASHBOARD VIEW: "MY PORTFOLIOS" */}
      {/* ========================================================================= */}
      {viewMode === 'dashboard' && (
        <>
          <SideNavBar active="career" />
          <div className="lg:ml-[280px] ml-0 w-full lg:w-[calc(100%-280px)] min-h-screen flex flex-col flex-1 bg-surface">
            {/* Top Sub-Navigation Tabs */}
            <CareerNav activeTab="portfolio" />

            <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-8 flex-1">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  <span>Career</span>
                  <span>/</span>
                  <span className="text-primary font-bold">Personal Website Builder</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-serif">
                  My Portfolios
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Design, build, and publish high-impact personal portfolio websites with custom domain support.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-primary/90 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>+ CREATE PORTFOLIO</span>
                </button>
              </div>
            </div>

          {/* Subscription Tier Summary Banner */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined">web</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">LEVELUP Portfolio Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary text-on-primary">
                    {state.subscription.status === 'active' ? 'PRO ACTIVE' : 'STARTER'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {state.subscription.status === 'active'
                    ? 'Unlimited portfolio sites, all 6 design templates, Gemini AI copywriter, and custom domain hosting enabled.'
                    : '1 portfolio slot, standard templates. Subscribe for ₹129/mo to unlock full pro suite.'}
                </p>
              </div>
            </div>

            {state.subscription.status !== 'active' && (
              <a
                href="/pricing"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-xs hover:bg-primary/90 transition-colors"
              >
                Upgrade to Pro (₹129/mo)
              </a>
            )}
          </div>

          {/* Portfolios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((port) => {
              const isPublished = port.status === 'published';
              const publicUrl = `https://${port.settings?.slug || 'portfolio'}.levelup.site`;

              return (
                <div
                  key={port.id}
                  className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  {/* Top Preview Header */}
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                            }`}
                          ></span>
                          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                            {isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mt-1 line-clamp-1 font-serif">
                          {port.name}
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold capitalize bg-secondary text-secondary-foreground border border-border">
                        {port.template}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {port.hero.tagline || port.hero.introduction || 'Personal portfolio website showcasing engineering & design works.'}
                    </p>

                    {/* Subdomain & Link */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-muted-foreground block">Public URL:</span>
                      <a
                        href={`/p/${port.settings?.slug || port.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-primary font-semibold hover:underline flex items-center gap-1 mt-0.5 truncate"
                      >
                        <span className="truncate">{publicUrl}</span>
                        <span className="material-symbols-outlined text-[13px] flex-shrink-0">open_in_new</span>
                      </a>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 bg-secondary/40 border-t border-border space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Updated {port.lastUpdated || 'Recently'}</span>
                      <span>{port.projects?.length || 0} projects</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEditPortfolio(port.id)}
                        className="py-2 px-3 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>EDIT</span>
                      </button>

                      <button
                        onClick={() => handleOpenPreviewTab(port)}
                        className="py-2 px-3 rounded-lg border border-border bg-card text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-secondary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>PREVIEW</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                      {isPublished ? (
                        <button
                          onClick={() => unpublishPortfolio(port.id)}
                          className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          UNPUBLISH
                        </button>
                      ) : (
                        <button
                          onClick={() => publishPortfolio(port.id)}
                          className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          PUBLISH SITE
                        </button>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDuplicate(port.id)}
                          className="text-[11px] font-mono text-muted-foreground hover:text-foreground"
                          title="Duplicate portfolio"
                        >
                          DUPLICATE
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${port.name}"?`)) {
                              deletePortfolio(port.id);
                            }
                          }}
                          className="text-[11px] font-mono text-destructive hover:underline"
                          title="Delete portfolio"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
    )}

      {/* ========================================================================= */}
      {/* SPLIT-SCREEN EDITOR VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && currentPortfolio && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Editor Bar */}
          <header className="h-14 px-6 border-b border-border bg-card flex items-center justify-between flex-shrink-0 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1 text-xs font-mono"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>My Portfolios</span>
              </button>

              <div className="h-4 w-[1px] bg-border hidden sm:block"></div>

              <div className="hidden sm:flex items-center gap-2">
                <input
                  type="text"
                  value={currentPortfolio.name}
                  onChange={(e) => updatePortfolio(currentPortfolio.id, { name: e.target.value })}
                  className="font-bold text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 text-foreground"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                  {currentPortfolio.template}
                </span>
              </div>
            </div>

            {/* Viewport Toggles & Actions */}
            <div className="flex items-center gap-3">
              {/* Responsive Device Switchers */}
              <div className="hidden md:flex items-center bg-secondary p-1 rounded-lg border border-border">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === 'desktop' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Desktop Preview (100%)"
                >
                  <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === 'tablet' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Tablet Preview (768px)"
                >
                  <span className="material-symbols-outlined text-[18px]">tablet_mac</span>
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === 'mobile' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Mobile Viewport (375px)"
                >
                  <span className="material-symbols-outlined text-[18px]">smartphone</span>
                </button>
              </div>

              {/* Open in New Tab Button */}
              <button
                onClick={() => handleOpenPreviewTab(currentPortfolio)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                title="Open live website in standalone window"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                <span className="hidden sm:inline">Open Live</span>
              </button>

              {/* Publish Toggle Button */}
              {currentPortfolio.status === 'published' ? (
                <button
                  onClick={() => unpublishPortfolio(currentPortfolio.id)}
                  className="px-4 py-1.5 rounded-lg border border-border bg-card text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors"
                >
                  Published ✓
                </button>
              ) : (
                <button
                  onClick={() => publishPortfolio(currentPortfolio.id)}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-primary/90 transition-colors"
                >
                  PUBLISH SITE
                </button>
              )}
            </div>
          </header>

          {/* Split Screen Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANE: CONTROLS & TABS */}
            <div className="w-full md:w-[420px] lg:w-[480px] border-r border-border bg-card flex flex-col flex-shrink-0 overflow-hidden">
              {/* Primary Navigation Tabs */}
              <div className="grid grid-cols-5 border-b border-border bg-secondary/30 text-xs font-semibold">
                {[
                  { id: 'content', label: 'Content', icon: 'edit_note' },
                  { id: 'design', label: 'Design', icon: 'palette' },
                  { id: 'sections', label: 'Sections', icon: 'view_agenda' },
                  { id: 'ai', label: 'AI Tools', icon: 'auto_awesome' },
                  { id: 'settings', label: 'Settings', icon: 'settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setEditorTab(tab.id as any)}
                    className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
                      editorTab === tab.id
                        ? 'border-primary text-primary bg-card font-bold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="text-[10px] uppercase font-mono">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Scrollable Sub-Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {editorTab === 'content' && (
                  <PortfolioEditorControls
                    portfolio={currentPortfolio}
                    onChange={(updates) => updatePortfolio(currentPortfolio.id, updates)}
                    onOpenAI={handleOpenAIFromControl}
                  />
                )}

                {editorTab === 'design' && (
                  <PortfolioDesignPanel
                    portfolio={currentPortfolio}
                    onChange={(updates) => updatePortfolio(currentPortfolio.id, updates)}
                    isPro={state.subscription.status === 'active'}
                  />
                )}

                {editorTab === 'sections' && (
                  <PortfolioSectionManager
                    portfolio={currentPortfolio}
                    onChange={(updates) => updatePortfolio(currentPortfolio.id, updates)}
                  />
                )}

                {editorTab === 'ai' && (
                  <PortfolioAIPanel
                    portfolio={currentPortfolio}
                    onChange={(updates) => updatePortfolio(currentPortfolio.id, updates)}
                    initialTool={aiInitialTool}
                  />
                )}

                {editorTab === 'settings' && (
                  <PortfolioSettingsPanel
                    portfolio={currentPortfolio}
                    onChange={(updates) => updatePortfolio(currentPortfolio.id, updates)}
                    isPro={state.subscription.status === 'active'}
                  />
                )}
              </div>
            </div>

            {/* RIGHT PANE: LIVE PREVIEW CANVAS */}
            <div className="hidden md:flex flex-1 bg-stone-900/5 dark:bg-black/40 overflow-y-auto items-start justify-center p-4 lg:p-8">
              <div
                className={`transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-border bg-card flex flex-col ${
                  viewport === 'mobile'
                    ? 'w-[375px] min-h-[720px]'
                    : viewport === 'tablet'
                    ? 'w-[768px] min-h-[850px]'
                    : 'w-full max-w-5xl min-h-[900px]'
                }`}
              >
                {/* Mini Browser Bar */}
                <div className="px-4 py-2 bg-secondary/80 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="px-3 py-0.5 rounded bg-background border border-border text-[11px] text-foreground font-mono flex items-center gap-1.5 max-w-sm truncate">
                    <span className="material-symbols-outlined text-[13px] text-emerald-500">lock</span>
                    <span className="truncate">https://{currentPortfolio.settings?.slug || 'portfolio'}.levelup.site</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>LIVE PREVIEW</span>
                  </div>
                </div>

                {/* The Real Dynamic Template Renderer */}
                <div className="flex-1 overflow-y-auto">
                  <PortfolioRenderer portfolio={currentPortfolio} isStandalone={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE PORTFOLIO MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-foreground border border-border rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-xl space-y-6 animate-fade-up">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary">New Website</span>
                <h2 className="text-xl font-bold font-serif">Create Portfolio Website</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder={`${state.profile.name}'s Portfolio`}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
                  Choose Starting Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'minimal', name: 'Minimal', tag: 'Swiss' },
                    { id: 'designer', name: 'Designer', tag: 'Visual' },
                    { id: 'developer', name: 'Developer', tag: 'Terminal' },
                    { id: 'creative', name: 'Creative', tag: 'Bold' },
                    { id: 'professional', name: 'Professional', tag: 'Corporate' },
                    { id: 'editorial', name: 'Editorial', tag: 'Magazine' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewPortfolioTemplate(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newPortfolioTemplate === t.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-secondary'
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground block">{t.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{t.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90"
              >
                Launch Builder →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
