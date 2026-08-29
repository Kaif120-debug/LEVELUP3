import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import { ProBadge } from '../ProBadge';

export interface CalculatedMacroResult {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  bmr: number;
  tdee: number;
  surplusDeficit: {
    type: 'Surplus' | 'Deficit' | 'Maintenance';
    amount: number;
    percentage: number;
    rationale: string;
  };
  macroRatioPercentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  rationale: string;
  mealTimingAdvice: Array<{
    timing: string;
    recommendation: string;
    rationale: string;
  }>;
  foodSources: {
    protein: string[];
    carbs: string[];
    fat: string[];
  };
  adjustmentGuidelines: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

interface MacroCoachProps {
  onOpenDietGeneratorWithMacros?: (macros: { calories: number; protein: number; dietType: string }) => void;
  showNotification: (msg: string) => void;
}

export const MacroCoach: React.FC<MacroCoachProps> = ({
  onOpenDietGeneratorWithMacros,
  showNotification,
}) => {
  const { state, fitnessProfile, nutritionProfile, updateNutritionProfile, updateFitnessProfile } = useApp();
  const { isPro, openUpgradeModal } = useSubscription();

  // Form Inputs
  const [age, setAge] = useState<number>(() => state.profile?.age || 26);
  const [gender, setGender] = useState<string>('Male');
  const [height, setHeight] = useState<number>(() => fitnessProfile?.height || 178);
  const [weight, setWeight] = useState<number>(() => fitnessProfile?.current_weight || state.fitness.weight || 78);
  const [targetWeight, setTargetWeight] = useState<string>(() => (fitnessProfile?.target_weight ? String(fitnessProfile.target_weight) : '82'));
  const [fitnessGoal, setFitnessGoal] = useState<string>(() => {
    const rawGoal = fitnessProfile?.goal || state.fitness.fitnessGoal || '';
    if (rawGoal.toLowerCase().includes('loss') || rawGoal.toLowerCase().includes('cut')) return 'Fat Loss';
    if (rawGoal.toLowerCase().includes('maint')) return 'Maintenance';
    return 'Muscle Gain';
  });
  const [activityLevel, setActivityLevel] = useState<string>('Moderately Active (3-5 days/wk)');
  const [trainingFrequency, setTrainingFrequency] = useState<string>('4-5 days/week');
  const [dietaryPreference, setDietaryPreference] = useState<string>(() => nutritionProfile?.diet_type || 'High Protein / Lean Bulking');

  // Calculation & Loading State
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSavingToProfile, setIsSavingToProfile] = useState(false);
  const [calculatedData, setCalculatedData] = useState<CalculatedMacroResult | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync initial fitnessProfile changes
  useEffect(() => {
    if (fitnessProfile?.height && height === 178) setHeight(fitnessProfile.height);
    if (fitnessProfile?.current_weight && weight === 78) setWeight(fitnessProfile.current_weight);
    if (fitnessProfile?.target_weight) setTargetWeight(String(fitnessProfile.target_weight));
  }, [fitnessProfile]);

  // Initial calculation on mount if not yet calculated
  useEffect(() => {
    if (!calculatedData && !isCalculating) {
      handleCalculateMacros();
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  const handleCalculateMacros = async () => {
    setIsCalculating(true);
    try {
      const payload = {
        age: Number(age) || 25,
        gender,
        height: Number(height) || 175,
        weight: Number(weight) || 75,
        targetWeight: targetWeight ? Number(targetWeight) : undefined,
        goal: fitnessGoal,
        activityLevel,
        trainingFrequency,
        dietaryPreference,
      };

      const res = await fetch('/api/ai/macro-coach/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.dailyCalories && data.proteinGrams) {
        setCalculatedData(data);
        showNotification('Macro Blueprint calculated with physiological accuracy!');
        
        // Seed welcome greeting in chat if empty
        if (messages.length === 0) {
          setMessages([
            {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: `👋 **Welcome to your AI Macro Coach!**\n\nI have calculated your daily protocol: **${data.dailyCalories} kcal** with **${data.proteinGrams}g Protein**, **${data.carbsGrams}g Carbs**, and **${data.fatGrams}g Fat** tailored for **${fitnessGoal}**.\n\nAsk me anything below about hitting your protein, meal ideas for remaining calories, or nutrient timing!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestedFollowUps: [
                'How much protein should I eat today?',
                'What should I eat to hit my protein goal?',
                'I have 500 calories left, what can I eat?',
                'How should I adjust my macros if my weight changes?',
              ],
            },
          ]);
        }
      } else {
        showNotification('Calculation completed with fallback parameters.');
      }
    } catch (err: any) {
      console.error('[Macro Coach Calculation Error]:', err);
      showNotification('Error calculating macro targets.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!calculatedData) return;
    setIsSavingToProfile(true);
    try {
      // 1. Update Nutrition Profile
      await updateNutritionProfile({
        diet_type: dietaryPreference,
        protein_target: calculatedData.proteinGrams,
        meals_per_day: 4,
      });

      // 2. Update Fitness Profile
      await updateFitnessProfile({
        height: Number(height),
        current_weight: Number(weight),
        target_weight: targetWeight ? Number(targetWeight) : undefined,
        goal: fitnessGoal,
        protein_target: calculatedData.proteinGrams,
        diet_type: dietaryPreference,
      });

      showNotification('Calculated targets saved to your Nutrition & Fitness Profile in Supabase!');
    } catch (err: any) {
      console.error('[Save to Profile Error]:', err);
      showNotification('Error saving targets to profile.');
    } finally {
      setIsSavingToProfile(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const profileContext = {
        age,
        gender,
        height,
        weight,
        targetWeight: targetWeight ? Number(targetWeight) : undefined,
        goal: fitnessGoal,
        activityLevel,
        trainingFrequency,
        dietaryPreference,
        dailyCalories: calculatedData?.dailyCalories || 2450,
        proteinGrams: calculatedData?.proteinGrams || 165,
        carbsGrams: calculatedData?.carbsGrams || 270,
        fatGrams: calculatedData?.fatGrams || 65,
        surplusDeficit: calculatedData?.surplusDeficit || { type: 'Surplus', amount: 250 },
        bmr: calculatedData?.bmr || 1720,
        tdee: calculatedData?.tdee || 2200,
      };

      const res = await fetch('/api/ai/macro-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          profileContext,
          chatHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data && data.answer) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: data.suggestedFollowUps || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const fallbackMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Based on your calculated target of **${calculatedData?.dailyCalories || 2400} kcal** and **${calculatedData?.proteinGrams || 160}g protein**, distribute your meals every 3-4 hours with 30-40g protein per feeding for optimal hypertrophy and metabolic control.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (err: any) {
      console.error('[Macro Coach Chat Error]:', err);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I encountered a momentary connection issue. For your weight of **${weight}kg**, make sure to target **${calculatedData?.proteinGrams || 160}g protein** daily across 3–4 balanced meals!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const quickQuestions = [
    'How much protein should I eat today?',
    'What should I eat to hit my protein goal?',
    'I have 500 calories left, what can I eat?',
    'How should I adjust my macros if my weight changes?',
    'What are optimal pre & post workout meals?',
    'Should I take creatine & whey protein?',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Coach Overview */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-2xl">calculate</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display-sm text-lg font-bold text-on-surface">AI Macro Coach</h3>
              <ProBadge featureName="AI Macro Coach" size="xs" />
            </div>
            <p className="text-xs text-on-surface-variant">
              Precision energy calculations based on Mifflin-St Jeor metabolic science & personalized sports nutrition.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleCalculateMacros}
            disabled={isCalculating}
            className="flex-1 md:flex-none px-4 py-2.5 bg-primary text-on-primary rounded-lg font-label-caps text-xs uppercase flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">
              {isCalculating ? 'progress_activity' : 'refresh'}
            </span>
            <span>{isCalculating ? 'CALCULATING...' : 'RECALCULATE TARGETS'}</span>
          </button>

          {calculatedData && (
            <button
              onClick={handleSaveToProfile}
              disabled={isSavingToProfile}
              className="flex-1 md:flex-none px-4 py-2.5 bg-surface-container-high border border-outline-variant text-on-surface rounded-lg font-label-caps text-xs uppercase flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                {isSavingToProfile ? 'progress_activity' : 'save'}
              </span>
              <span>SAVE TO PROFILE</span>
            </button>
          )}

          {onOpenDietGeneratorWithMacros && calculatedData && (
            <button
              onClick={() => {
                if (!isPro) {
                  openUpgradeModal('AI Diet Generator');
                  return;
                }
                onOpenDietGeneratorWithMacros({
                  calories: calculatedData.dailyCalories,
                  protein: calculatedData.proteinGrams,
                  dietType: dietaryPreference,
                });
              }}
              className="flex-1 md:flex-none px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary rounded-lg font-label-caps text-xs uppercase flex items-center justify-center gap-2 hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>GENERATE MEAL PLAN</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Inputs & Calculations on Left, Interactive Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Calculated Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Athlete Profile & Variables Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">tune</span>
                <h4 className="font-label-caps text-xs text-on-surface uppercase tracking-wider font-bold">
                  User Inputs & Metabolic Parameters
                </h4>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">Real-time update</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Neutral</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="240"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="35"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="35"
                  max="250"
                  placeholder="Optional"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Fitness Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface font-semibold text-primary focus:border-primary outline-none"
                >
                  <option value="Muscle Gain">Muscle Gain (Surplus)</option>
                  <option value="Fat Loss">Fat Loss (Deficit)</option>
                  <option value="Maintenance">Maintenance (Energy Balance)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                >
                  <option value="Sedentary (Desk job, minimal exercise)">Sedentary</option>
                  <option value="Lightly Active (1-3 days/wk)">Lightly Active (1-3 days/wk)</option>
                  <option value="Moderately Active (3-5 days/wk)">Moderately Active (3-5 days/wk)</option>
                  <option value="Very Active (6-7 days/wk intense)">Very Active (6-7 days/wk)</option>
                  <option value="Extremely Active (Twice daily/heavy labor)">Extremely Active</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Training Frequency
                </label>
                <select
                  value={trainingFrequency}
                  onChange={(e) => setTrainingFrequency(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                >
                  <option value="1-2 days/week">1-2 days/week</option>
                  <option value="3-4 days/week">3-4 days/week</option>
                  <option value="4-5 days/week">4-5 days/week</option>
                  <option value="5-6 days/week">5-6 days/week</option>
                  <option value="Daily / High Volume">Daily / High Volume</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant uppercase mb-1">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                >
                  <option value="High Protein / Lean Bulking">High Protein / Clean</option>
                  <option value="Balanced Whole Foods">Balanced Whole Foods</option>
                  <option value="Vegetarian / Lacto-Ovo">Vegetarian</option>
                  <option value="Vegan / Plant-Based">Vegan</option>
                  <option value="Keto / Low Carb">Keto / Low Carb</option>
                  <option value="Mediterranean Diet">Mediterranean</option>
                  <option value="Intermittent Fasting (16:8)">Intermittent Fasting</option>
                </select>
              </div>
            </div>
          </div>

          {/* CALCULATED MACROS DISPLAY */}
          {calculatedData && (
            <div className="space-y-6">
              
              {/* 4 Main Macro Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Calories Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                      Daily Energy
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">{calculatedData.dailyCalories}</span>
                      <span className="text-xs text-on-surface-variant">kcal</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono">TDEE: {calculatedData.tdee}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        calculatedData.surplusDeficit.type === 'Surplus'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : calculatedData.surplusDeficit.type === 'Deficit'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {calculatedData.surplusDeficit.type === 'Surplus'
                        ? `+${calculatedData.surplusDeficit.amount}`
                        : calculatedData.surplusDeficit.type === 'Deficit'
                        ? `-${calculatedData.surplusDeficit.amount}`
                        : 'Balance'}
                    </span>
                  </div>
                </div>

                {/* Protein Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-primary uppercase tracking-wider block mb-1 font-bold">
                      Protein Target
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-on-surface">{calculatedData.proteinGrams}</span>
                      <span className="text-xs text-on-surface-variant">g</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono">
                      {(calculatedData.proteinGrams / weight).toFixed(1)}g/kg
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {calculatedData.macroRatioPercentages.protein}% kcal
                    </span>
                  </div>
                </div>

                {/* Carbs Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                      Carbohydrates
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-on-surface">{calculatedData.carbsGrams}</span>
                      <span className="text-xs text-on-surface-variant">g</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono">Energy fuel</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {calculatedData.macroRatioPercentages.carbs}% kcal
                    </span>
                  </div>
                </div>

                {/* Fats Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                      Healthy Fats
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-on-surface">{calculatedData.fatGrams}</span>
                      <span className="text-xs text-on-surface-variant">g</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono">Hormone balance</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {calculatedData.macroRatioPercentages.fat}% kcal
                    </span>
                  </div>
                </div>
              </div>

              {/* Macro Energy Distribution Bar */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                    Caloric Energy Distribution
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                      <span>Protein ({calculatedData.macroRatioPercentages.protein}%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span>Carbs ({calculatedData.macroRatioPercentages.carbs}%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Fats ({calculatedData.macroRatioPercentages.fat}%)</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${calculatedData.macroRatioPercentages.protein}%` }}
                    className="bg-primary h-full transition-all"
                  />
                  <div
                    style={{ width: `${calculatedData.macroRatioPercentages.carbs}%` }}
                    className="bg-amber-500 h-full transition-all"
                  />
                  <div
                    style={{ width: `${calculatedData.macroRatioPercentages.fat}%` }}
                    className="bg-emerald-500 h-full transition-all"
                  />
                </div>
              </div>

              {/* Scientific Rationale & Metabolic Breakdown */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">biotech</span>
                    <h4 className="font-label-caps text-xs text-on-surface uppercase font-bold tracking-wider">
                      Metabolic Rationale & Formula
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
                    <span>BMR: <strong>{calculatedData.bmr} kcal</strong></span>
                    <span>•</span>
                    <span>TDEE: <strong>{calculatedData.tdee} kcal</strong></span>
                  </div>
                </div>

                <p className="text-xs text-on-surface leading-relaxed">
                  {calculatedData.rationale}
                </p>

                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">info</span>
                  <div>
                    <strong className="text-on-surface block font-semibold mb-0.5">
                      {calculatedData.surplusDeficit.type} Protocol ({calculatedData.surplusDeficit.percentage}% Delta):
                    </strong>
                    <span>{calculatedData.surplusDeficit.rationale}</span>
                  </div>
                </div>
              </div>

              {/* Strategic Nutrient Timing */}
              {calculatedData.mealTimingAdvice && calculatedData.mealTimingAdvice.length > 0 && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                    <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                    <h4 className="font-label-caps text-xs text-on-surface uppercase font-bold tracking-wider">
                      Strategic Nutrient & Protein Timing
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {calculatedData.mealTimingAdvice.map((item, idx) => (
                      <div key={idx} className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/40">
                        <span className="font-label-caps text-[10px] text-primary uppercase font-bold block mb-1">
                          {item.timing}
                        </span>
                        <p className="text-xs font-semibold text-on-surface mb-1">{item.recommendation}</p>
                        <p className="text-[11px] text-on-surface-variant">{item.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Whole Food Sources */}
              {calculatedData.foodSources && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                    <span className="material-symbols-outlined text-primary text-sm">nutrition</span>
                    <h4 className="font-label-caps text-xs text-on-surface uppercase font-bold tracking-wider">
                      Recommended Whole Food Sources ({dietaryPreference})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/40">
                      <span className="font-label-caps text-[10px] text-primary uppercase font-bold block mb-1.5">
                        High-Yield Protein
                      </span>
                      <ul className="space-y-1 text-on-surface">
                        {calculatedData.foodSources.protein.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/40">
                      <span className="font-label-caps text-[10px] text-amber-600 uppercase font-bold block mb-1.5">
                        Complex Carbohydrates
                      </span>
                      <ul className="space-y-1 text-on-surface">
                        {calculatedData.foodSources.carbs.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/40">
                      <span className="font-label-caps text-[10px] text-emerald-600 uppercase font-bold block mb-1.5">
                        Essential Fats
                      </span>
                      <ul className="space-y-1 text-on-surface">
                        {calculatedData.foodSources.fat.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive AI Macro Coaching Chat (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[760px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div>
                <h4 className="font-display-sm text-sm font-bold text-on-surface">
                  Macro Coach Assistant
                </h4>
                <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span>Grounded in your {calculatedData?.proteinGrams || 160}g protein target</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([]);
                handleCalculateMacros();
              }}
              title="Reset conversation"
              className="text-on-surface-variant hover:text-on-surface p-1.5 rounded hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
          </div>

          {/* Quick Questions Chip Bar */}
          <div className="p-3 bg-surface-container-low/60 border-b border-outline-variant/60 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isChatLoading}
                className="px-2.5 py-1 text-[11px] font-medium bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface-bright/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-tr-xs shadow-xs'
                      : 'bg-surface-container-lowest border border-outline-variant/70 text-on-surface rounded-tl-xs shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-body-sm space-y-2">
                    {msg.content}
                  </div>

                  {/* Suggested Followups */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/50 space-y-1.5">
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">
                        Suggested Follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((f, fi) => (
                          <button
                            key={fi}
                            onClick={() => handleSendMessage(f)}
                            disabled={isChatLoading}
                            className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-primary hover:bg-primary/20 transition-colors text-left cursor-pointer"
                          >
                            + {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm animate-spin">
                    progress_activity
                  </span>
                  <span>Macro Coach is analyzing your protocol...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your coach (e.g. 'I have 400 kcal left, what to eat?')..."
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isChatLoading}
              className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              <span className="hidden sm:inline">SEND</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
