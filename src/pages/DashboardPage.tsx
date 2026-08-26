import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, openAIModal, aiInsights, isGeneratingInsights, refreshInsights, updateProtein } = useApp();
  const [showDietModal, setShowDietModal] = useState(false);
  const [mealProtein, setMealProtein] = useState('35');

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const proteinNum = parseInt(mealProtein, 10);
    if (!isNaN(proteinNum)) {
      updateProtein(Math.min(state.fitness.proteinTarget, state.fitness.proteinCurrent + proteinNum));
    }
    setShowDietModal(false);
  };

  const applicationsCount = state.career.jobs.length;
  const interviewCount = state.career.jobs.filter((j) => j.stage === 'Interview').length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="dashboard" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-section-gap px-4 sm:px-6 lg:px-margin-desktop bg-background min-h-screen w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          {/* Header */}
          <header className="mb-stack-md flex justify-between items-end">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Good morning, {state.profile.name.split(' ')[0]}.</h2>
              <p className="font-body-lg text-on-surface-variant">Here's your day at a glance.</p>
            </div>
            <button
              onClick={() => openAIModal()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg font-label-caps uppercase text-xs text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              Ask AI Coach
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-gutter">
              {/* Today's Focus Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8">
                <div className="flex justify-between items-center mb-stack-md">
                  <h3 className="font-headline-sm">Today's Focus</h3>
                  <button
                    onClick={() => navigate('/planner')}
                    className="text-primary font-label-caps uppercase hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
                  <div
                    onClick={() => navigate('/fitness')}
                    className="border border-surface-variant rounded-lg p-6 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">
                      fitness_center
                    </span>
                    <h4 className="font-body-lg font-medium text-on-surface">
                      {state.fitness.todaysProtocol?.title && state.fitness.todaysProtocol.title !== 'No workout protocol active'
                        ? state.fitness.todaysProtocol.title
                        : 'Start Workout Protocol'}
                    </h4>
                    <p className="text-on-surface-variant text-sm">
                      {state.fitness.todaysProtocol?.duration && state.fitness.todaysProtocol.duration !== '0 min'
                        ? `${state.fitness.todaysProtocol.duration} • ${state.fitness.todaysProtocol.intensity || 'Active'}`
                        : 'Set your workout routine'}
                    </p>
                  </div>

                  <div
                    onClick={() => navigate('/planner')}
                    className="border border-surface-variant rounded-lg p-6 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">
                      task_alt
                    </span>
                    <h4 className="font-body-lg font-medium text-on-surface line-clamp-1">
                      {state.planner.priorities.find((p) => !p.completed)?.title || state.planner.priorities[0]?.title || 'Add Daily Priority'}
                    </h4>
                    <p className="text-on-surface-variant text-sm">
                      {state.planner.priorities.find((p) => !p.completed)?.dueDate
                        ? `Due: ${state.planner.priorities.find((p) => !p.completed)?.dueDate}`
                        : 'Stay focused and consistent'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Stats (Fitness, Career & Finance) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
                <div
                  onClick={() => navigate('/fitness')}
                  className="cursor-pointer bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col gap-stack-md hover:border-primary transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-base">Fitness</h3>
                    <span className="material-symbols-outlined text-primary text-[20px]">monitor_heart</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                      <span className="text-on-surface-variant">Calories</span>
                      <strong>{state.fitness.caloriesCurrent.toLocaleString()}/{state.fitness.caloriesTarget.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Protein</span>
                      <strong className="text-primary">{state.fitness.proteinCurrent}g/{state.fitness.proteinTarget}g</strong>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/career-tracker')}
                  className="cursor-pointer bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col gap-stack-md hover:border-primary transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-base">Career</h3>
                    <span className="material-symbols-outlined text-primary text-[20px]">business_center</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                      <span className="text-on-surface-variant">Applications</span>
                      <strong>{applicationsCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Interviews</span>
                      <strong className="text-primary">{interviewCount}</strong>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/finance')}
                  className="cursor-pointer bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col gap-stack-md hover:border-primary transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-base">Finance</h3>
                    <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                      <span className="text-on-surface-variant">Budget</span>
                      <strong>₹{(state.finance?.monthlyBudget ?? 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Savings</span>
                      <strong className="text-primary">
                        ₹{(state.finance?.savingsGoals?.[0]?.currentAmount ?? 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-gutter">
              {/* AI Insights Card */}
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px]">smart_toy</span>
                </div>
                <div className="relative z-10 flex flex-col gap-stack-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">auto_awesome</span>
                      <h3 className="font-headline-sm">AI Insights</h3>
                    </div>
                    <button
                      onClick={refreshInsights}
                      disabled={isGeneratingInsights}
                      className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Refresh AI Insights"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isGeneratingInsights ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                    </button>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {aiInsights.insight}
                  </p>
                  {aiInsights.tip && (
                    <div className="p-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs text-on-surface">
                      <strong className="text-primary block mb-0.5">Tip:</strong>
                      {aiInsights.tip}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(aiInsights.actionLink || '/career')}
                    className="bg-primary-container text-on-primary rounded px-6 py-3 font-label-caps uppercase self-start mt-2 hover:bg-primary transition-colors cursor-pointer"
                  >
                    {aiInsights.actionLabel || 'Start Draft'}
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/fitness')}
                  className="border border-outline-variant p-4 flex flex-col items-center gap-2 rounded hover:border-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary">fitness_center</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Workout</span>
                </button>

                <button
                  onClick={() => setShowDietModal(true)}
                  className="border border-outline-variant p-4 flex flex-col items-center gap-2 rounded hover:border-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Diet</span>
                </button>

                <button
                  onClick={() => navigate('/planner')}
                  className="border border-outline-variant p-4 flex flex-col items-center gap-2 rounded hover:border-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Plan Day</span>
                </button>

                <button
                  onClick={() => openAIModal('What are my highest leverage opportunities today?')}
                  className="bg-surface-container-high p-4 flex flex-col items-center gap-2 rounded hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary">forum</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Diet Log Modal */}
        {showDietModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full animate-fade-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary">Log Protein & Nutrition</h3>
                <button onClick={() => setShowDietModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleAddMeal} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Add Protein (grams)</label>
                  <input
                    type="number"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full border border-outline-variant rounded p-2 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDietModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                  >
                    Log Meal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
