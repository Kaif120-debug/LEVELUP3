import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  Bookmark,
  Share2,
  HelpCircle,
  Code,
  Zap,
} from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface StudyNotesResponse {
  id: string;
  title: string;
  subject: string;
  topic: string;
  format: string;
  overview: string;
  cornellCues: Array<{
    cueQuestion: string;
    noteContent: string;
    importance?: string;
  }>;
  mainSections: Array<{
    sectionTitle: string;
    summary: string;
    bulletPoints: string[];
    codeOrFormula?: string;
    language?: string;
  }>;
  keyFormulasOrRules: Array<{
    ruleName: string;
    formula: string;
    meaning: string;
  }>;
  examCheatSheet: string[];
  flashcards: Array<{
    front: string;
    back: string;
  }>;
  createdAt: string;
}

interface StudyNotesStudioProps {
  initialTopic?: string;
  initialSubject?: string;
  onLaunchQuiz?: (topic: string, subject: string) => void;
}

export const StudyNotesStudio: React.FC<StudyNotesStudioProps> = ({
  initialTopic = 'B-Trees & Database Indexing',
  initialSubject = 'Database Systems',
  onLaunchQuiz,
}) => {
  const { isPro, openUpgradeModal } = useSubscription();
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [format, setFormat] = useState<'cornell' | 'cheatsheet' | 'executive'>('cornell');
  const [detailLevel, setDetailLevel] = useState<'concise' | 'comprehensive'>('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<StudyNotesResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'cues' | 'cheatsheet' | 'flashcards'>('notes');

  const handleGenerateNotes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/study/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          format,
          detailLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate study notes');
      }

      const data: StudyNotesResponse = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('[AI Notes Generation Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadMarkdown = () => {
    if (!notes) return;
    let md = `# ${notes.title}\n\n`;
    md += `**Subject:** ${notes.subject} | **Topic:** ${notes.topic}\n\n`;
    md += `## Overview\n${notes.overview}\n\n`;

    if (notes.cornellCues?.length > 0) {
      md += `## Cornell Active Recall Cues\n`;
      notes.cornellCues.forEach((c) => {
        md += `### Q: ${c.cueQuestion}\n${c.noteContent}\n\n`;
      });
    }

    if (notes.mainSections?.length > 0) {
      md += `## Core Sections\n`;
      notes.mainSections.forEach((s) => {
        md += `### ${s.sectionTitle}\n*${s.summary}*\n\n`;
        s.bulletPoints.forEach((b) => {
          md += `- ${b}\n`;
        });
        if (s.codeOrFormula) {
          md += `\n\`\`\`\n${s.codeOrFormula}\n\`\`\`\n\n`;
        }
      });
    }

    if (notes.examCheatSheet?.length > 0) {
      md += `## Exam Cheat Sheet\n`;
      notes.examCheatSheet.forEach((item) => {
        md += `- ${item}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Form */}
      <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-fixed/20 text-primary">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-headline-sm text-on-surface">AI Study Notes Generator</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Synthesize complex lectures and textbook chapters into Cornell notes, rapid cheat sheets, and active recall flashcards.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed/20 text-primary self-start sm:self-auto">
            Powered by Gemini AI
          </span>
        </div>

        <form onSubmit={handleGenerateNotes} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1.5">
                Topic or Chapter Name
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. B-Trees & B+ Tree Splits, Dynamic Programming"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none text-on-surface"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1.5">
                Course or Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Database Systems, Data Structures"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none text-on-surface"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1.5">
                Note Architecture Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cornell', label: 'Cornell Method' },
                  { id: 'cheatsheet', label: 'Exam Cheat Sheet' },
                  { id: 'executive', label: 'Executive Summary' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      format === f.id
                        ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1.5">
                Detail Depth
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'comprehensive', label: 'Comprehensive (Deep)' },
                  { id: 'concise', label: 'Concise (High-Yield)' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDetailLevel(d.id as any)}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      detailLevel === d.id
                        ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Generating High-Retention Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Master Notes</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Notes View */}
      {notes && (
        <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant/40 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {notes.subject}
              </span>
              <h3 className="font-headline-sm text-on-surface text-xl">{notes.title}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
              {onLaunchQuiz && (
                <button
                  onClick={() => onLaunchQuiz(notes.topic, notes.subject)}
                  className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-dim text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quiz on this Topic</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            {[
              { id: 'notes', label: 'Cornell Notes' },
              { id: 'cues', label: 'Recall Cues' },
              { id: 'cheatsheet', label: 'Cheat Sheet' },
              { id: 'flashcards', label: `Flashcards (${notes.flashcards?.length || 0})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-primary-container text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface bg-surface-container-lowest'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview Callout */}
          <div className="p-4 rounded-xl bg-primary-fixed/10 border border-primary/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              Executive Synopsis
            </h4>
            <p className="text-sm text-on-surface leading-relaxed">{notes.overview}</p>
          </div>

          {/* TAB 1: Main Cornell Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {notes.mainSections?.map((section, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-3"
                >
                  <h4 className="font-semibold text-on-surface text-base">{section.sectionTitle}</h4>
                  <p className="text-xs text-on-surface-variant italic">{section.summary}</p>
                  <ul className="space-y-2">
                    {section.bulletPoints?.map((bp, bIdx) => (
                      <li key={bIdx} className="text-xs sm:text-sm text-on-surface flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ul>

                  {section.codeOrFormula && (
                    <div className="mt-3 relative rounded-lg bg-surface-container-highest p-3 font-mono text-xs overflow-x-auto text-on-surface">
                      <pre>{section.codeOrFormula}</pre>
                      <button
                        onClick={() => handleCopy(section.codeOrFormula!, `code-${idx}`)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-surface/80 hover:bg-surface text-on-surface-variant cursor-pointer text-[10px] flex items-center gap-1"
                      >
                        {copiedKey === `code-${idx}` ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `code-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Cornell Active Recall Cues */}
          {activeTab === 'cues' && (
            <div className="space-y-4">
              <div className="text-xs text-on-surface-variant mb-2">
                Use the left column to test your recall without looking at the right notes column.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {notes.cornellCues?.map((cue, idx) => (
                  <React.Fragment key={idx}>
                    <div className="md:col-span-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 font-semibold text-xs text-on-surface flex items-center">
                      <span>{cue.cueQuestion}</span>
                    </div>
                    <div className="md:col-span-7 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs sm:text-sm text-on-surface-variant flex items-center">
                      <span>{cue.noteContent}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Exam Cheat Sheet */}
          {activeTab === 'cheatsheet' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-secondary/20 bg-secondary-container/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <h4 className="font-semibold text-sm text-on-surface">High-Yield Exam Rules</h4>
                </div>
                <div className="space-y-2">
                  {notes.examCheatSheet?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-surface border border-outline-variant/50 text-xs sm:text-sm text-on-surface flex items-start gap-2.5"
                    >
                      <span className="font-bold text-secondary text-xs">{idx + 1}.</span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {notes.keyFormulasOrRules?.length > 0 && (
                <div className="p-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-3">
                  <h4 className="font-semibold text-sm text-on-surface">Key Formulas & Theorems</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {notes.keyFormulasOrRules.map((r, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-surface border border-outline-variant/60">
                        <span className="text-[11px] font-bold text-primary block uppercase">
                          {r.ruleName}
                        </span>
                        <code className="text-xs font-mono font-bold text-on-surface block my-1">
                          {r.formula}
                        </code>
                        <span className="text-xs text-on-surface-variant block">{r.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.flashcards?.map((fc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Question {idx + 1}
                    </span>
                    <p className="font-semibold text-sm text-on-surface">{fc.front}</p>
                  </div>
                  <div className="pt-3 border-t border-outline-variant/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Answer
                    </span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{fc.back}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
