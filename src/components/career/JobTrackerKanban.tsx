import React from 'react';
import { JobApplication, JobApplicationStatus } from '../../types';
import {
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
  formatJobUrl,
  getCompanyInitials,
} from './jobTrackerUtils';

interface JobTrackerKanbanProps {
  jobs: JobApplication[];
  onViewJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (job: JobApplication) => void;
  onDuplicateJob: (job: JobApplication) => void;
  onStatusChange: (jobId: string, status: JobApplicationStatus) => void;
  onAddNewInStage: (stage: JobApplicationStatus) => void;
}

const COLUMNS: {
  status: JobApplicationStatus;
  label: string;
  dotColor: string;
  headerBorder: string;
}[] = [
  { status: 'Saved', label: 'Saved', dotColor: 'bg-slate-400', headerBorder: 'border-slate-400/40' },
  { status: 'Applied', label: 'Applied', dotColor: 'bg-blue-500', headerBorder: 'border-blue-500/40' },
  { status: 'Screening', label: 'Screening', dotColor: 'bg-purple-500', headerBorder: 'border-purple-500/40' },
  { status: 'Interview', label: 'Interview', dotColor: 'bg-amber-500', headerBorder: 'border-amber-500/40' },
  { status: 'Offer', label: 'Offer', dotColor: 'bg-emerald-500', headerBorder: 'border-emerald-500/40' },
  { status: 'Rejected', label: 'Rejected', dotColor: 'bg-rose-500', headerBorder: 'border-rose-500/40' },
];

export const JobTrackerKanban: React.FC<JobTrackerKanbanProps> = ({
  jobs,
  onViewJob,
  onEditJob,
  onDeleteJob,
  onDuplicateJob,
  onStatusChange,
  onAddNewInStage,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-4 min-w-[1240px] items-start">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => (j.status || j.stage) === col.status);

          return (
            <div
              key={col.status}
              className="w-[280px] sm:w-[300px] flex-shrink-0 flex flex-col bg-surface-container-lowest/70 border border-outline-variant/60 rounded-xl p-3"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between pb-2.5 mb-3 border-b ${col.headerBorder}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
                    {col.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant font-mono">
                    {colJobs.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddNewInStage(col.status)}
                  className="w-6 h-6 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                  title={`Add job in ${col.label}`}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 min-h-[350px]">
                {colJobs.map((job) => {
                  const companyName = job.company_name || job.company || 'Unknown Company';
                  const jobTitle = job.job_title || job.role || 'Untitled Role';
                  const priorityCfg = getPriorityBadgeConfig(job.priority);
                  const formattedUrl = formatJobUrl(job.job_url);

                  return (
                    <div
                      key={job.id}
                      className="bg-surface border border-outline-variant/60 rounded-xl p-3.5 hover:border-primary/70 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      {/* Card Top: Company & Priority */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center border border-outline-variant/40 flex-shrink-0">
                            {getCompanyInitials(companyName)}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onViewJob(job)}
                              className="font-bold text-xs text-on-surface hover:text-primary transition-colors text-left truncate block max-w-[140px] cursor-pointer"
                            >
                              {companyName}
                            </button>
                            <span className="text-[10px] text-on-surface-variant block font-mono">
                              {job.application_date || job.date || 'Recently'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border flex-shrink-0 ${priorityCfg.badgeClass}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${priorityCfg.dot}`}></span>
                          <span>{priorityCfg.label}</span>
                        </span>
                      </div>

                      {/* Job Title */}
                      <h4 className="font-semibold text-xs text-on-surface mb-2 line-clamp-1">
                        {jobTitle}
                      </h4>

                      {/* Chips: Salary, Mode */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px]">
                        {job.ai_match_score !== undefined && job.ai_match_score !== null && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            title={`AI Match: ${job.ai_match_score}%`}
                          >
                            ✨ {job.ai_match_score}%
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                          {job.work_mode || 'Remote'}
                        </span>
                        {job.salary && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                            {job.salary}
                          </span>
                        )}
                        {job.location && (
                          <span className="text-on-surface-variant/70 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">location_on</span>
                            <span className="truncate max-w-[80px]">{job.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Notes snippet if present */}
                      {job.notes && (
                        <p className="text-[11px] text-on-surface-variant italic mb-3 bg-surface-container-low/70 p-1.5 rounded border border-outline-variant/30 line-clamp-2">
                          "{job.notes}"
                        </p>
                      )}

                      {/* Card Footer: Stage Mover & Action Buttons */}
                      <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs mt-auto">
                        <select
                          value={job.status || job.stage}
                          onChange={(e) =>
                            onStatusChange(job.id, e.target.value as JobApplicationStatus)
                          }
                          className="text-[10px] font-medium bg-surface-container-low text-on-surface rounded px-2 py-1 border border-outline-variant/60 outline-none cursor-pointer hover:border-primary"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              Move: {c.label}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-0.5">
                          {formattedUrl && (
                            <a
                              href={formattedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors"
                              title="Open original job posting"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                          )}
                          <button
                            onClick={() => onViewJob(job)}
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="View details"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          <button
                            onClick={() => onEditJob(job)}
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => onDuplicateJob(job)}
                            className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                          <button
                            onClick={() => onDeleteJob(job)}
                            className="p-1 rounded text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colJobs.length === 0 && (
                  <div className="border border-dashed border-outline-variant/60 rounded-xl p-6 text-center text-xs text-on-surface-variant/70 flex flex-col items-center justify-center min-h-[140px]">
                    <span className="material-symbols-outlined text-xl mb-1 opacity-40">
                      folder_open
                    </span>
                    <span>No jobs in {col.label}</span>
                    <button
                      onClick={() => onAddNewInStage(col.status)}
                      className="mt-2 text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      + Add application
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
