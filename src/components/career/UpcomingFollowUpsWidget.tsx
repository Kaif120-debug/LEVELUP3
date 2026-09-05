import React from 'react';
import { JobFollowUp, JobApplication } from '../../types';

interface UpcomingFollowUpsWidgetProps {
  followUps: JobFollowUp[];
  jobs: JobApplication[];
  onOpenAddFollowUp: () => void;
  onToggleComplete: (followUp: JobFollowUp) => void;
  onViewJob: (job: JobApplication) => void;
}

export const UpcomingFollowUpsWidget: React.FC<UpcomingFollowUpsWidgetProps> = ({
  followUps,
  jobs,
  onOpenAddFollowUp,
  onToggleComplete,
  onViewJob,
}) => {
  const pending = followUps.filter((f) => !f.completed).slice(0, 4);

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">notifications_active</span>
            </span>
            <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
              Pending Follow-ups
            </h4>
          </div>
          <button
            onClick={onOpenAddFollowUp}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Add Reminder</span>
          </button>
        </div>

        {pending.length === 0 ? (
          <div className="py-6 text-center text-xs text-on-surface-variant/70 border border-dashed border-outline-variant/40 rounded-lg">
            <span className="material-symbols-outlined text-xl opacity-40 mb-1">done_all</span>
            <p>All caught up!</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
              No pending reminders or check-ins.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((fu) => {
              const matchedJob = jobs.find((j) => j.id === fu.job_application_id);

              return (
                <div
                  key={fu.id}
                  className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-blue-500/60 transition-all flex items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={fu.completed}
                      onChange={() => onToggleComplete(fu)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{fu.note}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                        {matchedJob && (
                          <button
                            onClick={() => onViewJob(matchedJob)}
                            className="font-medium text-primary hover:underline truncate"
                          >
                            {matchedJob.company_name || matchedJob.company}
                          </button>
                        )}
                        <span>• Due {fu.follow_up_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
