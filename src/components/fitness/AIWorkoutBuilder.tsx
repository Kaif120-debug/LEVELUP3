import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  AIWorkoutPlan,
  AIWorkoutDay,
  AIWorkoutExercise,
  AIWorkoutRequest,
  DbWorkoutPlan,
} from '../../types';

interface AIWorkoutBuilderProps {
  onBack?: () => void;
  onPlanActivated?: (plan: AIWorkoutPlan) => void;
}

const FITNESS_GOALS = [
  {
    id: 'Muscle Gain',
    title: 'Muscle Gain (Hypertrophy)',
    desc: 'Maximal muscle fiber recruitment, mechanical tension, and volume accumulation.',
    icon: 'fitness_center',
  },
  {
    id: 'Fat Loss',
    title: 'Fat Loss & Recomposition',
    desc: 'High metabolic density, lean mass preservation, and calorie expenditure.',
    icon: 'local_fire_department',
  },
  {
    id: 'Strength',
    title: 'Pure Strength & Power',
    desc: 'Heavy compound loads, central nervous system adaptation, and low rep ranges.',
    icon: 'bolt',
  },
  {
    id: 'General Fitness',
    title: 'General Fitness & Longevity',
    desc: 'Functional mobility, cardiovascular conditioning, and full-body resilience.',
    icon: 'vital_signs',
  },
];

const EXPERIENCE_LEVELS = [
  { id: 'Beginner', label: 'Beginner', subtitle: '< 1 yr training' },
  { id: 'Intermediate', label: 'Intermediate', subtitle: '1 - 3 yrs training' },
  { id: 'Advanced', label: 'Advanced', subtitle: '3+ yrs consistent lifting' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'Full Gym', label: 'Full Commercial Gym', desc: 'Barbells, dumbbells, cables, machines, racks', icon: 'domain' },
  { id: 'Dumbbells', label: 'Dumbbells & Bench', desc: 'Adjustable dumbbells, bench, pull-up bar', icon: 'sports_gymnastics' },
  { id: 'Home', label: 'Home Gym Essentials', desc: 'Bands, kettlebells, pull-up bar, basic weights', icon: 'home' },
  { id: 'Bodyweight', label: 'Calisthenics / Bodyweight', desc: 'Minimal equipment, pull-up bar, dip station', icon: 'accessibility_new' },
];

const SPLIT_OPTIONS = [
  'Upper / Lower (Balanced Hypertrophy)',
  'Push / Pull / Legs (PPL)',
  'Full Body (High Frequency)',
  'Arnold Split (Chest/Back, Shoulders/Arms, Legs)',
  'Bro Split (1-2 Bodyparts/Day)',
  'Custom / AI Optimized',
];

const TARGET_MUSCLE_OPTIONS = [
  'Full Body',
  'Chest',
  'Upper Back & Lats',
  'Shoulders (Delts)',
  'Biceps',
  'Triceps',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core & Abs',
];

const COMMON_LIMITATION_TAGS = [
  'No barbell squats (knee/back friendly)',
  'Shoulder impingement (neutral grip presses)',
  'Lower back herniation / sensitive',
  'Wrist pain (use dumbbells/machines)',
  'No overhead pressing',
  'Knee friendly (prefer machines & hinges)',
];

export const AIWorkoutBuilder: React.FC<AIWorkoutBuilderProps> = ({ onBack, onPlanActivated }) => {
  const { user } = useAuth();
  const {
    fitnessProfile,
    workoutPlans,
    saveFullAIWorkoutPlan,
    setActiveWorkoutPlan,
    deleteWorkoutPlan,
    startCustomWorkout,
  } = useApp();

  // Form State
  const [goal, setGoal] = useState<'Muscle Gain' | 'Fat Loss' | 'Strength' | 'General Fitness'>(
    (fitnessProfile?.goal as any) || 'Muscle Gain'
  );
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    (fitnessProfile?.experience_level as any) || 'Intermediate'
  );
  const [trainingDays, setTrainingDays] = useState<number>(4);
  const [duration, setDuration] = useState<string>('60 mins');
  const [equipment, setEquipment] = useState<'Full Gym' | 'Dumbbells' | 'Home' | 'Bodyweight'>('Full Gym');
  const [preferredSplit, setPreferredSplit] = useState<string>('Upper / Lower (Balanced Hypertrophy)');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['Chest', 'Upper Back & Lats', 'Quadriceps', 'Hamstrings']);
  const [limitations, setLimitations] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');

  // Execution & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStepText, setGenerationStepText] = useState<string>('Analyzing biomechanical parameters...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<AIWorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'builder' | 'plan' | 'saved'>('builder');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Single Day Modification / Regeneration
  const [showModifyDayModal, setShowModifyDayModal] = useState<boolean>(false);
  const [dayFeedbackText, setDayFeedbackText] = useState<string>('');
  const [isRegeneratingDay, setIsRegeneratingDay] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Rotating tips during generation
  useEffect(() => {
    if (!isGenerating) return;
    const tips = [
      'Synthesizing volume allocation and stimulus-to-fatigue ratios...',
      'Structuring dynamic warm-up drills and motor unit activation...',
      'Sequencing compound lifts ahead of metabolic pump isolations...',
      'Formulating double-progression rules and RPE targets...',
      'Calibrating joint-friendly exercise angles and form cues...',
      'Finalizing weekly periodization schedule...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % tips.length;
      setGenerationStepText(tips[idx]);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Toggle muscle selection
  const handleToggleMuscle = (muscle: string) => {
    if (muscle === 'Full Body') {
      setSelectedMuscles(['Full Body']);
      return;
    }
    setSelectedMuscles((prev) => {
      const filtered = prev.filter((m) => m !== 'Full Body');
      if (filtered.includes(muscle)) {
        const next = filtered.filter((m) => m !== muscle);
        return next.length === 0 ? ['Full Body'] : next;
      } else {
        return [...filtered, muscle];
      }
    });
  };

  const handleAddLimitationTag = (tag: string) => {
    if (!limitations.includes(tag)) {
      setLimitations((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  // Main Generator Function
  const handleGenerateWorkout = async (isRegen = false) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const requestPayload: AIWorkoutRequest & { regenerationCount?: number; previousPlan?: any } = {
        goal,
        experience,
        trainingDays,
        duration,
        equipment,
        preferredSplit,
        targetMuscles: selectedMuscles,
        limitations,
        preferences,
        regenerationCount: isRegen ? 1 : 0,
        previousPlan: isRegen ? generatedPlan : null,
      };

      const response = await fetch('/api/ai/workout/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: AIWorkoutPlan = await response.json();

      if (!data || !data.weeklySchedule || data.weeklySchedule.length === 0) {
        throw new Error('Received an empty workout schedule from AI generator.');
      }

      setGeneratedPlan(data);
      setSelectedDayIndex(0);
      setActiveTab('plan');
      showToast(isRegen ? 'Workout routine regenerated with fresh variations!' : 'AI Workout Plan engineered successfully!');
    } catch (err: any) {
      console.error('[AIWorkoutBuilder Error]:', err);
      setErrorMsg(err.message || 'Failed to generate workout plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Plan to Supabase
  const handleSaveToSupabase = async (setActive = false) => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const result = await saveFullAIWorkoutPlan(generatedPlan, setActive);
      if (result) {
        setSaveSuccess(true);
        showToast(
          setActive
            ? 'Plan saved to Supabase & activated in Fitness Command Center!'
            : 'Plan successfully saved to your Supabase workout library!'
        );
        if (onPlanActivated && setActive) {
          onPlanActivated(generatedPlan);
        }
      } else {
        showToast('Workout plan saved locally. Sign in to sync across all devices.');
      }
    } catch (err: any) {
      console.error('Error saving workout plan:', err);
      showToast('Saved to local workout storage.');
    } finally {
      setIsSaving(false);
    }
  };

  // Regenerate / Customize Specific Day
  const handleRegenerateSpecificDay = async () => {
    if (!generatedPlan || !generatedPlan.weeklySchedule[selectedDayIndex]) return;
    const currentDay = generatedPlan.weeklySchedule[selectedDayIndex];

    setIsRegeneratingDay(true);
    try {
      const res = await fetch('/api/ai/workout/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planContext: {
            goal: generatedPlan.goal,
            experience: generatedPlan.experience,
            equipment: generatedPlan.equipment,
            duration: generatedPlan.estimatedDuration,
            limitations,
            splitName: generatedPlan.splitName,
          },
          dayNumber: currentDay.dayNumber,
          dayName: currentDay.dayName,
          currentFocusTitle: currentDay.focusTitle,
          currentExercises: currentDay.exercises,
          userFeedback: dayFeedbackText || 'Generate a novel, high-performance variation of this session',
        }),
      });

      if (!res.ok) throw new Error('Failed to modify session');
      const updatedDay: AIWorkoutDay = await res.json();

      if (updatedDay && updatedDay.exercises && updatedDay.exercises.length > 0) {
        const nextSchedule = [...generatedPlan.weeklySchedule];
        nextSchedule[selectedDayIndex] = updatedDay;
        setGeneratedPlan({
          ...generatedPlan,
          weeklySchedule: nextSchedule,
        });
        setShowModifyDayModal(false);
        setDayFeedbackText('');
        showToast(`Day ${currentDay.dayNumber} updated with custom modifications!`);
      }
    } catch (err: any) {
      console.error('Failed to regenerate day:', err);
      showToast('Error regenerating day. Please try again.');
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  // Load a Saved Workout from Supabase
  const handleLoadSavedPlan = (savedPlan: DbWorkoutPlan) => {
    try {
      let parsedPlan: AIWorkoutPlan | null = null;
      if (savedPlan.goal && savedPlan.goal.startsWith('{')) {
        const meta = JSON.parse(savedPlan.goal);
        parsedPlan = {
          id: savedPlan.id,
          planName: savedPlan.name,
          overview: meta.overview || 'Custom saved workout protocol',
          goal: meta.goal || 'Hypertrophy & Strength',
          experience: meta.experience || 'Intermediate',
          equipment: meta.equipment || 'Full Gym',
          splitName: meta.splitName || 'Custom Split',
          trainingDaysCount: meta.trainingDaysCount || 4,
          estimatedDuration: `${savedPlan.duration_minutes || 60} mins`,
          targetMuscles: meta.targetMuscles,
          progressiveOverloadGuidance: meta.progressiveOverloadGuidance || {
            principles: ['Double progression method', 'Controlled 3-second eccentrics', 'Train to 1-2 RIR'],
            progressionRule: 'Increase load when top rep range is achieved across all working sets.',
            rpeGuidance: 'RPE 7.5 - 8.5 on primary movements.',
            tempoAdvice: '3-0-1-0 tempo on compound lifts.',
            deloadStrategy: 'Deload every 6-8 weeks.',
          },
          weeklySchedule: meta.weeklySchedule || [],
        };
      } else {
        // Fallback from exercises list
        const daysMap: Record<string, AIWorkoutExercise[]> = {};
        (savedPlan.exercises || []).forEach((ex, idx) => {
          let dayName = 'Day 1 - Full Session';
          let formInstructions = ex.notes || 'Focus on controlled eccentric phase and full stretch.';
          let tempo = '3-0-1-0';
          let intensityOrRPE = 'RPE 8';
          let alt = '';

          if (ex.notes && ex.notes.startsWith('{')) {
            try {
              const parsedNotes = JSON.parse(ex.notes);
              dayName = parsedNotes.dayName || dayName;
              formInstructions = parsedNotes.formInstructions || formInstructions;
              tempo = parsedNotes.tempo || tempo;
              intensityOrRPE = parsedNotes.intensityOrRPE || intensityOrRPE;
              alt = parsedNotes.alternativeExercise || alt;
            } catch {
              // ignore
            }
          }

          if (!daysMap[dayName]) daysMap[dayName] = [];
          daysMap[dayName].push({
            orderIndex: idx + 1,
            name: ex.exercise_name,
            targetMuscle: 'Target Muscle',
            sets: ex.sets || 3,
            reps: `${ex.reps || 10} reps`,
            restTime: `${ex.rest_seconds || 90} sec`,
            tempo,
            formInstructions,
            intensityOrRPE,
            alternativeExercise: alt,
          });
        });

        const weeklySchedule: AIWorkoutDay[] = Object.keys(daysMap).map((key, dIdx) => ({
          dayNumber: dIdx + 1,
          dayName: key,
          focusTitle: `${savedPlan.name} (${key})`,
          muscleGroups: ['Major Muscle Groups'],
          isRestDay: false,
          duration: `${savedPlan.duration_minutes || 60} mins`,
          warmup: {
            duration: '8 mins',
            routine: [
              { exercise: 'Dynamic Mobility Flow', durationOrReps: '2 sets x 10 reps', cues: 'Open joint capsules' },
            ],
          },
          exercises: daysMap[key],
          cooldown: {
            duration: '5 mins',
            routine: [
              { stretch: 'Full-Body Static Stretch', duration: '45s each', cues: 'Parasympathetic breathing' },
            ],
          },
        }));

        parsedPlan = {
          id: savedPlan.id,
          planName: savedPlan.name,
          overview: `Custom plan loaded from Supabase database.`,
          goal: savedPlan.goal || 'Strength & Hypertrophy',
          experience: 'Custom',
          equipment: 'Gym / Mixed',
          splitName: 'Weekly Routine',
          trainingDaysCount: weeklySchedule.length || 1,
          estimatedDuration: `${savedPlan.duration_minutes || 60} mins`,
          progressiveOverloadGuidance: {
            principles: ['Double progression', 'Controlled cadence', 'Target RPE 8'],
            progressionRule: 'Add weight when all target reps are executed cleanly.',
            rpeGuidance: 'RPE 8 across working sets.',
            tempoAdvice: '3-0-1-0 tempo.',
            deloadStrategy: 'Deload every 6-8 weeks.',
          },
          weeklySchedule: weeklySchedule.length > 0 ? weeklySchedule : [
            {
              dayNumber: 1,
              dayName: 'Day 1',
              focusTitle: savedPlan.name,
              muscleGroups: ['Full Body'],
              isRestDay: false,
              duration: '60 mins',
              warmup: { duration: '8 mins', routine: [] },
              exercises: (savedPlan.exercises || []).map((e, i) => ({
                orderIndex: i + 1,
                name: e.exercise_name,
                targetMuscle: 'Target Muscle',
                sets: e.sets || 3,
                reps: `${e.reps || 10} reps`,
                restTime: `${e.rest_seconds || 90} sec`,
                formInstructions: e.notes || 'Maintain controlled tempo.',
                intensityOrRPE: 'RPE 8',
              })),
              cooldown: { duration: '5 mins', routine: [] },
            },
          ],
        };
      }

      setGeneratedPlan(parsedPlan);
      setSelectedDayIndex(0);
      setActiveTab('plan');
      showToast(`Loaded "${savedPlan.name}" from library!`);
    } catch (e) {
      console.error('Error parsing saved plan:', e);
      showToast('Error loading plan format.');
    }
  };

  const currentDay = generatedPlan?.weeklySchedule?.[selectedDayIndex] || null;

  return (
    <div className="space-y-stack-lg animate-fade-up w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-2xl font-label-caps text-xs flex items-center gap-2 animate-fade-up">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-container text-on-primary text-[10px] font-bold px-2.5 py-1 rounded font-label-caps uppercase tracking-wider">
                AI Sports Physiology Engine
              </span>
              <span className="text-primary font-label-caps text-xs uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Biomechanically Grounded
              </span>
            </div>
            <h2 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
              AI Workout Builder
            </h2>
            <p className="text-on-surface-variant font-body-md mt-1 max-w-3xl">
              Scientifically engineered weekly splits, dynamic warm-up drills, exercise order optimization, 
              progressive overload protocols, and step-by-step form execution guides.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-lg font-label-caps text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              Configure
            </button>

            {generatedPlan && (
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-2 rounded-lg font-label-caps text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'plan'
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">calendar_view_week</span>
                Active Plan
              </button>
            )}

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-lg font-label-caps text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">bookmarks</span>
              Saved Library ({workoutPlans.length})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUILDER CONFIGURATION FORM                                         */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Goal */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-label-caps">
                  1
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Primary Fitness Goal
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FITNESS_GOALS.map((item) => {
                  const isSelected = goal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id as any)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary-fixed/15 ring-1 ring-primary shadow-sm'
                          : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </div>
                        <span className="font-label-caps text-xs font-bold text-on-surface">{item.title}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Experience & Training Frequency */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-label-caps">
                  2
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Experience Level & Training Frequency
                </h3>
              </div>

              <div className="space-y-5">
                {/* Experience */}
                <div>
                  <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                    Lifting Experience
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map((exp) => {
                      const isSelected = experience === exp.id;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => setExperience(exp.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-sm'
                              : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <span className="font-label-caps text-xs block uppercase">{exp.label}</span>
                          <span className="text-[11px] text-on-surface-variant opacity-80">{exp.subtitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Training Days */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                      Days per Week ({trainingDays} Days)
                    </label>
                    <div className="flex items-center gap-2">
                      {[2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTrainingDays(num)}
                          className={`flex-1 py-2.5 rounded-lg border font-label-caps text-xs font-bold transition-all cursor-pointer ${
                            trainingDays === num
                              ? 'border-primary bg-primary text-on-primary shadow-sm'
                              : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40'
                          }`}
                        >
                          {num}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                      Workout Duration
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {['30 mins', '45 mins', '60 mins', '75 mins', '90 mins'].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setDuration(dur)}
                          className={`py-2 px-1 rounded-lg border text-center font-label-caps text-[11px] transition-all cursor-pointer ${
                            duration === dur
                              ? 'border-primary bg-primary-fixed/25 text-primary font-bold'
                              : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {dur.replace(' mins', 'm')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Equipment & Split Architecture */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-label-caps">
                  3
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Equipment Available & Preferred Split
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                    Available Gear
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EQUIPMENT_OPTIONS.map((item) => {
                      const isSelected = equipment === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setEquipment(item.id as any)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'border-primary bg-primary-fixed/15 ring-1 ring-primary'
                              : 'border-outline-variant bg-surface-container-low hover:border-primary/40'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                          </div>
                          <div>
                            <span className="font-label-caps text-xs font-bold text-on-surface block">{item.label}</span>
                            <span className="text-[11px] text-on-surface-variant line-clamp-1">{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                    Preferred Split Structure
                  </label>
                  <select
                    value={preferredSplit}
                    onChange={(e) => setPreferredSplit(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    {SPLIT_OPTIONS.map((split) => (
                      <option key={split} value={split}>
                        {split}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Target Muscles & Limitations */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-label-caps">
                  4
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Target Focus & Limitations
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs text-on-surface-variant block mb-2 uppercase">
                    Target Muscle Groups (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_MUSCLE_OPTIONS.map((muscle) => {
                      const isSelected = selectedMuscles.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => handleToggleMuscle(muscle)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary text-on-primary font-bold'
                              : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {muscle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      Physical Limitations / Injury Considerations
                    </label>
                    <span className="text-[11px] text-on-surface-variant opacity-75">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={limitations}
                    onChange={(e) => setLimitations(e.target.value)}
                    placeholder="e.g. No barbell squats due to lower back pain, wrist pain on bench press"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-on-surface-variant py-0.5">Quick tags:</span>
                    {COMMON_LIMITATION_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddLimitationTag(tag)}
                        className="text-[10px] bg-surface-container-high hover:bg-primary-fixed/20 text-on-surface-variant hover:text-primary px-2 py-0.5 rounded border border-outline-variant/50 transition-colors cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      Special Preferences / Coaching Notes
                    </label>
                    <span className="text-[11px] text-on-surface-variant opacity-75">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. Include cable lateral raises, focus on arm pump finish, include pull-up variations"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Summary & Generation Call-to-Action */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Protocol Blueprint
                </h3>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Goal</span>
                  <span className="font-bold text-on-surface">{goal}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Experience</span>
                  <span className="font-bold text-on-surface">{experience}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Split</span>
                  <span className="font-bold text-on-surface truncate max-w-[150px] text-right">{preferredSplit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Frequency</span>
                  <span className="font-bold text-primary">{trainingDays} days / week</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Session Duration</span>
                  <span className="font-bold text-on-surface">{duration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant font-label-caps uppercase">Gear</span>
                  <span className="font-bold text-on-surface">{equipment}</span>
                </div>
                <div className="pt-1">
                  <span className="text-on-surface-variant font-label-caps uppercase block mb-1">Target Muscles</span>
                  <span className="font-medium text-on-surface leading-snug block">
                    {selectedMuscles.join(', ')}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-error-container text-error p-3 rounded-xl text-xs mb-4 flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleGenerateWorkout(false)}
                className="w-full bg-primary-container text-on-primary py-4 px-6 rounded-xl font-label-caps text-sm uppercase font-bold tracking-wider hover:bg-primary transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Engineering Routine...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <span>Generate AI Workout</span>
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-4 p-3 bg-surface-container-low border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="animate-pulse">{generationStepText}</span>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-outline-variant/60 text-[11px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                <span>Includes periodization, warm-up drills, cool-downs, and exercise execution cues.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE GENERATED WORKOUT PLAN VIEW                                 */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && generatedPlan && (
        <div className="space-y-6">
          {/* Plan Header Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-primary/15 text-primary text-xs font-bold px-2.5 py-1 rounded font-label-caps uppercase">
                    {generatedPlan.goal}
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded font-label-caps uppercase">
                    {generatedPlan.experience}
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded font-label-caps uppercase">
                    {generatedPlan.trainingDaysCount} Days/Wk
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded font-label-caps uppercase">
                    {generatedPlan.estimatedDuration}
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded font-label-caps uppercase">
                    {generatedPlan.equipment}
                  </span>
                </div>
                <h2 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
                  {generatedPlan.planName}
                </h2>
                <p className="text-on-surface-variant font-body-md max-w-4xl text-sm leading-relaxed">
                  {generatedPlan.overview}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerateWorkout(true)}
                  className="px-4 py-3 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-high font-label-caps text-xs uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Regenerate All
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveToSupabase(false)}
                  className={`px-4 py-3 rounded-xl border font-label-caps text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    saveSuccess
                      ? 'border-green-500/50 bg-green-500/10 text-green-700'
                      : 'border-primary text-primary hover:bg-primary-fixed/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {saveSuccess ? 'bookmark_added' : 'bookmark'}
                  </span>
                  {saveSuccess ? 'Saved to DB' : 'Save Routine'}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveToSupabase(true)}
                  className="bg-primary-container text-on-primary px-5 py-3 rounded-xl font-label-caps text-xs uppercase font-bold hover:bg-primary transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Set as Active Routine
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Overload Guidance Protocol */}
          {generatedPlan.progressiveOverloadGuidance && (
            <div className="bg-surface-container-low border border-primary/25 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface uppercase tracking-wide">
                  Progressive Overload & Periodization Framework
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                  <span className="font-label-caps text-primary font-bold uppercase block mb-1">
                    Progression Rule
                  </span>
                  <p className="text-on-surface leading-relaxed">
                    {generatedPlan.progressiveOverloadGuidance.progressionRule}
                  </p>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                  <span className="font-label-caps text-primary font-bold uppercase block mb-1">
                    RPE & Fatigue Roadmap
                  </span>
                  <p className="text-on-surface leading-relaxed">
                    {generatedPlan.progressiveOverloadGuidance.rpeGuidance}
                  </p>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                  <span className="font-label-caps text-primary font-bold uppercase block mb-1">
                    Tempo & Deload Strategy
                  </span>
                  <p className="text-on-surface leading-relaxed">
                    <strong>Tempo:</strong> {generatedPlan.progressiveOverloadGuidance.tempoAdvice}
                    <br />
                    <strong>Deload:</strong> {generatedPlan.progressiveOverloadGuidance.deloadStrategy}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {generatedPlan.weeklySchedule.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={day.dayNumber || idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-5 py-3 rounded-xl border font-label-caps text-xs uppercase whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-on-primary font-bold shadow-md'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-[10px]">
                    {day.dayNumber || idx + 1}
                  </span>
                  <span>{day.dayName || `Day ${idx + 1}`}</span>
                  {day.isRestDay && (
                    <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">
                      Rest
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          {currentDay && (
            <div className="space-y-6">
              {/* Day Header */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-label-caps text-xs text-primary font-bold uppercase">
                        {currentDay.dayName}
                      </span>
                      <span className="text-on-surface-variant text-xs">•</span>
                      <span className="text-on-surface-variant text-xs">{currentDay.duration || '60 mins'}</span>
                    </div>
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">
                      {currentDay.focusTitle}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(currentDay.muscleGroups || []).map((m) => (
                        <span
                          key={m}
                          className="bg-surface-container-high text-on-surface-variant text-[11px] px-2 py-0.5 rounded font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowModifyDayModal(true)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-caps text-xs uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">tune</span>
                    Modify This Day
                  </button>
                </div>
              </div>

              {/* Dynamic Warm-Up */}
              {currentDay.warmup && currentDay.warmup.routine && currentDay.warmup.routine.length > 0 && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">local_fire_department</span>
                      <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                        Dynamic Warm-Up & Motor Activation ({currentDay.warmup.duration})
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentDay.warmup.routine.map((drill, wIdx) => (
                      <div
                        key={wIdx}
                        className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-semibold text-xs text-on-surface">{drill.exercise}</span>
                            <span className="font-label-caps text-[11px] text-amber-600 font-bold shrink-0">
                              {drill.durationOrReps}
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-snug">{drill.cues}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise List */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">fitness_center</span>
                    <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                      Target Exercise Prescription ({currentDay.exercises.length} Movements)
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentDay.exercises.map((exercise, exIdx) => {
                    const isExpanded = expandedExerciseId === `${selectedDayIndex}-${exIdx}`;
                    return (
                      <div
                        key={exIdx}
                        className="border border-outline-variant rounded-xl p-4 sm:p-5 bg-surface-container-low hover:border-primary/50 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-label-caps shrink-0">
                              {exercise.orderIndex || exIdx + 1}
                            </div>
                            <div>
                              <h5 className="font-headline-sm text-base font-bold text-on-surface">
                                {exercise.name}
                              </h5>
                              <span className="text-xs text-primary font-medium">{exercise.targetMuscle}</span>
                            </div>
                          </div>

                          {/* Quick Metrics */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                            <div className="bg-surface-container-high px-3 py-1.5 rounded-lg">
                              <span className="text-on-surface-variant font-label-caps block text-[10px] uppercase">Sets & Reps</span>
                              <span className="font-bold text-on-surface">{exercise.sets} × {exercise.reps}</span>
                            </div>
                            <div className="bg-surface-container-high px-3 py-1.5 rounded-lg">
                              <span className="text-on-surface-variant font-label-caps block text-[10px] uppercase">Rest</span>
                              <span className="font-bold text-on-surface">{exercise.restTime}</span>
                            </div>
                            {exercise.intensityOrRPE && (
                              <div className="bg-primary-fixed/20 px-3 py-1.5 rounded-lg">
                                <span className="text-primary font-label-caps block text-[10px] uppercase">Target RPE</span>
                                <span className="font-bold text-primary">{exercise.intensityOrRPE}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Instruction & Biomechanics Cue Box */}
                        <div className="mt-4 pt-4 border-t border-outline-variant/60 space-y-2">
                          <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40">
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">
                                sports
                              </span>
                              <div className="text-xs space-y-1">
                                <span className="font-label-caps text-[11px] font-bold text-on-surface block uppercase">
                                  Form Execution & Biomechanics Cues:
                                </span>
                                <p className="text-on-surface leading-relaxed">{exercise.formInstructions}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-on-surface-variant pt-1 px-1">
                            {exercise.tempo && (
                              <span>
                                <strong>Tempo Cadence:</strong> {exercise.tempo}
                              </span>
                            )}
                            {exercise.alternativeExercise && (
                              <span>
                                <strong>Gym Alternative:</strong> {exercise.alternativeExercise}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cool-Down & Recovery */}
              {currentDay.cooldown && currentDay.cooldown.routine && currentDay.cooldown.routine.length > 0 && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-500">ac_unit</span>
                    <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
                      Parasympathetic Cool-Down & Static Mobility ({currentDay.cooldown.duration})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentDay.cooldown.routine.map((stretch, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex justify-between items-start"
                      >
                        <div>
                          <span className="font-semibold text-xs text-on-surface block mb-1">{stretch.stretch}</span>
                          <p className="text-[11px] text-on-surface-variant leading-snug">{stretch.cues}</p>
                        </div>
                        <span className="font-label-caps text-[11px] text-blue-600 font-bold shrink-0 ml-3">
                          {stretch.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach Takeaway */}
              {currentDay.coachNotes && (
                <div className="bg-primary-fixed/15 border border-primary/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">psychology</span>
                  <div className="text-xs space-y-1">
                    <span className="font-label-caps text-primary font-bold uppercase">Coach's Daily Protocol Note:</span>
                    <p className="text-on-surface leading-relaxed">{currentDay.coachNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SAVED WORKOUTS LIBRARY                                             */}
      {/* ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface">
                  Supabase Workout Library
                </h3>
                <p className="text-on-surface-variant font-body-md text-xs mt-1">
                  All routines stored and synchronized in your Supabase account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className="bg-primary-container text-on-primary px-4 py-2.5 rounded-xl font-label-caps text-xs uppercase font-bold hover:bg-primary transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                New AI Plan
              </button>
            </div>

            {workoutPlans.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-outline-variant rounded-xl p-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-40 mb-2">
                  fitness_center
                </span>
                <h4 className="font-headline-sm text-base text-on-surface font-bold">
                  No Saved Workout Plans Yet
                </h4>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1 mb-4">
                  Configure your fitness goals and generate a custom AI routine to save it to your Supabase library.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="bg-primary-container text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-xs uppercase font-bold hover:bg-primary transition-colors cursor-pointer"
                >
                  Open Workout Generator
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutPlans.map((plan) => {
                  const isActive = plan.is_active;
                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'border-primary bg-primary-fixed/10 shadow-sm ring-1 ring-primary'
                          : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-headline-sm text-base font-bold text-on-surface">
                                {plan.name}
                              </h4>
                              {isActive && (
                                <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded font-label-caps uppercase">
                                  Active Protocol
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-primary font-medium block mt-0.5">
                              {plan.duration_minutes || 60} mins • {(plan.exercises || []).length} Exercises
                            </span>
                          </div>
                        </div>

                        <div className="my-3 py-2 border-y border-outline-variant/40">
                          <span className="text-xs text-on-surface-variant line-clamp-2">
                            {plan.goal && plan.goal.startsWith('{')
                              ? (JSON.parse(plan.goal).overview || 'AI-Generated Workout Plan')
                              : plan.goal || 'Hypertrophy & Strength'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedPlan(plan)}
                          className="bg-surface-container-high hover:bg-primary-fixed/20 text-on-surface hover:text-primary px-3.5 py-2 rounded-xl text-xs font-label-caps uppercase font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Inspect & Load
                        </button>

                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={async () => {
                                await setActiveWorkoutPlan(plan.id);
                                showToast(`"${plan.name}" set as active workout routine!`);
                              }}
                              className="border border-primary text-primary hover:bg-primary-fixed/20 px-3 py-2 rounded-xl text-xs font-label-caps uppercase transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Delete workout plan "${plan.name}" from database?`)) {
                                await deleteWorkoutPlan(plan.id);
                                showToast('Plan deleted from Supabase.');
                              }
                            }}
                            className="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors cursor-pointer"
                            title="Delete plan"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMIZE / REGENERATE SPECIFIC DAY                                 */}
      {/* ========================================================================= */}
      {showModifyDayModal && currentDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <span className="font-label-caps text-xs text-primary uppercase">Day Customizer</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  Modify {currentDay.dayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModifyDayModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-on-surface-variant">
                Describe the exact adjustments or exercise swaps you want for this session (e.g. equipment substitutions, volume adjustments, or focusing on a specific muscle angle).
              </p>

              <textarea
                rows={4}
                value={dayFeedbackText}
                onChange={(e) => setDayFeedbackText(e.target.value)}
                placeholder="e.g. Swap barbell bench press for dumbbell incline press, replace leg extensions with sissy squats, keep duration under 45 mins."
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
              />

              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-on-surface-variant py-0.5">Quick ideas:</span>
                {[
                  'Dumbbell-only variation',
                  'Focus on high-rep pump finishers',
                  'Knee-friendly quad exercises',
                  'Include drop sets on last set',
                ].map((cue) => (
                  <button
                    key={cue}
                    type="button"
                    onClick={() => setDayFeedbackText((prev) => (prev ? `${prev}, ${cue}` : cue))}
                    className="text-[10px] bg-surface-container-high hover:bg-primary-fixed/20 text-on-surface-variant hover:text-primary px-2 py-0.5 rounded border border-outline-variant/50 transition-colors cursor-pointer"
                  >
                    + {cue}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setShowModifyDayModal(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant font-label-caps text-xs uppercase hover:bg-surface-container-high text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRegeneratingDay}
                onClick={handleRegenerateSpecificDay}
                className="bg-primary-container text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-xs uppercase font-bold hover:bg-primary transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRegeneratingDay ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>Updating Session...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Regenerate Session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
