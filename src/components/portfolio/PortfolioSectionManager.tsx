import React from 'react';
import { PortfolioItem, PortfolioSectionConfig } from '../../types';

interface SectionManagerProps {
  portfolio: PortfolioItem;
  onChange: (updates: Partial<PortfolioItem>) => void;
}

export const PortfolioSectionManager: React.FC<SectionManagerProps> = ({ portfolio, onChange }) => {
  const { sections } = portfolio;

  // Move section up in order
  const moveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    // Re-index orders
    const updated = reordered.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    onChange({ sections: updated });
  };

  // Move section down in order
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    // Re-index orders
    const updated = reordered.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    onChange({ sections: updated });
  };

  // Toggle section enabled
  const toggleEnabled = (id: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
    );
    onChange({ sections: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold text-foreground">Section Management & Hierarchy</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Reorder your website sections or hide/show specific modules to match your target role.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((sec, index) => (
          <div
            key={sec.id}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              sec.enabled
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/60 bg-secondary/30 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-mono font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <span className="text-xs font-bold text-foreground block">{sec.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">#{sec.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Reorder Up/Down */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-secondary disabled:opacity-30 transition-colors text-foreground"
                  title="Move section up"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                </button>
                <div className="w-[1px] h-4 bg-border"></div>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sections.length - 1}
                  className="p-1.5 hover:bg-secondary disabled:opacity-30 transition-colors text-foreground"
                  title="Move section down"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </button>
              </div>

              {/* Visibility Switch */}
              <button
                onClick={() => toggleEnabled(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  sec.enabled
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {sec.enabled ? 'visibility' : 'visibility_off'}
                </span>
                <span>{sec.enabled ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
