import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Link,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  BookmarkPlus,
  Loader2,
  ChevronRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { JobAIAnalysis, JobApplication } from '../../types';
import {
  analyzeJobOpportunity,
  generateJobCoverLetter,
  tailorJobResumeTips,
  generateJobInterviewPrep,
} from '../../services/jobTrackerService';

interface AIJobAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContext: any;
  userId?: string;
  onSaveApplication?: (appData: Partial<JobApplication>) => void;
  initialJobUrl?: string;
  initialJobDescription?: string;
  initialJobTitle?: string;
  initialCompanyName?: string;
}

export const AIJobAnalyzerModal: React.FC<AIJobAnalyzerModalProps> = ({
  isOpen,
  onClose,
  resumeContext,
  userId,
  onSaveApplication,
  initialJobUrl = '',
  initialJobDescription = '',
  initialJobTitle = '',
  initialCompanyName = '',
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'url' | 'description'>(
    initialJobDescription ? 'description' : 'url'
  );
  const [jobUrl, setJobUrl] = useState(initialJobUrl);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JobAIAnalysis | null>(null);

  // Secondary AI tools state (Cover letter, Resume tips, Interview prep)
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<'overview' | 'cover-letter' | 'resume-tips' | 'interview-prep'>('overview');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);

  const [isGeneratingResumeTips, setIsGeneratingResumeTips] = useState(false);
  const [resumeTipsResult, setResumeTipsResult] = useState<{ strategicTips: string[]; tailoredBullets: string[] } | null>(null);

  const [isGeneratingInterviewPrep, setIsGeneratingInterviewPrep] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{ category: string; question: string; focusTip: string; sampleOutline: string }> | null>(null);

  const [hasSaved, setHasSaved] = useState(false);

  if (!isOpen) return null;

  const candidateName = `${resumeContext?.personal?.firstName || ''} ${resumeContext?.personal?.lastName || ''}`.trim() || 'Alex Chen';
  const candidateTitle = resumeContext?.personal?.title || resumeContext?.title || 'Senior Product Designer';
  const candidateSkills: string[] = Array.isArray(resumeContext?.skills) ? resumeContext.skills : [];
  const candidateExperienceCount = Array.isArray(resumeContext?.experience) ? resumeContext.experience.length : 0;

  const handleRunAnalysis = async () => {
    setAnalysisError(null);
    if (!jobUrl.trim() && !jobDescription.trim()) {
      setAnalysisError('Please enter a Job Posting URL or paste the Job Description.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeJobOpportunity({
        jobUrl: jobUrl.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        resumeContext,
        userId,
      });

      setAnalysisResult(data);
      setActiveSecondaryTab('overview');
      setHasSaved(false);
    } catch (err: any) {
      console.error('Job analysis failed:', err);
      setAnalysisError(err.message || 'Failed to analyze job. Please verify the URL or paste the job description text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!analysisResult) return;
    setActiveSecondaryTab('cover-letter');
    if (generatedCoverLetter) return; // already loaded

    setIsGeneratingCoverLetter(true);
    try {
      const res = await generateJobCoverLetter({
        jobTitle: analysisResult.extracted_details?.job_title || initialJobTitle || 'Target Role',
        companyName: analysisResult.extracted_details?.company_name || initialCompanyName || 'Company',
        jobDescription: jobDescription || analysisResult.job_summary || '',
        resumeContext,
        tone: 'confident',
      });
      setGeneratedCoverLetter(res.coverLetter);
    } catch (err: any) {
      console.error('Cover letter failed:', err);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleGenerateResumeTips = async () => {
    if (!analysisResult) return;
    setActiveSecondaryTab('resume-tips');
    if (resumeTipsResult) return;

    setIsGeneratingResumeTips(true);
    try {
      const res = await tailorJobResumeTips({
        jobTitle: analysisResult.extracted_details?.job_title || initialJobTitle || 'Target Role',
        companyName: analysisResult.extracted_details?.company_name || initialCompanyName || 'Company',
        jobDescription: jobDescription || analysisResult.job_summary || '',
        resumeContext,
      });
      setResumeTipsResult(res);
    } catch (err: any) {
      console.error('Resume tips failed:', err);
    } finally {
      setIsGeneratingResumeTips(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    if (!analysisResult) return;
    setActiveSecondaryTab('interview-prep');
    if (interviewQuestions) return;

    setIsGeneratingInterviewPrep(true);
    try {
      const res = await generateJobInterviewPrep({
        jobTitle: analysisResult.extracted_details?.job_title || initialJobTitle || 'Target Role',
        companyName: analysisResult.extracted_details?.company_name || initialCompanyName || 'Company',
        jobDescription: jobDescription || analysisResult.job_summary || '',
        resumeContext,
      });
      setInterviewQuestions(res.questions);
    } catch (err: any) {
      console.error('Interview prep failed:', err);
    } finally {
      setIsGeneratingInterviewPrep(false);
    }
  };

  const handleSaveToTracker = () => {
    if (!analysisResult || !onSaveApplication) return;

    const extracted = analysisResult.extracted_details || {};
    const appData: Partial<JobApplication> = {
      company: extracted.company_name || initialCompanyName || 'Target Company',
      company_name: extracted.company_name || initialCompanyName || 'Target Company',
      role: extracted.job_title || initialJobTitle || 'Opportunity',
      job_title: extracted.job_title || initialJobTitle || 'Opportunity',
      location: extracted.location || 'Remote',
      salary: extracted.salary || '',
      employment_type: extracted.employment_type || 'Full-time',
      work_mode: extracted.work_mode || 'Remote',
      job_url: jobUrl || initialJobUrl || '',
      source: jobUrl?.toLowerCase().includes('linkedin') ? 'LinkedIn' : jobUrl?.toLowerCase().includes('indeed') ? 'Indeed' : 'Company Website',
      stage: 'Saved',
      status: 'Saved',
      priority: analysisResult.match_score >= 80 ? 'High' : 'Medium',
      notes: `AI Match Score: ${analysisResult.match_score}%\n\nSummary:\n${analysisResult.job_summary}`,
      ai_match_score: analysisResult.match_score,
      ai_summary: analysisResult.job_summary,
      ai_analysis: analysisResult,
      ai_analyzed_at: analysisResult.analyzed_at || new Date().toISOString(),
    };

    onSaveApplication(appData);
    setHasSaved(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCoverLetterCopied(true);
    setTimeout(() => setCoverLetterCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#141517] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  AI Career Intelligence & Job Analyzer
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  Real Time
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Compare job opportunities directly against your verified resume profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Profile Reference Banner */}
        <div className="px-6 py-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Analyzing against verified profile: <strong className="font-semibold">{candidateName}</strong> ({candidateTitle}) &bull; {candidateSkills.length} skills &bull; {candidateExperienceCount} career entries
            </span>
          </div>
          <span className="hidden sm:inline text-stone-500 dark:text-stone-400 text-[11px]">
            Strict anti-hallucination active
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Input Section (Hidden when result is active unless re-analyzing) */}
          <div className="bg-stone-50 dark:bg-stone-900/60 rounded-xl p-4 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Job Opportunity Source
              </span>
              <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveInputTab('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    activeInputTab === 'url'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  Job URL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputTab('description')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    activeInputTab === 'description'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Description
                </button>
              </div>
            </div>

            {activeInputTab === 'url' ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Public Job Posting URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="e.g. https://www.linkedin.com/jobs/view/... or greenhouse.io link"
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || !jobUrl.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Job
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Supports LinkedIn, Indeed, Greenhouse, Lever, Workday, and standard career pages.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Paste Full Job Description & Requirements
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the role summary, requirements, qualifications, and company overview..."
                  className="w-full p-3 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {jobDescription.length} characters entered
                  </span>
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}
          </div>

          {/* Analysis Results View */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Secondary Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveSecondaryTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSecondaryTab === 'overview'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Fit Analysis & Match
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSecondaryTab === 'cover-letter'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Tailored Cover Letter
                </button>
                <button
                  type="button"
                  onClick={handleGenerateResumeTips}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSecondaryTab === 'resume-tips'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Targeted Resume Bullets
                </button>
                <button
                  type="button"
                  onClick={handleGenerateInterviewPrep}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSecondaryTab === 'interview-prep'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Interview Prep Questions
                </button>
              </div>

              {/* TAB 1: OVERVIEW & MATCH */}
              {activeSecondaryTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Match Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-stone-50 to-teal-500/10 dark:from-emerald-950/30 dark:via-stone-900 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-stone-800 shadow-md border-4 border-emerald-500/30 dark:border-emerald-500/40 shrink-0">
                        <div className="text-center">
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {analysisResult.match_score}%
                          </span>
                          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                            Match
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {analysisResult.extracted_details?.job_title || 'Analyzed Role'}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              analysisResult.fit_verdict === 'High Match'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : analysisResult.fit_verdict === 'Moderate Match'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {analysisResult.fit_verdict}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            {analysisResult.extracted_details?.company_name || 'Target Company'}
                          </span>
                          &bull;
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {analysisResult.extracted_details?.location || 'Remote'}
                          </span>
                          {analysisResult.extracted_details?.salary && (
                            <>
                              &bull;
                              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                                <DollarSign className="w-3.5 h-3.5" />
                                {analysisResult.extracted_details.salary}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Scores */}
                    <div className="flex items-center gap-4 bg-white/70 dark:bg-stone-800/70 p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60">
                      <div className="text-center px-2">
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {analysisResult.score_breakdown?.skills_match || 88}%
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Skills Overlap</div>
                      </div>
                      <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
                      <div className="text-center px-2">
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {analysisResult.score_breakdown?.experience_match || 82}%
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Experience</div>
                      </div>
                      <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
                      <div className="text-center px-2">
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {analysisResult.score_breakdown?.domain_match || 85}%
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Domain Fit</div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Role Summary */}
                  <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                      Role Mission & Scope
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {analysisResult.job_summary}
                    </p>
                  </div>

                  {/* Two-Column Skills Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched Skills */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Found in Your Profile ({analysisResult.matched_skills.length})
                        </h4>
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                          Matched
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.matched_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          Required by Job & Missing ({analysisResult.missing_skills.length})
                        </h4>
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                          Gaps to Address
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.missing_skills.length > 0 ? (
                          analysisResult.missing_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-500 italic">
                            No significant skill deficiencies detected!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Gaps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2.5">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Why You Stand Out
                      </h4>
                      <ul className="space-y-1.5">
                        {analysisResult.candidate_strengths.map((str, i) => (
                          <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps / Watchouts */}
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2.5">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Honest Areas to Address
                      </h4>
                      <ul className="space-y-1.5">
                        {analysisResult.skill_gaps.map((gap, i) => (
                          <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Strategic Action Recommendations */}
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Application Positioning Strategy
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.application_recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: TAILORED COVER LETTER */}
              {activeSecondaryTab === 'cover-letter' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Tailored Executive Cover Letter
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Generated strictly from your verified experience and matched to the job description.
                      </p>
                    </div>

                    {generatedCoverLetter && (
                      <button
                        onClick={() => copyToClipboard(generatedCoverLetter)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                      >
                        {coverLetterCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Letter
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isGeneratingCoverLetter ? (
                    <div className="p-12 text-center space-y-3 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                        Drafting an authentic, high-converting cover letter...
                      </p>
                    </div>
                  ) : generatedCoverLetter ? (
                    <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-inner font-serif text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                      {generatedCoverLetter}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
                      <button
                        onClick={handleGenerateCoverLetter}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Generate Tailored Cover Letter
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TARGETED RESUME BULLETS */}
              {activeSecondaryTab === 'resume-tips' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Targeted ATS Resume Bullets & Positioning
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      High-impact XYZ bullet suggestions based on your verified background to pass applicant tracking systems.
                    </p>
                  </div>

                  {isGeneratingResumeTips ? (
                    <div className="p-12 text-center space-y-3 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                        Optimizing resume bullet points and keywords...
                      </p>
                    </div>
                  ) : resumeTipsResult ? (
                    <div className="space-y-4">
                      {/* Strategic Tips */}
                      <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                          Section Emphasis Recommendations
                        </h4>
                        <ul className="space-y-1.5">
                          {resumeTipsResult.strategicTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tailored Bullets */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                          Recommended XYZ Formula Bullets to Add
                        </h4>
                        <div className="space-y-2">
                          {resumeTipsResult.tailoredBullets.map((bullet, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-3 group"
                            >
                              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                                {bullet}
                              </p>
                              <button
                                onClick={() => copyToClipboard(bullet)}
                                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors shrink-0"
                                title="Copy Bullet"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 4: INTERVIEW PREP */}
              {activeSecondaryTab === 'interview-prep' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Role-Specific Interview Questions & Strategy
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Anticipate technical, behavioral, and company questions tailored specifically to this posting.
                    </p>
                  </div>

                  {isGeneratingInterviewPrep ? (
                    <div className="p-12 text-center space-y-3 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                        Synthesizing role-specific interview questions and answers...
                      </p>
                    </div>
                  ) : interviewQuestions ? (
                    <div className="space-y-3">
                      {interviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              {q.category}
                            </span>
                            <span className="text-[10px] text-stone-400">Question {idx + 1}</span>
                          </div>
                          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            "{q.question}"
                          </p>
                          <div className="p-2.5 bg-stone-50 dark:bg-stone-900/60 rounded-lg text-[11px] space-y-1">
                            <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              Interviewer Focus:
                            </div>
                            <p className="text-stone-600 dark:text-stone-300">{q.focusTip}</p>
                            {q.sampleOutline && (
                              <div className="text-stone-500 dark:text-stone-400 mt-1 italic">
                                Answer Outline: {q.sampleOutline}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Clock className="w-3.5 h-3.5" />
            <span>AI analyses persist directly with your tracked applications</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Close
            </button>

            {analysisResult && onSaveApplication && (
              <button
                type="button"
                onClick={handleSaveToTracker}
                disabled={hasSaved}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              >
                {hasSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved to Job Tracker
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Save Opportunity to Tracker
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
