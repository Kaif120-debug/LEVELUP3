import React, { useState, useEffect } from 'react';
import { JobFollowUp, JobApplication } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (followUpData: Partial<JobFollowUp>) => Promise<void>;
  jobApplicationId: string;
  jobApplications?: JobApplication[];
  initialData?: JobFollowUp | null;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jobApplicationId,
  jobApplications = [],
  initialData,
}) => {
  const [selectedJobId, setSelectedJobId] = useState(jobApplicationId);
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSelectedJobId(initialData.job_application_id);
      setFollowUpDate(initialData.follow_up_date || new Date().toISOString().split('T')[0]);
      setNote(initialData.note || '');
      setCompleted(Boolean(initialData.completed));
    } else {
      setSelectedJobId(jobApplicationId);
      // Default follow up in 5 days
      const d = new Date();
      d.setDate(d.getDate() + 5);
      setFollowUpDate(d.toISOString().split('T')[0]);
      setNote('Follow up with recruiter on application review status');
      setCompleted(false);
    }
    setError(null);
  }, [initialData, jobApplicationId, isOpen]);

  if (!isOpen) return null;

  const currentJob = jobApplications.find((j) => j.id === selectedJobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      setError('Please select an application');
      return;
    }
    if (!note.trim()) {
      setError('Reminder note is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        job_application_id: selectedJobId,
        follow_up_date: followUpDate,
        note: note.trim(),
        completed,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">notifications_active</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {initialData ? 'Edit Follow-up Reminder' : 'Set Follow-up Reminder'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {currentJob
                  ? `For ${currentJob.company_name || currentJob.company}`
                  : 'Never let an opportunity go cold.'}
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
          {jobApplications.length > 0 && !initialData && (
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Associated Application
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {jobApplications.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company_name || j.company} — {j.job_title || j.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
              Follow-up Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
              Reminder Note <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Send thank-you note to hiring manager or check application status."
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="completedCheck"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <label
              htmlFor="completedCheck"
              className="text-xs text-on-surface font-medium cursor-pointer"
            >
              Mark reminder as completed
            </label>
          </div>

          {/* Actions */}
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
              <span>{initialData ? 'Save Reminder' : 'Set Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
