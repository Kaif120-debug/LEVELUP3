import React, { useState } from 'react';
import { PortfolioItem } from '../../types';

interface AIPanelProps {
  portfolio: PortfolioItem;
  onChange: (updates: Partial<PortfolioItem>) => void;
  initialTool?: 'bio' | 'project' | 'case-study' | 'tagline' | 'experience';
}

export const PortfolioAIPanel: React.FC<AIPanelProps> = ({ portfolio, onChange, initialTool = 'bio' }) => {
  const [activeTool, setActiveTool] = useState<'bio' | 'project' | 'case-study' | 'tagline' | 'experience'>(initialTool);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bio State
  const [bioInput, setBioInput] = useState(portfolio.about.bio);
  const [bioRole, setBioRole] = useState(portfolio.hero.title || 'Product Designer');
  const [bioTone, setBioTone] = useState<'visionary' | 'executive' | 'technical' | 'minimal'>('visionary');
  const [improvedBio, setImprovedBio] = useState<string | null>(null);

  // Taglines State
  const [taglineRole, setTaglineRole] = useState(portfolio.hero.title || 'Product Designer');
  const [taglineNiche, setTaglineNiche] = useState(portfolio.about.skills.slice(0, 3).join(', ') || 'UI Systems');
  const [generatedTaglines, setGeneratedTaglines] = useState<string[]>([]);

  // Project Description State
  const [selectedProjectId, setSelectedProjectId] = useState(portfolio.projects[0]?.id || '');
  const [projectNotes, setProjectNotes] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState<string | null>(null);

  // Case Study State
  const [csProjectId, setCsProjectId] = useState(portfolio.projects[0]?.id || '');
  const [csProblem, setCsProblem] = useState('');
  const [csSolution, setCsSolution] = useState('');
  const [csMetrics, setCsMetrics] = useState('');
  const [generatedCaseStudy, setGeneratedCaseStudy] = useState<any | null>(null);

  // AI Call Handlers
  const handleImproveBio = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/portfolio/improve-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBio: bioInput, targetRole: bioRole, tone: bioTone }),
      });
      const data = await res.json();
      if (data.improvedBio) {
        setImprovedBio(data.improvedBio);
      } else {
        setError('Could not generate bio improvements. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Error communicating with AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBio = () => {
    if (!improvedBio) return;
    onChange({ about: { ...portfolio.about, bio: improvedBio } });
  };

  const handleGenerateTaglines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/portfolio/generate-tagline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: taglineRole, niche: taglineNiche, name: portfolio.hero.name }),
      });
      const data = await res.json();
      if (data.taglines && Array.isArray(data.taglines)) {
        setGeneratedTaglines(data.taglines);
      } else {
        setError('Could not generate taglines.');
      }
    } catch (e: any) {
      setError(e.message || 'Error generating taglines');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTagline = (tagline: string) => {
    onChange({ hero: { ...portfolio.hero, tagline } });
  };

  const handleGenerateProjectDesc = async () => {
    const proj = portfolio.projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/portfolio/project-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: proj.name,
          role: proj.role,
          tools: proj.tools,
          roughNotes: projectNotes || proj.description,
        }),
      });
      const data = await res.json();
      if (data.description) {
        setGeneratedDesc(data.description);
      } else {
        setError('Could not generate project description.');
      }
    } catch (e: any) {
      setError(e.message || 'Error generating description');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProjectDesc = () => {
    if (!generatedDesc || !selectedProjectId) return;
    const updated = portfolio.projects.map((p) =>
      p.id === selectedProjectId ? { ...p, description: generatedDesc } : p
    );
    onChange({ projects: updated });
  };

  const handleGenerateCaseStudy = async () => {
    const proj = portfolio.projects.find((p) => p.id === csProjectId);
    if (!proj) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/portfolio/case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: proj.name,
          role: proj.role,
          problem: csProblem || proj.caseStudy?.problem,
          solution: csSolution || proj.caseStudy?.solution,
          metrics: csMetrics || proj.caseStudy?.results,
        }),
      });
      const data = await res.json();
      if (data.caseStudy) {
        setGeneratedCaseStudy(data.caseStudy);
      } else {
        setError('Could not generate case study.');
      }
    } catch (e: any) {
      setError(e.message || 'Error generating case study');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCaseStudy = () => {
    if (!generatedCaseStudy || !csProjectId) return;
    const updated = portfolio.projects.map((p) =>
      p.id === csProjectId ? { ...p, caseStudy: generatedCaseStudy } : p
    );
    onChange({ projects: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          <h3 className="text-sm font-bold text-foreground">AI Portfolio Studio</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Elevate your copy, generate comprehensive case studies, and craft magnetic headlines using Gemini.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border pb-3">
        {[
          { id: 'bio', label: 'Improve Bio', icon: 'person' },
          { id: 'tagline', label: 'Taglines', icon: 'short_text' },
          { id: 'project', label: 'Project Copy', icon: 'article' },
          { id: 'case-study', label: 'Case Study', icon: 'dataset' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              activeTool === tool.id
                ? 'border-primary bg-primary text-on-primary shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      {/* 1. BIO IMPROVER TOOL */}
      {activeTool === 'bio' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Target Professional Role</label>
            <input
              type="text"
              value={bioRole}
              onChange={(e) => setBioRole(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              placeholder="e.g. Staff Product Designer, AI Interface Engineer"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Tone & Voice</label>
            <div className="grid grid-cols-4 gap-2">
              {['visionary', 'executive', 'technical', 'minimal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setBioTone(t as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs capitalize border ${
                    bioTone === t
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Current Bio / Raw Draft</label>
            <textarea
              rows={4}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground leading-relaxed"
              placeholder="Paste your existing bio or bullet points..."
            />
          </div>

          <button
            onClick={handleImproveBio}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Optimizing Bio with AI...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Generate Enhanced Bio</span>
              </>
            )}
          </button>

          {/* Result */}
          {improvedBio && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary block">
                AI Enhanced Bio Recommendation
              </span>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                {improvedBio}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleApplyBio}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-primary/90 transition-colors"
                >
                  Apply to Website Bio ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TAGLINES GENERATOR */}
      {activeTool === 'tagline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Role / Focus</label>
              <input
                type="text"
                value={taglineRole}
                onChange={(e) => setTaglineRole(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Core Niche / Skills</label>
              <input
                type="text"
                value={taglineNiche}
                onChange={(e) => setTaglineNiche(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateTaglines}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating Taglines...' : 'Generate 3 Headline Options'}
          </button>

          {generatedTaglines.length > 0 && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary block">
                Choose a Tagline:
              </span>
              {generatedTaglines.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-foreground italic">"{t}"</p>
                  <button
                    onClick={() => handleApplyTagline(t)}
                    className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap"
                  >
                    Apply →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PROJECT DESCRIPTION GENERATOR */}
      {activeTool === 'project' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            >
              {portfolio.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Rough Project Notes / Highlights</label>
            <textarea
              rows={3}
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
              placeholder="What was built? What problem did it solve? What were key achievements?"
            />
          </div>

          <button
            onClick={handleGenerateProjectDesc}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Drafting Project Summary...' : 'Write Polished Description'}
          </button>

          {generatedDesc && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
              <p className="text-xs text-foreground leading-relaxed">{generatedDesc}</p>
              <div className="flex justify-end">
                <button
                  onClick={handleApplyProjectDesc}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
                >
                  Apply to Project Description ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CASE STUDY GENERATOR */}
      {activeTool === 'case-study' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Target Project</label>
            <select
              value={csProjectId}
              onChange={(e) => setCsProjectId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            >
              {portfolio.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              value={csProblem}
              onChange={(e) => setCsProblem(e.target.value)}
              placeholder="The user challenge / problem statement"
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            />
            <input
              type="text"
              value={csSolution}
              onChange={(e) => setCsSolution(e.target.value)}
              placeholder="The delivered solution & architecture"
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            />
            <input
              type="text"
              value={csMetrics}
              onChange={(e) => setCsMetrics(e.target.value)}
              placeholder="Quantifiable metric / result (e.g. +40% speed)"
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            />
          </div>

          <button
            onClick={handleGenerateCaseStudy}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Synthesizing Full Case Study...' : 'Generate 8-Part Case Study'}
          </button>

          {generatedCaseStudy && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary block">
                Generated Case Study Modules
              </span>
              <div className="space-y-2 text-xs">
                <p><strong>Problem:</strong> {generatedCaseStudy.problem}</p>
                <p><strong>Research:</strong> {generatedCaseStudy.research}</p>
                <p><strong>Solution:</strong> {generatedCaseStudy.solution}</p>
                <p><strong>Results:</strong> {generatedCaseStudy.results}</p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleApplyCaseStudy}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
                >
                  Apply Full Case Study ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
