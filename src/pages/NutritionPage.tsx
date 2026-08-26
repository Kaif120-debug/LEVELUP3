import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { DbDietPlan, DbDietMeal, DbDietFoodItem, DbGroceryItem } from '../types';
import { useSubscription } from '../hooks/useSubscription';
import { ProBadge } from '../components/ProBadge';

export const NutritionPage: React.FC = () => {
  const {
    state,
    fitnessProfile,
    nutritionProfile,
    updateNutritionProfile,
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
    groceryItems,
    createGroceryItem,
    updateGroceryItem,
    toggleGroceryItem,
    deleteGroceryItem,
    clearPurchasedGrocery,
    generateGroceryFromDietPlan,
    openAIModal,
  } = useApp();

  const { isPro, openUpgradeModal } = useSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'profile' | 'grocery'>('plans');

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DbDietPlan | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [targetPlanIdForMeal, setTargetPlanIdForMeal] = useState<string>('');
  const [editingMeal, setEditingMeal] = useState<DbDietMeal | null>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [targetMealIdForFood, setTargetMealIdForFood] = useState<string>('');
  const [editingFood, setEditingFood] = useState<DbDietFoodItem | null>(null);
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [editingGrocery, setEditingGrocery] = useState<DbGroceryItem | null>(null);

  // AI Diet Generator state
  const [showAIDietModal, setShowAIDietModal] = useState(false);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [generatedDiet, setGeneratedDiet] = useState<any | null>(null);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [aiDietType, setAiDietType] = useState(nutritionProfile?.diet_type || 'High Protein / Lean Bulking');
  const [aiCalorieTarget, setAiCalorieTarget] = useState(2500);
  const [aiProteinTarget, setAiProteinTarget] = useState(nutritionProfile?.protein_target || 160);
  const [aiMealsPerDay, setAiMealsPerDay] = useState(nutritionProfile?.meals_per_day || 4);
  const [aiBudget, setAiBudget] = useState('Moderate / Standard');
  const [aiCookingSituation, setAiCookingSituation] = useState('Quick Prep (<15 mins)');
  const [aiFoodPreferences, setAiFoodPreferences] = useState('Clean Whole Foods, High Protein');
  const [aiFoodsToAvoid, setAiFoodsToAvoid] = useState('None');
  const [aiAllergies, setAiAllergies] = useState(nutritionProfile?.allergies || 'None');

  // Profile form state
  const [dietType, setDietType] = useState(nutritionProfile?.diet_type || 'High Protein / Lean Bulking');
  const [allergies, setAllergies] = useState(nutritionProfile?.allergies || 'None');
  const [mealsPerDay, setMealsPerDay] = useState(nutritionProfile?.meals_per_day || 4);
  const [proteinTarget, setProteinTarget] = useState(nutritionProfile?.protein_target || 160);

  // Plan form state
  const [planName, setPlanName] = useState('');
  const [planGoal, setPlanGoal] = useState('Lean Hypertrophy');
  const [planMealsPerDay, setPlanMealsPerDay] = useState(4);
  const [planProteinTarget, setPlanProteinTarget] = useState(160);
  const [planIsActive, setPlanIsActive] = useState(true);

  // Meal form state
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [mealTime, setMealTime] = useState('8:00 AM');
  const [mealCalories, setMealCalories] = useState(600);
  const [mealProtein, setMealProtein] = useState(45);
  const [mealCarbs, setMealCarbs] = useState(65);
  const [mealFats, setMealFats] = useState(18);

  // Food form state
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState(100);
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodCalories, setFoodCalories] = useState(250);
  const [foodProtein, setFoodProtein] = useState(30);
  const [foodCarbs, setFoodCarbs] = useState(20);
  const [foodFats, setFoodFats] = useState(5);

  // Grocery form state
  const [groceryName, setGroceryName] = useState('');
  const [groceryQuantity, setGroceryQuantity] = useState(1);
  const [groceryUnit, setGroceryUnit] = useState('pack');
  const [groceryCategory, setGroceryCategory] = useState('Produce');

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateNutritionProfile({
        diet_type: dietType,
        allergies,
        meals_per_day: Number(mealsPerDay),
        protein_target: Number(proteinTarget),
      });
      setShowProfileModal(false);
      showNotification('Nutrition Profile updated in Supabase!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPlan) {
        await updateDietPlan(editingPlan.id, {
          name: planName,
          goal: planGoal,
          meals_per_day: Number(planMealsPerDay),
          protein_target: Number(planProteinTarget),
          is_active: planIsActive,
        });
        showNotification('Diet plan updated!');
      } else {
        await createDietPlan({
          name: planName,
          goal: planGoal,
          meals_per_day: Number(planMealsPerDay),
          protein_target: Number(planProteinTarget),
          is_active: planIsActive,
        });
        showNotification('New diet plan created in Supabase!');
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingMeal) {
        await updateDietMeal(editingMeal.id, {
          meal_name: mealName,
          meal_type: mealType,
          meal_time: mealTime,
          calories: Number(mealCalories),
          protein: Number(mealProtein),
          carbs: Number(mealCarbs),
          fats: Number(mealFats),
        });
        showNotification('Meal updated!');
      } else {
        await createDietMeal(targetPlanIdForMeal, {
          meal_name: mealName,
          meal_type: mealType,
          meal_time: mealTime,
          calories: Number(mealCalories),
          protein: Number(mealProtein),
          carbs: Number(mealCarbs),
          fats: Number(mealFats),
        });
        showNotification('Meal added to plan in Supabase!');
      }
      setShowMealModal(false);
      setEditingMeal(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingFood) {
        await updateDietFoodItem(editingFood.id, {
          food_name: foodName,
          quantity: Number(foodQuantity),
          unit: foodUnit,
          calories: Number(foodCalories),
          protein: Number(foodProtein),
          carbs: Number(foodCarbs),
          fats: Number(foodFats),
        });
        showNotification('Food item updated!');
      } else {
        await createDietFoodItem(targetMealIdForFood, {
          food_name: foodName,
          quantity: Number(foodQuantity),
          unit: foodUnit,
          calories: Number(foodCalories),
          protein: Number(foodProtein),
          carbs: Number(foodCarbs),
          fats: Number(foodFats),
        });
        showNotification('Food item added to meal in Supabase!');
      }
      setShowFoodModal(false);
      setEditingFood(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGrocery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingGrocery) {
        await updateGroceryItem(editingGrocery.id, {
          item_name: groceryName,
          quantity: Number(groceryQuantity),
          unit: groceryUnit,
          category: groceryCategory,
        });
        showNotification('Grocery item updated!');
      } else {
        await createGroceryItem({
          item_name: groceryName,
          quantity: Number(groceryQuantity),
          unit: groceryUnit,
          category: groceryCategory,
          purchased: false,
        });
        showNotification('Item added to grocery list in Supabase!');
      }
      setShowGroceryModal(false);
      setEditingGrocery(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAIDiet = async () => {
    setIsGeneratingDiet(true);
    try {
      const nextRegenCount = generatedDiet ? regenerationCount + 1 : 0;
      setRegenerationCount(nextRegenCount);

      const payload = {
        dietType: aiDietType,
        mealsPerDay: Number(aiMealsPerDay) || 4,
        calorieTarget: Number(aiCalorieTarget) || 2500,
        proteinTarget: Number(aiProteinTarget) || 160,
        budget: aiBudget,
        cookingSituation: aiCookingSituation,
        foodPreferences: aiFoodPreferences,
        foodsToAvoid: aiFoodsToAvoid,
        allergies: aiAllergies,
        fitnessGoal: fitnessProfile?.goal || state.fitness.fitnessGoal || 'Lean Hypertrophy',
        currentWeight: fitnessProfile?.current_weight || state.fitness.weight || 78,
        targetWeight: fitnessProfile?.target_weight || state.fitness.targetWeight || 82,
        experienceLevel: fitnessProfile?.experience_level || 'Advanced',
        previousPlan: generatedDiet || null,
        regenerationCount: nextRegenCount,
      };

      const res = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.meals) {
        setGeneratedDiet(data);
        showNotification('AI Diet Plan generated! Review details below.');
      } else {
        showNotification('Failed to generate diet plan. Please try again.');
      }
    } catch (err: any) {
      console.error('Error calling AI diet generator:', err);
      showNotification('AI Diet Generation error.');
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const handleSaveAIDietToSupabase = async () => {
    if (!generatedDiet) return;
    setIsSaving(true);
    try {
      const mealsWithFood = (generatedDiet.meals || []).map((m: any) => ({
        meal: {
          meal_name: m.meal_name || 'Personalized Meal',
          meal_type: m.meal_type || 'Main Meal',
          meal_time: m.meal_time || '12:00 PM',
          calories: Number(m.calories) || 0,
          protein: Number(m.protein) || 0,
          carbs: Number(m.carbs) || 0,
          fats: Number(m.fats) || 0,
        },
        food_items: (m.food_items || []).map((f: any) => ({
          food_name: f.food_name || 'Ingredient',
          quantity: Number(f.quantity) || 100,
          unit: f.unit || 'g',
          calories: Number(f.calories) || 0,
          protein: Number(f.protein) || 0,
          carbs: Number(f.carbs) || 0,
          fats: Number(f.fats) || 0,
        })),
      }));

      const groceries = (generatedDiet.groceryList || []).map((g: any) => ({
        item_name: g.item_name || 'Grocery Item',
        quantity: Number(g.quantity) || 1,
        unit: g.unit || 'units',
        category: g.category || 'Produce',
      }));

      await createDietPlan(
        {
          name: generatedDiet.planName || `${aiDietType} Protocol`,
          goal: generatedDiet.goal || fitnessProfile?.goal || 'Lean Hypertrophy',
          meals_per_day: Number(generatedDiet.mealsPerDay) || mealsWithFood.length || 4,
          protein_target: Number(generatedDiet.dailyProtein) || Number(aiProteinTarget) || 160,
          is_active: true,
        },
        mealsWithFood,
        groceries
      );

      // Update nutrition profile targets in Supabase
      await updateNutritionProfile({
        diet_type: aiDietType,
        allergies: aiAllergies,
        meals_per_day: Number(aiMealsPerDay),
        protein_target: Number(generatedDiet.dailyProtein) || Number(aiProteinTarget),
      });

      setShowAIDietModal(false);
      setGeneratedDiet(null);
      setActiveTab('plans');
      showNotification('AI Diet Plan & Grocery List successfully saved to Supabase!');
    } catch (err: any) {
      console.error('Error saving AI diet plan to Supabase:', err);
      showNotification('Error saving diet plan to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const purchasedGroceryCount = groceryItems.filter((g) => g.purchased).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="fitness" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-section-gap px-4 sm:px-6 lg:px-margin-desktop bg-surface-bright overflow-y-auto min-h-screen w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          {/* Toast */}
          {successToast && (
            <div className="fixed bottom-8 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-2xl font-label-caps text-xs flex items-center gap-2 animate-fade-up">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-caps text-xs text-primary uppercase">Nutrition & Fueling OS</span>
              </div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Diet & Grocery Management</h2>
              <p className="text-on-surface-variant font-body-md">
                Manage macro targets, custom meal protocols, and auto-generated grocery lists.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (!isPro) {
                    openUpgradeModal('AI Diet Generator');
                    return;
                  }
                  setShowAIDietModal(true);
                }}
                className="px-4 py-3 font-label-caps bg-primary/10 border border-primary text-primary rounded hover:bg-primary/20 transition-all uppercase cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>AI DIET GENERATOR</span>
                <ProBadge featureName="AI Diet Generator" size="xs" />
              </button>
              <button
                onClick={() => openAIModal('Generate a tailored high-protein meal plan and shopping list for lean muscle gain')}
                className="px-4 py-3 font-label-caps border border-outline-variant text-on-surface rounded hover:bg-surface-container-high transition-colors uppercase cursor-pointer"
              >
                AI MEAL COACH
              </button>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanName('');
                  setPlanGoal('Lean Hypertrophy');
                  setPlanMealsPerDay(4);
                  setPlanProteinTarget(160);
                  setPlanIsActive(true);
                  setShowPlanModal(true);
                }}
                className="px-6 py-3 font-label-caps bg-primary-container text-on-primary rounded hover:bg-primary transition-colors uppercase cursor-pointer"
              >
                + NEW DIET PLAN
              </button>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex border-b border-outline-variant bg-surface-container-low px-6 pt-2 rounded-t-xl">
            <button
              onClick={() => setActiveTab('plans')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'plans'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">restaurant_menu</span>
              <span>Diet Plans & Meals</span>
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'grocery'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shopping_cart</span>
              <span>Grocery List ({groceryItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-xs font-label-caps uppercase transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Nutrition Profile</span>
            </button>
          </div>

          {/* TAB 1: DIET PLANS & MEALS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Macro Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm">
                  <span className="font-label-caps text-xs text-on-surface-variant block mb-1">Active Diet Plan</span>
                  <p className="font-headline-sm text-primary font-bold truncate">
                    {activeDietPlan?.name || 'No Active Plan'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {activeDietPlan?.goal || 'Maintain clean diet'}
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm">
                  <span className="font-label-caps text-xs text-on-surface-variant block mb-1">Daily Target Protein</span>
                  <p className="text-stat-number text-primary">
                    {activeDietPlan?.protein_target || nutritionProfile?.protein_target || 160}g
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2">Optimal 2.0g/kg lean body mass</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm">
                  <span className="font-label-caps text-xs text-on-surface-variant block mb-1">Meals Scheduled</span>
                  <p className="text-stat-number">
                    {activeDietPlan?.meals?.length || activeDietPlan?.meals_per_day || 4}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2">Evenly spaced protein feedings</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant block mb-1">Grocery Integration</span>
                    <p className="text-sm font-semibold text-on-surface">Auto-generate items from plan</p>
                  </div>
                  <button
                    onClick={() => {
                      if (activeDietPlan) {
                        generateGroceryFromDietPlan(activeDietPlan.id);
                        showNotification('Added active meal ingredients to grocery list!');
                        setActiveTab('grocery');
                      }
                    }}
                    className="mt-3 py-2 px-3 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors text-xs font-label-caps rounded-lg uppercase text-center"
                  >
                    Sync to Grocery List
                  </button>
                </div>
              </div>

              {/* Diet Plans List */}
              <div className="space-y-6">
                {dietPlans.length === 0 ? (
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">restaurant</span>
                    <h3 className="font-headline-sm text-on-surface">No Diet Plans Yet</h3>
                    <p className="text-sm text-on-surface-variant mt-1 mb-4">
                      Create your first meal protocol or generate one with AI.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          if (!isPro) {
                            openUpgradeModal('AI Diet Generator');
                            return;
                          }
                          setShowAIDietModal(true);
                        }}
                        className="px-5 py-2.5 bg-primary/10 border border-primary text-primary rounded font-label-caps text-xs uppercase flex items-center gap-2 hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        <span>Generate with AI</span>
                        <ProBadge featureName="AI Diet Generator" size="xs" />
                      </button>
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="px-6 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors cursor-pointer"
                      >
                        + Create Manual Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  dietPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-surface-container-lowest border rounded-2xl p-6 sm:p-8 shadow-sm transition-all ${
                        plan.is_active ? 'border-primary ring-1 ring-primary/20' : 'border-surface-variant'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-variant">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-headline-sm text-on-surface">{plan.name}</h3>
                            {plan.is_active ? (
                              <span className="bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                Active Protocol
                              </span>
                            ) : (
                              <button
                                onClick={() => setActiveDietPlan(plan.id)}
                                className="text-xs text-primary font-bold hover:underline"
                              >
                                Set as Active
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Goal: {plan.goal || 'Hypertrophy'} • {plan.meals_per_day || 4} meals/day • Target:{' '}
                            {plan.protein_target || 160}g protein
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetPlanIdForMeal(plan.id);
                              setEditingMeal(null);
                              setMealName('');
                              setMealType('Breakfast');
                              setMealTime('8:00 AM');
                              setMealCalories(500);
                              setMealProtein(40);
                              setMealCarbs(60);
                              setMealFats(15);
                              setShowMealModal(true);
                            }}
                            className="px-3 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            <span>Add Meal</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingPlan(plan);
                              setPlanName(plan.name);
                              setPlanGoal(plan.goal || '');
                              setPlanMealsPerDay(plan.meals_per_day || 4);
                              setPlanProteinTarget(plan.protein_target || 160);
                              setPlanIsActive(plan.is_active || false);
                              setShowPlanModal(true);
                            }}
                            className="p-2 border border-outline-variant hover:bg-surface-container-high rounded text-on-surface-variant"
                            title="Edit Plan"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete diet plan "${plan.name}" and all associated meals?`)) {
                                deleteDietPlan(plan.id);
                                showNotification('Diet plan deleted.');
                              }
                            }}
                            className="p-2 border border-error/30 hover:bg-error-container/20 text-error rounded"
                            title="Delete Plan"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Meals in Plan */}
                      <div className="mt-6 space-y-4">
                        {(!plan.meals || plan.meals.length === 0) ? (
                          <div className="p-6 bg-surface-container-low rounded-xl text-center text-xs text-on-surface-variant">
                            No meals added yet. Click "+ Add Meal" to construct this diet plan.
                          </div>
                        ) : (
                          plan.meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="bg-surface-container-low border border-surface-variant/80 rounded-xl p-5"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-outline-variant/30">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-label-caps text-xs bg-surface-container-high px-2.5 py-0.5 rounded text-on-surface">
                                      {meal.meal_type || 'Meal'}
                                    </span>
                                    <h4 className="font-bold text-sm text-on-surface">{meal.meal_name}</h4>
                                    {meal.meal_time && (
                                      <span className="text-xs text-on-surface-variant">({meal.meal_time})</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                                    <span className="font-bold text-on-surface">{meal.calories || 0} kcal</span>
                                    <span>•</span>
                                    <span className="text-primary font-bold">{meal.protein || 0}g P</span>
                                    <span>•</span>
                                    <span>{meal.carbs || 0}g C</span>
                                    <span>•</span>
                                    <span>{meal.fats || 0}g F</span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setTargetMealIdForFood(meal.id);
                                      setEditingFood(null);
                                      setFoodName('');
                                      setFoodQuantity(100);
                                      setFoodUnit('g');
                                      setFoodCalories(200);
                                      setFoodProtein(25);
                                      setFoodCarbs(10);
                                      setFoodFats(5);
                                      setShowFoodModal(true);
                                    }}
                                    className="px-2 py-1 bg-surface-container-highest text-on-surface text-[11px] font-label-caps rounded uppercase hover:bg-primary-container hover:text-on-primary transition-colors"
                                  >
                                    + Food
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMeal(meal);
                                      setMealName(meal.meal_name);
                                      setMealType(meal.meal_type || 'Breakfast');
                                      setMealTime(meal.meal_time || '8:00 AM');
                                      setMealCalories(meal.calories || 0);
                                      setMealProtein(meal.protein || 0);
                                      setMealCarbs(meal.carbs || 0);
                                      setMealFats(meal.fats || 0);
                                      setShowMealModal(true);
                                    }}
                                    className="text-on-surface-variant hover:text-on-surface text-xs"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete meal "${meal.meal_name}"?`)) {
                                        deleteDietMeal(meal.id);
                                        showNotification('Meal removed.');
                                      }
                                    }}
                                    className="text-error/70 hover:text-error text-xs"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                  </button>
                                </div>
                              </div>

                              {/* Food items inside this meal */}
                              {meal.food_items && meal.food_items.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {meal.food_items.map((food) => (
                                    <div
                                      key={food.id}
                                      className="flex justify-between items-center bg-surface-container-lowest px-3.5 py-2 rounded-lg text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[14px] text-primary">lunch_dining</span>
                                        <span className="font-medium text-on-surface">{food.food_name}</span>
                                        <span className="text-on-surface-variant">
                                          ({food.quantity} {food.unit})
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-on-surface-variant">
                                          {food.calories} kcal • {food.protein}g P
                                        </span>
                                        <button
                                          onClick={() => {
                                            setEditingFood(food);
                                            setFoodName(food.food_name);
                                            setFoodQuantity(food.quantity || 100);
                                            setFoodUnit(food.unit || 'g');
                                            setFoodCalories(food.calories || 0);
                                            setFoodProtein(food.protein || 0);
                                            setFoodCarbs(food.carbs || 0);
                                            setFoodFats(food.fats || 0);
                                            setShowFoodModal(true);
                                          }}
                                          className="text-on-surface-variant hover:text-on-surface"
                                        >
                                          <span className="material-symbols-outlined text-[13px]">edit</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            deleteDietFoodItem(food.id);
                                            showNotification('Food item removed.');
                                          }}
                                          className="text-error/70 hover:text-error"
                                        >
                                          <span className="material-symbols-outlined text-[13px]">close</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GROCERY LIST */}
          {activeTab === 'grocery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Pantry & Shopping List</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {purchasedGroceryCount} of {groceryItems.length} items purchased
                  </p>
                </div>
                <div className="flex gap-2">
                  {purchasedGroceryCount > 0 && (
                    <button
                      onClick={() => {
                        clearPurchasedGrocery();
                        showNotification('Cleared checked items from list.');
                      }}
                      className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high rounded font-label-caps text-xs uppercase"
                    >
                      Clear Purchased
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingGrocery(null);
                      setGroceryName('');
                      setGroceryQuantity(1);
                      setGroceryUnit('pack');
                      setGroceryCategory('Meat & Poultry');
                      setShowGroceryModal(true);
                    }}
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {groceryItems.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">shopping_bag</span>
                  <h3 className="font-headline-sm text-on-surface">Grocery List Empty</h3>
                  <p className="text-sm text-on-surface-variant mt-1 mb-4">
                    Add custom items or import ingredients from your active diet plan.
                  </p>
                  {activeDietPlan && (
                    <button
                      onClick={() => {
                        generateGroceryFromDietPlan(activeDietPlan.id);
                        showNotification('Ingredients loaded from diet plan!');
                      }}
                      className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                    >
                      Generate from Active Plan
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm">
                  <ul className="divide-y divide-surface-variant">
                    {groceryItems.map((item) => (
                      <li
                        key={item.id}
                        className="py-3 flex items-center justify-between group hover:bg-surface-container-low/50 px-2 rounded transition-colors"
                      >
                        <div
                          onClick={() => toggleGroceryItem(item.id)}
                          className="flex items-center gap-3 cursor-pointer select-none flex-1"
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${
                              item.purchased ? 'text-primary fill-icon' : 'text-outline-variant group-hover:text-primary'
                            }`}
                          >
                            {item.purchased ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <div>
                            <span
                              className={`font-medium text-sm block ${
                                item.purchased ? 'line-through text-on-surface-variant' : 'text-on-surface'
                              }`}
                            >
                              {item.item_name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span>
                                {item.quantity} {item.unit}
                              </span>
                              {item.category && (
                                <span className="bg-surface-container-high px-2 py-0.2 rounded text-[10px]">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingGrocery(item);
                              setGroceryName(item.item_name);
                              setGroceryQuantity(item.quantity || 1);
                              setGroceryUnit(item.unit || 'pack');
                              setGroceryCategory(item.category || 'Produce');
                              setShowGroceryModal(true);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteGroceryItem(item.id);
                              showNotification('Item removed.');
                            }}
                            className="p-1.5 text-error/70 hover:text-error rounded hover:bg-error-container/20"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NUTRITION PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 max-w-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-surface-variant">
                <div>
                  <h3 className="font-headline-sm text-primary">Nutrition & Macro Profile</h3>
                  <p className="text-xs text-on-surface-variant">
                    Configures baseline macro calculations and AI diet recommendations in Supabase.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase text-on-surface">
                    Dietary Pattern / Philosophy
                  </label>
                  <input
                    type="text"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    placeholder="e.g. High Protein Clean Hypertrophy, Mediterranean, Keto"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase text-on-surface">
                    Allergies & Food Intolerances
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. None, Dairy, Peanuts, Gluten"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase text-on-surface">
                      Preferred Meals per Day
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase text-on-surface">
                      Daily Protein Target (grams)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="400"
                      value={proteinTarget}
                      onChange={(e) => setProteinTarget(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-variant flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving to Supabase...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MODAL: Plan Create/Edit */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}
              </h3>
              <form onSubmit={handleSavePlan} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Plan Name</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. High Protein Hypertrophy"
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Goal</label>
                  <input
                    type="text"
                    value={planGoal}
                    onChange={(e) => setPlanGoal(e.target.value)}
                    placeholder="e.g. Lean Muscle Gain & Strength"
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Meals / Day</label>
                    <input
                      type="number"
                      value={planMealsPerDay}
                      onChange={(e) => setPlanMealsPerDay(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Protein Target (g)</label>
                    <input
                      type="number"
                      value={planProteinTarget}
                      onChange={(e) => setPlanProteinTarget(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="planIsActive"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="planIsActive" className="text-xs font-medium text-on-surface">
                    Set as active primary diet plan
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
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Meal Create/Edit */}
        {showMealModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingMeal ? 'Edit Meal' : 'Add Meal to Plan'}
              </h3>
              <form onSubmit={handleSaveMeal} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Meal Name</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g. Post-Workout Steak & Sweet Potato"
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Pre-Workout">Pre-Workout</option>
                      <option value="Post-Workout">Post-Workout</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Scheduled Time</label>
                    <input
                      type="text"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      placeholder="e.g. 1:00 PM"
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Calories</label>
                    <input
                      type="number"
                      value={mealCalories}
                      onChange={(e) => setMealCalories(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Protein(g)</label>
                    <input
                      type="number"
                      value={mealProtein}
                      onChange={(e) => setMealProtein(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Carbs(g)</label>
                    <input
                      type="number"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Fats(g)</label>
                    <input
                      type="number"
                      value={mealFats}
                      onChange={(e) => setMealFats(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMealModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Meal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Food Item Create/Edit */}
        {showFoodModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingFood ? 'Edit Food Item' : 'Add Food Item to Meal'}
              </h3>
              <form onSubmit={handleSaveFood} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Food / Ingredient Name</label>
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Wild Atlantic Salmon"
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Quantity</label>
                    <input
                      type="number"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Unit</label>
                    <input
                      type="text"
                      value={foodUnit}
                      onChange={(e) => setFoodUnit(e.target.value)}
                      placeholder="e.g. g, oz, tbsp, scoops"
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Calories</label>
                    <input
                      type="number"
                      value={foodCalories}
                      onChange={(e) => setFoodCalories(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Protein</label>
                    <input
                      type="number"
                      value={foodProtein}
                      onChange={(e) => setFoodProtein(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Carbs</label>
                    <input
                      type="number"
                      value={foodCarbs}
                      onChange={(e) => setFoodCarbs(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] block mb-1 uppercase">Fats</label>
                    <input
                      type="number"
                      value={foodFats}
                      onChange={(e) => setFoodFats(Number(e.target.value))}
                      className="w-full border rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowFoodModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Food Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Grocery Item Create/Edit */}
        {showGroceryModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-up">
              <h3 className="font-headline-sm text-primary mb-4">
                {editingGrocery ? 'Edit Grocery Item' : 'Add Grocery Item'}
              </h3>
              <form onSubmit={handleSaveGrocery} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Item Name</label>
                  <input
                    type="text"
                    value={groceryName}
                    onChange={(e) => setGroceryName(e.target.value)}
                    placeholder="e.g. Grass-fed Ground Beef 90/10"
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      value={groceryQuantity}
                      onChange={(e) => setGroceryQuantity(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1 uppercase">Unit</label>
                    <input
                      type="text"
                      value={groceryUnit}
                      onChange={(e) => setGroceryUnit(e.target.value)}
                      placeholder="e.g. kg, cartons, bags"
                      className="w-full border border-outline-variant rounded-lg p-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Category</label>
                  <select
                    value={groceryCategory}
                    onChange={(e) => setGroceryCategory(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest"
                  >
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Produce">Produce & Greens</option>
                    <option value="Grains & Carbs">Grains & Carbs</option>
                    <option value="Supplements">Supplements & Whey</option>
                    <option value="General Food">General Food</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowGroceryModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL: AI Diet Generator (PRO FEATURE)      */}
        {/* ========================================== */}
        {showAIDietModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl animate-fade-up my-8 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-outline-variant/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-on-surface">AI Diet Generator</h3>
                      <ProBadge featureName="AI Diet Generator" size="xs" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Precision macro & micronutrient protocol designed by Gemini AI and synced with Supabase
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAIDietModal(false);
                    setGeneratedDiet(null);
                  }}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto py-4 flex-1 space-y-6 pr-1">
                {/* Synced Context Badge */}
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-variant/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[18px]">cloud_sync</span>
                    <span className="font-bold">Synced Supabase Profile Context:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-mono">
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">
                      Weight: {fitnessProfile?.current_weight || state.fitness.weight || 78}kg
                    </span>
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">
                      Target: {fitnessProfile?.target_weight || state.fitness.targetWeight || 82}kg
                    </span>
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded text-primary font-bold">
                      Goal: {fitnessProfile?.goal || state.fitness.fitnessGoal || 'Lean Hypertrophy'}
                    </span>
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">
                      Level: {fitnessProfile?.experience_level || 'Advanced'}
                    </span>
                  </div>
                </div>

                {!generatedDiet ? (
                  /* ==================================== */
                  /* STEP 1: CONFIGURATION & PARAMETERS   */
                  /* ==================================== */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Diet Type */}
                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Dietary Strategy / Philosophy
                        </label>
                        <select
                          value={aiDietType}
                          onChange={(e) => setAiDietType(e.target.value)}
                          className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest focus:border-primary outline-none"
                        >
                          <option value="High Protein / Lean Bulking">High Protein / Clean Bulking</option>
                          <option value="Lean Muscle Cut / Fat Loss">Lean Muscle Cut / High Protein Fat Loss</option>
                          <option value="Balanced Athletic Performance">Balanced Athletic Performance (40/30/30)</option>
                          <option value="Mediterranean Longevity & Fuel">Mediterranean Longevity & Fuel</option>
                          <option value="Low Carb / Targeted Ketogenic">Low Carb / Targeted Ketogenic Protocol</option>
                          <option value="Plant-Forward High Protein">Plant-Forward High Protein Protocol</option>
                        </select>
                      </div>

                      {/* Meals Per Day */}
                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Meals Per Day
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAiMealsPerDay(num)}
                              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                                aiMealsPerDay === num
                                  ? 'bg-primary-container text-on-primary border border-primary'
                                  : 'bg-surface-container-low border border-outline-variant/60 text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              {num} Meals
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Macro Targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Daily Calorie Target (kcal)
                        </label>
                        <input
                          type="number"
                          value={aiCalorieTarget}
                          onChange={(e) => setAiCalorieTarget(Number(e.target.value))}
                          step="50"
                          className="w-full border border-outline-variant rounded-lg p-3 text-sm font-bold bg-surface-container-lowest focus:border-primary outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Daily Protein Target (g)
                        </label>
                        <input
                          type="number"
                          value={aiProteinTarget}
                          onChange={(e) => setAiProteinTarget(Number(e.target.value))}
                          step="5"
                          className="w-full border border-outline-variant rounded-lg p-3 text-sm font-bold text-primary bg-surface-container-lowest focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    {/* Budget & Prep Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Budget Category
                        </label>
                        <select
                          value={aiBudget}
                          onChange={(e) => setAiBudget(e.target.value)}
                          className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest focus:border-primary outline-none"
                        >
                          <option value="Budget-Friendly / Student">Budget-Friendly (Cost Optimized)</option>
                          <option value="Moderate / Standard">Moderate / Standard Quality</option>
                          <option value="Premium / Organic & Grass-Fed">Premium (Organic, Wild-Caught, Grass-Fed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-label-caps text-xs block mb-1 text-on-surface uppercase">
                          Cooking & Prep Situation
                        </label>
                        <select
                          value={aiCookingSituation}
                          onChange={(e) => setAiCookingSituation(e.target.value)}
                          className="w-full border border-outline-variant rounded-lg p-3 text-sm bg-surface-container-lowest focus:border-primary outline-none"
                        >
                          <option value="Quick Prep (<15 mins)">Quick Prep (&lt;15 mins per meal)</option>
                          <option value="Batch Meal Prep (2x / week)">Batch Meal Prep (Weekend Batch Cooking)</option>
                          <option value="Full Kitchen Cooking">Full Gourmet Kitchen Cooking</option>
                          <option value="Minimal Cooking / Dorm">Minimal Cooking / Microwave & Air Fryer Only</option>
                        </select>
                      </div>
                    </div>

                    {/* Food Preferences, Avoid, Allergies */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-label-caps text-[11px] block mb-1 text-on-surface uppercase">
                          Food Preferences / Cuisines
                        </label>
                        <input
                          type="text"
                          value={aiFoodPreferences}
                          onChange={(e) => setAiFoodPreferences(e.target.value)}
                          placeholder="e.g. Whole foods, Asian, Italian"
                          className="w-full border border-outline-variant rounded-lg p-2.5 text-xs bg-surface-container-lowest"
                        />
                      </div>
                      <div>
                        <label className="font-label-caps text-[11px] block mb-1 text-on-surface uppercase">
                          Foods to Avoid
                        </label>
                        <input
                          type="text"
                          value={aiFoodsToAvoid}
                          onChange={(e) => setAiFoodsToAvoid(e.target.value)}
                          placeholder="e.g. Pork, dairy, spicy"
                          className="w-full border border-outline-variant rounded-lg p-2.5 text-xs bg-surface-container-lowest"
                        />
                      </div>
                      <div>
                        <label className="font-label-caps text-[11px] block mb-1 text-on-surface uppercase">
                          Allergies
                        </label>
                        <input
                          type="text"
                          value={aiAllergies}
                          onChange={(e) => setAiAllergies(e.target.value)}
                          placeholder="e.g. Peanuts, Gluten, Shellfish"
                          className="w-full border border-outline-variant rounded-lg p-2.5 text-xs bg-surface-container-lowest"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ==================================== */
                  /* STEP 2: GENERATED PLAN PREVIEW       */
                  /* ==================================== */
                  <div className="space-y-6">
                    {/* Plan Summary Banner */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-primary/10">
                        <div>
                          <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block">
                            AI Generated Diet Plan
                          </span>
                          <h4 className="font-headline-sm text-on-surface text-lg font-bold">
                            {generatedDiet.planName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="bg-surface-container-highest px-2.5 py-1 rounded text-on-surface font-bold">
                            {generatedDiet.dailyCalories} kcal
                          </span>
                          <span className="bg-primary/20 text-primary px-2.5 py-1 rounded font-bold">
                            {generatedDiet.dailyProtein}g Protein
                          </span>
                          <span className="bg-surface-container-highest px-2.5 py-1 rounded text-on-surface">
                            {generatedDiet.meals?.length || generatedDiet.mealsPerDay} Meals
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
                        {generatedDiet.summary}
                      </p>
                    </div>

                    {/* Meals List */}
                    <div className="space-y-3">
                      <h4 className="font-label-caps text-xs text-on-surface uppercase font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">restaurant</span>
                        <span>Daily Meal Breakdown & Food Items</span>
                      </h4>

                      <div className="space-y-3">
                        {generatedDiet.meals?.map((meal: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-surface-container-low border border-surface-variant/80 rounded-xl p-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-label-caps text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
                                  {meal.meal_type || `Meal ${idx + 1}`}
                                </span>
                                <span className="font-bold text-sm text-on-surface">{meal.meal_name}</span>
                                {meal.meal_time && (
                                  <span className="text-xs text-on-surface-variant font-mono">
                                    ({meal.meal_time})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-on-surface-variant flex items-center gap-2">
                                <span className="font-bold text-on-surface">{meal.calories} kcal</span>
                                <span>•</span>
                                <span className="text-primary font-bold">{meal.protein}g P</span>
                                <span>•</span>
                                <span>{meal.carbs}g C</span>
                                <span>•</span>
                                <span>{meal.fats}g F</span>
                              </div>
                            </div>

                            {/* Food items inside this meal */}
                            {meal.food_items && meal.food_items.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {meal.food_items.map((fi: any, fIdx: number) => (
                                  <div
                                    key={fIdx}
                                    className="bg-surface-container-lowest px-3 py-1.5 rounded-lg text-xs flex justify-between items-center"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="material-symbols-outlined text-[13px] text-primary">nutrition</span>
                                      <span className="font-medium text-on-surface truncate">{fi.food_name}</span>
                                      <span className="text-on-surface-variant text-[11px]">
                                        ({fi.quantity} {fi.unit})
                                      </span>
                                    </div>
                                    <span className="font-mono text-[11px] text-on-surface-variant shrink-0 ml-2">
                                      {fi.calories} kcal • {fi.protein}g P
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grocery List Preview */}
                    {generatedDiet.groceryList && generatedDiet.groceryList.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="font-label-caps text-xs text-on-surface uppercase font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">shopping_bag</span>
                          <span>Matching Weekly Grocery Shopping List ({generatedDiet.groceryList.length} items)</span>
                        </h4>
                        <div className="bg-surface-container-low rounded-xl p-4 border border-surface-variant/80">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {generatedDiet.groceryList.map((g: any, gIdx: number) => (
                              <div
                                key={gIdx}
                                className="bg-surface-container-lowest px-3 py-2 rounded-lg text-xs flex items-center justify-between"
                              >
                                <span className="font-medium text-on-surface truncate">{g.item_name}</span>
                                <span className="text-on-surface-variant font-mono text-[11px] shrink-0 ml-1">
                                  {g.quantity} {g.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-outline-variant/40 shrink-0">
                {!generatedDiet ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAIDietModal(false)}
                      className="w-full sm:w-auto px-5 py-2.5 border border-outline-variant rounded-lg font-label-caps text-xs uppercase hover:bg-surface-container-high transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingDiet}
                      onClick={handleGenerateAIDiet}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-caps text-xs uppercase hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingDiet ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                          <span>Synthesizing AI Protocol...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                          <span>Generate AI Diet Plan</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setGeneratedDiet(null)}
                      className="w-full sm:w-auto px-4 py-2.5 border border-outline-variant rounded-lg font-label-caps text-xs uppercase hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      <span>Adjust Parameters</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={isGeneratingDiet}
                        onClick={handleGenerateAIDiet}
                        className="px-4 py-2.5 border border-primary text-primary rounded-lg font-label-caps text-xs uppercase hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveAIDietToSupabase}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-container text-on-primary rounded-lg font-label-caps text-xs uppercase hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                            <span>Saving to Supabase...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                            <span>Save to Supabase & Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
