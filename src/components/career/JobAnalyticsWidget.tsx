import React from 'react';
import { JobStats } from '../../types';

interface JobAnalyticsWidgetProps {
  stats: JobStats;
}

export const JobAnalyticsWidget: React.FC<JobAnalyticsWidgetProps> = ({ stats }) => {
  const stageDistribution = [
    { label: 'Saved', count: stats.saved, color: 'bg-slate-400' },
    { label: 'Applied', count: stats.applied, color: 'bg-blue-500' },
    { label: 'Screening', count: stats.screening, color: 'bg-purple-500' },
    { label: 'Interview', count: stats.interview, color: 'bg-amber-500' },
    { label: 'Offer', count: stats.offer, color: 'bg-emerald-500' },
    { label: 'Rejected', count: stats.rejected, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-base">analytics</span>
          </span>
          <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
            Pipeline Analytics
          </h4>
        </div>

        {/* Stacked stage distribution bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-on-surface-variant font-medium">Stage Distribution</span>
            <span className="font-bold text-on-surface">{stats.total} Total</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden flex">
            {stats.total > 0 ? (
              stageDistribution.map(
                (st) =>
                  st.count > 0 && (
                    <div
                      key={st.label}
                      style={{ width: `${(st.count / stats.total) * 100}%` }}
                      className={`${st.color} h-full transition-all`}
                      title={`${st.label}: ${st.count}`}
                    />
                  )
              )
            ) : (
              <div className="w-full bg-surface-container h-full" />
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div>
          <span className="text-[11px] text-on-surface-variant font-medium block mb-2">
            Top Applied Organizations
          </span>
          {stats.topCompanies.length === 0 ? (
            <p className="text-[11px] text-on-surface-variant/60 italic">
              Add applications to see target companies.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {stats.topCompanies.map((c) => (
                <span
                  key={c.name}
                  className="px-2 py-0.5 rounded-md bg-surface-container-low border border-outline-variant/50 text-[10px] font-medium text-on-surface flex items-center gap-1"
                >
                  <span>{c.name}</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-surface-container font-mono text-[9px] flex items-center justify-center text-primary font-bold">
                    {c.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Velocity footer */}
      <div className="pt-3 mt-4 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>
          This Week: <strong className="text-on-surface">{stats.appsThisWeek}</strong>
        </span>
        <span>
          This Month: <strong className="text-on-surface">{stats.appsThisMonth}</strong>
        </span>
      </div>
    </div>
  );
};
