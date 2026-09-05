import React from 'react';
import { JobStats, JobApplicationStatus } from '../../types';

interface JobTrackerStatsProps {
  stats: JobStats;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export const JobTrackerStats: React.FC<JobTrackerStatsProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const cards: {
    id: string;
    label: string;
    count: number;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    filterValue?: string;
  }[] = [
    {
      id: 'total',
      label: 'Total Applications',
      count: stats.total,
      icon: 'work',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      filterValue: 'ALL',
    },
    {
      id: 'saved',
      label: 'Saved',
      count: stats.saved,
      icon: 'bookmark',
      color: 'text-slate-600 dark:text-slate-300',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-400/20',
      filterValue: 'Saved',
    },
    {
      id: 'applied',
      label: 'Applied',
      count: stats.applied,
      icon: 'send',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/20',
      filterValue: 'Applied',
    },
    {
      id: 'screening',
      label: 'Screening',
      count: stats.screening,
      icon: 'filter_alt',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/20',
      filterValue: 'Screening',
    },
    {
      id: 'interview',
      label: 'Interviews',
      count: stats.interview,
      icon: 'video_call',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-400/20',
      filterValue: 'Interview',
    },
    {
      id: 'offer',
      label: 'Offers',
      count: stats.offer,
      icon: 'verified',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-400/20',
      filterValue: 'Offer',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: stats.rejected,
      icon: 'cancel',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-400/20',
      filterValue: 'Rejected',
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Top 7 Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {cards.map((card) => {
          const isSelected =
            card.filterValue === 'ALL'
              ? activeStatusFilter === 'ALL'
              : activeStatusFilter === card.filterValue;

          return (
            <button
              key={card.id}
              onClick={() => card.filterValue && onSelectStatusFilter(card.filterValue)}
              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-surface shadow-md ring-2 ring-primary border-primary'
                  : 'bg-surface border-outline-variant/60 hover:border-outline-variant hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-caps text-[10px] text-on-surface-variant font-medium tracking-wider uppercase truncate">
                  {card.label}
                </span>
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${card.bgColor} ${card.color}`}
                >
                  <span className="material-symbols-outlined text-sm">{card.icon}</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.count}</span>
                {stats.total > 0 && card.filterValue !== 'ALL' && (
                  <span className="text-[11px] text-on-surface-variant/80 font-medium">
                    {Math.round((card.count / stats.total) * 100)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conversion Banner: Response Rate & Conversion Metrics */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-lg">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface text-sm">
                Response Rate: {stats.responseRate}%
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium border border-outline-variant/40"
                title="Response Rate = (Screening + Interview + Offer + Rejected) / Total × 100"
              >
                (Screening + Interview + Offer + Rejected) ÷ Total
              </span>
            </div>
            <p className="text-on-surface-variant text-[11px] mt-0.5">
              {stats.total === 0
                ? 'Add job applications to start measuring employer response rates.'
                : `${stats.screening + stats.interview + stats.offer + stats.rejected} of ${stats.total} applications have received an active response.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-on-surface-variant text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Interview Rate:</span>
            <strong className="text-on-surface font-semibold">{stats.interviewConversionRate}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Offer Rate:</span>
            <strong className="text-on-surface font-semibold">{stats.offerRate}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>This Month:</span>
            <strong className="text-on-surface font-semibold">{stats.appsThisMonth} apps</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
