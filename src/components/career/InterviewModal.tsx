import React, { useState, useEffect } from 'react';
import { JobInterview, JobApplication } from '../../types';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interviewData: Partial<JobInterview>) => Promise<void>;
  jobApplicationId: string;
  jobApplications?: JobApplication[];
  initialData?: JobInterview | null;
}

const ROUNDS = [
  'Recruiter Phone Screen',
  'Technical Screen (Round 1)',
  'Coding & Problem Solving',
  'System Design & Architecture',
  'Hiring Manager Interview',
  'Leadership & Culture Fit',
  'Final / Executive Round',
  'Take-home Assessment / Presentation',
  'Other',
];

const INTERVIEW_TYPES = ['Video Call', 'Phone Call', 'On-site', 'Take-home Assessment'];

const RESULTS = [
  'Scheduled',
  'Completed - Passed',
  'Completed - Pending Feedback',
  'Did Not Pass',
  'Cancelled',
];

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jobApplicationId,
  jobApplications = [],
  initialData,
}) => {
  const [selectedJobId, setSelectedJobId] = useState(jobApplicationId);
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewTime, setInterviewTime] = useState('10:00 AM');
  const [round, setRound] = useState('Technical Screen (Round 1)');
  const [interviewType, setInterviewType] = useState('Video Call');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('Scheduled');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSelectedJobId(initialData.job_application_id);
      setInterviewDate(initialData.interview_date || new Date().toISOString().split('T')[0]);
      setInterviewTime(initialData.interview_time || '10:00 AM');
      setRound(initialData.round || 'Technical Screen (Round 1)');
      setInterviewType(initialData.interview_type || 'Video Call');
      setInterviewer(initialData.interviewer || '');
      setNotes(initialData.notes || '');
      setResult(initialData.result || 'Scheduled');
    } else {
      setSelectedJobId(jobApplicationId);
      setInterviewDate(new Date().toISOString().split('T')[0]);
      setInterviewTime('10:00 AM');
      setRound('Technical Screen (Round 1)');
      setInterviewType('Video Call');
      setInterviewer('');
      setNotes('');
      setResult('Scheduled');
    }
    setError(null);
  }, [initialData, jobApplicationId, isOpen]);

  if (!isOpen) return null;

  const currentJob = jobApplications.find((j) => j.id === selectedJobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      setError('Please select an application for this interview');
      return;
    }
    if (!interviewDate) {
      setError('Interview date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        job_application_id: selectedJobId,
        interview_date: interviewDate,
        interview_time: interviewTime,
        round,
        interview_type: interviewType,
        interviewer: interviewer.trim(),
        notes: notes.trim(),
        result: result as any,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-lg w-full my-8 shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">event_available</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {initialData ? 'Edit Interview' : 'Schedule / Log Interview'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {currentJob
                  ? `For ${currentJob.job_title || currentJob.role} at ${currentJob.company_name || currentJob.company}`
                  : 'Track rounds, interviewer contacts, and prep notes.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Associated Job Selector (if multiple jobs available and not fixed) */}
          {jobApplications.length > 0 && !initialData && (
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Associated Job Application <span className="text-error">*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                <option value="">Select a job application...</option>
                {jobApplications.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company_name || j.company} — {j.job_title || j.role} ({j.status || j.stage})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time (Row 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Interview Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Time (e.g. 2:30 PM IST)
              </label>
              <input
                type="text"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="e.g. 10:30 AM or 3:00 PM EST"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Round & Interview Type (Row 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Interview Round
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interviewer Info & Result Status (Row 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Interviewer Name / Title
              </label>
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="e.g. Maya Lin (Staff Engineer)"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Outcome / Result
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {RESULTS.map((res) => (
                  <option key={res} value={res}>
                    {res}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prep & Notes */}
          <div>
            <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
              Interview Notes & Prep Questions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on distributed caching, Redis design patterns, and past projects handling high throughput."
              className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              )}
              <span>{initialData ? 'Save Interview' : 'Schedule Interview'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
