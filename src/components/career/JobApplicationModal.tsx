import React, { useState, useEffect } from 'react';
import {
  JobApplication,
  JobApplicationStatus,
  JobEmploymentType,
  JobWorkMode,
  JobPriority,
  JobSource,
} from '../../types';
import { formatJobUrl } from './jobTrackerUtils';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appData: Partial<JobApplication>) => Promise<void>;
  initialData?: JobApplication | null;
  defaultStage?: JobApplicationStatus;
}

const SOURCES: JobSource[] = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Other'];
const WORK_MODES: JobWorkMode[] = ['Remote', 'Hybrid', 'On-site'];
const EMPLOYMENT_TYPES: JobEmploymentType[] = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const STATUSES: JobApplicationStatus[] = ['Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
const PRIORITIES: JobPriority[] = ['High', 'Medium', 'Low'];

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultStage = 'Applied',
}) => {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobUrl, setJobUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [employmentType, setEmploymentType] = useState<JobEmploymentType>('Full-time');
  const [workMode, setWorkMode] = useState<JobWorkMode>('Remote');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<JobSource>('LinkedIn');
  const [status, setStatus] = useState<JobApplicationStatus>(defaultStage);
  const [priority, setPriority] = useState<JobPriority>('Medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ company?: string; jobTitle?: string }>({});

  useEffect(() => {
    if (initialData) {
      setCompany(initialData.company_name || initialData.company || '');
      setJobTitle(initialData.job_title || initialData.role || '');
      setLocation(initialData.location || 'Remote');
      setJobUrl(initialData.job_url || '');
      setSalary(initialData.salary || '');
      setEmploymentType(initialData.employment_type || 'Full-time');
      setWorkMode(initialData.work_mode || 'Remote');
      setApplicationDate(initialData.application_date || new Date().toISOString().split('T')[0]);
      setSource(initialData.source || 'LinkedIn');
      setStatus(initialData.status || initialData.stage || defaultStage);
      setPriority(initialData.priority || 'Medium');
      setNotes(initialData.notes || '');
    } else {
      setCompany('');
      setJobTitle('');
      setLocation('Remote');
      setJobUrl('');
      setSalary('');
      setEmploymentType('Full-time');
      setWorkMode('Remote');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setSource('LinkedIn');
      setStatus(defaultStage);
      setPriority('Medium');
      setNotes('');
    }
    setErrors({});
  }, [initialData, defaultStage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { company?: string; jobTitle?: string } = {};

    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        company: company.trim(),
        company_name: company.trim(),
        role: jobTitle.trim(),
        job_title: jobTitle.trim(),
        location: location.trim() || 'Remote',
        job_url: formatJobUrl(jobUrl),
        salary: salary.trim(),
        employment_type: employmentType,
        work_mode: workMode,
        application_date: applicationDate,
        source,
        stage: status,
        status,
        priority,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save application', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">
                {initialData ? 'edit_document' : 'post_add'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {initialData ? 'Edit Job Application' : 'Add New Job Application'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Fill in the details to track this role in your career pipeline.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Company & Job Title (Row 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (errors.company) setErrors((prev) => ({ ...prev, company: undefined }));
                }}
                placeholder="e.g. Google, Stripe, Microsoft"
                className={`w-full px-3 py-2 rounded-lg bg-surface-container-lowest border text-on-surface outline-none focus:ring-1 transition-all ${
                  errors.company
                    ? 'border-error focus:ring-error'
                    : 'border-outline-variant focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.company && (
                <p className="text-[10px] text-error mt-1">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Job Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: undefined }));
                }}
                placeholder="e.g. Senior Frontend Engineer"
                className={`w-full px-3 py-2 rounded-lg bg-surface-container-lowest border text-on-surface outline-none focus:ring-1 transition-all ${
                  errors.jobTitle
                    ? 'border-error focus:ring-error'
                    : 'border-outline-variant focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.jobTitle && (
                <p className="text-[10px] text-error mt-1">{errors.jobTitle}</p>
              )}
            </div>
          </div>

          {/* Location & Salary Range (Row 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Bangalore, New York"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Salary / Compensation
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $140k - $160k or ₹20 - 28 LPA"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Job URL (Row 3) */}
          <div>
            <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
              Job URL / Listing Link
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant text-base absolute left-3 top-1/2 -translate-y-1/2">
                link
              </span>
              <input
                type="text"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/... or careers page"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Employment Type & Work Mode (Row 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as JobEmploymentType)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as JobWorkMode)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Application Date & Source (Row 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Application Date
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as JobSource)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority (Row 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as JobPriority)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes (Row 7) */}
          <div>
            <label className="font-label-caps text-[11px] font-semibold text-on-surface block mb-1">
              Notes / Recruiter Contacts / Key Highlights
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recruiter: Priya (LinkedIn). Referred by Sarah. Emphasize React & Distributed Systems experience."
              className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
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
              <span>{initialData ? 'Save Changes' : 'Create Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
