import React from 'react';
import { PortfolioItem, PortfolioSettings } from '../../types';

interface SettingsPanelProps {
  portfolio: PortfolioItem;
  onChange: (updates: Partial<PortfolioItem>) => void;
  isPro?: boolean;
}

export const PortfolioSettingsPanel: React.FC<SettingsPanelProps> = ({ portfolio, onChange, isPro = true }) => {
  const { settings, name, analytics } = portfolio;

  const updateSettings = (updates: Partial<PortfolioSettings>) => {
    onChange({ settings: { ...settings, ...updates } });
  };

  const fullUrl = `https://${settings.slug || 'portfolio'}.levelup.site`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    alert('Public portfolio URL copied to clipboard: ' + fullUrl);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. General Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">General Website Settings</h3>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Portfolio Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            placeholder="e.g. Alexander Chen — Staff Designer"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Subdomain & Live URL</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center border border-border rounded-lg bg-card px-3 py-2 text-xs font-mono">
              <span className="text-muted-foreground">https://</span>
              <input
                type="text"
                value={settings.slug}
                onChange={(e) => updateSettings({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="bg-transparent text-foreground font-bold focus:outline-none px-1 flex-1"
                placeholder="username"
              />
              <span className="text-muted-foreground">.levelup.site</span>
            </div>
            <button
              onClick={copyUrl}
              className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEO & Social Meta */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Search Engine Optimization (SEO)</h3>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">SEO Title Tag</label>
          <input
            type="text"
            value={settings.seoTitle || ''}
            onChange={(e) => updateSettings({ seoTitle: e.target.value })}
            className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            placeholder="e.g. Alexander Chen — Product Designer & Design Technologist"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">SEO Meta Description</label>
          <textarea
            rows={2}
            value={settings.seoDescription || ''}
            onChange={(e) => updateSettings({ seoDescription: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground leading-relaxed"
            placeholder="A compelling 1-2 sentence description that appears in Google search snippets..."
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Browser Tab Favicon Emoji</label>
          <input
            type="text"
            value={settings.favicon || '💼'}
            onChange={(e) => updateSettings({ favicon: e.target.value })}
            className="w-20 text-center text-base px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
          />
        </div>
      </div>

      {/* 3. Pro Feature Options */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Advanced Domain & Branding</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            PRO SUITE
          </span>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Custom Domain (e.g. yourname.com)</label>
          <input
            type="text"
            value={settings.customDomain || ''}
            onChange={(e) => updateSettings({ customDomain: e.target.value })}
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            placeholder="alexanderchen.design"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Point your CNAME record to <code className="text-primary font-mono">cname.levelup.site</code>
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
          <div>
            <span className="text-xs font-bold text-foreground block">Remove "Built with LEVELUP" Badge</span>
            <span className="text-[11px] text-muted-foreground">Present a 100% white-label unbranded personal portfolio</span>
          </div>
          <button
            onClick={() => updateSettings({ removeBranding: !settings.removeBranding })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              settings.removeBranding
                ? 'bg-primary text-on-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {settings.removeBranding ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* 4. Real-Time Analytics Overview */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">Audience & Performance Analytics</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <span className="text-[11px] font-mono text-muted-foreground uppercase block">Total Views</span>
            <span className="text-xl font-bold text-foreground mt-1 block">{analytics?.views || 142}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <span className="text-[11px] font-mono text-muted-foreground uppercase block">Unique Visitors</span>
            <span className="text-xl font-bold text-foreground mt-1 block">{analytics?.uniqueVisitors || 89}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card text-center">
            <span className="text-[11px] font-mono text-muted-foreground uppercase block">CTA Inquiries</span>
            <span className="text-xl font-bold text-primary mt-1 block">{analytics?.ctaClicks || 12}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
