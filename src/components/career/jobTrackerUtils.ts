import { JobApplicationStatus, JobPriority } from '../../types';

export function getStatusBadgeConfig(status: JobApplicationStatus | string) {
  const norm = (status || 'Applied').toLowerCase();
  switch (norm) {
    case 'saved':
      return {
        label: 'Saved',
        bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
        dot: 'bg-slate-400',
        icon: 'bookmark',
      };
    case 'applied':
      return {
        label: 'Applied',
        bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        dot: 'bg-blue-500',
        icon: 'send',
      };
    case 'screening':
    case 'shortlisted':
      return {
        label: 'Screening',
        bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        dot: 'bg-purple-500',
        icon: 'filter_alt',
      };
    case 'interview':
    case 'interviewing':
      return {
        label: 'Interview',
        bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        dot: 'bg-amber-500',
        icon: 'video_call',
      };
    case 'offer':
    case 'offered':
      return {
        label: 'Offer',
        bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        dot: 'bg-emerald-500',
        icon: 'verified',
      };
    case 'rejected':
    case 'declined':
      return {
        label: 'Rejected',
        bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        dot: 'bg-rose-500',
        icon: 'cancel',
      };
    default:
      return {
        label: status || 'Applied',
        bg: 'bg-surface-container text-on-surface-variant border-outline-variant/50',
        dot: 'bg-on-surface-variant',
        icon: 'circle',
      };
  }
}

export function getPriorityBadgeConfig(priority?: JobPriority | string) {
  const norm = (priority || 'Medium').toLowerCase();
  switch (norm) {
    case 'high':
      return {
        label: 'High',
        badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
        dot: 'bg-red-500',
      };
    case 'medium':
      return {
        label: 'Medium',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
      };
    case 'low':
      return {
        label: 'Low',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: 'Medium',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400',
      };
  }
}

export function formatJobUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getCompanyInitials(name: string): string {
  if (!name) return 'CO';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
