import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { DbWorkoutPlan, DbWorkoutExercise, DbWorkoutLog, DbBodyMeasurement, DbWeightLog } from '../types';

export const FitnessPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    fitnessProfile,
    updateFitnessProfile,
    toggleExercise,
    updateWeight,
    logWeight,
    updateWeightLog,
    deleteWeightLog,
    weightLogs,
    bodyMeasurements,
    createBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
    workoutPlans,
    activeWorkoutPlan,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    setActiveWorkoutPlan,
    addWorkoutExercise,
    updateWorkoutExercise,
    deleteWorkoutExercise,
    workoutLogs,
    createWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog,
    addWorkoutSet,
    updateWorkoutSet,
    deleteWorkoutSet,
    updateProtein,
    openAIModal,
    startCustomWorkout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'logs' | 'metrics'>('overview');

  // Modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState(state.fitness.weight.toString());
  const [weightNotesInput, setWeightNotesInput] = useState('');
  const [editingWeightLog, setEditingWeightLog] = useState<DbWeightLog | null>(null);

  const [showFitnessProfileModal, setShowFitnessProfileModal] = useState(false);
  const [profileHeight, setProfileHeight] = useState(fitnessProfile?.height ?? state.fitness.height ?? 178);
  const [profileWeight, setProfileWeight] = useState(fitnessProfile?.current_weight ?? state.fitness.weight ?? 78.5);
  const [profileTargetWeight, setProfileTargetWeight] = useState(fitnessProfile?.target_weight ?? state.fitness.targetWeight ?? 75.0);
  const [profileGoal, setProfileGoal] = useState(fitnessProfile?.goal ?? state.fitness.fitnessGoal ?? 'Gain Muscle & Hypertrophy');
  const [profileLevel, setProfileLevel] = useState(fitnessProfile?.experience_level ?? state.fitness.experienceLevel ?? 'Advanced');
  const [profileDietType, setProfileDietType] = useState(fitnessProfile?.diet_type ?? state.fitness.dietType ?? 'High Protein Clean Hypertrophy');
  const [profileProteinTarget, setProfileProteinTarget] = useState(fitnessProfile?.protein_target ?? state.fitness.proteinTarget ?? 160);

  // Measurement Modal
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<DbBodyMeasurement | null>(null);
  const [measChest, setMeasChest] = useState(102);
  const [measWaist, setMeasWaist] = useState(81);
  const [measArms, setMeasArms] = useState(38);
  const [measThighs, setMeasThighs] = useState(58);
  const [measHips, setMeasHips] = useState(96);
  const [measNeck, setMeasNeck] = useState(39);
  const [measNotes, setMeasNotes] = useState('');

  // Workout Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DbWorkoutPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planGoal, setPlanGoal] = useState('Hypertrophy');
  const [planDuration, setPlanDuration] = useState(45);
  const [planIsActive, setPlanIsActive] = useState(true);

  // Exercise Modal
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [targetPlanIdForExercise, setTargetPlanIdForExercise] = useState('');
  const [editingExercise, setEditingExercise] = useState<DbWorkoutExercise | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState(10);
  const [exerciseRest, setExerciseRest] = useState(60);
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Active Session & Log Modals
  const [showWorkoutSessionModal, setShowWorkoutSessionModal] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showManualLogModal, setShowManualLogModal] = useState(false);
  const [manualLogName, setManualLogName] = useState('Upper Body Hypertrophy');
  const [manualLogDuration, setManualLogDuration] = useState(45);
  const [manualLogNotes, setManualLogNotes] = useState('');
  const [manualLogSets, setManualLogSets] = useState([
    { exercise_name: 'Incline Bench Press', set_number: 1, reps: 10, weight: 32, completed: true },
    { exercise_name: 'Incline Bench Press', set_number: 2, reps: 10, weight: 32, completed: true },
    { exercise_name: 'Neutral Lat Pulldown', set_number: 1, reps: 12, weight: 65, completed: true },
  ]);

  // AI Protocol builder
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customMuscle, setCustomMuscle] = useState('Upper Body Hypertrophy (Chest, Back, Arms)');
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val)) {
      if (editingWeightLog) {
        await updateWeightLog(editingWeightLog.id, { weight: val, notes: weightNotesInput });
        showToast('Weight log updated in Supabase!');
      } else {
        await logWeight(val, weightNotesInput);
        showToast('New weight logged to Supabase!');
      }
    }
    setShowWeightModal(false);
    setEditingWeightLog(null);
    setWeightNotesInput('');
  };

  const handleSaveFitnessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFitnessProfile({
      height: Number(profileHeight),
      current_weight: Number(profileWeight),
      target_weight: Number(profileTargetWeight),
      goal: profileGoal,
      experience_level: profileLevel,
      diet_type: profileDietType,
      protein_target: Number(profileProteinTarget),
    });
    setShowFitnessProfileModal(false);
    showToast('Fitness Profile updated in Supabase!');
  };

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeasurement) {
      await updateBodyMeasurement(editingMeasurement.id, {
        chest: Number(measChest),
        waist: Number(measWaist),
        arms: Number(measArms),
        thighs: Number(measThighs),
        hips: Number(measHips),
        neck: Number(measNeck),
        notes: measNotes,
      });
      showToast('Body measurement updated!');
    } else {
      await createBodyMeasurement({
        chest: Number(measChest),
        waist: Number(measWaist),
        arms: Number(measArms),
        thighs: Number(measThighs),
        hips: Number(measHips),
        neck: Number(measNeck),
        notes: measNotes,
      });
      showToast('Body measurement saved to Supabase!');
    }
    setShowMeasurementModal(false);
    setEditingMeasurement(null);
  };

  const handleSaveWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      await updateWorkoutPlan(editingPlan.id, {
        name: planName,
        goal: planGoal,
        duration_minutes: Number(planDuration),
        is_active: planIsActive,
      });
      showToast('Workout plan updated!');
    } else {
      await createWorkoutPlan({
        name: planName,
        goal: planGoal,
        duration_minutes: Number(planDuration),
        is_active: planIsActive,
      });
      showToast('Workout plan created in Supabase!');
    }
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      await updateWorkoutExercise(editingExercise.id, {
        exercise_name: exerciseName,
        sets: Number(exerciseSets),
        reps: Number(exerciseReps),
        rest_seconds: Number(exerciseRest),
        notes: exerciseNotes,
      });
      showToast('Exercise updated!');
    } else {
      await addWorkoutExercise({
        workout_plan_id: targetPlanIdForExercise,
        exercise_name: exerciseName,
        sets: Number(exerciseSets),
        reps: Number(exerciseReps),
        rest_seconds: Number(exerciseRest),
        notes: exerciseNotes,
      });
      showToast('Exercise added to workout plan!');
    }
    setShowExerciseModal(false);
    setEditingExercise(null);
  };

  const handleSaveManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkoutLog(
      {
        workout_name: manualLogName,
        duration_minutes: Number(manualLogDuration),
        completed: true,
        notes: manualLogNotes,
      },
      manualLogSets
    );
    setShowManualLogModal(false);
    showToast('Workout session logged to Supabase!');
  };

  const handleGenerateAIProtocol = async () => {
    setIsGeneratingProtocol(true);
    try {
      const res = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMuscle: customMuscle,
          splitType: 'Hypertrophy',
          fitnessLevel: fitnessProfile?.experience_level || 'Advanced',
        }),
      });
      const data = await res.json();
      if (data.exercises) {
        await startCustomWorkout({
          title: data.protocolName || `${customMuscle} Protocol`,
          duration: data.duration || '45 min',
          exercises: data.exercises,
        });
        setShowCustomizeModal(false);
        showToast('AI Protocol saved to Supabase workout plans!');
      }
    } catch (e) {
      console.warn('AI Workout error:', e);
    } finally {
      setIsGeneratingProtocol(false);
    }
  };

  const currentExercises = state.fitness.todaysProtocol.exercises;
  const completedExercisesCount = currentExercises.filter((e) => e.completed).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="fitness" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-section-gap px-4 sm:px-6 lg:px-margin-desktop bg-surface-bright overflow-y-auto min-h-screen w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          {/* Toast */}
          {toastMessage && (
            <div className="fixed bottom-8 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-2xl font-label-caps text-xs flex items-center gap-2 animate-fade-up">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-caps text-xs text-primary uppercase">Hypertrophy & Performance OS</span>
              </div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Fitness Command Center</h2>
              <p className="text-on-surface-variant font-body-md">
                Scientific progressive overload, Supabase-persisted workout plans, and metrics tracking.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => openAIModal('Analyze my recent workout consistency and propose progression')}
                className="px-4 py-3 font-label-caps border border-primary text-primary rounded hover:bg-primary-fixed/20 transition-colors uppercase cursor-pointer"
              >
                AI COACH
              </button>
              <button
                onClick={() => navigate('/nutrition')}
                className="px-4 py-3 font-label-caps border border-on-surface rounded hover:bg-surface-container-low transition-colors uppercase cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">restaurant</span>
                <span>Nutrition & Diet</span>
              </button>
              <button
                onClick={() => {
                  setProfileHeight(fitnessProfile?.height ?? state.fitness.height ?? 178);
                  setProfileWeight(fitnessProfile?.current_weight ?? state.fitness.weight ?? 78.5);
                  setProfileTargetWeight(fitnessProfile?.target_weight ?? state.fitness.targetWeight ?? 75.0);
                  setProfileGoal(fitnessProfile?.goal ?? state.fitness.fitnessGoal ?? 'Gain Muscle & Hypertrophy');
                  setProfileLevel(fitnessProfile?.experience_level ?? state.fitness.experienceLevel ?? 'Advanced');
                  setProfileDietType(fitnessProfile?.diet_type ?? state.fitness.dietType ?? 'High Protein Clean Hypertrophy');
                  setProfileProteinTarget(fitnessProfile?.protein_target ?? state.fitness.proteinTarget ?? 160);
                  setShowFitnessProfileModal(true);
                }}
                className="px-5 py-3 font-label-caps bg-primary-container text-on-primary rounded hover:bg-primary transition-colors uppercase cursor-pointer"
              >
                Edit Fitness Profile
              </button>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex border-b border-outline-variant bg-surface-container-low px-6 pt-2 rounded-t-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Overview & Today</span>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'plans'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">fitness_center</span>
              <span>Workout Plans ({workoutPlans.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">history</span>
              <span>Workout Logs & History ({workoutLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'metrics'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">straighten</span>
              <span>Body Metrics & Weight ({weightLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & TODAY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {/* Weight Card */}
                <div
                  onClick={() => {
                    setEditingWeightLog(null);
                    setNewWeightInput(state.fitness.weight.toString());
                    setWeightNotesInput('');
                    setShowWeightModal(true);
                  }}
                  className="bg-surface-container-lowest p-8 rounded border border-surface-variant flex flex-col justify-between hover:border-primary transition-colors cursor-pointer shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">monitor_weight</span>
                        <span className="font-label-caps text-on-surface-variant">Weight</span>
                      </div>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">edit</span>
                    </div>
                    <p className="text-stat-number">
                      {state.fitness.weight.toFixed(1)}{' '}
                      <span className="text-body-md font-normal text-on-surface-variant">kg</span>
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between text-xs">
                    <span className="text-on-surface-variant font-label-caps">TARGET</span>
                    <strong className="text-primary">{state.fitness.targetWeight.toFixed(1)} kg</strong>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="bg-surface-container-lowest p-8 rounded border border-surface-variant shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">local_fire_department</span>
                    <span className="font-label-caps text-on-surface-variant">Streak</span>
                  </div>
                  <p className="text-stat-number">
                    {state.fitness.streak}{' '}
                    <span className="text-body-md font-normal text-on-surface-variant">days</span>
                  </p>
                  <div className="mt-8 pt-4 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                    Consistent daily habits active
                  </div>
                </div>

                {/* This Week Card */}
                <div className="bg-surface-container-lowest p-8 rounded border border-surface-variant shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    <span className="font-label-caps text-on-surface-variant">This Week</span>
                  </div>
                  <p className="text-stat-number">
                    {state.fitness.weeklyWorkoutsCount}/{state.fitness.weeklyWorkoutsTarget}{' '}
                    <span className="text-body-md font-normal text-on-surface-variant">workouts</span>
                  </p>
                  <div className="mt-8 pt-4 border-t border-outline-variant/30 text-xs text-primary font-bold">
                    Target: 4-5 sessions/week
                  </div>
                </div>

                {/* Protein Card */}
                <div className="bg-surface-container-lowest p-8 rounded border border-surface-variant shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">restaurant</span>
                      <span className="font-label-caps text-on-surface-variant">Protein</span>
                    </div>
                    <button
                      onClick={() => updateProtein(Math.min(state.fitness.proteinTarget, state.fitness.proteinCurrent + 20))}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      +20g
                    </button>
                  </div>
                  <p className="text-stat-number">
                    {state.fitness.proteinCurrent}/{state.fitness.proteinTarget}g
                  </p>
                  <div className="mt-4 h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (state.fitness.proteinCurrent / state.fitness.proteinTarget) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Today's Protocol Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-section-gap">
                <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-surface-variant shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-label-caps text-primary-container uppercase">Today's Protocol</h3>
                      <span className="text-xs text-on-surface-variant">
                        (Active Plan: {activeWorkoutPlan?.name || 'Standard Split'})
                      </span>
                    </div>
                    <span className="text-xs bg-primary-fixed/30 text-primary px-3 py-1 rounded-full font-bold">
                      {completedExercisesCount}/{currentExercises.length} Done
                    </span>
                  </div>
                  <h2 className="font-headline-lg mb-8 text-on-surface">{state.fitness.todaysProtocol.title}</h2>

                  <ul className="space-y-4">
                    {currentExercises.map((exercise, index) => (
                      <li
                        key={exercise.id}
                        onClick={() => toggleExercise(exercise.id)}
                        className="flex justify-between items-center py-3 border-b border-surface-variant cursor-pointer hover:bg-surface-container-low/60 px-3 rounded transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-xl ${
                              exercise.completed ? 'text-primary fill-icon' : 'text-outline-variant group-hover:text-primary'
                            }`}
                          >
                            {exercise.completed ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className={`font-medium ${exercise.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                            {index + 1}. {exercise.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {exercise.weightUsed && (
                            <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded text-on-surface">
                              {exercise.weightUsed}
                            </span>
                          )}
                          <span className="text-on-surface-variant font-label-caps">{exercise.setsReps}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={() => setShowWorkoutSessionModal(true)}
                      className="flex-1 py-4 bg-primary-container text-on-primary rounded font-label-caps uppercase hover:bg-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      Start Workout Session
                    </button>
                    <button
                      onClick={() => setShowCustomizeModal(true)}
                      className="flex-1 py-4 border border-on-surface rounded font-label-caps uppercase hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      Customize / AI Protocol
                    </button>
                  </div>
                </div>

                <div
                  className="lg:col-span-4 rounded-xl border border-surface-variant bg-cover bg-center h-64 lg:h-auto min-h-[360px] shadow-sm relative overflow-hidden flex flex-col justify-end p-6 text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80')",
                  }}
                >
                  <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-fixed block mb-1">
                      Hypertrophy Coach
                    </span>
                    <h4 className="font-headline-sm mb-2 text-white">Progressive Overload Principle</h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Log your working weights and reps each session to trigger continuous muscle protein synthesis and progressive adaptation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUT PLANS CRUD */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Workout Plans & Splits</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Manage routine splits, customized compound lifts, target rep ranges, and rest intervals.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanName('');
                    setPlanGoal('Hypertrophy');
                    setPlanDuration(45);
                    setPlanIsActive(true);
                    setShowPlanModal(true);
                  }}
                  className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Create Workout Plan</span>
                </button>
              </div>

              {workoutPlans.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">fitness_center</span>
                  <h3 className="font-headline-sm text-on-surface">No Workout Plans Found</h3>
                  <p className="text-sm text-on-surface-variant mt-1 mb-4">
                    Create your first plan or generate a personalized routine using AI.
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                  >
                    + New Workout Plan
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {workoutPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-surface-container-lowest border rounded-2xl p-6 sm:p-8 shadow-sm transition-all ${
                        plan.is_active ? 'border-primary ring-1 ring-primary/20' : 'border-surface-variant'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-surface-variant">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-headline-sm text-on-surface">{plan.name}</h3>
                            {plan.is_active ? (
                              <span className="bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                Active Routine
                              </span>
                            ) : (
                              <button
                                onClick={() => setActiveWorkoutPlan(plan.id)}
                                className="text-xs text-primary font-bold hover:underline"
                              >
                                Set Active
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Goal: {plan.goal || 'Hypertrophy'} • Duration: {plan.duration_minutes || 45} mins •{' '}
                            {plan.exercises?.length || 0} exercises
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetPlanIdForExercise(plan.id);
                              setEditingExercise(null);
                              setExerciseName('');
                              setExerciseSets(3);
                              setExerciseReps(10);
                              setExerciseRest(60);
                              setExerciseNotes('');
                              setShowExerciseModal(true);
                            }}
                            className="px-3 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            <span>Add Exercise</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingPlan(plan);
                              setPlanName(plan.name);
                              setPlanGoal(plan.goal || 'Hypertrophy');
                              setPlanDuration(plan.duration_minutes || 45);
                              setPlanIsActive(plan.is_active || false);
                              setShowPlanModal(true);
                            }}
                            className="p-2 border border-outline-variant hover:bg-surface-container-high rounded text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete workout plan "${plan.name}" and all its exercises?`)) {
                                deleteWorkoutPlan(plan.id);
                                showToast('Workout plan deleted.');
                              }
                            }}
                            className="p-2 border border-error/30 hover:bg-error-container/20 text-error rounded"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Exercises in Plan */}
                      <div className="mt-4">
                        {(!plan.exercises || plan.exercises.length === 0) ? (
                          <div className="p-4 bg-surface-container-low rounded-lg text-xs text-on-surface-variant text-center">
                            No exercises in this plan yet. Click "+ Add Exercise" above.
                          </div>
                        ) : (
                          <ul className="divide-y divide-surface-variant">
                            {plan.exercises.map((ex, idx) => (
                              <li key={ex.id} className="py-3 flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-semibold text-on-surface">
                                    {idx + 1}. {ex.exercise_name}
                                  </span>
                                  {ex.notes && (
                                    <p className="text-xs text-on-surface-variant italic">{ex.notes}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs font-mono font-bold bg-surface-container-high px-2.5 py-1 rounded">
                                    {ex.sets || 3} sets × {ex.reps || 10} reps ({ex.rest_seconds || 60}s rest)
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingExercise(ex);
                                      setExerciseName(ex.exercise_name);
                                      setExerciseSets(ex.sets || 3);
                                      setExerciseReps(ex.reps || 10);
                                      setExerciseRest(ex.rest_seconds || 60);
                                      setExerciseNotes(ex.notes || '');
                                      setShowExerciseModal(true);
                                    }}
                                    className="text-on-surface-variant hover:text-on-surface p-1"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      deleteWorkoutExercise(ex.id);
                                      showToast('Exercise removed.');
                                    }}
                                    className="text-error/70 hover:text-error p-1"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORKOUT LOGS & HISTORY */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Completed Workout Sessions</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Historical logs and detailed volume tracking recorded to Supabase.
                  </p>
                </div>
                <button
                  onClick={() => setShowManualLogModal(true)}
                  className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">post_add</span>
                  <span>Log Completed Workout</span>
                </button>
              </div>

              {workoutLogs.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">history</span>
                  <h3 className="font-headline-sm text-on-surface">No Completed Workout Logs Yet</h3>
                  <p className="text-sm text-on-surface-variant mt-1 mb-4">
                    Complete your daily session or log past workouts to track progressive overload.
                  </p>
                  <button
                    onClick={() => setShowManualLogModal(true)}
                    className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                  >
                    Log a Workout
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workoutLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm"
                    >
                      <div className="flex justify-between items-start pb-3 border-b border-surface-variant">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                            <h4 className="font-headline-sm text-base font-bold text-on-surface">{log.workout_name}</h4>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Logged on {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Today'} • Duration: {log.duration_minutes || 45} mins
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Delete log "${log.workout_name}"?`)) {
                              deleteWorkoutLog(log.id);
                              showToast('Workout log removed.');
                            }
                          }}
                          className="text-error/70 hover:text-error p-1 text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>

                      {log.notes && (
                        <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg mt-3">
                          <strong>Notes:</strong> {log.notes}
                        </p>
                      )}

                      {log.sets && log.sets.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-label-caps text-[11px] uppercase text-on-surface-variant mb-2">Sets & Volume</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {log.sets.map((s, idx) => (
                              <div
                                key={s.id || idx}
                                className="bg-surface-container-low px-3 py-2 rounded-lg text-xs flex justify-between items-center"
                              >
                                <span className="font-medium text-on-surface">{s.exercise_name}</span>
                                <span className="font-mono font-bold text-primary">
                                  {s.weight}kg × {s.reps} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BODY METRICS & WEIGHT */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Weight Log Section */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-surface-variant">
                  <div>
                    <h3 className="font-headline-sm text-on-surface">Weight History</h3>
                    <p className="text-xs text-on-surface-variant">
                      Track bodyweight progression over time (Current: {state.fitness.weight.toFixed(1)} kg)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingWeightLog(null);
                      setNewWeightInput(state.fitness.weight.toString());
                      setWeightNotesInput('');
                      setShowWeightModal(true);
                    }}
                    className="px-4 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Log Weight</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant font-label-caps text-on-surface-variant uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Weight (kg)</th>
                        <th className="py-2.5 px-3">Notes</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant">
                      {weightLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-container-low/50">
                          <td className="py-2.5 px-3 font-medium">
                            {log.created_at ? log.created_at.split('T')[0] : 'Today'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">
                            {Number(log.weight).toFixed(1)} kg
                          </td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{log.notes || '—'}</td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingWeightLog(log);
                                setNewWeightInput(log.weight.toString());
                                setWeightNotesInput(log.notes || '');
                                setShowWeightModal(true);
                              }}
                              className="text-on-surface-variant hover:text-on-surface"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteWeightLog(log.id);
                                showToast('Weight log deleted.');
                              }}
                              className="text-error/70 hover:text-error"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Body Measurements Section */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-surface-variant">
                  <div>
                    <h3 className="font-headline-sm text-on-surface">Body Circumference Measurements</h3>
                    <p className="text-xs text-on-surface-variant">
                      Track chest, waist, arms, thighs, hips, and neck dimensions in cm.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMeasurement(null);
                      setMeasChest(102);
                      setMeasWaist(81);
                      setMeasArms(38);
                      setMeasThighs(58);
                      setMeasHips(96);
                      setMeasNeck(39);
                      setMeasNotes('');
                      setShowMeasurementModal(true);
                    }}
                    className="px-4 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Log Measurements</span>
                  </button>
                </div>

                {bodyMeasurements.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant">
                    No body measurements logged yet. Click "+ Log Measurements" above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bodyMeasurements.map((m) => (
                      <div
                        key={m.id}
                        className="bg-surface-container-low border border-surface-variant rounded-xl p-5"
                      >
                        <div className="flex justify-between items-start pb-2 border-b border-outline-variant/40">
                          <div>
                            <span className="font-label-caps text-xs text-primary font-bold">
                              {m.created_at ? m.created_at.split('T')[0] : 'Recent Log'}
                            </span>
                            {m.notes && <p className="text-xs text-on-surface-variant mt-0.5">{m.notes}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMeasurement(m);
                                setMeasChest(m.chest || 102);
                                setMeasWaist(m.waist || 81);
                                setMeasArms(m.arms || 38);
                                setMeasThighs(m.thighs || 58);
                                setMeasHips(m.hips || 96);
                                setMeasNeck(m.neck || 39);
                                setMeasNotes(m.notes || '');
                                setShowMeasurementModal(true);
                              }}
                              className="text-on-surface-variant hover:text-on-surface"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteBodyMeasurement(m.id);
                                showToast('Measurement removed.');
                              }}
                              className="text-error/70 hover:text-error"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Chest</span>
                            <span className="font-mono font-bold text-on-surface">{m.chest || '—'} cm</span>
                          </div>
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Waist</span>
                            <span className="font-mono font-bold text-on-surface">{m.waist || '—'} cm</span>
                          </div>
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Arms</span>
                            <span className="font-mono font-bold text-on-surface">{m.arms || '—'} cm</span>
                          </div>
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Thighs</span>
                            <span className="font-mono font-bold text-on-surface">{m.thighs || '—'} cm</span>
                          </div>
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Hips</span>
                            <span className="font-mono font-bold text-on-surface">{m.hips || '—'} cm</span>
                          </div>
                          <div className="bg-surface-container-lowest p-2.5 rounded text-center">
                            <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Neck</span>
                            <span className="font-mono font-bold text-on-surface">{m.neck || '—'} cm</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL: Edit Fitness Profile */}
        {showFitnessProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">Edit Fitness Profile</h3>
              <form onSubmit={handleSaveFitnessProfile} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Height (cm)</label>
                    <input
                      type="number"
                      value={profileHeight}
                      onChange={(e) => setProfileHeight(Number(e.target.value))}
                      className="w-full border rounded-lg p-2.5 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileWeight}
                      onChange={(e) => setProfileWeight(Number(e.target.value))}
                      className="w-full border rounded-lg p-2.5 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Target (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileTargetWeight}
                      onChange={(e) => setProfileTargetWeight(Number(e.target.value))}
                      className="w-full border rounded-lg p-2.5 text-sm font-bold text-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Fitness Goal</label>
                  <input
                    type="text"
                    value={profileGoal}
                    onChange={(e) => setProfileGoal(e.target.value)}
                    placeholder="e.g. Hypertrophy, Strength, Fat Loss"
                    className="w-full border rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Experience Level</label>
                    <select
                      value={profileLevel}
                      onChange={(e) => setProfileLevel(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Elite">Elite</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Daily Protein Target (g)</label>
                    <input
                      type="number"
                      value={profileProteinTarget}
                      onChange={(e) => setProfileProteinTarget(Number(e.target.value))}
                      className="w-full border rounded-lg p-2.5 text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Workout & Diet Strategy</label>
                  <input
                    type="text"
                    value={profileDietType}
                    onChange={(e) => setProfileDietType(e.target.value)}
                    placeholder="e.g. Push Pull Legs + High Protein"
                    className="w-full border rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowFitnessProfileModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Log/Update Weight */}
        {showWeightModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingWeightLog ? 'Edit Weight Log' : "Log Today's Weight"}
              </h3>
              <form onSubmit={handleUpdateWeight} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Weight in kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(e.target.value)}
                    className="w-full border border-outline-variant rounded p-3 text-lg font-bold outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={weightNotesInput}
                    onChange={(e) => setWeightNotesInput(e.target.value)}
                    placeholder="e.g. Fasted morning weigh-in"
                    className="w-full border border-outline-variant rounded p-2.5 text-xs outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWeightModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                  >
                    Save Metric
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Body Measurement */}
        {showMeasurementModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingMeasurement ? 'Edit Measurement' : 'Log Body Circumference'}
              </h3>
              <form onSubmit={handleSaveMeasurement} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Chest (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measChest}
                      onChange={(e) => setMeasChest(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Waist (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measWaist}
                      onChange={(e) => setMeasWaist(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Arms (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measArms}
                      onChange={(e) => setMeasArms(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Thighs (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measThighs}
                      onChange={(e) => setMeasThighs(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Hips (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measHips}
                      onChange={(e) => setMeasHips(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Neck (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={measNeck}
                      onChange={(e) => setMeasNeck(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Notes</label>
                  <input
                    type="text"
                    value={measNotes}
                    onChange={(e) => setMeasNotes(e.target.value)}
                    placeholder="e.g. Post-mesocycle check"
                    className="w-full border rounded p-2 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMeasurementModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Save Measurement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Workout Plan Create/Edit */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
              </h3>
              <form onSubmit={handleSaveWorkoutPlan} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Plan Name</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Push Power & Hypertrophy"
                    className="w-full border rounded p-2.5 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Goal</label>
                    <input
                      type="text"
                      value={planGoal}
                      onChange={(e) => setPlanGoal(e.target.value)}
                      placeholder="e.g. Hypertrophy"
                      className="w-full border rounded p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      value={planDuration}
                      onChange={(e) => setPlanDuration(Number(e.target.value))}
                      className="w-full border rounded p-2.5 text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="planIsActiveWorkout"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="planIsActiveWorkout" className="text-xs font-medium text-on-surface">
                    Set as active workout routine
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Save Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Exercise Add/Edit */}
        {showExerciseModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingExercise ? 'Edit Exercise' : 'Add Exercise to Plan'}
              </h3>
              <form onSubmit={handleSaveExercise} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Exercise Name</label>
                  <input
                    type="text"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="e.g. Incline Dumbbell Press"
                    className="w-full border rounded p-2.5 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Sets</label>
                    <input
                      type="number"
                      value={exerciseSets}
                      onChange={(e) => setExerciseSets(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Reps</label>
                    <input
                      type="number"
                      value={exerciseReps}
                      onChange={(e) => setExerciseReps(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Rest (sec)</label>
                    <input
                      type="number"
                      value={exerciseRest}
                      onChange={(e) => setExerciseRest(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Technique / Notes</label>
                  <input
                    type="text"
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    placeholder="e.g. 3-second eccentric tempo"
                    className="w-full border rounded p-2 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowExerciseModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Save Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Manual Workout Log */}
        {showManualLogModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">Log Completed Session</h3>
              <form onSubmit={handleSaveManualLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Workout Name</label>
                    <input
                      type="text"
                      value={manualLogName}
                      onChange={(e) => setManualLogName(e.target.value)}
                      className="w-full border rounded p-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      value={manualLogDuration}
                      onChange={(e) => setManualLogDuration(Number(e.target.value))}
                      className="w-full border rounded p-2.5 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Session Notes / PRs</label>
                  <textarea
                    rows={2}
                    value={manualLogNotes}
                    onChange={(e) => setManualLogNotes(e.target.value)}
                    placeholder="e.g. Hit PR on bench, 10 reps at 32kg."
                    className="w-full border rounded p-2.5 text-xs resize-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="font-label-caps text-xs block mb-2 uppercase text-on-surface">
                    Logged Working Sets
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {manualLogSets.map((s, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-surface-container-low p-2 rounded text-xs">
                        <input
                          type="text"
                          value={s.exercise_name}
                          onChange={(e) => {
                            const copy = [...manualLogSets];
                            copy[idx].exercise_name = e.target.value;
                            setManualLogSets(copy);
                          }}
                          className="flex-1 border rounded p-1.5"
                          placeholder="Exercise"
                        />
                        <input
                          type="number"
                          value={s.weight}
                          onChange={(e) => {
                            const copy = [...manualLogSets];
                            copy[idx].weight = Number(e.target.value);
                            setManualLogSets(copy);
                          }}
                          className="w-16 border rounded p-1.5 font-bold"
                          placeholder="kg"
                        />
                        <span className="text-on-surface-variant">kg ×</span>
                        <input
                          type="number"
                          value={s.reps}
                          onChange={(e) => {
                            const copy = [...manualLogSets];
                            copy[idx].reps = Number(e.target.value);
                            setManualLogSets(copy);
                          }}
                          className="w-14 border rounded p-1.5 font-bold"
                          placeholder="reps"
                        />
                        <button
                          type="button"
                          onClick={() => setManualLogSets(manualLogSets.filter((_, i) => i !== idx))}
                          className="text-error/70 hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setManualLogSets([
                        ...manualLogSets,
                        { exercise_name: 'Exercise Name', set_number: manualLogSets.length + 1, reps: 10, weight: 20, completed: true },
                      ])
                    }
                    className="mt-2 text-xs text-primary font-bold hover:underline"
                  >
                    + Add Set Row
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowManualLogModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Save Log to Supabase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: AI Protocol Builder */}
        {showCustomizeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline-sm text-primary">Customize Protocol</h3>
                  <p className="text-xs text-on-surface-variant">Generate scientific hypertrophy splits via Gemini</p>
                </div>
                <button onClick={() => setShowCustomizeModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-2">Target Muscle Group</label>
                  <select
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest"
                  >
                    <option value="Upper Body Hypertrophy (Chest, Back, Arms)">Upper Body Hypertrophy (Chest, Back, Arms)</option>
                    <option value="Push Focus (Chest, Shoulders, Triceps)">Push Focus (Chest, Shoulders, Triceps)</option>
                    <option value="Pull Focus (Lats, Upper Back, Biceps)">Pull Focus (Lats, Upper Back, Biceps)</option>
                    <option value="Legs & Glutes Quad Dominant">Legs & Glutes Quad Dominant</option>
                    <option value="Full Body Athletic Conditioning">Full Body Athletic Conditioning</option>
                  </select>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg text-xs space-y-1">
                  <p className="font-bold text-on-surface">Hypertrophy Targets:</p>
                  <p className="text-on-surface-variant">4-5 Compound & Isolation exercises, 8-12 rep range, 90s rest periods.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCustomizeModal(false)}
                    className="px-5 py-2.5 border rounded-lg font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAIProtocol}
                    disabled={isGeneratingProtocol}
                    className="px-6 py-2.5 bg-primary-container text-on-primary rounded-lg font-label-caps text-xs uppercase flex items-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {isGeneratingProtocol ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Live Active Workout Session */}
        {showWorkoutSessionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-up">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <span className="font-label-caps text-primary text-xs uppercase block">Active Session</span>
                  <h3 className="font-headline-sm">{state.fitness.todaysProtocol.title}</h3>
                </div>
                <button
                  onClick={() => setShowWorkoutSessionModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="py-6 text-center">
                <p className="text-xs font-label-caps text-on-surface-variant mb-2">Exercise {activeExerciseIndex + 1} of {currentExercises.length}</p>
                <h2 className="font-headline-lg text-primary mb-2">{currentExercises[activeExerciseIndex]?.name}</h2>
                <span className="font-label-caps text-sm bg-surface-container-high px-4 py-1.5 rounded-full inline-block mb-6">
                  Target: {currentExercises[activeExerciseIndex]?.setsReps}
                </span>

                <div className="flex justify-center items-center gap-4 mb-8">
                  <button
                    onClick={() => toggleExercise(currentExercises[activeExerciseIndex]?.id)}
                    className={`px-6 py-3 rounded-lg font-label-caps text-xs uppercase flex items-center gap-2 transition-colors ${
                      currentExercises[activeExerciseIndex]?.completed
                        ? 'bg-primary text-on-primary'
                        : 'border-2 border-primary text-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {currentExercises[activeExerciseIndex]?.completed ? 'check' : 'done'}
                    </span>
                    {currentExercises[activeExerciseIndex]?.completed ? 'Completed' : 'Mark Completed'}
                  </button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    disabled={activeExerciseIndex === 0}
                    onClick={() => setActiveExerciseIndex(activeExerciseIndex - 1)}
                    className="px-4 py-2 border rounded font-label-caps text-xs disabled:opacity-30"
                  >
                    PREV
                  </button>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {completedExercisesCount} of {currentExercises.length} finished
                  </span>
                  {activeExerciseIndex < currentExercises.length - 1 ? (
                    <button
                      onClick={() => setActiveExerciseIndex(activeExerciseIndex + 1)}
                      className="px-4 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                    >
                      NEXT
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setShowWorkoutSessionModal(false);
                        await createWorkoutLog({
                          workout_name: state.fitness.todaysProtocol.title,
                          duration_minutes: 45,
                          completed: true,
                          notes: 'Completed active routine session',
                        });
                        showToast('Workout finished and logged to Supabase!');
                      }}
                      className="px-5 py-2 bg-primary text-on-primary rounded font-label-caps text-xs uppercase"
                    >
                      FINISH & LOG
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
