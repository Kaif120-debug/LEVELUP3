import React from 'react';
import { JobInterview, JobApplication } from '../../types';

interface UpcomingInterviewsWidgetProps {
  interviews: JobInterview[];
  jobs: JobApplication[];
  onOpenSchedule: () => void;
  onViewJob: (job: JobApplication) => void;
}

export const UpcomingInterviewsWidget: React.FC<UpcomingInterviewsWidgetProps> = ({
  interviews,
  jobs,
  onOpenSchedule,
  onViewJob,
}) => {
  const nowStr = new Date().toISOString().split('T')[0];

  // Filter for interviews scheduled for today or in the future, or active
  const upcoming = interviews
    .filter((i) => i.result === 'Scheduled' || i.interview_date >= nowStr)
    .sort((a, b) => (a.interview_date > b.interview_date ? 1 : -1))
    .slice(0, 4);

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">event_upcoming</span>
            </span>
            <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
              Upcoming Interviews
            </h4>
          </div>
          <button
            onClick={onOpenSchedule}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Schedule</span>
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="py-6 text-center text-xs text-on-surface-variant/70 border border-dashed border-outline-variant/40 rounded-lg">
            <span className="material-symbols-outlined text-xl opacity-40 mb-1">calendar_today</span>
            <p>No interviews scheduled</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
              Log phone screens, technical rounds & hiring chats.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((iv) => {
              const matchedJob = jobs.find((j) => j.id === iv.job_application_id);
              const isToday = iv.interview_date === nowStr;

              return (
                <div
                  key={iv.id}
                  onClick={() => matchedJob && onViewJob(matchedJob)}
                  className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-on-surface truncate">
                        {matchedJob ? matchedJob.company_name || matchedJob.company : 'Job'}
                      </span>
                      {isToday ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                          TODAY
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {iv.interview_date}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {iv.round} • {iv.interview_type}
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-xs text-on-surface-variant flex-shrink-0">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
