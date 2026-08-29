import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppState,
  JobApplication,
  PriorityTask,
  TimeBlock,
  Assignment,
  ContentPost,
  BrandKit,
  PortfolioItem,
  PortfolioTemplate,
  ExpenseItem,
  SavingsGoal,
  DbProfile,
  DbFitnessProfile,
  DbWorkoutPlan,
  DbWorkoutExercise,
  DbWorkoutLog,
  DbWorkoutSet,
  DbWeightLog,
  DbBodyMeasurement,
  DbNutritionProfile,
  DbDietPlan,
  DbDietMeal,
  DbDietFoodItem,
  DbGroceryItem,
  DbTask,
  DbGoal,
  DbSavingsGoal,
  DbHabit,
  DbHabitLog,
  DbStudentCourse,
  DbStudentAssignment,
  DbJobApplication,
  DbFinanceTransaction,
  DbBudget,
  DbClient,
  DbProposal,
  DbInvoice,
  DbInvoiceItem,
  DbBrandKit,
  DbSubscription,
} from '../types';
import { initialAppState, createEmptyAppState } from '../data/initialData';
import { useAuth } from './AuthContext';
import * as db from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { startRazorpaySubscription } from '../services/razorpayService';

interface AppContextType {
  state: AppState;
  isDbLoading: boolean;
  
  // Profile
  updateProfile: (profile: Partial<AppState['profile']>) => Promise<{ success: boolean; error?: string }>;

  // Fitness Profile & Metrics
  fitnessProfile: DbFitnessProfile | null;
  updateFitnessProfile: (updates: Partial<DbFitnessProfile>) => Promise<void>;
  updateWeight: (weight: number, notes?: string) => Promise<void>;
  updateProtein: (protein: number) => void;
  toggleExercise: (exerciseId: string) => void;
  startCustomWorkout: (workout: { title: string; duration: string; exercises: { name: string; setsReps: string }[] }) => Promise<void>;

  // Workout Plans CRUD
  workoutPlans: DbWorkoutPlan[];
  activeWorkoutPlan: DbWorkoutPlan | null;
  createWorkoutPlan: (plan: { name: string; goal?: string; duration_minutes?: number; is_active?: boolean }, exercises?: Array<{ exercise_name: string; sets?: number; reps?: number; rest_seconds?: number; notes?: string }>) => Promise<DbWorkoutPlan | null>;
  saveFullAIWorkoutPlan: (aiPlan: any, setActive?: boolean) => Promise<DbWorkoutPlan | null>;
  updateWorkoutPlan: (planId: string, updates: Partial<{ name: string; goal: string; duration_minutes: number; is_active: boolean }>) => Promise<void>;
  deleteWorkoutPlan: (planId: string) => Promise<void>;
  setActiveWorkoutPlan: (planId: string) => Promise<void>;
  addWorkoutExercise: (exercise: { workout_plan_id: string; exercise_name: string; sets?: number; reps?: number; rest_seconds?: number; notes?: string }) => Promise<DbWorkoutExercise | null>;
  updateWorkoutExercise: (exerciseId: string, updates: Partial<{ exercise_name: string; sets: number; reps: number; rest_seconds: number; notes: string }>) => Promise<void>;
  deleteWorkoutExercise: (exerciseId: string) => Promise<void>;

  // Workout Logs & Sets CRUD
  workoutLogs: DbWorkoutLog[];
  createWorkoutLog: (log: { workout_name: string; workout_plan_id?: string; duration_minutes?: number; completed?: boolean; notes?: string }, sets?: Array<{ exercise_name: string; set_number: number; reps: number; weight: number; rest_seconds?: number; completed?: boolean }>) => Promise<DbWorkoutLog | null>;
  updateWorkoutLog: (logId: string, updates: Partial<{ workout_name: string; duration_minutes: number; completed: boolean; notes: string }>) => Promise<void>;
  deleteWorkoutLog: (logId: string) => Promise<void>;
  addWorkoutSet: (setData: { workout_log_id: string; exercise_name: string; set_number?: number; reps: number; weight: number; rest_seconds?: number; completed?: boolean }) => Promise<DbWorkoutSet | null>;
  updateWorkoutSet: (setId: string, updates: Partial<{ exercise_name: string; set_number: number; reps: number; weight: number; rest_seconds: number; completed: boolean }>) => Promise<void>;
  deleteWorkoutSet: (setId: string) => Promise<void>;

  // Weight Logs CRUD
  weightLogs: DbWeightLog[];
  logWeight: (weight: number, notes?: string) => Promise<void>;
  updateWeightLog: (id: string, updates: { weight?: number; notes?: string }) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;

  // Body Measurements CRUD
  bodyMeasurements: DbBodyMeasurement[];
  createBodyMeasurement: (measurements: { chest?: number; waist?: number; arms?: number; thighs?: number; hips?: number; neck?: number; notes?: string }) => Promise<void>;
  updateBodyMeasurement: (id: string, measurements: { chest?: number; waist?: number; arms?: number; thighs?: number; hips?: number; neck?: number; notes?: string }) => Promise<void>;
  deleteBodyMeasurement: (id: string) => Promise<void>;

  // Nutrition Profile CRUD
  nutritionProfile: DbNutritionProfile | null;
  updateNutritionProfile: (profile: Partial<DbNutritionProfile>) => Promise<void>;

  // Diet Plans, Meals & Food Items CRUD
  dietPlans: DbDietPlan[];
  activeDietPlan: DbDietPlan | null;
  createDietPlan: (plan: { name: string; goal?: string; meals_per_day?: number; protein_target?: number; is_active?: boolean }, mealsWithFood?: Array<{ meal: { meal_name: string; meal_type?: string; meal_time?: string; calories?: number; protein?: number; carbs?: number; fats?: number }; food_items?: Array<{ food_name: string; quantity?: number; unit?: string; calories?: number; protein?: number; carbs?: number; fats?: number }> }>, groceries?: Array<{ item_name: string; quantity?: number; unit?: string; category?: string }>) => Promise<DbDietPlan | null>;
  updateDietPlan: (planId: string, updates: Partial<{ name: string; goal: string; meals_per_day: number; protein_target: number; is_active: boolean }>) => Promise<void>;
  deleteDietPlan: (planId: string) => Promise<void>;
  setActiveDietPlan: (planId: string) => Promise<void>;
  createDietMeal: (dietPlanId: string, meal: { meal_name: string; meal_type?: string; meal_time?: string; calories?: number; protein?: number; carbs?: number; fats?: number }) => Promise<DbDietMeal | null>;
  updateDietMeal: (mealId: string, updates: Partial<{ meal_name: string; meal_type: string; meal_time: string; calories: number; protein: number; carbs: number; fats: number }>) => Promise<void>;
  deleteDietMeal: (mealId: string) => Promise<void>;
  createDietFoodItem: (mealId: string, item: { food_name: string; quantity?: number; unit?: string; calories?: number; protein?: number; carbs?: number; fats?: number }) => Promise<DbDietFoodItem | null>;
  updateDietFoodItem: (itemId: string, updates: Partial<{ food_name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fats: number }>) => Promise<void>;
  deleteDietFoodItem: (itemId: string) => Promise<void>;

  // Grocery List CRUD
  groceryItems: DbGroceryItem[];
  createGroceryItem: (item: { item_name: string; quantity?: number; unit?: string; category?: string; purchased?: boolean; diet_plan_id?: string }) => Promise<DbGroceryItem | null>;
  updateGroceryItem: (itemId: string, updates: Partial<{ item_name: string; quantity: number; unit: string; category: string; purchased: boolean; diet_plan_id: string }>) => Promise<void>;
  toggleGroceryItem: (itemId: string) => Promise<void>;
  deleteGroceryItem: (itemId: string) => Promise<void>;
  clearPurchasedGrocery: () => Promise<void>;
  generateGroceryFromDietPlan: (dietPlanId?: string) => Promise<void>;

  // Career & Resume
  updateResume: (resume: AppState['career']['resume']) => void;
  addJob: (job: Omit<JobApplication, 'id'>) => void;
  updateJobStage: (id: string, stage: JobApplication['stage']) => void;
  deleteJob: (id: string) => void;

  // Portfolio Website Builder Methods
  createPortfolio: (template?: PortfolioTemplate, name?: string) => string;
  updatePortfolio: (id: string, updates: Partial<PortfolioItem>) => void;
  duplicatePortfolio: (id: string) => string;
  deletePortfolio: (id: string) => void;
  publishPortfolio: (id: string) => void;
  unpublishPortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;

  // Finance Methods
  updateTotalIncome: (amount: number) => void;
  updateMonthlyBudget: (amount: number) => void;
  deleteMonthlyBudget: () => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  addMoneyToGoal: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;

  // Planner & Tasks
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  deleteTimeBlock: (id: string) => void;
  togglePriority: (id: string) => void;
  addPriority: (title: string, priority?: 'High' | 'Medium' | 'Low') => void;
  toggleHabit: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  addPost: (post: Omit<ContentPost, 'id'>) => void;
  updateBrandKit: (brandKit: Partial<BrandKit>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Student Workspace
  studentCourses: DbStudentCourse[];
  createStudentCourse: (course: { name: string; progress?: number; instructor?: string; credits?: number; semester?: string }) => Promise<DbStudentCourse | null>;
  updateStudentCourse: (id: string, updates: Partial<DbStudentCourse>) => Promise<void>;
  deleteStudentCourse: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => void;

  // Clients (Freelance / Agency / Creator)
  clients: DbClient[];
  createClient: (client: { name: string; company?: string; email?: string; phone?: string; website?: string; status?: string; notes?: string }) => Promise<DbClient | null>;
  updateClient: (id: string, updates: Partial<DbClient>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Proposals & Pitches
  proposals: DbProposal[];
  createProposal: (proposal: { title: string; client_id?: string; client_name?: string; status?: 'Draft' | 'Sent' | 'Accepted' | 'Declined'; value: number; scope?: string; valid_until?: string }) => Promise<DbProposal | null>;
  updateProposal: (id: string, updates: Partial<DbProposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;

  // Invoices & Invoice Items
  invoices: DbInvoice[];
  createInvoice: (invoice: { invoice_number: string; client_id?: string; client_name?: string; status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue'; issue_date?: string; due_date?: string; subtotal: number; tax_rate?: number; tax_amount?: number; total_amount: number; notes?: string }, items?: Array<{ description: string; quantity: number; unit_price: number; amount: number }>) => Promise<DbInvoice | null>;
  updateInvoice: (id: string, updates: Partial<DbInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Modals & UI States
  isAIModalOpen: boolean;
  aiModalInitialPrompt: string;
  openAIModal: (prompt?: string) => void;
  closeAIModal: () => void;
  
  isNotificationsOpen: boolean;
  toggleNotifications: () => void;
  closeNotifications: () => void;

  isSettingsOpen: boolean;
  toggleSettings: () => void;
  closeSettings: () => void;

  // Subscription Actions & Modal
  dbSubscription: DbSubscription | null;
  isUpgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  subscribeUser: (options?: string | { plan?: string; name?: string; email?: string; contact?: string; upiId?: string; method?: 'upi' | 'card' | 'netbanking' }) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;

  // AI Actions
  aiInsights: { insight: string; actionLabel: string; actionLink: string; tip: string };
  isGeneratingInsights: boolean;
  refreshInsights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const getUserStorageKey = (uid?: string | null) => (uid ? `levelup_app_state_${uid}` : 'levelup_app_state_guest');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDbLoading, setIsDbLoading] = useState(false);

  // Database-backed states
  const [fitnessProfile, setFitnessProfile] = useState<DbFitnessProfile | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<DbWorkoutPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<DbWorkoutLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<DbWeightLog[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<DbBodyMeasurement[]>([]);
  const [nutritionProfile, setNutritionProfile] = useState<DbNutritionProfile | null>(null);
  const [dietPlans, setDietPlans] = useState<DbDietPlan[]>([]);
  const [groceryItems, setGroceryItems] = useState<DbGroceryItem[]>([]);
  const [clients, setClients] = useState<DbClient[]>([]);
  const [proposals, setProposals] = useState<DbProposal[]>([]);
  const [invoices, setInvoices] = useState<DbInvoice[]>([]);
  const [studentCourses, setStudentCourses] = useState<DbStudentCourse[]>([]);
  const [dbSubscription, setDbSubscription] = useState<DbSubscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  const openUpgradeModal = (featureName?: string) => {
    setUpgradeModalFeature(featureName || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalFeature(null);
  };

  const [state, setState] = useState<AppState>(() => {
    try {
      localStorage.removeItem('levelup_app_state_v1');
      if (user?.id) {
        const saved = localStorage.getItem(getUserStorageKey(user.id));
        if (saved) {
          const parsed = JSON.parse(saved);
          const base = createEmptyAppState(user);
          return {
            ...base,
            ...parsed,
            profile: { ...base.profile, ...(parsed.profile || {}) },
            subscription: { ...base.subscription, ...(parsed.subscription || {}) },
            career: {
              ...base.career,
              ...(parsed.career || {}),
              resume: {
                ...base.career.resume,
                ...(parsed.career?.resume || {}),
                personal: {
                  ...base.career.resume.personal,
                  ...(parsed.career?.resume?.personal || {}),
                },
              },
            },
            fitness: { ...base.fitness, ...(parsed.fitness || {}) },
            finance: { ...base.finance, ...(parsed.finance || {}) },
            planner: { ...base.planner, ...(parsed.planner || {}) },
            student: { ...base.student, ...(parsed.student || {}) },
            creator: { ...base.creator, ...(parsed.creator || {}) },
          };
        }
      }
    } catch (e) {
      console.warn('Could not read saved state:', e);
    }
    return createEmptyAppState(user);
  });

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalInitialPrompt, setAiModalInitialPrompt] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [aiInsights, setAiInsights] = useState({
    insight: "Start by logging today's habits, setting your fitness goals, and tracking your daily priorities.",
    actionLabel: "Open Planner",
    actionLink: "/planner",
    tip: "Consistent daily tracking leads to measurable progress across all domains.",
  });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Sync state to user-isolated localStorage
  useEffect(() => {
    try {
      if (user?.id) {
        localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(state));
      }
    } catch (e) {
      console.warn('Could not save state:', e);
    }
  }, [state, user?.id]);

  // ==========================================
  // HYDRATE FROM SUPABASE ON USER AUTH
  // ==========================================
  const loadUserDataFromSupabase = useCallback(async (userId: string) => {
    setIsDbLoading(true);
    // 1. Immediately reset memory state to clean user state so no previous user data remains
    setFitnessProfile(null);
    setWorkoutPlans([]);
    setWorkoutLogs([]);
    setWeightLogs([]);
    setBodyMeasurements([]);
    setNutritionProfile(null);
    setDietPlans([]);
    setGroceryItems([]);
    setClients([]);
    setProposals([]);
    setInvoices([]);
    setStudentCourses([]);
    setDbSubscription(null);

    const baseState = createEmptyAppState(user);
    setState(baseState);

    try {
      const [
        dbProf,
        dbFitProf,
        dbWkPlans,
        dbWkLogs,
        dbWtLogs,
        dbMeasurements,
        dbNutProf,
        dbDietPlans,
        dbGrocItems,
        dbTasks,
        dbSavingsGoalsList,
        dbHabitsList,
        dbHabitLogsList,
        dbCoursesList,
        dbAssignmentsList,
        dbJobsList,
        dbTransactionsList,
        dbBudgetsList,
        dbClientsList,
        dbProposalsList,
        dbInvoicesList,
        dbBrandKitItem,
        dbSubItem,
      ] = await Promise.all([
        db.fetchUserProfile(userId),
        db.fetchFitnessProfile(userId),
        db.fetchWorkoutPlans(userId),
        db.fetchWorkoutLogs(userId),
        db.fetchWeightLogs(userId),
        db.fetchBodyMeasurements(userId),
        db.fetchNutritionProfile(userId),
        db.fetchDietPlans(userId),
        db.fetchGroceryItems(userId),
        db.fetchTasks(userId),
        db.fetchSavingsGoals(userId),
        db.fetchHabits(userId),
        db.fetchHabitLogs(userId),
        db.fetchStudentCourses(userId),
        db.fetchStudentAssignments(userId),
        db.fetchJobApplications(userId),
        db.fetchFinanceTransactions(userId),
        db.fetchBudgets(userId),
        db.fetchClients(userId),
        db.fetchProposals(userId),
        db.fetchInvoices(userId),
        db.fetchBrandKit(userId),
        db.fetchUserSubscription(userId),
      ]);

      // 1. Profile Hydration
      if (dbProf) {
        setState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            name: dbProf.full_name || prev.profile.name,
            email: dbProf.email || prev.profile.email,
            age: dbProf.age ? Number(dbProf.age) : prev.profile.age,
            goals: dbProf.goals || prev.profile.goals,
          },
        }));
      } else if (user?.email) {
        await db.upsertUserProfile(userId, {
          full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email,
          goals: '',
        });
      }

      // 2. Fitness Profile Hydration
      if (dbFitProf) {
        setFitnessProfile(dbFitProf);
        setState((prev) => ({
          ...prev,
          fitness: {
            ...prev.fitness,
            height: dbFitProf.height !== null && dbFitProf.height !== undefined ? Number(dbFitProf.height) : prev.fitness.height,
            weight: dbFitProf.current_weight !== null && dbFitProf.current_weight !== undefined ? Number(dbFitProf.current_weight) : prev.fitness.weight,
            targetWeight: dbFitProf.target_weight !== null && dbFitProf.target_weight !== undefined ? Number(dbFitProf.target_weight) : prev.fitness.targetWeight,
            fitnessGoal: dbFitProf.goal || prev.fitness.fitnessGoal,
            experienceLevel: dbFitProf.experience_level || prev.fitness.experienceLevel,
            dietType: dbFitProf.diet_type || prev.fitness.dietType,
            proteinTarget: dbFitProf.protein_target !== null && dbFitProf.protein_target !== undefined ? Number(dbFitProf.protein_target) : prev.fitness.proteinTarget,
          },
        }));
      }

      // 3. Workout Plans
      if (dbWkPlans && dbWkPlans.length > 0) {
        setWorkoutPlans(dbWkPlans);
        const activePlan = dbWkPlans.find((p) => p.is_active) || dbWkPlans[0];
        if (activePlan?.exercises && activePlan.exercises.length > 0) {
          setState((prev) => ({
            ...prev,
            fitness: {
              ...prev.fitness,
              todaysProtocol: {
                title: activePlan.name,
                duration: `${activePlan.duration_minutes || 45} mins`,
                intensity: 'High Intensity',
                exercises: activePlan.exercises!.map((e) => ({
                  id: e.id,
                  name: e.exercise_name,
                  setsReps: `${e.sets || 3} x ${e.reps || 10}`,
                  completed: false,
                  notes: e.notes || undefined,
                })),
              },
            },
          }));
        }
      }

      // 4. Workout Logs
      setWorkoutLogs(dbWkLogs || []);

      // 5. Weight Logs
      if (dbWtLogs && dbWtLogs.length > 0) {
        setWeightLogs(dbWtLogs);
        const latestLog = dbWtLogs[dbWtLogs.length - 1];
        setState((prev) => ({
          ...prev,
          fitness: {
            ...prev.fitness,
            weight: Number(latestLog.weight),
            weightHistory: dbWtLogs.map((l) => ({
              id: l.id,
              date: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              weight: Number(l.weight),
              notes: l.notes || undefined,
            })),
          },
        }));
      }

      // 6. Body Measurements
      setBodyMeasurements(dbMeasurements || []);

      // 7. Nutrition Profile
      if (dbNutProf) {
        setNutritionProfile(dbNutProf);
      }

      // 8. Diet Plans
      if (dbDietPlans && dbDietPlans.length > 0) {
        setDietPlans(dbDietPlans);
      }

      // 9. Grocery Items
      setGroceryItems(dbGrocItems || []);

      // 10. Tasks / Priorities Hydration
      if (dbTasks && dbTasks.length > 0) {
        setState((prev) => ({
          ...prev,
          planner: {
            ...prev.planner,
            priorities: dbTasks.map((t) => ({
              id: t.id,
              title: t.title,
              completed: t.status === 'completed',
              priority: (t.priority || 'Medium') as 'High' | 'Medium' | 'Low',
              dueDate: t.due_date || 'Today',
            })),
          },
        }));
      }

      // 11. Savings Goals Hydration
      if (dbSavingsGoalsList && dbSavingsGoalsList.length > 0) {
        setState((prev) => ({
          ...prev,
          finance: {
            ...prev.finance,
            savingsGoals: dbSavingsGoalsList.map((g) => ({
              id: g.id,
              name: g.name,
              targetAmount: Number(g.target_amount),
              currentAmount: Number(g.current_amount || 0),
              targetDate: g.target_date || '2026-12-31',
              notes: g.status || undefined,
            })),
          },
        }));
      }

      // 12. Habits & Habit Logs Hydration
      if (dbHabitsList && dbHabitsList.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedHabitIds = new Set(
          (dbHabitLogsList || [])
            .filter((l) => l.completed && l.log_date === todayStr)
            .map((l) => l.habit_id)
        );

        setState((prev) => ({
          ...prev,
          planner: {
            ...prev.planner,
            habits: dbHabitsList.map((h) => {
              const habitLogs = (dbHabitLogsList || []).filter((l) => l.habit_id === h.id && l.completed);
              const streak = habitLogs.length || 0;
              return {
                id: h.id,
                name: h.name,
                icon: 'check_circle',
                streak: Math.max(streak, 0),
                completedToday: completedHabitIds.has(h.id),
              };
            }),
          },
        }));
      }

      // 13. Student Courses & Assignments Hydration
      if (dbCoursesList && dbCoursesList.length > 0) {
        setStudentCourses(dbCoursesList);
      }

      if (dbAssignmentsList && dbAssignmentsList.length > 0) {
        setState((prev) => ({
          ...prev,
          student: {
            ...prev.student,
            assignments: dbAssignmentsList.map((a) => ({
              id: a.id,
              subject: a.priority || 'General',
              task: a.title,
              dueDate: a.due_date || 'In 3 days',
              status: (a.status === 'Completed' || a.status === 'Done' ? 'Completed' : a.status === 'Pending Review' ? 'Pending Review' : 'In Progress') as 'In Progress' | 'Completed' | 'Pending Review',
            })),
          },
        }));
      }

      // 14. Job Applications Hydration
      if (dbJobsList && dbJobsList.length > 0) {
        setState((prev) => ({
          ...prev,
          career: {
            ...prev.career,
            jobs: dbJobsList.map((j) => ({
              id: j.id,
              company: j.company,
              role: j.role,
              location: j.location || 'Remote',
              salary: j.salary || '',
              stage: (j.status === 'Interview' ? 'Interview' : j.status === 'Offer' ? 'Offer' : j.status === 'Shortlisted' ? 'Shortlisted' : j.status === 'Saved' ? 'Saved' : 'Applied') as 'Saved' | 'Applied' | 'Shortlisted' | 'Interview' | 'Offer',
              date: j.applied_date ? new Date(j.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
              notes: j.notes || undefined,
            })),
          },
        }));
      }

      // 15. Finance Transactions & Budgets Hydration
      const incomeTransactions = (dbTransactionsList || []).filter(
        (t) =>
          t.type?.toLowerCase() === 'income' ||
          t.category?.toLowerCase() === 'income' ||
          t.name === 'Monthly Total Income' ||
          t.name?.toLowerCase().includes('income')
      );
      const expenseTransactions = (dbTransactionsList || []).filter(
        (t) =>
          t.type !== 'income' &&
          t.category?.toLowerCase() !== 'income' &&
          !t.name?.toLowerCase().includes('income')
      );

      const incomeBudget = (dbBudgetsList || []).find(
        (b) => b.category?.toLowerCase() === 'income' || b.name?.toLowerCase().includes('income')
      );
      const overallBudget = (dbBudgetsList || []).find(
        (b) =>
          b.category === 'Monthly Overall' ||
          b.category?.toLowerCase() === 'monthly overall' ||
          b.name === 'Monthly Budget' ||
          (b.category?.toLowerCase() !== 'income' && !b.name?.toLowerCase().includes('income'))
      );

      let totalIncomeFromDb = 0;
      if (incomeTransactions.length > 0) {
        const canonicalIncome = incomeTransactions.find(
          (t) => t.name === 'Monthly Total Income' || t.name?.toLowerCase().includes('total income')
        );
        if (canonicalIncome) {
          totalIncomeFromDb = Number(canonicalIncome.amount) || 0;
        } else {
          totalIncomeFromDb = incomeTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        }
      } else if (incomeBudget) {
        totalIncomeFromDb = Number(incomeBudget.amount) || 0;
      }

      const monthlyBudgetFromDb = overallBudget ? Number(overallBudget.amount) : 0;

      setState((prev) => ({
        ...prev,
        finance: {
          ...prev.finance,
          totalIncome: totalIncomeFromDb > 0 ? totalIncomeFromDb : (prev.finance?.totalIncome || 0),
          monthlyBudget: monthlyBudgetFromDb > 0 ? monthlyBudgetFromDb : (prev.finance?.monthlyBudget || 0),
          expenses: expenseTransactions.map((t) => ({
            id: t.id,
            name: t.name,
            amount: Number(t.amount),
            category: (t.category || 'Other') as
              | 'Food'
              | 'Travel'
              | 'Education'
              | 'Shopping'
              | 'Subscriptions'
              | 'Other',
            date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: t.notes || undefined,
          })),
        },
      }));

      // 16. Clients, Proposals & Invoices
      setClients(dbClientsList || []);
      setProposals(dbProposalsList || []);
      setInvoices(dbInvoicesList || []);

      // 17. Brand Kit
      if (dbBrandKitItem) {
        setState((prev) => ({
          ...prev,
          creator: {
            ...prev.creator,
            brandKit: {
              ...prev.creator.brandKit,
              bodyFont: dbBrandKitItem.body_font || prev.creator.brandKit.bodyFont,
              colors: dbBrandKitItem.primary_color
                ? [
                    { name: 'Primary Forest', hex: dbBrandKitItem.primary_color },
                    { name: 'Secondary Gold', hex: dbBrandKitItem.secondary_color || '#C48A44' },
                    { name: 'Accent Cream', hex: dbBrandKitItem.accent_color || '#F4F1EA' },
                    { name: 'Surface White', hex: '#FFFFFF' },
                  ]
                : prev.creator.brandKit.colors,
            },
          },
        }));
      }

      // 18. Subscription Hydration
      if (
        dbSubItem &&
        (dbSubItem.status === 'active' || dbSubItem.status === 'trial') &&
        (dbSubItem.plan === 'pro' || dbSubItem.plan_tier === 'pro' || dbSubItem.plan === 'LEVELUP_PRO')
      ) {
        setDbSubscription(dbSubItem);
        setState((prev) => ({
          ...prev,
          subscription: {
            status: dbSubItem.status as 'active' | 'trial',
            plan: 'LEVELUP_PRO',
            amount: 129,
            currency: 'INR',
            startDate: dbSubItem.started_at || dbSubItem.created_at || new Date().toISOString().split('T')[0],
            nextBillingDate: dbSubItem.expires_at || dbSubItem.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          },
        }));
      } else if (dbSubItem) {
        setDbSubscription(dbSubItem);
        setState((prev) => ({
          ...prev,
          subscription: {
            status: 'inactive',
            plan: 'LEVELUP_FREE',
            amount: 0,
            currency: 'INR',
          },
        }));
      } else {
        setDbSubscription(null);
        setState((prev) => ({
          ...prev,
          subscription: {
            status: 'inactive',
            plan: 'LEVELUP_FREE',
            amount: 0,
            currency: 'INR',
          },
        }));
      }
    } catch (err) {
      console.error('Error hydrating data from Supabase:', err);
    } finally {
      setIsDbLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadUserDataFromSupabase(user.id);
    } else {
      // Clean reset on logout so previous user state does not leak into next session
      try {
        localStorage.removeItem('levelup_app_state_v1');
      } catch (e) {}
      setDbSubscription(null);
      setFitnessProfile(null);
      setNutritionProfile(null);
      setWorkoutPlans([]);
      setWorkoutLogs([]);
      setWeightLogs([]);
      setBodyMeasurements([]);
      setDietPlans([]);
      setGroceryItems([]);
      setClients([]);
      setProposals([]);
      setInvoices([]);
      setStudentCourses([]);
      setState(createEmptyAppState(null));
    }
  }, [user?.id, loadUserDataFromSupabase]);

  // ==========================================
  // 1. PROFILE METHODS
  // ==========================================
  const updateProfile = async (profileUpdate: Partial<AppState['profile']>): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdate },
    }));

    if (user?.id) {
      try {
        // 1. If email changed and is different from current auth email, trigger Supabase auth email update
        if (profileUpdate.email && profileUpdate.email !== user.email) {
          const { error: authErr } = await supabase.auth.updateUser({
            email: profileUpdate.email,
          });
          if (authErr) {
            console.warn('Supabase auth email update warning:', authErr.message);
          }
        }

        // 2. Persist to profiles table
        const { error: dbErr } = await db.upsertUserProfile(user.id, {
          full_name: profileUpdate.name,
          email: profileUpdate.email,
          age: profileUpdate.age,
          goals: profileUpdate.goals,
        });

        if (dbErr) {
          console.error('Error updating profiles table in Supabase:', dbErr);
          return { success: false, error: dbErr.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Error updating profile' };
      }
    }
    return { success: true };
  };

  // ==========================================
  // 2. FITNESS PROFILE & METRICS METHODS
  // ==========================================
  const updateFitnessProfile = async (updates: Partial<DbFitnessProfile>) => {
    // 1. Optimistically update local application state immediately
    setState((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        height: updates.height !== undefined && updates.height !== null ? Number(updates.height) : prev.fitness.height,
        weight: updates.current_weight !== undefined && updates.current_weight !== null ? Number(updates.current_weight) : prev.fitness.weight,
        targetWeight: updates.target_weight !== undefined && updates.target_weight !== null ? Number(updates.target_weight) : prev.fitness.targetWeight,
        fitnessGoal: updates.goal || prev.fitness.fitnessGoal,
        experienceLevel: updates.experience_level || prev.fitness.experienceLevel,
        dietType: updates.diet_type || prev.fitness.dietType,
        proteinTarget: updates.protein_target !== undefined && updates.protein_target !== null ? Number(updates.protein_target) : prev.fitness.proteinTarget,
      },
    }));

    setFitnessProfile((prev) => (prev ? { ...prev, ...updates } : ({ user_id: user?.id || '', ...updates } as DbFitnessProfile)));

    if (!user?.id) return;

    // 2. Persist to Supabase and sync confirmed state
    const { data } = await db.upsertFitnessProfile(user.id, updates);
    if (data) {
      setFitnessProfile(data);
      setState((prev) => ({
        ...prev,
        fitness: {
          ...prev.fitness,
          height: data.height !== undefined && data.height !== null ? Number(data.height) : prev.fitness.height,
          weight: data.current_weight !== undefined && data.current_weight !== null ? Number(data.current_weight) : prev.fitness.weight,
          targetWeight: data.target_weight !== undefined && data.target_weight !== null ? Number(data.target_weight) : prev.fitness.targetWeight,
          fitnessGoal: data.goal || prev.fitness.fitnessGoal,
          experienceLevel: data.experience_level || prev.fitness.experienceLevel,
          dietType: data.diet_type || prev.fitness.dietType,
          proteinTarget: data.protein_target !== undefined && data.protein_target !== null ? Number(data.protein_target) : prev.fitness.proteinTarget,
        },
      }));
    }
  };

  const updateWeight = async (newWeight: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        weight: newWeight,
        weightHistory: [
          ...prev.fitness.weightHistory.filter((h) => h.date !== today),
          { date: today, weight: newWeight, notes },
        ],
      },
    }));

    if (user?.id) {
      await db.createWeightLog(user.id, newWeight, notes);
      const refreshed = await db.fetchWeightLogs(user.id);
      setWeightLogs(refreshed);
      await updateFitnessProfile({ current_weight: newWeight });
    }
  };

  const logWeight = async (weight: number, notes?: string) => {
    await updateWeight(weight, notes);
  };

  const updateWeightLog = async (id: string, updates: { weight?: number; notes?: string }) => {
    await db.updateWeightLog(id, updates);
    if (user?.id) {
      const refreshed = await db.fetchWeightLogs(user.id);
      setWeightLogs(refreshed);
    }
  };

  const deleteWeightLog = async (id: string) => {
    await db.deleteWeightLog(id);
    if (user?.id) {
      const refreshed = await db.fetchWeightLogs(user.id);
      setWeightLogs(refreshed);
    }
  };

  const updateProtein = (protein: number) => {
    setState((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        proteinCurrent: protein,
      },
    }));
  };

  const toggleExercise = (exerciseId: string) => {
    setState((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        todaysProtocol: {
          ...prev.fitness.todaysProtocol,
          exercises: prev.fitness.todaysProtocol.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
          ),
        },
      },
    }));
  };

  const startCustomWorkout = async (workout: { title: string; duration: string; exercises: { name: string; setsReps: string; notes?: string }[] }) => {
    // 1. Update in-memory state
    setState((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        todaysProtocol: {
          title: workout.title,
          duration: workout.duration,
          intensity: 'High Intensity',
          exercises: workout.exercises.map((e, idx) => ({
            id: `gen-ex-${idx}-${Date.now()}`,
            name: e.name,
            setsReps: e.setsReps,
            completed: false,
            notes: e.notes,
          })),
        },
        weeklyWorkoutsCount: Math.min(prev.fitness.weeklyWorkoutsTarget, prev.fitness.weeklyWorkoutsCount + 1),
      },
    }));

    // 2. Persist to Supabase workout_plans and workout_exercises
    if (user?.id) {
      const created = await db.createWorkoutPlan(
        user.id,
        {
          name: workout.title,
          goal: 'Hypertrophy Protocol',
          duration_minutes: parseInt(workout.duration, 10) || 45,
          is_active: true,
        },
        workout.exercises.map((e) => {
          const parts = e.setsReps.split(/x/i).map((p) => parseInt(p.trim(), 10));
          return {
            exercise_name: e.name,
            sets: !isNaN(parts[0]) ? parts[0] : 3,
            reps: !isNaN(parts[1]) ? parts[1] : 10,
            rest_seconds: 60,
            notes: e.notes || '',
          };
        })
      );
      if (created.data) {
        const refreshedPlans = await db.fetchWorkoutPlans(user.id);
        setWorkoutPlans(refreshedPlans);
      }
    }
  };

  // ==========================================
  // 3. WORKOUT PLANS CRUD
  // ==========================================
  const activeWorkoutPlan = workoutPlans.find((p) => p.is_active) || workoutPlans[0] || null;

  const createWorkoutPlan = async (
    plan: { name: string; goal?: string; duration_minutes?: number; is_active?: boolean },
    exercises?: Array<{ exercise_name: string; sets?: number; reps?: number; rest_seconds?: number; notes?: string }>
  ): Promise<DbWorkoutPlan | null> => {
    if (!user?.id) return null;
    const { data } = await db.createWorkoutPlan(user.id, plan, exercises);
    if (data) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
    return data;
  };

  const saveFullAIWorkoutPlan = async (aiPlan: any, setActive: boolean = true): Promise<DbWorkoutPlan | null> => {
    if (!user?.id) return null;
    const { data } = await db.saveAIWorkoutPlan(user.id, aiPlan, setActive);
    if (data) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);

      // If active, also update today's active protocol in in-memory state
      if (setActive && aiPlan.weeklySchedule && aiPlan.weeklySchedule.length > 0) {
        const firstActiveDay = aiPlan.weeklySchedule.find((d: any) => !d.isRestDay) || aiPlan.weeklySchedule[0];
        if (firstActiveDay && firstActiveDay.exercises) {
          setState((prev) => ({
            ...prev,
            fitness: {
              ...prev.fitness,
              todaysProtocol: {
                title: firstActiveDay.focusTitle || `${aiPlan.planName} - ${firstActiveDay.dayName}`,
                duration: firstActiveDay.duration || aiPlan.estimatedDuration || '60 mins',
                intensity: 'High Intensity',
                exercises: firstActiveDay.exercises.map((e: any, idx: number) => ({
                  id: `ai-ex-${idx}-${Date.now()}`,
                  name: e.name,
                  setsReps: `${e.sets || 3} x ${e.reps || '10'}`,
                  completed: false,
                  notes: e.formInstructions || e.tempo || '',
                })),
              },
            },
          }));
        }
      }
    }
    return data;
  };

  const updateWorkoutPlan = async (
    planId: string,
    updates: Partial<{ name: string; goal: string; duration_minutes: number; is_active: boolean }>
  ) => {
    await db.updateWorkoutPlan(planId, updates);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    await db.deleteWorkoutPlan(planId);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
  };

  const setActiveWorkoutPlan = async (planId: string) => {
    if (!user?.id) return;
    await db.updateWorkoutPlan(planId, { is_active: true });
    // Deactivate others
    for (const p of workoutPlans) {
      if (p.id !== planId && p.is_active) {
        await db.updateWorkoutPlan(p.id, { is_active: false });
      }
    }
    const refreshed = await db.fetchWorkoutPlans(user.id);
    setWorkoutPlans(refreshed);
  };

  const addWorkoutExercise = async (exercise: {
    workout_plan_id: string;
    exercise_name: string;
    sets?: number;
    reps?: number;
    rest_seconds?: number;
    notes?: string;
  }): Promise<DbWorkoutExercise | null> => {
    const { data } = await db.addWorkoutExercise(exercise);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
    return data;
  };

  const updateWorkoutExercise = async (
    exerciseId: string,
    updates: Partial<{ exercise_name: string; sets: number; reps: number; rest_seconds: number; notes: string }>
  ) => {
    await db.updateWorkoutExercise(exerciseId, updates);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
  };

  const deleteWorkoutExercise = async (exerciseId: string) => {
    await db.deleteWorkoutExercise(exerciseId);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutPlans(user.id);
      setWorkoutPlans(refreshed);
    }
  };

  // ==========================================
  // 4. WORKOUT LOGS & SETS CRUD
  // ==========================================
  const createWorkoutLog = async (
    log: { workout_name: string; workout_plan_id?: string; duration_minutes?: number; completed?: boolean; notes?: string },
    sets?: Array<{ exercise_name: string; set_number: number; reps: number; weight: number; rest_seconds?: number; completed?: boolean }>
  ): Promise<DbWorkoutLog | null> => {
    if (!user?.id) return null;
    const { data } = await db.createWorkoutLog(user.id, log, sets);
    if (data) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
    return data;
  };

  const updateWorkoutLog = async (
    logId: string,
    updates: Partial<{ workout_name: string; duration_minutes: number; completed: boolean; notes: string }>
  ) => {
    await db.updateWorkoutLog(logId, updates);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
  };

  const deleteWorkoutLog = async (logId: string) => {
    await db.deleteWorkoutLog(logId);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
  };

  const addWorkoutSet = async (setData: {
    workout_log_id: string;
    exercise_name: string;
    set_number?: number;
    reps: number;
    weight: number;
    rest_seconds?: number;
    completed?: boolean;
  }): Promise<DbWorkoutSet | null> => {
    const { data } = await db.addWorkoutSet(setData);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
    return data;
  };

  const updateWorkoutSet = async (
    setId: string,
    updates: Partial<{ exercise_name: string; set_number: number; reps: number; weight: number; rest_seconds: number; completed: boolean }>
  ) => {
    await db.updateWorkoutSet(setId, updates);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
  };

  const deleteWorkoutSet = async (setId: string) => {
    await db.deleteWorkoutSet(setId);
    if (user?.id) {
      const refreshed = await db.fetchWorkoutLogs(user.id);
      setWorkoutLogs(refreshed);
    }
  };

  // ==========================================
  // 5. BODY MEASUREMENTS CRUD
  // ==========================================
  const createBodyMeasurement = async (measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
    hips?: number;
    neck?: number;
    notes?: string;
  }) => {
    if (!user?.id) return;
    await db.createBodyMeasurement(user.id, measurements);
    const refreshed = await db.fetchBodyMeasurements(user.id);
    setBodyMeasurements(refreshed);
  };

  const updateBodyMeasurement = async (
    id: string,
    measurements: {
      chest?: number;
      waist?: number;
      arms?: number;
      thighs?: number;
      hips?: number;
      neck?: number;
      notes?: string;
    }
  ) => {
    await db.updateBodyMeasurement(id, measurements);
    if (user?.id) {
      const refreshed = await db.fetchBodyMeasurements(user.id);
      setBodyMeasurements(refreshed);
    }
  };

  const deleteBodyMeasurement = async (id: string) => {
    await db.deleteBodyMeasurement(id);
    if (user?.id) {
      const refreshed = await db.fetchBodyMeasurements(user.id);
      setBodyMeasurements(refreshed);
    }
  };

  // ==========================================
  // 6. NUTRITION PROFILE CRUD
  // ==========================================
  const updateNutritionProfile = async (profile: Partial<DbNutritionProfile>) => {
    if (!user?.id) return;
    const { data } = await db.upsertNutritionProfile(user.id, profile);
    if (data) setNutritionProfile(data);
  };

  // ==========================================
  // 7. DIET PLANS, MEALS & FOOD ITEMS CRUD
  // ==========================================
  const activeDietPlan = dietPlans.find((p) => p.is_active) || dietPlans[0] || null;

  const createDietPlan = async (
    plan: { name: string; goal?: string; meals_per_day?: number; protein_target?: number; is_active?: boolean },
    mealsWithFood?: Array<{
      meal: { meal_name: string; meal_type?: string; meal_time?: string; calories?: number; protein?: number; carbs?: number; fats?: number };
      food_items?: Array<{ food_name: string; quantity?: number; unit?: string; calories?: number; protein?: number; carbs?: number; fats?: number }>;
    }>,
    groceries?: Array<{ item_name: string; quantity?: number; unit?: string; category?: string }>
  ): Promise<DbDietPlan | null> => {
    if (!user?.id) return null;
    const { data } = await db.createDietPlan(user.id, plan, mealsWithFood, groceries);
    if (data) {
      const refreshedPlans = await db.fetchDietPlans(user.id);
      setDietPlans(refreshedPlans);
      if (groceries && groceries.length > 0) {
        const refreshedGroceries = await db.fetchGroceryItems(user.id);
        setGroceryItems(refreshedGroceries);
      }
    }
    return data;
  };

  const updateDietPlan = async (
    planId: string,
    updates: Partial<{ name: string; goal: string; meals_per_day: number; protein_target: number; is_active: boolean }>
  ) => {
    await db.updateDietPlan(planId, updates);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  const deleteDietPlan = async (planId: string) => {
    await db.deleteDietPlan(planId);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  const setActiveDietPlan = async (planId: string) => {
    if (!user?.id) return;
    await db.updateDietPlan(planId, { is_active: true });
    for (const p of dietPlans) {
      if (p.id !== planId && p.is_active) {
        await db.updateDietPlan(p.id, { is_active: false });
      }
    }
    const refreshed = await db.fetchDietPlans(user.id);
    setDietPlans(refreshed);
  };

  const createDietMeal = async (
    dietPlanId: string,
    meal: { meal_name: string; meal_type?: string; meal_time?: string; calories?: number; protein?: number; carbs?: number; fats?: number }
  ): Promise<DbDietMeal | null> => {
    const { data } = await db.createDietMeal(dietPlanId, meal);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
    return data;
  };

  const updateDietMeal = async (
    mealId: string,
    updates: Partial<{ meal_name: string; meal_type: string; meal_time: string; calories: number; protein: number; carbs: number; fats: number }>
  ) => {
    await db.updateDietMeal(mealId, updates);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  const deleteDietMeal = async (mealId: string) => {
    await db.deleteDietMeal(mealId);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  const createDietFoodItem = async (
    mealId: string,
    item: { food_name: string; quantity?: number; unit?: string; calories?: number; protein?: number; carbs?: number; fats?: number }
  ): Promise<DbDietFoodItem | null> => {
    const { data } = await db.createDietFoodItem(mealId, item);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
    return data;
  };

  const updateDietFoodItem = async (
    itemId: string,
    updates: Partial<{ food_name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fats: number }>
  ) => {
    await db.updateDietFoodItem(itemId, updates);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  const deleteDietFoodItem = async (itemId: string) => {
    await db.deleteDietFoodItem(itemId);
    if (user?.id) {
      const refreshed = await db.fetchDietPlans(user.id);
      setDietPlans(refreshed);
    }
  };

  // ==========================================
  // 8. GROCERY ITEMS CRUD
  // ==========================================
  const createGroceryItem = async (item: {
    item_name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    purchased?: boolean;
    diet_plan_id?: string;
  }): Promise<DbGroceryItem | null> => {
    if (!user?.id) return null;
    const { data } = await db.createGroceryItem(user.id, item);
    if (data) {
      const refreshed = await db.fetchGroceryItems(user.id);
      setGroceryItems(refreshed);
    }
    return data;
  };

  const updateGroceryItem = async (
    itemId: string,
    updates: Partial<{ item_name: string; quantity: number; unit: string; category: string; purchased: boolean; diet_plan_id: string }>
  ) => {
    await db.updateGroceryItem(itemId, updates);
    if (user?.id) {
      const refreshed = await db.fetchGroceryItems(user.id);
      setGroceryItems(refreshed);
    }
  };

  const toggleGroceryItem = async (itemId: string) => {
    const item = groceryItems.find((g) => g.id === itemId);
    if (!item) return;
    const nextPurchased = !item.purchased;
    // Optimistic update
    setGroceryItems((prev) => prev.map((g) => (g.id === itemId ? { ...g, purchased: nextPurchased } : g)));
    await db.updateGroceryItem(itemId, { purchased: nextPurchased });
  };

  const deleteGroceryItem = async (itemId: string) => {
    setGroceryItems((prev) => prev.filter((g) => g.id !== itemId));
    await db.deleteGroceryItem(itemId);
  };

  const clearPurchasedGrocery = async () => {
    if (!user?.id) return;
    setGroceryItems((prev) => prev.filter((g) => !g.purchased));
    await db.clearPurchasedGroceryItems(user.id);
  };

  const generateGroceryFromDietPlan = async (dietPlanId?: string) => {
    if (!user?.id) return;
    const plan = dietPlanId ? dietPlans.find((p) => p.id === dietPlanId) : activeDietPlan;
    if (!plan?.meals) return;

    for (const meal of plan.meals) {
      if (meal.food_items) {
        for (const item of meal.food_items) {
          await db.createGroceryItem(user.id, {
            item_name: item.food_name,
            quantity: item.quantity || 1,
            unit: item.unit || 'units',
            category: meal.meal_type || 'General Food',
            purchased: false,
            diet_plan_id: plan.id,
          });
        }
      }
    }
    const refreshed = await db.fetchGroceryItems(user.id);
    setGroceryItems(refreshed);
  };

  // ==========================================
  // 9. RESUME & CAREER
  // ==========================================
  const updateResume = (resume: AppState['career']['resume']) => {
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        resume,
      },
    }));
  };

  const addJob = async (job: Omit<JobApplication, 'id'>) => {
    const newId = `job-${Date.now()}`;
    const newJob: JobApplication = {
      ...job,
      id: newId,
    };
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        jobs: [newJob, ...prev.career.jobs],
      },
    }));

    if (user?.id) {
      const res = await db.createJobApplication(user.id, {
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        status: job.stage,
        notes: job.notes,
      });
      if (res.data) {
        setState((prev) => ({
          ...prev,
          career: {
            ...prev.career,
            jobs: prev.career.jobs.map((j) => (j.id === newId ? { ...j, id: res.data!.id } : j)),
          },
        }));
      }
    }
  };

  const updateJobStage = async (id: string, stage: JobApplication['stage']) => {
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        jobs: prev.career.jobs.map((j) => (j.id === id ? { ...j, stage } : j)),
      },
    }));

    if (user?.id && !id.startsWith('job-')) {
      await db.updateJobApplication(id, { status: stage });
    }
  };

  const deleteJob = async (id: string) => {
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        jobs: prev.career.jobs.filter((j) => j.id !== id),
      },
    }));

    if (user?.id && !id.startsWith('job-')) {
      await db.deleteJobApplication(id);
    }
  };

  // ==========================================
  // 10. PORTFOLIO WEBSITE BUILDER METHODS
  // ==========================================
  const createPortfolio = (template: PortfolioTemplate = 'minimal', name?: string): string => {
    const newId = `port-${Date.now()}`;
    const defaultSlug = (name || state.profile.name || 'portfolio')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPortfolio: PortfolioItem = {
      id: newId,
      userId: user?.id || 'user-1',
      name: name || `${state.profile.name || 'My'} Portfolio`,
      template,
      status: 'draft',
      lastUpdated: 'Just now',
      hero: {
        name: state.profile.name || 'Alexander Chen',
        title: state.profile.title || 'Product Designer & Engineer',
        introduction: 'I build refined digital products, design systems, and responsive web applications.',
        tagline: 'Bridging aesthetic craft with architectural engineering.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        ctaText: 'View My Work',
        ctaLink: '#projects',
      },
      about: {
        heading: 'Crafting Digital Experiences with Intent',
        bio: 'Passionate about building fast, accessible, and intuitive software solutions. Experienced in partnering with product and engineering teams to transform ambitious visions into shipped reality.',
        skills: ['UI/UX Design', 'Design Systems', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'User Research'],
        yearsOfExperience: 5,
        location: 'San Francisco, CA',
      },
      projects: [
        {
          id: `proj-${Date.now()}-1`,
          name: 'Flagship Platform Overhaul',
          role: 'Lead Designer & Developer',
          description: 'A complete redesign of the core workspace interface, improving task throughput and user engagement.',
          tools: ['Figma', 'React', 'Tailwind CSS'],
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          projectUrl: 'https://example.com',
          caseStudy: {
            problem: 'Legacy navigation resulted in high bounce rates and user confusion.',
            research: 'Interviewed 12 power users to uncover high-frequency interaction bottlenecks.',
            process: 'Built low-fidelity interactive mockups followed by a tokenized React component library.',
            wireframes: 'Tested 3 distinct spatial hierarchies with clickable prototype sprints.',
            design: 'Applied clean high-contrast typography and subtle elevation cues.',
            solution: 'Delivered a streamlined, responsive workspace with instant search and keyboard shortcuts.',
            results: '32% lift in retention and 45% faster task completion.',
            learnings: 'Early user validation prevents weeks of unnecessary architectural refactoring.',
          },
        },
      ],
      experience: [
        {
          id: `exp-${Date.now()}-1`,
          company: 'Nexus Tech',
          role: state.profile.title || 'Product Designer',
          location: 'San Francisco, CA',
          startDate: '2022',
          endDate: 'Present',
          currentPosition: true,
          description: 'Leading product design and front-end interface development for enterprise web applications.',
        },
      ],
      education: [
        {
          id: `edu-${Date.now()}-1`,
          institution: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science & HCI',
          startDate: '2016',
          endDate: '2020',
          description: 'Focused on human-computer interaction, web technologies, and cognitive systems.',
        },
      ],
      services: [
        {
          id: `serv-${Date.now()}-1`,
          title: 'UI/UX & Product Design',
          description: 'End-to-end design from user research and wireframing to high-fidelity design systems.',
          icon: 'devices',
        },
        {
          id: `serv-${Date.now()}-2`,
          title: 'Frontend Development',
          description: 'Modern, responsive web applications built with React, TypeScript, and Tailwind CSS.',
          icon: 'code',
        },
      ],
      testimonials: [
        {
          id: `test-${Date.now()}-1`,
          clientName: 'Elena Rostova',
          role: 'VP of Product',
          company: 'Nexus Tech',
          testimonial: 'Exceptional attention to detail and design rigor. A true partner from conception to delivery.',
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        },
      ],
      contact: {
        email: state.profile.email || 'hello@example.com',
        phone: '+1 (555) 019-2834',
        location: 'San Francisco, CA',
        contactCta: "Let's build something remarkable together.",
      },
      social: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        x: 'https://x.com',
      },
      design: {
        primaryColor: template === 'developer' ? '#10B981' : template === 'creative' ? '#E11D48' : template === 'editorial' ? '#0F172A' : '#2D4B3E',
        secondaryColor: '#C48A44',
        backgroundColor: template === 'developer' ? '#0F172A' : '#FBF9F5',
        textColor: template === 'developer' ? '#F8FAFC' : '#1F2421',
        fontHeading: template === 'editorial' ? 'Playfair Display' : template === 'developer' ? 'JetBrains Mono' : 'Newsreader',
        fontBody: template === 'developer' ? 'JetBrains Mono' : 'Plus Jakarta Sans',
        buttonStyle: template === 'minimal' ? 'minimal' : template === 'creative' ? 'rounded' : 'pill',
        borderRadius: '12px',
        spacing: 'normal',
        layoutStyle: 'standard',
        mode: template === 'developer' ? 'dark' : 'light',
      },
      sections: [
        { id: 'hero', name: 'Hero Header', enabled: true, order: 1 },
        { id: 'about', name: 'About & Bio', enabled: true, order: 2 },
        { id: 'skills', name: 'Skills & Stack', enabled: true, order: 3 },
        { id: 'projects', name: 'Featured Projects', enabled: true, order: 4 },
        { id: 'experience', name: 'Experience Timeline', enabled: true, order: 5 },
        { id: 'education', name: 'Education', enabled: true, order: 6 },
        { id: 'services', name: 'Services Offered', enabled: true, order: 7 },
        { id: 'testimonials', name: 'Client Testimonials', enabled: true, order: 8 },
        { id: 'contact', name: 'Contact & Socials', enabled: true, order: 9 },
      ],
      settings: {
        slug: `${defaultSlug}-${Date.now().toString().slice(-4)}`,
        seoTitle: `${name || state.profile.name} — Portfolio`,
        seoDescription: `Portfolio website of ${name || state.profile.name}, showcasing design and engineering works.`,
        favicon: '💼',
        removeBranding: false,
      },
      analytics: {
        views: 0,
        uniqueVisitors: 0,
        ctaClicks: 0,
      },
    };

    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        portfolios: [newPortfolio, ...(prev.career.portfolios || [])],
        activePortfolioId: newId,
      },
    }));

    return newId;
  };

  const updatePortfolio = (id: string, updates: Partial<PortfolioItem>) => {
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        portfolios: (prev.career.portfolios || []).map((p) =>
          p.id === id ? { ...p, ...updates, lastUpdated: 'Just now' } : p
        ),
      },
    }));
  };

  const duplicatePortfolio = (id: string): string => {
    const original = (state.career.portfolios || []).find((p) => p.id === id);
    if (!original) return '';
    const newId = `port-${Date.now()}`;
    const duplicated: PortfolioItem = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `${original.name} (Copy)`,
      status: 'draft',
      lastUpdated: 'Just now',
      settings: {
        ...original.settings,
        slug: `${original.settings.slug}-copy-${Date.now().toString().slice(-4)}`,
      },
      analytics: { views: 0, uniqueVisitors: 0, ctaClicks: 0 },
    };

    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        portfolios: [duplicated, ...(prev.career.portfolios || [])],
        activePortfolioId: newId,
      },
    }));
    return newId;
  };

  const deletePortfolio = (id: string) => {
    setState((prev) => {
      const remaining = (prev.career.portfolios || []).filter((p) => p.id !== id);
      return {
        ...prev,
        career: {
          ...prev.career,
          portfolios: remaining,
          activePortfolioId: remaining.length > 0 ? remaining[0].id : undefined,
        },
      };
    });
  };

  const publishPortfolio = (id: string) => {
    updatePortfolio(id, { status: 'published' });
  };

  const unpublishPortfolio = (id: string) => {
    updatePortfolio(id, { status: 'draft' });
  };

  const setActivePortfolio = (id: string) => {
    setState((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        activePortfolioId: id,
      },
    }));
  };

  // ==========================================
  // 11. PLANNER & TASKS
  // ==========================================
  const addTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `tb-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        timeBlocks: [...prev.planner.timeBlocks, newBlock],
      },
    }));
  };

  const deleteTimeBlock = (id: string) => {
    setState((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        timeBlocks: prev.planner.timeBlocks.filter((b) => b.id !== id),
      },
    }));
  };

  const togglePriority = async (id: string) => {
    let nextCompleted = false;
    setState((prev) => {
      const current = prev.planner.priorities.find((p) => p.id === id);
      nextCompleted = !current?.completed;
      return {
        ...prev,
        planner: {
          ...prev.planner,
          priorities: prev.planner.priorities.map((p) =>
            p.id === id ? { ...p, completed: nextCompleted } : p
          ),
        },
      };
    });

    if (user?.id && !id.startsWith('p-')) {
      await db.updateTask(id, { status: nextCompleted ? 'completed' : 'pending' });
    }
  };

  const addPriority = async (title: string, priority: 'High' | 'Medium' | 'Low' = 'Medium') => {
    const tempId = `p-${Date.now()}`;
    const newTask: PriorityTask = {
      id: tempId,
      title,
      completed: false,
      priority,
      dueDate: 'Today',
    };
    setState((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        priorities: [newTask, ...prev.planner.priorities],
      },
    }));

    if (user?.id) {
      const res = await db.createTask(user.id, {
        title,
        priority,
        status: 'pending',
        due_date: 'Today',
      });
      if (res.data) {
        setState((prev) => ({
          ...prev,
          planner: {
            ...prev.planner,
            priorities: prev.planner.priorities.map((p) => (p.id === tempId ? { ...p, id: res.data!.id } : p)),
          },
        }));
      }
    }
  };

  const toggleHabit = async (id: string) => {
    let nextCompleted = false;
    setState((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        habits: prev.planner.habits.map((h) => {
          if (h.id === id) {
            nextCompleted = !h.completedToday;
            return {
              ...h,
              completedToday: nextCompleted,
              streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            };
          }
          return h;
        }),
      },
    }));

    if (user?.id && !id.startsWith('h-')) {
      await db.toggleHabitLog(user.id, id, nextCompleted);
    }
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    const tempId = `as-${Date.now()}`;
    const newAs: Assignment = {
      ...assignment,
      id: tempId,
    };
    setState((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        assignments: [newAs, ...prev.student.assignments],
      },
    }));

    if (user?.id) {
      const res = await db.createStudentAssignment(user.id, {
        title: assignment.task,
        priority: assignment.subject,
        due_date: assignment.dueDate,
        status: assignment.status,
      });
      if (res.data) {
        setState((prev) => ({
          ...prev,
          student: {
            ...prev.student,
            assignments: prev.student.assignments.map((a) => (a.id === tempId ? { ...a, id: res.data!.id } : a)),
          },
        }));
      }
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    setState((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        assignments: prev.student.assignments.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      },
    }));

    if (user?.id && !id.startsWith('as-')) {
      const dbPayload: Partial<DbStudentAssignment> = {};
      if (updates.task !== undefined) dbPayload.title = updates.task;
      if (updates.subject !== undefined) dbPayload.priority = updates.subject;
      if (updates.dueDate !== undefined) dbPayload.due_date = updates.dueDate;
      if (updates.status !== undefined) dbPayload.status = updates.status;
      await db.updateStudentAssignment(id, dbPayload);
    }
  };

  const updateAssignmentStatus = async (id: string, status: Assignment['status']) => {
    await updateAssignment(id, { status });
  };

  const deleteAssignment = async (id: string) => {
    setState((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        assignments: prev.student.assignments.filter((a) => a.id !== id),
      },
    }));

    if (user?.id && !id.startsWith('as-')) {
      await db.deleteStudentAssignment(id);
    }
  };

  const createStudentCourse = async (course: { name: string; progress?: number; instructor?: string; credits?: number; semester?: string }): Promise<DbStudentCourse | null> => {
    if (!user?.id) return null;
    const res = await db.createStudentCourse(user.id, course);
    if (res.data) {
      setStudentCourses((prev) => [res.data!, ...prev]);
      return res.data;
    }
    return null;
  };

  const updateStudentCourse = async (id: string, updates: Partial<DbStudentCourse>) => {
    setStudentCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    await db.updateStudentCourse(id, updates);
  };

  const deleteStudentCourse = async (id: string) => {
    setStudentCourses((prev) => prev.filter((c) => c.id !== id));
    await db.deleteStudentCourse(id);
  };

  // Client CRUD
  const createClient = async (client: { name: string; company?: string; email?: string; phone?: string; website?: string; status?: string; notes?: string }): Promise<DbClient | null> => {
    if (!user?.id) return null;
    const res = await db.createClient(user.id, client);
    if (res.data) {
      setClients((prev) => [res.data!, ...prev]);
      return res.data;
    }
    return null;
  };

  const updateClient = async (id: string, updates: Partial<DbClient>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    await db.updateClient(id, updates);
  };

  const deleteClient = async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    await db.deleteClient(id);
  };

  // Proposal CRUD
  const createProposal = async (proposal: {
    title: string;
    client_id?: string;
    client_name?: string;
    status?: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
    value: number;
    scope?: string;
    valid_until?: string;
  }): Promise<DbProposal | null> => {
    if (!user?.id) return null;
    const res = await db.createProposal(user.id, proposal);
    if (res.data) {
      setProposals((prev) => [res.data!, ...prev]);
      return res.data;
    }
    return null;
  };

  const updateProposal = async (id: string, updates: Partial<DbProposal>) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    await db.updateProposal(id, updates);
  };

  const deleteProposal = async (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
    await db.deleteProposal(id);
  };

  // Invoice CRUD
  const createInvoice = async (
    invoice: {
      invoice_number: string;
      client_id?: string;
      client_name?: string;
      status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
      issue_date?: string;
      due_date?: string;
      subtotal: number;
      tax_rate?: number;
      tax_amount?: number;
      total_amount: number;
      notes?: string;
    },
    items?: Array<{ description: string; quantity: number; unit_price: number; amount: number }>
  ): Promise<DbInvoice | null> => {
    if (!user?.id) return null;
    const res = await db.createInvoice(user.id, invoice, items);
    if (res.data) {
      setInvoices((prev) => [res.data!, ...prev]);
      return res.data;
    }
    return null;
  };

  const updateInvoice = async (id: string, updates: Partial<DbInvoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    await db.updateInvoice(id, updates);
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    await db.deleteInvoice(id);
  };

  const addPost = (post: Omit<ContentPost, 'id'>) => {
    const newPost: ContentPost = {
      ...post,
      id: `cp-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      creator: {
        ...prev.creator,
        posts: [...prev.creator.posts, newPost],
      },
    }));
  };

  const updateBrandKit = async (brandKitUpdate: Partial<BrandKit>) => {
    setState((prev) => ({
      ...prev,
      creator: {
        ...prev.creator,
        brandKit: {
          ...prev.creator.brandKit,
          ...brandKitUpdate,
        },
      },
    }));

    if (user?.id) {
      await db.upsertBrandKit(user.id, {
        primary_color: brandKitUpdate.colors?.[0]?.hex,
        secondary_color: brandKitUpdate.colors?.[1]?.hex,
        accent_color: brandKitUpdate.colors?.[2]?.hex,
        body_font: brandKitUpdate.bodyFont,
        name: brandKitUpdate.primaryLogoName,
      });
    }
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const clearNotifications = () => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
  };

  const openAIModal = (prompt: string = '') => {
    setAiModalInitialPrompt(prompt);
    setIsAIModalOpen(true);
  };

  const closeAIModal = () => {
    setIsAIModalOpen(false);
    setAiModalInitialPrompt('');
  };

  const toggleNotifications = () => setIsNotificationsOpen((prev) => !prev);
  const closeNotifications = () => setIsNotificationsOpen(false);

  const toggleSettings = () => setIsSettingsOpen((prev) => !prev);
  const closeSettings = () => setIsSettingsOpen(false);

  const subscribeUser = async (options?: string | { plan?: string; name?: string; email?: string; contact?: string; upiId?: string; method?: 'upi' | 'card' | 'netbanking' }): Promise<{ success: boolean; error?: string }> => {
    const customOpts = typeof options === 'object' ? options : {};
    // 1. Get authenticated user
    let currentUserId = user?.id;
    let currentUserEmail = customOpts.email || user?.email;
    let currentUserName = customOpts.name || user?.user_metadata?.full_name || state.profile.name;
    let currentUserContact = customOpts.contact || user?.user_metadata?.phone || '';
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        currentUserId = authData.user.id;
        currentUserEmail = customOpts.email || authData.user.email || currentUserEmail;
        currentUserName = customOpts.name || authData.user.user_metadata?.full_name || currentUserName;
        currentUserContact = customOpts.contact || authData.user.user_metadata?.phone || currentUserContact;
      }
    } catch (e) {
      console.warn('Error resolving user auth:', e);
    }

    if (!currentUserId) {
      const msg = 'Please log in to upgrade to LEVELUP Pro.';
      console.warn(msg);
      return { success: false, error: msg };
    }

    return new Promise((resolve) => {
      startRazorpaySubscription({
        user: {
          id: currentUserId!,
          email: currentUserEmail,
          user_metadata: { full_name: currentUserName, phone: currentUserContact },
        },
        name: currentUserName,
        email: currentUserEmail,
        contact: currentUserContact,
        vpa: customOpts.upiId,
        method: customOpts.method,
        onSuccess: (subData: DbSubscription) => {
          setDbSubscription(subData);
          const today = new Date().toISOString().split('T')[0];
          const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          setState((prev) => ({
            ...prev,
            subscription: {
              status: 'active',
              plan: 'LEVELUP_PRO',
              amount: 129,
              currency: 'INR',
              startDate: today,
              nextBillingDate: nextMonth,
            },
          }));
          resolve({ success: true });
        },
        onError: (err: string) => {
          console.error('subscribeUser Razorpay error:', err);
          resolve({ success: false, error: err });
        },
        onDismiss: () => {
          resolve({ success: false, error: 'Checkout was cancelled' });
        },
      });
    });
  };

  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    let currentUserId = user?.id;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        currentUserId = authData.user.id;
      }
    } catch (e) {
      console.warn('Error resolving user auth:', e);
    }

    if (!currentUserId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const res = await db.upsertUserSubscription(currentUserId, {
        plan: 'free',
        status: 'canceled',
      });

      if (res.error || !res.data) {
        console.error('Failed to cancel subscription in Supabase:', res.error);
        alert(`Failed to cancel subscription: ${res.error?.message || 'Unknown database error'}`);
        return { success: false, error: res.error?.message };
      }

      setDbSubscription(res.data);
      setState((prev) => ({
        ...prev,
        subscription: {
          status: 'inactive',
          plan: 'LEVELUP_FREE',
          amount: 0,
          currency: 'INR',
        },
      }));

      return { success: true };
    } catch (err: any) {
      console.error('cancelSubscription exception:', err);
      return { success: false, error: err?.message };
    }
  };

  // Finance Handlers
  const updateTotalIncome = async (amount: number) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        totalIncome: amount,
      },
    }));

    if (user?.id) {
      await Promise.allSettled([
        db.upsertMonthlyIncome(user.id, amount),
        db.upsertMonthlyBudget(user.id, amount, 'Income'),
      ]);
    }
  };

  const updateMonthlyBudget = async (amount: number) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        monthlyBudget: amount,
      },
    }));

    if (user?.id) {
      await db.upsertMonthlyBudget(user.id, amount, 'Monthly Overall');
    }
  };

  const deleteMonthlyBudget = async () => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        monthlyBudget: 0,
      },
    }));

    if (user?.id) {
      await db.upsertMonthlyBudget(user.id, 0, 'Monthly Overall');
    }
  };

  const addExpense = async (expense: Omit<ExpenseItem, 'id'>) => {
    const tempId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newExpense: ExpenseItem = {
      ...expense,
      id: tempId,
    };
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        expenses: [newExpense, ...((prev.finance && prev.finance.expenses) || [])],
      },
    }));

    if (user?.id) {
      const res = await db.createFinanceTransaction(user.id, {
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        type: 'expense',
      });
      if (res.data) {
        setState((prev) => ({
          ...prev,
          finance: {
            ...prev.finance,
            expenses: prev.finance.expenses.map((e) => (e.id === tempId ? { ...e, id: res.data!.id } : e)),
          },
        }));
      }
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseItem>) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        expenses: ((prev.finance && prev.finance.expenses) || []).map((exp) =>
          exp.id === id ? { ...exp, ...updates } : exp
        ),
      },
    }));

    if (user?.id && !id.startsWith('exp-')) {
      await db.updateFinanceTransaction(id, {
        name: updates.name,
        amount: updates.amount,
        category: updates.category,
      });
    }
  };

  const deleteExpense = async (id: string) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        expenses: ((prev.finance && prev.finance.expenses) || []).filter((exp) => exp.id !== id),
      },
    }));

    if (user?.id && !id.startsWith('exp-')) {
      await db.deleteFinanceTransaction(id);
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const tempId = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newGoal: SavingsGoal = {
      ...goal,
      id: tempId,
    };
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        savingsGoals: [...((prev.finance && prev.finance.savingsGoals) || []), newGoal],
      },
    }));

    if (user?.id) {
      const res = await db.createSavingsGoal(user.id, {
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        target_date: goal.targetDate,
        status: goal.notes || 'In Progress',
      });
      if (res.data) {
        setState((prev) => ({
          ...prev,
          finance: {
            ...prev.finance,
            savingsGoals: prev.finance.savingsGoals.map((g) => (g.id === tempId ? { ...g, id: res.data!.id } : g)),
          },
        }));
      }
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        savingsGoals: ((prev.finance && prev.finance.savingsGoals) || []).map((goal) =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      },
    }));

    if (user?.id && !id.startsWith('goal-')) {
      await db.updateSavingsGoal(id, {
        name: updates.name,
        target_amount: updates.targetAmount,
        current_amount: updates.currentAmount,
        target_date: updates.targetDate,
        status: updates.notes,
      });
    }
  };

  const addMoneyToGoal = async (id: string, amount: number) => {
    let nextAmount = 0;
    setState((prev) => {
      const targetGoal = (prev.finance?.savingsGoals || []).find((g) => g.id === id);
      nextAmount = (targetGoal?.currentAmount || 0) + amount;
      return {
        ...prev,
        finance: {
          ...(prev.finance || initialAppState.finance),
          savingsGoals: ((prev.finance && prev.finance.savingsGoals) || []).map((goal) =>
            goal.id === id ? { ...goal, currentAmount: nextAmount } : goal
          ),
        },
      };
    });

    if (user?.id && !id.startsWith('goal-')) {
      await db.updateSavingsGoal(id, { current_amount: nextAmount });
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    setState((prev) => ({
      ...prev,
      finance: {
        ...(prev.finance || initialAppState.finance),
        savingsGoals: ((prev.finance && prev.finance.savingsGoals) || []).filter((goal) => goal.id !== id),
      },
    }));

    if (user?.id && !id.startsWith('goal-')) {
      await db.deleteSavingsGoal(id);
    }
  };

  const refreshInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userContext: {
            name: state.profile.name,
            title: state.profile.title,
            focus: state.profile.selectedFocus,
          },
        }),
      });
      const data = await res.json();
      if (data.insight) {
        setAiInsights(data);
      }
    } catch (e) {
      console.warn('Could not refresh AI insights:', e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        isDbLoading,
        updateProfile,

        // Fitness Profile & Metrics
        fitnessProfile,
        updateFitnessProfile,
        updateWeight,
        updateProtein,
        toggleExercise,
        startCustomWorkout,

        // Workout Plans
        workoutPlans,
        activeWorkoutPlan,
        createWorkoutPlan,
        saveFullAIWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        setActiveWorkoutPlan,
        addWorkoutExercise,
        updateWorkoutExercise,
        deleteWorkoutExercise,

        // Workout Logs & Sets
        workoutLogs,
        createWorkoutLog,
        updateWorkoutLog,
        deleteWorkoutLog,
        addWorkoutSet,
        updateWorkoutSet,
        deleteWorkoutSet,

        // Weight Logs
        weightLogs,
        logWeight,
        updateWeightLog,
        deleteWeightLog,

        // Body Measurements
        bodyMeasurements,
        createBodyMeasurement,
        updateBodyMeasurement,
        deleteBodyMeasurement,

        // Nutrition Profile
        nutritionProfile,
        updateNutritionProfile,

        // Diet Plans, Meals & Food Items
        dietPlans,
        activeDietPlan,
        createDietPlan,
        updateDietPlan,
        deleteDietPlan,
        setActiveDietPlan,
        createDietMeal,
        updateDietMeal,
        deleteDietMeal,
        createDietFoodItem,
        updateDietFoodItem,
        deleteDietFoodItem,

        // Grocery List
        groceryItems,
        createGroceryItem,
        updateGroceryItem,
        toggleGroceryItem,
        deleteGroceryItem,
        clearPurchasedGrocery,
        generateGroceryFromDietPlan,

        // Career & Portfolios
        updateResume,
        addJob,
        updateJobStage,
        deleteJob,
        createPortfolio,
        updatePortfolio,
        duplicatePortfolio,
        deletePortfolio,
        publishPortfolio,
        unpublishPortfolio,
        setActivePortfolio,

        // Finance
        updateTotalIncome,
        updateMonthlyBudget,
        deleteMonthlyBudget,
        addExpense,
        updateExpense,
        deleteExpense,
        addSavingsGoal,
        updateSavingsGoal,
        addMoneyToGoal,
        deleteSavingsGoal,

        // Planner & Modals
        addTimeBlock,
        deleteTimeBlock,
        togglePriority,
        addPriority,
        toggleHabit,
        studentCourses,
        createStudentCourse,
        updateStudentCourse,
        deleteStudentCourse,
        addAssignment,
        updateAssignment,
        updateAssignmentStatus,
        deleteAssignment,
        clients,
        createClient,
        updateClient,
        deleteClient,
        proposals,
        createProposal,
        updateProposal,
        deleteProposal,
        invoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        addPost,
        updateBrandKit,
        markNotificationRead,
        clearNotifications,
        isAIModalOpen,
        aiModalInitialPrompt,
        openAIModal,
        closeAIModal,
        isNotificationsOpen,
        toggleNotifications,
        closeNotifications,
        isSettingsOpen,
        toggleSettings,
        closeSettings,
        dbSubscription,
        isUpgradeModalOpen,
        upgradeModalFeature,
        openUpgradeModal,
        closeUpgradeModal,
        subscribeUser,
        cancelSubscription,
        aiInsights,
        isGeneratingInsights,
        refreshInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
