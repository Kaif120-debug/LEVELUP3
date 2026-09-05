import React from 'react';
import { JobApplicationStatus } from '../../types';

interface JobTrackerPipelineProps {
  counts: Record<JobApplicationStatus, number>;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const PIPELINE_STAGES: {
  status: JobApplicationStatus;
  label: string;
  color: string;
  dotColor: string;
  icon: string;
}[] = [
  { status: 'Saved', label: 'Saved', color: 'slate', dotColor: 'bg-slate-400', icon: 'bookmark' },
  { status: 'Applied', label: 'Applied', color: 'blue', dotColor: 'bg-blue-500', icon: 'send' },
  { status: 'Screening', label: 'Screening', color: 'purple', dotColor: 'bg-purple-500', icon: 'filter_alt' },
  { status: 'Interview', label: 'Interview', color: 'amber', dotColor: 'bg-amber-500', icon: 'video_call' },
  { status: 'Offer', label: 'Offer', color: 'emerald', dotColor: 'bg-emerald-500', icon: 'verified' },
  { status: 'Rejected', label: 'Rejected', color: 'rose', dotColor: 'bg-rose-500', icon: 'cancel' },
];

export const JobTrackerPipeline: React.FC<JobTrackerPipelineProps> = ({
  counts,
  activeStatus,
  onSelectStatus,
}) => {
  return (
    <div className="w-full bg-surface border border-outline-variant/60 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">linear_scale</span>
          <span className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
            Application Pipeline
          </span>
        </div>
        {activeStatus !== 'ALL' && (
          <button
            onClick={() => onSelectStatus('ALL')}
            className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Show All Stages</span>
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        )}
      </div>

      {/* Pipeline Progression Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isSelected = activeStatus === stage.status;
          const count = counts[stage.status] || 0;

          return (
            <button
              key={stage.status}
              onClick={() => onSelectStatus(isSelected ? 'ALL' : stage.status)}
              className={`relative p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                  : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dotColor}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">{stage.label}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  count > 0
                    ? 'bg-surface-container-high text-on-surface font-mono'
                    : 'text-on-surface-variant/50 font-mono'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
