-- ==============================================================================
-- LEVELUP JOB TRACKER UPGRADE MIGRATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Update job_applications table with modern columns
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT,
    role TEXT,
    position TEXT,
    location TEXT DEFAULT 'Remote',
    job_url TEXT,
    salary TEXT,
    employment_type TEXT DEFAULT 'Full-time',
    work_mode TEXT DEFAULT 'Remote',
    application_date DATE DEFAULT CURRENT_DATE,
    date_applied DATE DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'LinkedIn',
    status TEXT DEFAULT 'Applied',
    priority TEXT DEFAULT 'Medium',
    notes TEXT,
    interview_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backward-compatibility column additions for pre-existing tables
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS job_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'Remote';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS application_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS date_applied DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'LinkedIn';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Applied';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_match_score NUMERIC;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage job applications" ON public.job_applications;
CREATE POLICY "Users manage job applications" ON public.job_applications FOR ALL USING (auth.uid() = user_id);

-- 3. Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_date DATE NOT NULL,
    interview_time TEXT,
    round TEXT DEFAULT 'Technical Screen',
    interview_type TEXT DEFAULT 'Video Call',
    interviewer TEXT,
    notes TEXT,
    result TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage interviews" ON public.interviews;
CREATE POLICY "Users manage interviews" ON public.interviews FOR ALL USING (auth.uid() = user_id);

-- 4. Create follow_ups table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    note TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage follow_ups" ON public.follow_ups;
CREATE POLICY "Users manage follow_ups" ON public.follow_ups FOR ALL USING (auth.uid() = user_id);

-- 5. Indexes for fast user queries
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_app_user ON public.interviews(user_id, job_application_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_app_user ON public.follow_ups(user_id, job_application_id);
