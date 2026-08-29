export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  title: string;
  avatar: string;
  selectedFocus: string[];
  age?: number;
  goals?: string;
}

export interface FitnessData {
  height: number;
  weight: number;
  targetWeight: number;
  fitnessGoal: string;
  experienceLevel: string;
  dietType: string;
  proteinCurrent: number;
  proteinTarget: number;
  caloriesCurrent: number;
  caloriesTarget: number;
  streak: number;
  weeklyWorkoutsCount: number;
  weeklyWorkoutsTarget: number;
  weightHistory: { id?: string; date: string; weight: number; notes?: string }[];
  measurementsHistory: BodyMeasurementRecord[];
  todaysProtocol: {
    title: string;
    duration: string;
    intensity: string;
    exercises: {
      id: string;
      name: string;
      setsReps: string;
      completed: boolean;
      weightUsed?: string;
      notes?: string;
    }[];
  };
  weeklySchedule: {
    id: string;
    day: string;
    name: string;
    isToday?: boolean;
    isRest?: boolean;
    exercises: { name: string; setsReps: string }[];
  }[];
}

// Supabase Database Entity Interfaces
export interface DbProfile {
  id?: string;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  age?: number | null;
  goals?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbFitnessProfile {
  id?: string;
  user_id: string;
  height?: number | null;
  current_weight?: number | null;
  target_weight?: number | null;
  goal?: string | null;
  experience?: string | null;
  experience_level?: string | null;
  diet_type?: string | null;
  protein_target?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbWorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  goal?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
  exercises?: DbWorkoutExercise[];
}

export interface DbWorkoutExercise {
  id: string;
  workout_plan_id: string;
  exercise_name: string;
  sets?: number | null;
  reps?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbWorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id?: string | null;
  workout_name: string;
  duration_minutes?: number | null;
  completed?: boolean | null;
  notes?: string | null;
  created_at?: string;
  sets?: DbWorkoutSet[];
}

export interface DbWorkoutSet {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  set_number?: number | null;
  reps?: number | null;
  weight?: number | null;
  rest_seconds?: number | null;
  completed?: boolean | null;
  created_at?: string;
}

export interface DbWeightLog {
  id: string;
  user_id: string;
  weight: number;
  notes?: string | null;
  created_at?: string;
}

export interface DbBodyMeasurement {
  id: string;
  user_id: string;
  chest?: number | null;
  waist?: number | null;
  arms?: number | null;
  thighs?: number | null;
  hips?: number | null;
  neck?: number | null;
  notes?: string | null;
  created_at?: string;
}

export interface BodyMeasurementRecord {
  id: string;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  hips?: number;
  neck?: number;
  notes?: string;
  date: string;
}

export interface DbNutritionProfile {
  id?: string;
  user_id: string;
  diet_type?: string | null;
  allergies?: string | null;
  meals_per_day?: number | null;
  protein_target?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbDietPlan {
  id: string;
  user_id: string;
  name: string;
  goal?: string | null;
  meals_per_day?: number | null;
  protein_target?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
  meals?: DbDietMeal[];
}

export interface DbDietMeal {
  id: string;
  diet_plan_id: string;
  meal_name: string;
  meal_type?: string | null;
  meal_time?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  created_at?: string;
  updated_at?: string;
  food_items?: DbDietFoodItem[];
}

export interface DbDietFoodItem {
  id: string;
  meal_id: string;
  food_name: string;
  quantity?: number | null;
  unit?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  created_at?: string;
}

export interface DbGroceryItem {
  id: string;
  user_id: string;
  diet_plan_id?: string | null;
  item_name: string;
  quantity?: number | null;
  unit?: string | null;
  category?: string | null;
  purchased?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'High' | 'Medium' | 'Low' | null;
  due_date?: string | null;
  category?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  target_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbSavingsGoal {
  id: string;
  user_id: string;
  name: string;
  status?: string | null;
  category?: string | null;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  frequency?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbHabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  completed: boolean;
  log_date?: string | null;
  created_at?: string;
}

export interface DbStudentCourse {
  id: string;
  user_id: string;
  name: string;
  progress?: number | null;
  instructor?: string | null;
  credits?: number | null;
  semester?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbStudentAssignment {
  id: string;
  user_id: string;
  course_id?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbJobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location?: string | null;
  salary?: string | null;
  status?: string | null;
  notes?: string | null;
  applied_date?: string | null;
  job_url?: string | null;
  interview_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbFinanceTransaction {
  id: string;
  user_id: string;
  name: string;
  category: string;
  notes?: string | null;
  type: 'expense' | 'income';
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbBudget {
  id: string;
  user_id: string;
  name: string;
  category?: string | null;
  amount: number;
  period?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbClient {
  id: string;
  user_id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbProposal {
  id: string;
  user_id: string;
  client_id?: string | null;
  client_name?: string | null;
  title: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  value: number;
  scope?: string | null;
  valid_until?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbInvoice {
  id: string;
  user_id: string;
  client_id?: string | null;
  client_name?: string | null;
  invoice_number: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  issue_date?: string | null;
  due_date?: string | null;
  subtotal: number;
  tax_rate?: number | null;
  tax_amount?: number | null;
  total_amount: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: DbInvoiceItem[];
}

export interface DbInvoiceItem {
  id: string;
  invoice_id: string;
  user_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at?: string;
}

export interface DbBrandKit {
  id: string;
  user_id: string;
  name?: string | null;
  body_font?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentJob?: boolean;
  period?: string;
  description?: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  url?: string;
}

export type ResumeProject = ProjectEntry;
export type ResumeExperience = ExperienceEntry;

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface ResumeData {
  personal: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  template: 'minimal' | 'professional' | 'tech' | 'modern';
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  date: string;
  stage: 'Saved' | 'Applied' | 'Shortlisted' | 'Interview' | 'Offer';
  notes?: string;
}

// Interview Prep Types
export type InterviewExperienceLevel = 'Fresher' | '0–1 years' | '1–3 years' | '3+ years';
export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Case Study' | 'Mixed';
export type InterviewQuestionCategory = 'Technical' | 'Behavioral' | 'HR' | 'Project' | 'Role-Specific' | 'Job-Specific' | 'Case Study';

export interface InterviewRoadmapPhase {
  phase: string;
  timeline: string;
  focus: string;
  milestones: string[];
}

export interface DayByDayRoadmapItem {
  day: number;
  phase: string;
  title: string;
  focus: string;
  tasks: string[];
  estimatedMinutes: number;
  category: 'Fundamentals' | 'Technical' | 'Projects' | 'Behavioral' | 'Case Study' | 'Mock' | 'Review';
}

export interface JobDescriptionAnalysis {
  isJdTargeted: boolean;
  focusSummary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  likelyTechnicalTopics: string[];
  likelyBehavioralTopics: string[];
  importantTools: string[];
  experienceExpectations: string;
  potentialInterviewRounds: { round: string; focus: string; duration: string }[];
  keyRequirements?: string[];
  highFrequencyKeywords?: string[];
  whatInterviewerLooksFor?: string[];
}

export interface InterviewTopicItem {
  topic: string;
  category: 'Technical' | 'HR/Behavioral' | 'System Design' | 'Domain' | 'Core';
  importance: 'Critical' | 'High' | 'Medium';
  keyConcepts: string[];
  tips: string;
}

export interface InterviewHrTopicItem {
  topic: string;
  keyQuestions: string[];
  cultureFitPrompt: string;
  growthCompensationTips: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: InterviewQuestionCategory;
  type?: 'Technical' | 'HR' | 'Behavioral' | 'Case Study';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  evaluates: string;
  sampleFramework: string;
  keyPointsToCover: string[];
  projectRef?: string;
  relatedProject?: string;
  practiceNotes?: string;
  isPracticed?: boolean;
}

export interface InterviewPracticeArea {
  area: string;
  actionableExercise: string;
  suggestedTools: string[];
  expectedOutput: string;
}

export interface InterviewPrepPlan {
  id: string;
  targetRole: string;
  experienceLevel: InterviewExperienceLevel;
  interviewType: InterviewType;
  skills: string[];
  targetCompany?: string;
  jobDescription?: string;
  createdAt: string;
  summary: string;
  recommendedDifficulty: {
    level: 'Entry' | 'Intermediate' | 'Advanced' | 'Senior/Staff Bar';
    description: string;
    pitfallsToAvoid: string[];
    evaluationRubric?: { criteria: string; weight: string; targetBehavior: string }[];
  };
  preparationPriorities: {
    priority: number;
    title: string;
    description: string;
    weight: string;
    keyFocusAreas?: string[];
  }[];
  roadmap: InterviewRoadmapPhase[];
  dayByDayRoadmap?: DayByDayRoadmapItem[];
  jobDescriptionAnalysis?: JobDescriptionAnalysis;
  importantTopics: InterviewTopicItem[];
  recommendedQuestions: InterviewQuestionItem[];
  technicalQuestions?: any[];
  projectDeepDives?: any[];
  behavioralScenarios?: any[];
  technicalTopics: {
    category: string;
    topics: string[];
    deepDivePrompt: string;
    masteryBenchmark?: string;
  }[];
  behavioralTopics: {
    theme: string;
    starSituationPrompt: string;
    suggestedStoryAngle: string;
    redFlagsToAvoid?: string[];
  }[];
  hrTopics?: InterviewHrTopicItem[];
  suggestedPracticeAreas: InterviewPracticeArea[];
}

export interface TimeBlock {
  id: string;
  hour: number;
  title: string;
  category: 'Deep Work' | 'Meeting' | 'Workout' | 'Study' | 'Personal' | 'Routine';
  colorClass?: string;
  durationHours?: number;
}

export interface PriorityTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completedToday: boolean;
}

export interface Assignment {
  id: string;
  subject: string;
  task: string;
  status: 'In Progress' | 'Completed' | 'Pending Review';
  dueDate: string;
}

export interface ContentPost {
  id: string;
  day: number;
  title: string;
  platform: 'X' | 'Instagram' | 'YouTube' | 'LinkedIn' | 'TikTok' | 'Blog';
  status: 'Draft' | 'Scheduled' | 'Published';
  colorTag?: string;
}

export interface BrandKit {
  primaryLogoName: string;
  logomarkName: string;
  colors: { name: string; hex: string }[];
  displayFont: string;
  headlineFont: string;
  bodyFont: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'workout' | 'task' | 'career' | 'system';
}

export interface UserSubscription {
  status: 'active' | 'inactive' | 'trial';
  plan: 'LEVELUP_MONTHLY' | 'LEVELUP_PRO' | 'LEVELUP_FREE';
  amount: number;
  currency: string;
  startDate?: string;
  nextBillingDate?: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  plan?: string;
  plan_tier?: string;
  status: 'active' | 'inactive' | 'canceled' | 'trial' | 'past_due';
  started_at?: string;
  expires_at?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionTier = 'free' | 'pro';

export const FREE_LIMITS = {
  resumes: 2,
  portfolios: 1,
  clients: 5,
  proposals: 3,
  invoices: 3,
  dietPlans: 2,
  workoutPlans: 3,
  jobApplications: 20,
  coverLetters: 5,
  aiGenerations: 0,
  aiInterviewSessions: 0,
  mockInterviews: 2,
} as const;

export type FeatureLimitKey = keyof typeof FREE_LIMITS;

// Portfolio Types
export type PortfolioTemplate = 'minimal' | 'designer' | 'developer' | 'creative' | 'professional' | 'editorial';

export interface PortfolioHero {
  name: string;
  title: string;
  introduction: string;
  tagline?: string;
  profileImage: string;
  ctaText: string;
  ctaLink: string;
}

export interface PortfolioAbout {
  heading: string;
  bio: string;
  skills: string[];
  yearsOfExperience: number;
  location: string;
}

export interface PortfolioCaseStudy {
  problem?: string;
  research?: string;
  process?: string;
  wireframes?: string;
  design?: string;
  solution?: string;
  results?: string;
  learnings?: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  role: string;
  tools: string[];
  image: string;
  additionalImages?: string[];
  projectUrl?: string;
  caseStudyUrl?: string;
  caseStudy?: PortfolioCaseStudy;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  currentPosition: boolean;
  description: string;
}

export interface PortfolioEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface PortfolioService {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface PortfolioTestimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  testimonial: string;
  profileImage?: string;
}

export interface PortfolioContact {
  email: string;
  phone: string;
  location: string;
  contactCta: string;
}

export interface PortfolioSocialLinks {
  linkedin?: string;
  github?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  x?: string;
  youtube?: string;
}

export interface PortfolioDesign {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  buttonStyle: 'pill' | 'rounded' | 'square' | 'minimal';
  borderRadius: string;
  spacing: 'compact' | 'normal' | 'spacious';
  layoutStyle: 'standard' | 'asymmetric' | 'grid';
  mode: 'light' | 'dark';
}

export type PortfolioSectionType = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'services' | 'testimonials' | 'contact';

export interface PortfolioSectionConfig {
  id: PortfolioSectionType;
  name: string;
  enabled: boolean;
  order: number;
}

export interface PortfolioSettings {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  socialPreviewImage?: string;
  favicon?: string;
  customDomain?: string;
  removeBranding?: boolean;
}

export interface PortfolioAnalytics {
  views: number;
  uniqueVisitors: number;
  ctaClicks: number;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  name: string;
  template: PortfolioTemplate;
  status: 'published' | 'draft';
  lastUpdated: string;
  hero: PortfolioHero;
  about: PortfolioAbout;
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  services: PortfolioService[];
  testimonials: PortfolioTestimonial[];
  contact: PortfolioContact;
  social: PortfolioSocialLinks;
  design: PortfolioDesign;
  sections: PortfolioSectionConfig[];
  settings: PortfolioSettings;
  analytics: PortfolioAnalytics;
}

export interface AppState {
  profile: UserProfile;
  subscription: UserSubscription;
  fitness: FitnessData;
  career: {
    resume: ResumeData;
    jobs: JobApplication[];
    portfolios?: PortfolioItem[];
    activePortfolioId?: string;
  };
  planner: {
    timeBlocks: TimeBlock[];
    priorities: PriorityTask[];
    habits: Habit[];
  };
  student: {
    milestoneDays: number;
    milestoneName: string;
    milestoneSubject: string;
    milestoneProgress: number;
    assignments: Assignment[];
    studyBlocks: { time: string; title: string }[];
  };
  creator: {
    month: string;
    year: number;
    posts: ContentPost[];
    brandKit: BrandKit;
  };
  finance: FinanceData;
  notifications: NotificationItem[];
}

export type ExpenseCategory = 'Food' | 'Travel' | 'Education' | 'Shopping' | 'Subscriptions' | 'Other';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes?: string;
}

export interface FinanceData {
  totalIncome: number;
  monthlyBudget: number;
  expenses: ExpenseItem[];
  savingsGoals: SavingsGoal[];
}

// ==========================================
// AI FINANCIAL COACH TYPES
// ==========================================

export type FinancialHealthStatus = 'Excellent' | 'Good' | 'Caution' | 'Action Needed';

export interface CategorySpendingInsight {
  category: ExpenseCategory;
  spent: number;
  percentageOfTotal: number;
  percentageOfIncome: number;
  benchmarkPercentage: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  insight: string;
  recommendation: string;
}

export interface Rule50_30_20Comparison {
  needs: {
    actualAmount: number;
    actualPercentage: number;
    targetPercentage: number;
    targetAmount: number;
    status: 'Optimal' | 'High' | 'Over';
    categoriesIncluded: string[];
  };
  wants: {
    actualAmount: number;
    actualPercentage: number;
    targetPercentage: number;
    targetAmount: number;
    status: 'Optimal' | 'High' | 'Over';
    categoriesIncluded: string[];
  };
  savings: {
    actualAmount: number;
    actualPercentage: number;
    targetPercentage: number;
    targetAmount: number;
    status: 'Ahead' | 'On Track' | 'Behind';
  };
  overallEvaluation: string;
}

export interface SpendingPatternInsight {
  id: string;
  title: string;
  category: string;
  type: 'recurring_subscription' | 'impulse_spike' | 'weekend_trend' | 'frequent_small_spend' | 'positive_habit';
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
  impactAmount?: number;
  suggestedAction: string;
}

export interface SavingsOpportunityItem {
  id: string;
  title: string;
  category: ExpenseCategory | 'General';
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  actionStep: string;
  impactScore: number; // 1-100
  applied?: boolean;
}

export interface FinancialActionItem {
  id: string;
  title: string;
  timeline: 'This Week' | 'This Month' | 'Quarterly';
  category: string;
  potentialBenefit: string;
  priority: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

export interface GoalAccelerationImpact {
  goalId?: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  originalEstimatedMonths: number;
  acceleratedEstimatedMonths: number;
  monthsSaved: number;
  monthlyRequiredSaving: number;
  statusRecommendation: string;
}

export interface FinancialHealthAnalysis {
  id: string;
  createdAt: string;
  healthScore: number; // 0 - 100
  healthStatus: FinancialHealthStatus;
  summaryHeadline: string;
  executiveSummary: string;
  cashFlowSummary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRatePercent: number;
    dailyBurnRate: number;
    projectedMonthEndExpenses: number;
    budgetAdherencePercent: number;
    isOverBudget: boolean;
  };
  categoryInsights: CategorySpendingInsight[];
  rule50_30_20: Rule50_30_20Comparison;
  spendingPatterns: SpendingPatternInsight[];
  savingsOpportunities: SavingsOpportunityItem[];
  actionPlan: FinancialActionItem[];
  goalImpacts: GoalAccelerationImpact[];
  keyStrengths: string[];
  primaryRisks: string[];
  disclaimer: string;
}

export interface CategoryBudgetRecommendation {
  category: ExpenseCategory;
  currentSpend: number;
  recommendedBudget: number;
  percentageOfIncome: number;
  savingsPotential: number;
  rationale: string;
}

export interface BudgetRecommendationPlan {
  id: string;
  createdAt: string;
  recommendedTotalBudget: number;
  targetSavingsRate: number;
  projectedMonthlySavings: number;
  categoryBudgets: CategoryBudgetRecommendation[];
  implementationSteps: string[];
  summary: string;
}

export interface ScenarioSimulationResult {
  scenarioName: string;
  feasibilityVerdict: 'Highly Feasible' | 'Moderate / Manageable' | 'Tight / High Discipline' | 'Risky / Not Recommended';
  monthlyCashFlowDelta: number;
  newProjectedSavingsRate: number;
  impactOnGoals: {
    goalName: string;
    timelineChange: string;
  }[];
  tradeOffs: string[];
  proTips: string[];
  confidenceScore: number;
}

export interface FinancialCoachChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  insightsHighlighted?: string[];
}

// ==========================================
// MOCK INTERVIEW TYPES
// ==========================================

export type MockInterviewMode = 'text' | 'voice';
export type MockInterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type MockInterviewQuestionCount = 5 | 10 | 15;

export interface MockInterviewConfig {
  targetRole: string;
  interviewType: InterviewType;
  difficulty: MockInterviewDifficulty;
  questionCount: MockInterviewQuestionCount;
  mode: MockInterviewMode;
  targetCompany?: string;
  jobDescription?: string;
  useJobDescription: boolean;
  useResumeProjects: boolean;
  weakAreas?: string[];
}

export interface InternalAnswerEvaluation {
  score: number; // 0 - 100
  relevance: number; // 0 - 100
  accuracy: number; // 0 - 100
  completeness: number; // 0 - 100
  technicalUnderstanding: number; // 0 - 100
  communicationClarity: number; // 0 - 100
  examplesProvided: boolean;
  directlyAddressedQuestion: boolean;
  keyStrengths: string[];
  keyWeaknesses: string[];
  suggestedFollowUpAngle?: string;
  nextDifficultyAdjustment?: 'increase' | 'maintain' | 'decrease';
}

export interface MockInterviewTurn {
  questionId: string;
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  evaluates?: string;
  projectRef?: string;
  userAnswer: string;
  internalEvaluation?: InternalAnswerEvaluation;
  feedback?: {
    scoreOutOf10: number;
    whatWasGood: string;
    whatWasMissing: string;
    strongerAnswerAdvice: string;
  };
  answeredAt: string;
}

export interface MockInterviewQuestionReview {
  questionNumber: number;
  question: string;
  category: string;
  difficulty?: string;
  userAnswer: string;
  score: number; // out of 10
  whatWasGood: string;
  whatWasMissing: string;
  strongerAnswerAdvice: string;
}

export interface MockInterviewReport {
  id: string;
  sessionId: string;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: MockInterviewDifficulty;
  mode?: MockInterviewMode;
  totalQuestions: number;
  completedAt: string;
  durationMinutes?: number;
  overallScore: number; // 0 - 100
  dimensionScores: {
    technicalKnowledge: number; // 0 - 100
    communication: number; // 0 - 100
    problemSolving: number; // 0 - 100
    roleKnowledge: number; // 0 - 100
    behavioral: number; // 0 - 100
  };
  whatYouDidWell: string[];
  areasToImprove: string[];
  strongestAnswer: {
    questionNumber: number;
    question: string;
    explanation: string;
  };
  weakestAnswer: {
    questionNumber: number;
    question: string;
    explanation: string;
  };
  questionReviews: MockInterviewQuestionReview[];
  personalizedNextSteps: {
    weakestArea: string;
    actionSteps: string[];
    recommendedRevisionTopics: string[];
    recommendedPrepDays: number;
    suggestedNextMockFocus: string;
  };
  candidateName?: string;
  targetCompany?: string;
}

export interface MockInterviewSession {
  id: string;
  status: 'setup' | 'in_progress' | 'evaluating' | 'completed';
  config: MockInterviewConfig;
  currentQuestionNumber: number;
  totalQuestions: number;
  currentQuestion?: {
    questionId: string;
    question: string;
    category: string;
    difficulty: string;
    evaluates?: string;
    projectRef?: string;
  };
  turns: MockInterviewTurn[];
  report?: MockInterviewReport;
  startedAt: string;
  updatedAt: string;
}

// ==========================================
// AI STUDY COACH TYPES
// ==========================================

export type StudyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type StudyGoal = 'Ace Exam (90%+)' | 'Master Fundamentals' | 'Quick Revision & Practice' | 'Pass Course' | 'Complete Homework / Project';
export type StudyToolTab = 'dashboard' | 'plan' | 'explain' | 'quiz' | 'practice' | 'exam' | 'weaknesses';

export interface StudyPlanTask {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'concept' | 'practice' | 'revision' | 'quiz' | 'problem_solving';
  description: string;
  completed?: boolean;
}

export interface StudyPlanDay {
  dayNumber: number;
  theme: string;
  focusArea: string;
  estimatedMinutes: number;
  tasks: StudyPlanTask[];
  keyMilestone: string;
  quizTopicSuggestion?: string;
}

export interface StudyPlanResponse {
  id: string;
  planTitle: string;
  subject: string;
  courseName?: string;
  targetGoal: string;
  level: StudyLevel;
  totalDays: number;
  dailyStudyMinutes: number;
  examDate?: string;
  overview: string;
  strategyHighlights: string[];
  days: StudyPlanDay[];
  proTips: string[];
  createdAt: string;
}

export interface TopicExplanationSection {
  title: string;
  content: string;
  bulletPoints?: string[];
  codeSnippet?: string;
  language?: string;
}

export interface TopicExplanationResponse {
  topic: string;
  subject: string;
  level: StudyLevel;
  oneLineSummary: string;
  simpleExplanation: string;
  keyConcepts: { name: string; explanation: string }[];
  realWorldExample: {
    title: string;
    scenario: string;
    explanation: string;
    codeOrDiagram?: string;
    language?: string;
  };
  importantPointsToRemember: string[];
  commonMistakesAndPitfalls: { mistake: string; correction: string }[];
  quickSummary: string[];
  suggestedPracticeTopics: string[];
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  conceptTested: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint?: string;
}

export interface QuizUserAnswer {
  questionId: string;
  questionNumber: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface QuizResultSummary {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  subject: string;
  topic: string;
  level: StudyLevel;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Revision';
  strongConcepts: string[];
  weakConcepts: string[];
  revisionRecommendations: string[];
  completedAt: string;
}

export interface PracticeProblem {
  id: string;
  title: string;
  type: 'MCQ' | 'Conceptual' | 'Coding' | 'SQL' | 'Numerical' | 'Case Study';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  topic: string;
  question: string;
  codeStarter?: string;
  hints: string[];
  solution: {
    answer: string;
    explanation: string;
    keyTakeaway: string;
  };
}

export interface WeakTopicRecord {
  id: string;
  topic: string;
  subject: string;
  accuracy: number; // 0 - 100
  totalAttempts: number;
  correctAttempts: number;
  status: 'weak' | 'moderate' | 'strong'; // <50 red, 50-75 yellow, >75 green
  lastTestedDate: string;
  recommendedAction: string;
}

export interface ExamPriorityTopic {
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedWeight: string; // e.g. "30-35% of Exam"
  keySubtopics: string[];
  whyImportant: string;
}

export interface ExamPrepPlan {
  id: string;
  examName: string;
  subject: string;
  examDate: string;
  daysRemaining: number;
  dailyStudyHours: number;
  currentReadinessScore: number; // 0 - 100
  targetScore: string;
  executiveSummary: string;
  priorityTopics: ExamPriorityTopic[];
  revisionSchedule: {
    phase: string;
    timeline: string;
    focus: string;
    deliverables: string[];
  }[];
  mockTestMilestones: {
    testName: string;
    targetDay: string;
    focusTopics: string[];
  }[];
  last24HoursStrategy: string[];
  createdAt: string;
}

// ==========================================
// AI WORKOUT BUILDER TYPES
// ==========================================

export interface AIWorkoutExercise {
  orderIndex: number;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restTime: string;
  tempo?: string;
  formInstructions: string;
  intensityOrRPE: string;
  alternativeExercise?: string;
}

export interface AIWorkoutWarmupDrill {
  exercise: string;
  durationOrReps: string;
  cues: string;
}

export interface AIWorkoutWarmup {
  duration: string;
  routine: AIWorkoutWarmupDrill[];
}

export interface AIWorkoutCooldownDrill {
  stretch: string;
  duration: string;
  cues: string;
}

export interface AIWorkoutCooldown {
  duration: string;
  routine: AIWorkoutCooldownDrill[];
}

export interface AIWorkoutDay {
  dayNumber: number;
  dayName: string;
  focusTitle: string;
  muscleGroups: string[];
  isRestDay: boolean;
  duration: string;
  warmup: AIWorkoutWarmup;
  exercises: AIWorkoutExercise[];
  cooldown: AIWorkoutCooldown;
  coachNotes?: string;
}

export interface AIWorkoutProgressiveOverload {
  principles: string[];
  progressionRule: string;
  rpeGuidance: string;
  tempoAdvice: string;
  deloadStrategy: string;
}

export interface AIWorkoutPlan {
  id?: string;
  planName: string;
  overview: string;
  goal: string;
  experience: string;
  equipment: string;
  splitName: string;
  trainingDaysCount: number;
  estimatedDuration: string;
  targetMuscles?: string;
  progressiveOverloadGuidance: AIWorkoutProgressiveOverload;
  weeklySchedule: AIWorkoutDay[];
  created_at?: string;
}

export interface AIWorkoutRequest {
  goal: 'Muscle Gain' | 'Fat Loss' | 'Strength' | 'General Fitness';
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  trainingDays: number;
  duration: string;
  equipment: 'Full Gym' | 'Dumbbells' | 'Home' | 'Bodyweight';
  preferredSplit: string;
  targetMuscles: string[];
  limitations: string;
  preferences: string;
}



