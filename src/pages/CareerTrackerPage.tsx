import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { CareerNav } from '../components/career/CareerNav';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  JobApplication,
  JobApplicationStatus,
  JobInterview,
  JobFollowUp,
  JobStats,
} from '../types';
import * as jobService from '../services/jobTrackerService';
import { JobTrackerStats } from '../components/career/JobTrackerStats';
import { JobTrackerPipeline } from '../components/career/JobTrackerPipeline';
import { JobTrackerFilters, FilterState } from '../components/career/JobTrackerFilters';
import { JobTrackerTable } from '../components/career/JobTrackerTable';
import { JobTrackerKanban } from '../components/career/JobTrackerKanban';
import { JobApplicationModal } from '../components/career/JobApplicationModal';
import { JobDetailsModal } from '../components/career/JobDetailsModal';
import { InterviewModal } from '../components/career/InterviewModal';
import { FollowUpModal } from '../components/career/FollowUpModal';
import { UpcomingInterviewsWidget } from '../components/career/UpcomingInterviewsWidget';
import { UpcomingFollowUpsWidget } from '../components/career/UpcomingFollowUpsWidget';
import { JobAnalyticsWidget } from '../components/career/JobAnalyticsWidget';
import { DeleteConfirmModal } from '../components/career/DeleteConfirmModal';
import { AIJobAnalyzerModal } from '../components/career/AIJobAnalyzerModal';

export const CareerTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, addJob, updateJobStage, deleteJob } = useApp();
  const { user } = useAuth();

  // Local state for loaded applications, interviews, follow-ups
  const [applications, setApplications] = useState<JobApplication[]>(state.career.jobs || []);
  const [interviews, setInterviews] = useState<JobInterview[]>([]);
  const [followUps, setFollowUps] = useState<JobFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View state: 'board' (Kanban) or 'list' (Table)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    workMode: 'ALL',
    employmentType: 'ALL',
    priority: 'ALL',
    sortBy: 'newest',
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [viewingJob, setViewingJob] = useState<JobApplication | null>(null);
  const [addJobDefaultStage, setAddJobDefaultStage] = useState<JobApplicationStatus>('Applied');

  // Interview modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewJobTargetId, setInterviewJobTargetId] = useState<string>('');
  const [editingInterview, setEditingInterview] = useState<JobInterview | null>(null);

  // Follow-up modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpJobTargetId, setFollowUpJobTargetId] = useState<string>('');
  const [editingFollowUp, setEditingFollowUp] = useState<JobFollowUp | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'job' | 'interview' | 'followup';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Career Intelligence modal
  const [isAIAnalyzerOpen, setIsAIAnalyzerOpen] = useState(false);
  const [aiTargetJob, setAiTargetJob] = useState<JobApplication | null>(null);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Initial load from Supabase with user authentication
  const loadData = useCallback(async () => {
    const userId = user?.id || 'guest-user';
    setIsLoading(true);

    try {
      const [fetchedApps, fetchedInterviews, fetchedFollowUps] = await Promise.all([
        jobService.getJobApplications(userId),
        jobService.getInterviews(userId),
        jobService.getFollowUps(userId),
      ]);

      if (fetchedApps && fetchedApps.length > 0) {
        setApplications(fetchedApps);
      } else if (state.career.jobs && state.career.jobs.length > 0) {
        // Fallback to state if already present
        setApplications(state.career.jobs);
      }

      setInterviews(fetchedInterviews || []);
      setFollowUps(fetchedFollowUps || []);
    } catch (err) {
      console.error('Failed to load job tracker data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, state.career.jobs]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync state.career.jobs changes if updated externally
  useEffect(() => {
    if (state.career.jobs && state.career.jobs.length > 0 && applications.length === 0) {
      setApplications(state.career.jobs);
    }
  }, [state.career.jobs, applications.length]);

  // Dynamic Statistics
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    saved: 0,
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    responseRate: 0,
    interviewConversionRate: 0,
    offerRate: 0,
    appsThisWeek: 0,
    appsThisMonth: 0,
    topCompanies: [],
  });

  useEffect(() => {
    jobService.getJobStats(applications).then(setStats);
  }, [applications]);

  // Pipeline stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<JobApplicationStatus, number> = {
      Saved: 0,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Shortlisted: 0,
    };
    applications.forEach((app) => {
      const st = jobService.normalizeStatus(app.status || app.stage);
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [applications]);

  // Filter & Sort applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // 1. Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((j) => {
        const comp = (j.company_name || j.company || '').toLowerCase();
        const role = (j.job_title || j.role || '').toLowerCase();
        const loc = (j.location || '').toLowerCase();
        const notes = (j.notes || '').toLowerCase();
        return comp.includes(q) || role.includes(q) || loc.includes(q) || notes.includes(q);
      });
    }

    // 2. Status filter
    if (filters.status !== 'ALL') {
      result = result.filter(
        (j) => jobService.normalizeStatus(j.status || j.stage) === filters.status
      );
    }

    // 3. Work Mode filter
    if (filters.workMode !== 'ALL') {
      result = result.filter(
        (j) => (j.work_mode || 'Remote').toLowerCase() === filters.workMode.toLowerCase()
      );
    }

    // 4. Employment Type filter
    if (filters.employmentType !== 'ALL') {
      result = result.filter(
        (j) =>
          (j.employment_type || 'Full-time').toLowerCase() ===
          filters.employmentType.toLowerCase()
      );
    }

    // 5. Priority filter
    if (filters.priority !== 'ALL') {
      result = result.filter(
        (j) => (j.priority || 'Medium').toLowerCase() === filters.priority.toLowerCase()
      );
    }

    // 6. Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        const dateA = a.application_date || a.created_at || '';
        const dateB = b.application_date || b.created_at || '';
        return dateB.localeCompare(dateA);
      }
      if (filters.sortBy === 'oldest') {
        const dateA = a.application_date || a.created_at || '';
        const dateB = b.application_date || b.created_at || '';
        return dateA.localeCompare(dateB);
      }
      if (filters.sortBy === 'company') {
        const compA = (a.company_name || a.company || '').toLowerCase();
        const compB = (b.company_name || b.company || '').toLowerCase();
        return compA.localeCompare(compB);
      }
      if (filters.sortBy === 'priority') {
        const pRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const rankA = pRank[a.priority || 'Medium'] || 2;
        const rankB = pRank[b.priority || 'Medium'] || 2;
        return rankB - rankA;
      }
      if (filters.sortBy === 'status') {
        const sRank: Record<string, number> = {
          Saved: 1,
          Applied: 2,
          Screening: 3,
          Interview: 4,
          Offer: 5,
          Rejected: 6,
        };
        const rankA = sRank[jobService.normalizeStatus(a.status || a.stage)] || 2;
        const rankB = sRank[jobService.normalizeStatus(b.status || b.stage)] || 2;
        return rankA - rankB;
      }
      return 0;
    });

    return result;
  }, [applications, filters]);

  // Handlers for Application CRUD
  const handleSaveApplication = async (appData: Partial<JobApplication>) => {
    const userId = user?.id || 'guest-user';

    if (editingJob) {
      // Update existing
      const res = await jobService.updateJobApplication(editingJob.id, appData, userId);
      if (res.data) {
        setApplications((prev) =>
          prev.map((j) => (j.id === editingJob.id ? { ...j, ...res.data } : j))
        );
        if (viewingJob?.id === editingJob.id) {
          setViewingJob((prev) => (prev ? { ...prev, ...res.data } : null));
        }
        showToast(`Updated application for ${res.data.company_name || res.data.company}`);
      }
      setEditingJob(null);
    } else {
      // Create new
      const res = await jobService.createJobApplication(userId, appData);
      if (res.data) {
        setApplications((prev) => [res.data!, ...prev]);
        // Also sync to global AppContext
        addJob({
          company: res.data.company_name || res.data.company,
          role: res.data.job_title || res.data.role,
          location: res.data.location,
          salary: res.data.salary,
          stage: res.data.stage,
          notes: res.data.notes,
          date: res.data.date,
        });
        showToast(`Added ${res.data.job_title || res.data.role} at ${res.data.company_name || res.data.company}`);
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobApplicationStatus) => {
    const userId = user?.id || 'guest-user';
    const norm = jobService.normalizeStatus(newStatus);

    // Optimistic local update
    setApplications((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: norm, stage: norm } : j))
    );
    if (viewingJob?.id === jobId) {
      setViewingJob((prev) => (prev ? { ...prev, status: norm, stage: norm } : null));
    }

    // Supabase update
    await jobService.updateJobStatus(jobId, norm, userId);
    updateJobStage(jobId, norm);
    showToast(`Status updated to ${norm}`);
  };

  const handleDuplicateJob = async (job: JobApplication) => {
    const userId = user?.id || 'guest-user';
    const cloneData: Partial<JobApplication> = {
      ...job,
      company: job.company_name || job.company,
      company_name: job.company_name || job.company,
      role: `${job.job_title || job.role} (Copy)`,
      job_title: `${job.job_title || job.role} (Copy)`,
      application_date: new Date().toISOString().split('T')[0],
      status: 'Applied',
      stage: 'Applied',
    };
    delete (cloneData as any).id;
    delete (cloneData as any).created_at;
    delete (cloneData as any).updated_at;

    const res = await jobService.createJobApplication(userId, cloneData);
    if (res.data) {
      setApplications((prev) => [res.data!, ...prev]);
      showToast(`Duplicated ${job.company_name || job.company} application`);
    }
  };

  const promptDeleteJob = (job: JobApplication) => {
    setDeleteTarget({
      type: 'job',
      id: job.id,
      name: `${job.job_title || job.role} at ${job.company_name || job.company}`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const userId = user?.id || 'guest-user';

    try {
      if (deleteTarget.type === 'job') {
        await jobService.deleteJobApplication(deleteTarget.id, userId);
        deleteJob(deleteTarget.id);
        setApplications((prev) => prev.filter((j) => j.id !== deleteTarget.id));
        setInterviews((prev) => prev.filter((i) => i.job_application_id !== deleteTarget.id));
        setFollowUps((prev) => prev.filter((f) => f.job_application_id !== deleteTarget.id));
        if (viewingJob?.id === deleteTarget.id) {
          setViewingJob(null);
        }
        showToast('Job application deleted');
      } else if (deleteTarget.type === 'interview') {
        await jobService.deleteInterview(deleteTarget.id, userId);
        setInterviews((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        showToast('Interview deleted');
      } else if (deleteTarget.type === 'followup') {
        await jobService.deleteFollowUp(deleteTarget.id, userId);
        setFollowUps((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        showToast('Follow-up reminder deleted');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Interview Handlers
  const handleSaveInterview = async (interviewData: Partial<JobInterview>) => {
    const userId = user?.id || 'guest-user';

    if (editingInterview) {
      const res = await jobService.updateInterview(editingInterview.id, interviewData, userId);
      if (res.data) {
        setInterviews((prev) =>
          prev.map((i) => (i.id === editingInterview.id ? { ...i, ...res.data } : i))
        );
        showToast('Interview updated successfully');
      }
      setEditingInterview(null);
    } else {
      const res = await jobService.createInterview(userId, interviewData);
      if (res.data) {
        setInterviews((prev) => [...prev, res.data!]);
        // Also auto-promote job status to 'Interview' if it's currently Saved or Applied
        const targetJob = applications.find((j) => j.id === res.data!.job_application_id);
        if (
          targetJob &&
          (targetJob.status === 'Applied' || targetJob.status === 'Saved' || targetJob.stage === 'Applied')
        ) {
          await handleStatusChange(targetJob.id, 'Interview');
        }
        showToast('Interview scheduled successfully');
      }
    }
  };

  // Follow-Up Handlers
  const handleSaveFollowUp = async (followUpData: Partial<JobFollowUp>) => {
    const userId = user?.id || 'guest-user';

    if (editingFollowUp) {
      const res = await jobService.updateFollowUp(editingFollowUp.id, followUpData, userId);
      if (res.data) {
        setFollowUps((prev) =>
          prev.map((f) => (f.id === editingFollowUp.id ? { ...f, ...res.data } : f))
        );
        showToast('Reminder updated');
      }
      setEditingFollowUp(null);
    } else {
      const res = await jobService.createFollowUp(userId, followUpData);
      if (res.data) {
        setFollowUps((prev) => [...prev, res.data!]);
        showToast('Follow-up reminder created');
      }
    }
  };

  const handleToggleFollowUp = async (fu: JobFollowUp) => {
    const userId = user?.id || 'guest-user';
    const newCompleted = !fu.completed;
    setFollowUps((prev) =>
      prev.map((item) => (item.id === fu.id ? { ...item, completed: newCompleted } : item))
    );
    await jobService.updateFollowUp(fu.id, { completed: newCompleted }, userId);
    showToast(newCompleted ? 'Reminder marked as completed' : 'Reminder re-opened');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      <SideNavBar active="career" />

      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen bg-surface-container-lowest w-full lg:w-[calc(100%-280px)]">
        {/* Career Sub-Navigation */}
        <CareerNav activeTab="tracker" />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-surface border border-outline-variant shadow-2xl rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-on-surface animate-fade-up">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">check_circle</span>
            </span>
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <header className="px-4 sm:px-margin-desktop py-4 sm:py-stack-md border-b border-outline-variant bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-lg text-on-surface text-xl sm:text-2xl font-bold">
                Job Tracker
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                Production ATS
              </span>
            </div>
            <p className="text-on-surface-variant font-body-md text-xs sm:text-sm mt-0.5">
              Track applications, schedule interview rounds, set follow-up reminders, and measure response rates.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* AI Career Intelligence Button */}
            <button
              onClick={() => {
                setAiTargetJob(null);
                setIsAIAnalyzerOpen(true);
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer border border-emerald-500/30"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>✨ Analyze Job with AI</span>
            </button>

            {/* Quick Action: Schedule Interview */}
            <button
              onClick={() => {
                setInterviewJobTargetId(applications[0]?.id || '');
                setEditingInterview(null);
                setIsInterviewModalOpen(true);
              }}
              disabled={applications.length === 0}
              className="px-3.5 py-2 sm:py-2.5 rounded-lg border border-outline-variant hover:border-outline bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-amber-500">
                event_available
              </span>
              <span>Schedule Interview</span>
            </button>

            {/* Primary Action: Add Application */}
            <button
              onClick={() => {
                setEditingJob(null);
                setAddJobDefaultStage('Applied');
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-on-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Job Application</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-margin-desktop space-y-5 flex-1 pb-16">
          {/* Top Statistics & Response Rate Banner */}
          <JobTrackerStats
            stats={stats}
            activeStatusFilter={filters.status}
            onSelectStatusFilter={(status) => setFilters((prev) => ({ ...prev, status }))}
          />

          {/* Visual Pipeline Progression */}
          <JobTrackerPipeline
            counts={stageCounts}
            activeStatus={filters.status}
            onSelectStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
          />

          {/* Dashboard Widgets: Upcoming Interviews, Follow-ups, Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UpcomingInterviewsWidget
              interviews={interviews}
              jobs={applications}
              onOpenSchedule={() => {
                setInterviewJobTargetId(applications[0]?.id || '');
                setEditingInterview(null);
                setIsInterviewModalOpen(true);
              }}
              onViewJob={(job) => setViewingJob(job)}
            />

            <UpcomingFollowUpsWidget
              followUps={followUps}
              jobs={applications}
              onOpenAddFollowUp={() => {
                setFollowUpJobTargetId(applications[0]?.id || '');
                setEditingFollowUp(null);
                setIsFollowUpModalOpen(true);
              }}
              onToggleComplete={handleToggleFollowUp}
              onViewJob={(job) => setViewingJob(job)}
            />

            <JobAnalyticsWidget stats={stats} />
          </div>

          {/* Filters, Search, Sort & View Mode Switcher */}
          <JobTrackerFilters
            filters={filters}
            onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
            onResetFilters={() =>
              setFilters({
                search: '',
                status: 'ALL',
                workMode: 'ALL',
                employmentType: 'ALL',
                priority: 'ALL',
                sortBy: 'newest',
              })
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalResults={filteredApplications.length}
          />

          {/* Applications View: Table vs Kanban Board */}
          {isLoading ? (
            <div className="py-16 text-center text-on-surface-variant flex flex-col items-center justify-center">
              <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading your job pipeline...</p>
            </div>
          ) : viewMode === 'list' ? (
            <JobTrackerTable
              jobs={filteredApplications}
              onViewJob={(job) => setViewingJob(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsAddModalOpen(true);
              }}
              onDeleteJob={promptDeleteJob}
              onDuplicateJob={handleDuplicateJob}
              onStatusChange={handleStatusChange}
              onAddNew={() => {
                setEditingJob(null);
                setAddJobDefaultStage('Applied');
                setIsAddModalOpen(true);
              }}
              onResetFilters={() =>
                setFilters({
                  search: '',
                  status: 'ALL',
                  workMode: 'ALL',
                  employmentType: 'ALL',
                  priority: 'ALL',
                  sortBy: 'newest',
                })
              }
              isFiltered={
                filters.search !== '' ||
                filters.status !== 'ALL' ||
                filters.workMode !== 'ALL' ||
                filters.employmentType !== 'ALL' ||
                filters.priority !== 'ALL'
              }
            />
          ) : (
            <JobTrackerKanban
              jobs={filteredApplications}
              onViewJob={(job) => setViewingJob(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsAddModalOpen(true);
              }}
              onDeleteJob={promptDeleteJob}
              onDuplicateJob={handleDuplicateJob}
              onStatusChange={handleStatusChange}
              onAddNewInStage={(stage) => {
                setEditingJob(null);
                setAddJobDefaultStage(stage);
                setIsAddModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* MODALS */}

      {/* Add / Edit Job Application Modal */}
      <JobApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveApplication}
        initialData={editingJob}
        defaultStage={addJobDefaultStage}
      />

      {/* Application Details & Timeline Modal */}
      <JobDetailsModal
        isOpen={Boolean(viewingJob)}
        onClose={() => setViewingJob(null)}
        job={viewingJob}
        interviews={interviews}
        followUps={followUps}
        onEdit={(job) => {
          setViewingJob(null);
          setEditingJob(job);
          setIsAddModalOpen(true);
        }}
        onDuplicate={(job) => {
          handleDuplicateJob(job);
        }}
        onDelete={(job) => {
          setViewingJob(null);
          promptDeleteJob(job);
        }}
        onStatusChange={handleStatusChange}
        onOpenScheduleInterview={(job) => {
          setInterviewJobTargetId(job.id);
          setEditingInterview(null);
          setIsInterviewModalOpen(true);
        }}
        onOpenAddFollowUp={(job) => {
          setFollowUpJobTargetId(job.id);
          setEditingFollowUp(null);
          setIsFollowUpModalOpen(true);
        }}
        onToggleFollowUp={handleToggleFollowUp}
        onDeleteInterview={(interviewId) =>
          setDeleteTarget({ type: 'interview', id: interviewId, name: 'Interview Record' })
        }
        onDeleteFollowUp={(followUpId) =>
          setDeleteTarget({ type: 'followup', id: followUpId, name: 'Follow-up Reminder' })
        }
        onOpenAIAnalyzer={(job) => {
          setAiTargetJob(job);
          setIsAIAnalyzerOpen(true);
        }}
      />

      {/* Interview Schedule Modal */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setEditingInterview(null);
        }}
        onSave={handleSaveInterview}
        jobApplicationId={interviewJobTargetId || applications[0]?.id || ''}
        jobApplications={applications}
        initialData={editingInterview}
      />

      {/* Follow-up Reminder Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setEditingFollowUp(null);
        }}
        onSave={handleSaveFollowUp}
        jobApplicationId={followUpJobTargetId || applications[0]?.id || ''}
        jobApplications={applications}
        initialData={editingFollowUp}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.type === 'job'
            ? 'Delete Job Application?'
            : deleteTarget?.type === 'interview'
            ? 'Delete Interview?'
            : 'Delete Reminder?'
        }
        description={
          deleteTarget?.type === 'job'
            ? 'Are you sure you want to permanently delete this job application and all associated interview and follow-up records? This action cannot be undone.'
            : 'Are you sure you want to delete this record?'
        }
        itemName={deleteTarget?.name}
        isDeleting={isDeleting}
      />

      {/* AI Career Intelligence Modal */}
      <AIJobAnalyzerModal
        isOpen={isAIAnalyzerOpen}
        onClose={() => {
          setIsAIAnalyzerOpen(false);
          setAiTargetJob(null);
        }}
        resumeContext={state.career?.resume || state.career || {}}
        userId={user?.id || 'guest-user'}
        initialJobUrl={aiTargetJob?.job_url || ''}
        initialJobDescription={aiTargetJob?.notes || ''}
        initialJobTitle={aiTargetJob?.job_title || aiTargetJob?.role || ''}
        initialCompanyName={aiTargetJob?.company_name || aiTargetJob?.company || ''}
        onSaveApplication={async (appData) => {
          const userId = user?.id || 'guest-user';
          if (aiTargetJob) {
            // Update existing job
            const res = await jobService.updateJobApplication(aiTargetJob.id, appData, userId);
            if (res.data) {
              setApplications((prev) =>
                prev.map((j) => (j.id === aiTargetJob.id ? { ...j, ...res.data } : j))
              );
              if (viewingJob?.id === aiTargetJob.id) {
                setViewingJob((prev) => (prev ? { ...prev, ...res.data } : null));
              }
              showToast(`Updated AI Career Intelligence for ${res.data.company_name || res.data.company}`);
            }
          } else {
            // Create new tracked application with AI results
            const res = await jobService.createJobApplication(userId, appData);
            if (res.data) {
              setApplications((prev) => [res.data!, ...prev]);
              addJob({
                company: res.data.company_name || res.data.company,
                role: res.data.job_title || res.data.role,
                location: res.data.location,
                salary: res.data.salary,
                stage: res.data.stage,
                notes: res.data.notes,
                date: res.data.date,
              });
              showToast(`Saved ${res.data.job_title || res.data.role} with AI Intelligence!`);
            }
          }
        }}
      />
    </div>
  );
};
