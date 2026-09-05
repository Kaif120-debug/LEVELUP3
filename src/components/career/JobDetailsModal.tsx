import React, { useState } from 'react';
import {
  JobApplication,
  JobApplicationStatus,
  JobInterview,
  JobFollowUp,
} from '../../types';
import {
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
  formatJobUrl,
  getCompanyInitials,
} from './jobTrackerUtils';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication | null;
  interviews: JobInterview[];
  followUps: JobFollowUp[];
  onEdit: (job: JobApplication) => void;
  onDuplicate: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onStatusChange: (jobId: string, status: JobApplicationStatus) => void;
  onOpenScheduleInterview: (job: JobApplication) => void;
  onOpenAddFollowUp: (job: JobApplication) => void;
  onToggleFollowUp: (followUp: JobFollowUp) => void;
  onDeleteInterview: (interviewId: string) => void;
  onDeleteFollowUp: (followUpId: string) => void;
  onOpenAIAnalyzer?: (job: JobApplication) => void;
}

const ALL_STATUSES: JobApplicationStatus[] = [
  'Saved',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
];

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job,
  interviews,
  followUps,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onOpenScheduleInterview,
  onOpenAddFollowUp,
  onToggleFollowUp,
  onDeleteInterview,
  onDeleteFollowUp,
  onOpenAIAnalyzer,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'interviews' | 'followups' | 'timeline' | 'ai'>(
    'details'
  );

  if (!isOpen || !job) return null;

  const companyName = job.company_name || job.company || 'Unknown Company';
  const jobTitle = job.job_title || job.role || 'Untitled Role';
  const statusCfg = getStatusBadgeConfig(job.status || job.stage);
  const priorityCfg = getPriorityBadgeConfig(job.priority);
  const formattedUrl = formatJobUrl(job.job_url);

  const jobInterviews = interviews.filter((i) => i.job_application_id === job.id);
  const jobFollowUps = followUps.filter((f) => f.job_application_id === job.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-2xl w-full my-8 shadow-2xl animate-fade-up overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary font-bold text-base flex items-center justify-center border border-outline-variant/60 shadow-sm flex-shrink-0">
              {getCompanyInitials(companyName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  {companyName}
                </h3>
                {formattedUrl && (
                  <a
                    href={formattedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                  >
                    <span>View Listing</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
              <p className="text-sm font-semibold text-on-surface-variant mb-2">{jobTitle}</p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Dropdown */}
                <div className="relative inline-block">
                  <select
                    value={job.status || job.stage}
                    onChange={(e) => onStatusChange(job.id, e.target.value as JobApplicationStatus)}
                    className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer outline-none ${statusCfg.bg}`}
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

                {/* Priority */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityCfg.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                  <span>{priorityCfg.label} Priority</span>
                </span>

                {/* AI Match Score Badge */}
                {job.ai_match_score !== undefined && job.ai_match_score !== null && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                  >
                    <span>✨ {job.ai_match_score}% Match</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-outline-variant/60 bg-surface gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'interviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Interviews</span>
            {jobInterviews.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-mono">
                {jobInterviews.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'followups'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Follow-ups</span>
            {jobFollowUps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/10 text-blue-600 font-mono">
                {jobFollowUps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'timeline'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Activity Timeline
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>AI Intelligence</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              {job.ai_match_score ? `${job.ai_match_score}%` : '✨'}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Core Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Location
                  </span>
                  <p className="font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                    <span>{job.location || 'Remote'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Salary / Comp
                  </span>
                  <p className="font-semibold text-primary">
                    {job.salary || 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Work Mode
                  </span>
                  <p className="font-semibold text-on-surface">{job.work_mode || 'Remote'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Employment Type
                  </span>
                  <p className="font-semibold text-on-surface">
                    {job.employment_type || 'Full-time'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Application Date
                  </span>
                  <p className="font-mono font-semibold text-on-surface">
                    {job.application_date || job.date || 'Recently'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block mb-1">
                    Application Source
                  </span>
                  <p className="font-semibold text-on-surface">{job.source || 'LinkedIn'}</p>
                </div>
              </div>

              {/* Notes block */}
              <div>
                <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Application Notes & Contacts
                </h4>
                {job.notes ? (
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 text-on-surface leading-relaxed whitespace-pre-wrap">
                    {job.notes}
                  </div>
                ) : (
                  <p className="text-on-surface-variant/70 italic bg-surface-container-lowest p-3 rounded-lg border border-dashed border-outline-variant/60">
                    No notes recorded yet. Click "Edit Application" to add contacts, recruiter details, or interview prep notes.
                  </p>
                )}
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-on-surface text-xs">Interviews</h5>
                    <p className="text-[11px] text-on-surface-variant">
                      {jobInterviews.length} round(s) scheduled/logged
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenScheduleInterview(job)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-amber-600 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>Log Round</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-on-surface text-xs">Follow-ups</h5>
                    <p className="text-[11px] text-on-surface-variant">
                      {jobFollowUps.length} reminder(s) set
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenAddFollowUp(job)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-blue-700 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>Set Reminder</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
                  Interview Rounds
                </h4>
                <button
                  onClick={() => onOpenScheduleInterview(job)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span>+ Schedule Interview</span>
                </button>
              </div>

              {jobInterviews.length === 0 ? (
                <div className="border border-dashed border-outline-variant/60 rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">
                    video_call
                  </span>
                  <p className="font-semibold text-on-surface text-xs mb-1">
                    No interviews logged for this role yet
                  </p>
                  <p className="text-[11px] text-on-surface-variant mb-4">
                    Track technical screens, take-home tasks, system design, and recruiter chats.
                  </p>
                  <button
                    onClick={() => onOpenScheduleInterview(job)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Log First Interview
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobInterviews.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface text-xs">
                              {item.round || 'Interview Round'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {item.result || 'Scheduled'}
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            {item.interview_type} • {item.interview_date} {item.interview_time ? `at ${item.interview_time}` : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteInterview(item.id)}
                          className="text-on-surface-variant hover:text-error p-1 rounded transition-colors cursor-pointer"
                          title="Delete interview"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>

                      {item.interviewer && (
                        <p className="text-[11px] text-on-surface mb-1">
                          <strong className="text-on-surface-variant">Interviewer:</strong> {item.interviewer}
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-[11px] text-on-surface-variant italic bg-surface-container-low p-2 rounded mt-2">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface">
                  Follow-up Reminders
                </h4>
                <button
                  onClick={() => onOpenAddFollowUp(job)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">notification_add</span>
                  <span>+ Add Reminder</span>
                </button>
              </div>

              {jobFollowUps.length === 0 ? (
                <div className="border border-dashed border-outline-variant/60 rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">
                    notifications
                  </span>
                  <p className="font-semibold text-on-surface text-xs mb-1">No follow-ups scheduled</p>
                  <p className="text-[11px] text-on-surface-variant mb-4">
                    Keep momentum going by setting reminders to follow up with recruiters.
                  </p>
                  <button
                    onClick={() => onOpenAddFollowUp(job)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Set a Reminder
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {jobFollowUps.map((fu) => (
                    <div
                      key={fu.id}
                      className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                        fu.completed
                          ? 'bg-surface-container-lowest/50 border-outline-variant/40 opacity-70'
                          : 'bg-surface-container-lowest border-outline-variant/60 hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={fu.completed}
                          onChange={() => onToggleFollowUp(fu)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        />
                        <div>
                          <p
                            className={`text-xs font-medium text-on-surface ${
                              fu.completed ? 'line-through text-on-surface-variant' : ''
                            }`}
                          >
                            {fu.note}
                          </p>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            Due: {fu.follow_up_date}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteFollowUp(fu.id)}
                        className="text-on-surface-variant hover:text-error p-1 rounded transition-colors cursor-pointer"
                        title="Delete reminder"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-headline-sm text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Application Progression
              </h4>

              <div className="relative pl-6 border-l-2 border-outline-variant/60 space-y-6">
                {/* Applied Event */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-surface" />
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50">
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {job.application_date || job.date || 'Initial Entry'}
                    </span>
                    <h5 className="font-bold text-xs text-on-surface mt-0.5">Application Submitted</h5>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Applied for {jobTitle} via {job.source || 'Direct Search'}.
                    </p>
                  </div>
                </div>

                {/* Interviews */}
                {jobInterviews.map((iv) => (
                  <div key={iv.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-surface" />
                    <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50">
                      <span className="text-[10px] text-amber-600 font-mono">
                        {iv.interview_date} {iv.interview_time}
                      </span>
                      <h5 className="font-bold text-xs text-on-surface mt-0.5">
                        {iv.round || 'Interview'} ({iv.result || 'Scheduled'})
                      </h5>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {iv.interview_type} {iv.interviewer ? `with ${iv.interviewer}` : ''}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Current Stage */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-surface" />
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <span className="text-[10px] text-primary font-mono">Current Status</span>
                    <h5 className="font-bold text-xs text-on-surface mt-0.5">
                      Stage: {job.status || job.stage}
                    </h5>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Application is currently in the <strong>{job.status || job.stage}</strong> bucket.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI CAREER INTELLIGENCE */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {job.ai_analysis || job.ai_match_score ? (
                <div className="space-y-5">
                  {/* Top Match Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-surface-container-low to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-surface shadow-md border-4 border-emerald-500/40 flex items-center justify-center shrink-0">
                        <div className="text-center">
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {job.ai_match_score || job.ai_analysis?.match_score}%
                          </span>
                          <span className="block text-[9px] font-bold text-on-surface-variant uppercase mt-0.5">
                            Match
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-on-surface">
                            {job.ai_analysis?.fit_verdict || 'Evaluated Fit'}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Evaluated against your verified profile and resume qualifications
                        </p>
                      </div>
                    </div>

                    {onOpenAIAnalyzer && (
                      <button
                        type="button"
                        onClick={() => onOpenAIAnalyzer(job)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span>Open Full AI Suite</span>
                      </button>
                    )}
                  </div>

                  {/* Summary / Mission */}
                  {(job.ai_summary || job.ai_analysis?.job_summary) && (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-1">
                      <span className="text-[10px] uppercase font-label-caps text-on-surface-variant font-bold">
                        Opportunity Scope & Overview
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {job.ai_summary || job.ai_analysis?.job_summary}
                      </p>
                    </div>
                  )}

                  {/* Matched vs Missing Skills */}
                  {job.ai_analysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Matched */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300/50 dark:border-emerald-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase">
                            Matched Skills ({job.ai_analysis.matched_skills?.length || 0})
                          </span>
                          <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.ai_analysis.matched_skills?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing / Gaps */}
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
                            Skills Missing ({job.ai_analysis.missing_skills?.length || 0})
                          </span>
                          <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.ai_analysis.missing_skills?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {job.ai_analysis?.application_recommendations && job.ai_analysis.application_recommendations.length > 0 && (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-2">
                      <span className="text-[10px] uppercase font-label-caps text-on-surface-variant font-bold">
                        Strategic Positioning Advice
                      </span>
                      <ul className="space-y-1.5">
                        {job.ai_analysis.application_recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-on-surface flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-4 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-on-surface">
                      No AI Career Intelligence Analyzed Yet
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Run our AI Intelligence scanner on this role to compare it against your profile, calculate ATS alignment, reveal skill gaps, and generate tailored cover letters.
                    </p>
                  </div>
                  {onOpenAIAnalyzer && (
                    <button
                      type="button"
                      onClick={() => onOpenAIAnalyzer(job)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      <span>✨ Run AI Analysis for {companyName}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(job)}
              className="px-3 py-1.5 rounded-lg text-error hover:bg-error/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              <span>Delete</span>
            </button>
            <button
              onClick={() => onDuplicate(job)}
              className="px-3 py-1.5 rounded-lg text-on-surface hover:bg-surface-container text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>Duplicate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(job)}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Application</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
