import React from 'react';
import { JobApplication, JobApplicationStatus } from '../../types';
import {
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
  formatJobUrl,
  getCompanyInitials,
} from './jobTrackerUtils';

interface JobTrackerTableProps {
  jobs: JobApplication[];
  onViewJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (job: JobApplication) => void;
  onDuplicateJob: (job: JobApplication) => void;
  onStatusChange: (jobId: string, status: JobApplicationStatus) => void;
  onAddNew: () => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

const ALL_STATUSES: JobApplicationStatus[] = [
  'Saved',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
];

export const JobTrackerTable: React.FC<JobTrackerTableProps> = ({
  jobs,
  onViewJob,
  onEditJob,
  onDeleteJob,
  onDuplicateJob,
  onStatusChange,
  onAddNew,
  onResetFilters,
  isFiltered = false,
}) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant/60 rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">work_outline</span>
        </div>
        <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1">
          {isFiltered ? 'No applications match your criteria' : 'No Job Applications Yet'}
        </h3>
        <p className="text-xs text-on-surface-variant mb-6 max-w-sm">
          {isFiltered
            ? 'Try adjusting or clearing your filters to see more applications.'
            : 'Track your job search from application to offer. Add your first job now to monitor interviews and follow-ups.'}
        </p>
        {isFiltered && onResetFilters ? (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        ) : (
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add First Job Application</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant font-label-caps uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Company</th>
              <th className="py-3.5 px-4 font-semibold">Job Title & Work Mode</th>
              <th className="py-3.5 px-4 font-semibold">Location</th>
              <th className="py-3.5 px-4 font-semibold">Salary</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Priority</th>
              <th className="py-3.5 px-4 font-semibold">Applied</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {jobs.map((job) => {
              const statusCfg = getStatusBadgeConfig(job.status || job.stage);
              const priorityCfg = getPriorityBadgeConfig(job.priority);
              const companyName = job.company_name || job.company || 'Unknown Company';
              const jobTitle = job.job_title || job.role || 'Untitled Role';
              const formattedUrl = formatJobUrl(job.job_url);

              return (
                <tr
                  key={job.id}
                  className="hover:bg-surface-container-lowest/70 transition-colors group"
                >
                  {/* Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center border border-outline-variant/50 flex-shrink-0">
                        {getCompanyInitials(companyName)}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onViewJob(job)}
                          className="font-bold text-on-surface hover:text-primary transition-colors text-left truncate block max-w-[160px] cursor-pointer"
                        >
                          {companyName}
                        </button>
                        {job.source && (
                          <span className="text-[10px] text-on-surface-variant block truncate">
                            via {job.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Job Title & Mode */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-on-surface truncate max-w-[180px]">
                          {jobTitle}
                        </p>
                        {job.ai_match_score !== undefined && job.ai_match_score !== null && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0"
                            title={`AI Match: ${job.ai_match_score}%`}
                          >
                            ✨ {job.ai_match_score}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                          {job.work_mode || 'Remote'}
                        </span>
                        {job.employment_type && (
                          <span className="text-[10px] text-on-surface-variant">
                            • {job.employment_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant/70">
                        location_on
                      </span>
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {job.salary ? (
                      <span className="font-semibold text-primary">{job.salary}</span>
                    ) : (
                      <span className="text-on-surface-variant/50 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Status dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={job.status || job.stage}
                        onChange={(e) =>
                          onStatusChange(job.id, e.target.value as JobApplicationStatus)
                        }
                        className={`appearance-none text-[11px] font-semibold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer outline-none transition-all ${statusCfg.bg}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-surface text-on-surface">
                            {st}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined text-xs absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                        expand_more
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`}></span>
                      <span>{priorityCfg.label}</span>
                    </span>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                    <span className="font-mono text-[11px]">
                      {job.application_date || job.date || 'Recently'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Open original Job URL */}
                      {formattedUrl && (
                        <a
                          href={formattedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Open original job posting"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => onViewJob(job)}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="View details & timeline"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Edit application"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateJob(job)}
                        className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title="Duplicate application"
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteJob(job)}
                        className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                        title="Delete application"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
