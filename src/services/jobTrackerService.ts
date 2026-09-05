import { supabase } from '../lib/supabase';
import {
  JobApplication,
  JobApplicationStatus,
  JobInterview,
  JobFollowUp,
  JobStats,
  DbJobApplication,
  DbInterview,
  DbFollowUp,
} from '../types';

const LOCAL_STORAGE_APPS_KEY = 'levelup_job_applications_cache_v2';
const LOCAL_STORAGE_INTERVIEWS_KEY = 'levelup_interviews_cache_v2';
const LOCAL_STORAGE_FOLLOWUPS_KEY = 'levelup_followups_cache_v2';

// Helper: Normalize status value
export function normalizeStatus(raw?: string | null): JobApplicationStatus {
  if (!raw) return 'Applied';
  const clean = raw.trim();
  const lower = clean.toLowerCase();
  if (lower === 'saved') return 'Saved';
  if (lower === 'applied') return 'Applied';
  if (lower === 'screening' || lower === 'shortlisted') return 'Screening';
  if (lower === 'interview' || lower === 'interviewing') return 'Interview';
  if (lower === 'offer' || lower === 'offered') return 'Offer';
  if (lower === 'rejected' || lower === 'declined') return 'Rejected';
  return 'Applied';
}

// Helper: Convert Db row to client JobApplication
function mapDbToJobApplication(row: any): JobApplication {
  const company = row.company_name || row.company || 'Unknown Company';
  const role = row.job_title || row.role || row.position || 'Untitled Role';
  const appDate = row.application_date || row.date_applied || row.applied_date || '';
  const status = normalizeStatus(row.status);

  let formattedDate = 'Recently';
  if (appDate) {
    try {
      const parsed = new Date(appDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      formattedDate = appDate;
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    company,
    company_name: company,
    role,
    job_title: role,
    location: row.location || 'Remote',
    job_url: row.job_url || '',
    salary: row.salary || '',
    employment_type: row.employment_type || 'Full-time',
    work_mode: row.work_mode || 'Remote',
    application_date: appDate || new Date().toISOString().split('T')[0],
    date: formattedDate,
    stage: status,
    status,
    source: row.source || 'LinkedIn',
    priority: row.priority || 'Medium',
    notes: row.notes || '',
    ai_match_score: row.ai_match_score !== null && row.ai_match_score !== undefined ? Number(row.ai_match_score) : undefined,
    ai_summary: row.ai_summary || undefined,
    ai_analysis: row.ai_analysis
      ? typeof row.ai_analysis === 'string'
        ? (() => { try { return JSON.parse(row.ai_analysis); } catch { return undefined; } })()
        : row.ai_analysis
      : undefined,
    ai_analyzed_at: row.ai_analyzed_at || undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.created_at || new Date().toISOString(),
    interviews: [],
    follow_ups: [],
  };
}

// Local cache helpers
function getLocalCache<T>(key: string, userId: string): T[] {
  try {
    const raw = localStorage.getItem(`${key}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache<T>(key: string, userId: string, items: T[]): void {
  try {
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to local storage', e);
  }
}

// ==============================================================================
// 1. JOB APPLICATIONS DATA ACCESS
// ==============================================================================

/**
 * Fetch all job applications for the authenticated user
 */
export async function getJobApplications(userId: string): Promise<JobApplication[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('getJobApplications error from Supabase:', error.message);
      const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapDbToJobApplication);
      setLocalCache(LOCAL_STORAGE_APPS_KEY, userId, mapped);
      return mapped;
    }

    // If Supabase returned empty, check local cache fallback
    const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
    return cached;
  } catch (err) {
    console.error('getJobApplications exception:', err);
    return getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
  }
}

/**
 * Fetch a single job application by ID
 */
export async function getJobApplicationById(jobId: string, userId?: string): Promise<JobApplication | null> {
  if (!jobId) return null;

  try {
    let query = supabase.from('job_applications').select('*').eq('id', jobId);
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      if (userId) {
        const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
        return cached.find((j) => j.id === jobId) || null;
      }
      return null;
    }

    return mapDbToJobApplication(data);
  } catch (err) {
    console.error('getJobApplicationById exception:', err);
    return null;
  }
}

/**
 * Create a new job application
 */
export async function createJobApplication(
  userId: string,
  app: Partial<JobApplication>
): Promise<{ data: JobApplication | null; error: Error | null }> {
  if (!userId) {
    return { data: null, error: new Error('User must be authenticated to create a job application.') };
  }

  const companyName = (app.company_name || app.company || '').trim();
  const jobTitle = (app.job_title || app.role || '').trim();
  const appDate = app.application_date || new Date().toISOString().split('T')[0];
  const currentStatus = normalizeStatus(app.status || app.stage);
  const priority = app.priority || 'Medium';
  const location = app.location || 'Remote';
  const jobUrl = app.job_url || '';
  const salary = app.salary || '';
  const employmentType = app.employment_type || 'Full-time';
  const workMode = app.work_mode || 'Remote';
  const source = app.source || 'LinkedIn';
  const notes = app.notes || '';

  // Prepare standard payload including backward-compatible aliases
  const fullPayload: Record<string, any> = {
    user_id: userId,
    company_name: companyName,
    job_title: jobTitle,
    company: companyName,
    role: jobTitle,
    position: jobTitle,
    location,
    job_url: jobUrl,
    salary,
    employment_type: employmentType,
    work_mode: workMode,
    application_date: appDate,
    date_applied: appDate,
    applied_date: appDate,
    source,
    status: currentStatus,
    priority,
    notes,
    ai_match_score: app.ai_match_score !== undefined ? app.ai_match_score : null,
    ai_summary: app.ai_summary || null,
    ai_analysis: app.ai_analysis || null,
    ai_analyzed_at: app.ai_analyzed_at || null,
    updated_at: new Date().toISOString(),
  };

  try {
    let result = await supabase.from('job_applications').insert(fullPayload).select().single();

    // If Supabase failed because some columns don't exist yet on the database
    if (result.error && result.error.message?.includes('column')) {
      console.warn('Retrying job insert with minimal columns due to table schema mismatch:', result.error.message);
      const minimalPayload = {
        user_id: userId,
        company: companyName,
        position: jobTitle,
        location,
        salary,
        status: currentStatus,
        date_applied: appDate,
        notes,
      };
      result = await supabase.from('job_applications').insert(minimalPayload).select().single();
    }

    if (result.error) {
      console.warn('createJobApplication supabase error:', result.error);
      // Fallback: create local record so user is never blocked
      const localId = `job-local-${Date.now()}`;
      const localApp: JobApplication = {
        id: localId,
        user_id: userId,
        company: companyName,
        company_name: companyName,
        role: jobTitle,
        job_title: jobTitle,
        location,
        job_url: jobUrl,
        salary,
        employment_type: employmentType,
        work_mode: workMode,
        application_date: appDate,
        date: new Date(appDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        stage: currentStatus,
        status: currentStatus,
        source,
        priority,
        notes,
        ai_match_score: app.ai_match_score,
        ai_summary: app.ai_summary,
        ai_analysis: app.ai_analysis,
        ai_analyzed_at: app.ai_analyzed_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
      setLocalCache(LOCAL_STORAGE_APPS_KEY, userId, [localApp, ...cached]);
      return { data: localApp, error: null };
    }

    const created = mapDbToJobApplication(result.data);
    // Sync local cache
    const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
    setLocalCache(LOCAL_STORAGE_APPS_KEY, userId, [created, ...cached.filter((j) => j.id !== created.id)]);

    return { data: created, error: null };
  } catch (err: any) {
    console.error('createJobApplication exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Update an existing job application
 */
export async function updateJobApplication(
  jobId: string,
  updates: Partial<JobApplication>,
  userId?: string
): Promise<{ data: JobApplication | null; error: Error | null }> {
  if (!jobId) return { data: null, error: new Error('Job ID is required') };

  const companyName = updates.company_name || updates.company;
  const jobTitle = updates.job_title || updates.role;
  const status = updates.status || updates.stage ? normalizeStatus(updates.status || updates.stage) : undefined;

  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (companyName) {
    payload.company_name = companyName;
    payload.company = companyName;
  }
  if (jobTitle) {
    payload.job_title = jobTitle;
    payload.role = jobTitle;
    payload.position = jobTitle;
  }
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.job_url !== undefined) payload.job_url = updates.job_url;
  if (updates.salary !== undefined) payload.salary = updates.salary;
  if (updates.employment_type !== undefined) payload.employment_type = updates.employment_type;
  if (updates.work_mode !== undefined) payload.work_mode = updates.work_mode;
  if (updates.application_date !== undefined) {
    payload.application_date = updates.application_date;
    payload.date_applied = updates.application_date;
    payload.applied_date = updates.application_date;
  }
  if (updates.source !== undefined) payload.source = updates.source;
  if (status) payload.status = status;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.ai_match_score !== undefined) payload.ai_match_score = updates.ai_match_score;
  if (updates.ai_summary !== undefined) payload.ai_summary = updates.ai_summary;
  if (updates.ai_analysis !== undefined) payload.ai_analysis = updates.ai_analysis;
  if (updates.ai_analyzed_at !== undefined) payload.ai_analyzed_at = updates.ai_analyzed_at;

  try {
    if (!jobId.startsWith('job-local-')) {
      let res = await supabase.from('job_applications').update(payload).eq('id', jobId).select().single();

      if (res.error && res.error.message?.includes('column')) {
        // Strip newer columns that might not exist in an older table
        const safePayload: Record<string, any> = {};
        if (payload.company) safePayload.company = payload.company;
        if (payload.position) safePayload.position = payload.position;
        if (payload.location) safePayload.location = payload.location;
        if (payload.salary) safePayload.salary = payload.salary;
        if (payload.status) safePayload.status = payload.status;
        if (payload.notes !== undefined) safePayload.notes = payload.notes;
        res = await supabase.from('job_applications').update(safePayload).eq('id', jobId).select().single();
      }

      if (res.data) {
        const updated = mapDbToJobApplication(res.data);
        if (userId) {
          const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
          setLocalCache(
            LOCAL_STORAGE_APPS_KEY,
            userId,
            cached.map((j) => (j.id === jobId ? { ...j, ...updated } : j))
          );
        }
        return { data: updated, error: null };
      }
    }

    // Local update fallback
    if (userId) {
      const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
      const updatedList = cached.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            ...updates,
            company: companyName || j.company,
            role: jobTitle || j.role,
            stage: status || j.stage,
            status: status || j.status,
            updated_at: new Date().toISOString(),
          };
        }
        return j;
      });
      setLocalCache(LOCAL_STORAGE_APPS_KEY, userId, updatedList);
      const updated = updatedList.find((j) => j.id === jobId) || null;
      return { data: updated, error: null };
    }

    return { data: null, error: null };
  } catch (err: any) {
    console.error('updateJobApplication exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Quick update status of an application
 */
export async function updateJobStatus(
  jobId: string,
  status: JobApplicationStatus,
  userId?: string
): Promise<{ error: Error | null }> {
  const normStatus = normalizeStatus(status);
  return updateJobApplication(jobId, { status: normStatus, stage: normStatus }, userId).then((r) => ({
    error: r.error,
  }));
}

/**
 * Delete a job application
 */
export async function deleteJobApplication(jobId: string, userId?: string): Promise<{ error: Error | null }> {
  if (!jobId) return { error: new Error('Job ID required') };

  try {
    if (!jobId.startsWith('job-local-')) {
      const { error } = await supabase.from('job_applications').delete().eq('id', jobId);
      if (error) {
        console.warn('deleteJobApplication error:', error.message);
      }
    }

    if (userId) {
      const cached = getLocalCache<JobApplication>(LOCAL_STORAGE_APPS_KEY, userId);
      setLocalCache(
        LOCAL_STORAGE_APPS_KEY,
        userId,
        cached.filter((j) => j.id !== jobId)
      );
      // Clean up linked interviews and follow-ups in cache
      const interviews = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
      setLocalCache(
        LOCAL_STORAGE_INTERVIEWS_KEY,
        userId,
        interviews.filter((i) => i.job_application_id !== jobId)
      );
      const followUps = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
      setLocalCache(
        LOCAL_STORAGE_FOLLOWUPS_KEY,
        userId,
        followUps.filter((f) => f.job_application_id !== jobId)
      );
    }

    return { error: null };
  } catch (err: any) {
    console.error('deleteJobApplication exception:', err);
    return { error: err };
  }
}

// ==============================================================================
// 2. INTERVIEWS DATA ACCESS
// ==============================================================================

/**
 * Fetch interviews for user, optionally filtered by job application ID
 */
export async function getInterviews(userId: string, jobApplicationId?: string): Promise<JobInterview[]> {
  if (!userId) return [];

  try {
    let query = supabase.from('interviews').select('*').eq('user_id', userId);
    if (jobApplicationId) {
      query = query.eq('job_application_id', jobApplicationId);
    }
    const { data, error } = await query.order('interview_date', { ascending: true });

    if (error) {
      // Fallback to local cache if table doesn't exist yet
      const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
      return jobApplicationId ? cached.filter((i) => i.job_application_id === jobApplicationId) : cached;
    }

    if (data) {
      const mapped: JobInterview[] = data.map((row: any) => ({
        id: row.id,
        job_application_id: row.job_application_id,
        user_id: row.user_id,
        interview_date: row.interview_date,
        interview_time: row.interview_time || '',
        round: row.round || 'Technical Screen',
        interview_type: row.interview_type || 'Video Call',
        interviewer: row.interviewer || '',
        notes: row.notes || '',
        result: row.result || 'Scheduled',
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
      setLocalCache(LOCAL_STORAGE_INTERVIEWS_KEY, userId, mapped);
      return jobApplicationId ? mapped.filter((i) => i.job_application_id === jobApplicationId) : mapped;
    }

    return [];
  } catch (err) {
    console.error('getInterviews exception:', err);
    const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
    return jobApplicationId ? cached.filter((i) => i.job_application_id === jobApplicationId) : cached;
  }
}

/**
 * Create a new interview record
 */
export async function createInterview(
  userId: string,
  interview: Partial<JobInterview>
): Promise<{ data: JobInterview | null; error: Error | null }> {
  if (!userId || !interview.job_application_id) {
    return { data: null, error: new Error('User ID and Job Application ID are required') };
  }

  const payload = {
    user_id: userId,
    job_application_id: interview.job_application_id,
    interview_date: interview.interview_date || new Date().toISOString().split('T')[0],
    interview_time: interview.interview_time || '',
    round: interview.round || 'Technical Screen',
    interview_type: interview.interview_type || 'Video Call',
    interviewer: interview.interviewer || '',
    notes: interview.notes || '',
    result: interview.result || 'Scheduled',
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('interviews').insert(payload).select().single();

    if (error) {
      console.warn('createInterview supabase error, using local fallback:', error.message);
      const localItem: JobInterview = {
        id: `interview-local-${Date.now()}`,
        ...payload,
        result: (payload.result as any) || 'Scheduled',
        created_at: new Date().toISOString(),
      };
      const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
      setLocalCache(LOCAL_STORAGE_INTERVIEWS_KEY, userId, [...cached, localItem]);
      return { data: localItem, error: null };
    }

    const created: JobInterview = {
      id: data.id,
      job_application_id: data.job_application_id,
      user_id: data.user_id,
      interview_date: data.interview_date,
      interview_time: data.interview_time || '',
      round: data.round || '',
      interview_type: data.interview_type || '',
      interviewer: data.interviewer || '',
      notes: data.notes || '',
      result: data.result || 'Scheduled',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
    setLocalCache(LOCAL_STORAGE_INTERVIEWS_KEY, userId, [...cached.filter((i) => i.id !== created.id), created]);

    return { data: created, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Update an interview record
 */
export async function updateInterview(
  interviewId: string,
  updates: Partial<JobInterview>,
  userId?: string
): Promise<{ data: JobInterview | null; error: Error | null }> {
  if (!interviewId) return { data: null, error: new Error('Interview ID required') };

  const payload: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  delete payload.id;

  try {
    if (!interviewId.startsWith('interview-local-')) {
      const { data, error } = await supabase.from('interviews').update(payload).eq('id', interviewId).select().single();
      if (!error && data) {
        if (userId) {
          const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
          setLocalCache(
            LOCAL_STORAGE_INTERVIEWS_KEY,
            userId,
            cached.map((i) => (i.id === interviewId ? { ...i, ...updates } : i))
          );
        }
        return { data, error: null };
      }
    }

    if (userId) {
      const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
      const updated = cached.map((i) => (i.id === interviewId ? { ...i, ...updates } : i));
      setLocalCache(LOCAL_STORAGE_INTERVIEWS_KEY, userId, updated);
      return { data: updated.find((i) => i.id === interviewId) || null, error: null };
    }

    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Delete an interview record
 */
export async function deleteInterview(interviewId: string, userId?: string): Promise<{ error: Error | null }> {
  if (!interviewId) return { error: new Error('Interview ID required') };

  try {
    if (!interviewId.startsWith('interview-local-')) {
      await supabase.from('interviews').delete().eq('id', interviewId);
    }
    if (userId) {
      const cached = getLocalCache<JobInterview>(LOCAL_STORAGE_INTERVIEWS_KEY, userId);
      setLocalCache(
        LOCAL_STORAGE_INTERVIEWS_KEY,
        userId,
        cached.filter((i) => i.id !== interviewId)
      );
    }
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// ==============================================================================
// 3. FOLLOW-UPS DATA ACCESS
// ==============================================================================

/**
 * Fetch follow-ups for user, optionally filtered by job application ID
 */
export async function getFollowUps(userId: string, jobApplicationId?: string): Promise<JobFollowUp[]> {
  if (!userId) return [];

  try {
    let query = supabase.from('follow_ups').select('*').eq('user_id', userId);
    if (jobApplicationId) {
      query = query.eq('job_application_id', jobApplicationId);
    }
    const { data, error } = await query.order('follow_up_date', { ascending: true });

    if (error) {
      const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
      return jobApplicationId ? cached.filter((f) => f.job_application_id === jobApplicationId) : cached;
    }

    if (data) {
      const mapped: JobFollowUp[] = data.map((row: any) => ({
        id: row.id,
        job_application_id: row.job_application_id,
        user_id: row.user_id,
        follow_up_date: row.follow_up_date,
        note: row.note || '',
        completed: Boolean(row.completed),
        created_at: row.created_at,
      }));
      setLocalCache(LOCAL_STORAGE_FOLLOWUPS_KEY, userId, mapped);
      return jobApplicationId ? mapped.filter((f) => f.job_application_id === jobApplicationId) : mapped;
    }

    return [];
  } catch (err) {
    console.error('getFollowUps exception:', err);
    const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
    return jobApplicationId ? cached.filter((f) => f.job_application_id === jobApplicationId) : cached;
  }
}

/**
 * Create a new follow-up reminder
 */
export async function createFollowUp(
  userId: string,
  followUp: Partial<JobFollowUp>
): Promise<{ data: JobFollowUp | null; error: Error | null }> {
  if (!userId || !followUp.job_application_id) {
    return { data: null, error: new Error('User ID and Job Application ID are required') };
  }

  const payload = {
    user_id: userId,
    job_application_id: followUp.job_application_id,
    follow_up_date: followUp.follow_up_date || new Date().toISOString().split('T')[0],
    note: followUp.note || 'Follow up on application status',
    completed: Boolean(followUp.completed),
  };

  try {
    const { data, error } = await supabase.from('follow_ups').insert(payload).select().single();

    if (error) {
      console.warn('createFollowUp supabase error, using local fallback:', error.message);
      const localItem: JobFollowUp = {
        id: `followup-local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
      setLocalCache(LOCAL_STORAGE_FOLLOWUPS_KEY, userId, [...cached, localItem]);
      return { data: localItem, error: null };
    }

    const created: JobFollowUp = {
      id: data.id,
      job_application_id: data.job_application_id,
      user_id: data.user_id,
      follow_up_date: data.follow_up_date,
      note: data.note || '',
      completed: Boolean(data.completed),
      created_at: data.created_at,
    };

    const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
    setLocalCache(LOCAL_STORAGE_FOLLOWUPS_KEY, userId, [...cached.filter((f) => f.id !== created.id), created]);

    return { data: created, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Update follow-up (e.g. toggle completed or edit note/date)
 */
export async function updateFollowUp(
  followUpId: string,
  updates: Partial<JobFollowUp>,
  userId?: string
): Promise<{ data: JobFollowUp | null; error: Error | null }> {
  if (!followUpId) return { data: null, error: new Error('Follow-up ID required') };

  const payload: Record<string, any> = { ...updates };
  delete payload.id;

  try {
    if (!followUpId.startsWith('followup-local-')) {
      const { data, error } = await supabase.from('follow_ups').update(payload).eq('id', followUpId).select().single();
      if (!error && data) {
        if (userId) {
          const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
          setLocalCache(
            LOCAL_STORAGE_FOLLOWUPS_KEY,
            userId,
            cached.map((f) => (f.id === followUpId ? { ...f, ...updates } : f))
          );
        }
        return { data, error: null };
      }
    }

    if (userId) {
      const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
      const updated = cached.map((f) => (f.id === followUpId ? { ...f, ...updates } : f));
      setLocalCache(LOCAL_STORAGE_FOLLOWUPS_KEY, userId, updated);
      return { data: updated.find((f) => f.id === followUpId) || null, error: null };
    }

    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Delete a follow-up record
 */
export async function deleteFollowUp(followUpId: string, userId?: string): Promise<{ error: Error | null }> {
  if (!followUpId) return { error: new Error('Follow-up ID required') };

  try {
    if (!followUpId.startsWith('followup-local-')) {
      await supabase.from('follow_ups').delete().eq('id', followUpId);
    }
    if (userId) {
      const cached = getLocalCache<JobFollowUp>(LOCAL_STORAGE_FOLLOWUPS_KEY, userId);
      setLocalCache(
        LOCAL_STORAGE_FOLLOWUPS_KEY,
        userId,
        cached.filter((f) => f.id !== followUpId)
      );
    }
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// ==============================================================================
// 4. STATS & ANALYTICS CALCULATION (Real data only)
// ==============================================================================

/**
 * Computes dynamic statistics from user's real applications
 */
export async function getJobStats(input: JobApplication[] | string): Promise<JobStats> {
  let applications: JobApplication[] = [];

  if (typeof input === 'string') {
    applications = await getJobApplications(input);
  } else {
    applications = input || [];
  }

  const total = applications.length;
  let saved = 0;
  let applied = 0;
  let screening = 0;
  let interview = 0;
  let offer = 0;
  let rejected = 0;

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let appsThisWeek = 0;
  let appsThisMonth = 0;

  const companyCounts: Record<string, number> = {};

  applications.forEach((app) => {
    const st = normalizeStatus(app.status || app.stage);
    if (st === 'Saved') saved++;
    else if (st === 'Applied') applied++;
    else if (st === 'Screening') screening++;
    else if (st === 'Interview') interview++;
    else if (st === 'Offer') offer++;
    else if (st === 'Rejected') rejected++;

    // Date calculations
    const rawDate = app.application_date || app.created_at;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          if (d >= oneWeekAgo && d <= now) {
            appsThisWeek++;
          }
          if (d >= startOfMonth && d <= now) {
            appsThisMonth++;
          }
        }
      } catch {
        // ignore date parse issues
      }
    }

    // Company ranking
    const comp = (app.company || app.company_name || '').trim();
    if (comp) {
      companyCounts[comp] = (companyCounts[comp] || 0) + 1;
    }
  });

  // Response Rate = (Screening + Interview + Offer + Rejected) / Total * 100
  // Reflects applications where the employer responded (either for interview/screening, offer, or rejection)
  const respondedCount = screening + interview + offer + rejected;
  const responseRate = total > 0 ? Math.round((respondedCount / total) * 1000) / 10 : 0;
  const interviewConversionRate = total > 0 ? Math.round((interview / total) * 1000) / 10 : 0;
  const offerRate = total > 0 ? Math.round((offer / total) * 1000) / 10 : 0;

  const topCompanies = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    saved,
    applied,
    screening,
    interview,
    offer,
    rejected,
    responseRate,
    interviewConversionRate,
    offerRate,
    appsThisWeek,
    appsThisMonth,
    topCompanies,
  };
}

// ==============================================================================
// 5. AI CAREER INTELLIGENCE CLIENT API CALLS
// ==============================================================================

export interface JobAnalyzePayload {
  jobUrl?: string;
  jobDescription?: string;
  resumeContext?: any;
  userId?: string;
}

export async function analyzeJobOpportunity(payload: JobAnalyzePayload): Promise<any> {
  const response = await fetch('/api/career/analyze-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateJobCoverLetter(payload: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeContext?: any;
  tone?: string;
}): Promise<{ coverLetter: string }> {
  const response = await fetch('/api/career/generate-cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Cover letter generation failed (${response.status})`);
  }

  return response.json();
}

export async function tailorJobResumeTips(payload: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeContext?: any;
}): Promise<{ strategicTips: string[]; tailoredBullets: string[] }> {
  const response = await fetch('/api/career/tailor-resume-tips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Resume tips generation failed (${response.status})`);
  }

  return response.json();
}

export async function generateJobInterviewPrep(payload: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeContext?: any;
}): Promise<{ questions: Array<{ category: string; question: string; focusTip: string; sampleOutline: string }> }> {
  const response = await fetch('/api/career/interview-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Interview prep generation failed (${response.status})`);
  }

  return response.json();
}
