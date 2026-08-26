import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';

export const FitnessPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, workoutPlans, activeWorkoutPlan, createWorkoutLog } = useApp();
  const [selectedDay, setSelectedDay] = useState<string>('Tuesday');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);
  const [logSessionName, setLogSessionName] = useState(activeWorkoutPlan?.name || 'Upper Body Hypertrophy');

  const schedule = state.fitness.weeklySchedule;

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkoutLog({
      workout_name: logSessionName,
      workout_plan_id: activeWorkoutPlan?.id,
      duration_minutes: activeWorkoutPlan?.duration_minutes || 45,
      completed: true,
      notes: logNotes,
    });
    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setShowLogModal(false);
      setLogNotes('');
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="fitness" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-section-gap px-4 sm:px-6 lg:px-margin-desktop bg-background min-h-screen w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-stack-lg animate-fade-up">
          <header className="mb-section-gap flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-caps text-xs text-primary uppercase">Weekly Split & Schedule</span>
              </div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Workout Plan Schedule</h2>
              <p className="text-on-surface-variant font-body-md">
                Active protocol: <strong className="text-primary">{activeWorkoutPlan?.name || 'Hypertrophy Split'}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/fitness')}
                className="px-4 py-3 font-label-caps border border-outline-variant rounded hover:bg-surface-container-high transition-colors uppercase cursor-pointer"
              >
                Manage Plans
              </button>
              <button
                onClick={() => {
                  setLogSessionName(activeWorkoutPlan?.name || 'Workout Session');
                  setShowLogModal(true);
                }}
                className="bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps uppercase hover:bg-primary transition-colors cursor-pointer"
              >
                Log Workout
              </button>
            </div>
          </header>

          <div className="flex flex-col gap-stack-md max-w-4xl">
            {schedule.map((item) => {
              const isSelected = selectedDay === item.day;

              if (item.isRest) {
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDay(isSelected ? '' : item.day)}
                    className="bg-surface-container-low border border-surface-variant rounded-xl p-8 opacity-75 flex justify-between items-center cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    <div>
                      <span className="font-label-caps text-secondary block mb-1">{item.day}</span>
                      <h3 className="font-headline-sm text-secondary">{item.name}</h3>
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/30">
                          <ul className="space-y-2 text-sm text-on-surface-variant">
                            {item.exercises.map((ex, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{ex.name}</span>
                                <span className="font-label-caps">{ex.setsReps}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">bedtime</span>
                  </div>
                );
              }

              if (item.isToday) {
                return (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest border-2 border-primary-container rounded-xl p-8 relative shadow-sm"
                  >
                    <div className="absolute top-0 right-0 bg-primary-container text-on-primary px-3 py-1 rounded-bl-lg rounded-tr-xl font-label-caps text-xs">
                      Today
                    </div>
                    <div
                      onClick={() => setSelectedDay(isSelected ? '' : item.day)}
                      className="flex justify-between items-center mb-4 cursor-pointer"
                    >
                      <div>
                        <span className="font-label-caps text-primary-container block mb-1 uppercase tracking-wider">
                          {item.day}
                        </span>
                        <h3 className="font-headline-sm text-on-surface">{item.name}</h3>
                      </div>
                      <span className={`material-symbols-outlined text-primary-container transition-transform ${isSelected ? 'rotate-90' : ''}`}>
                        chevron_right
                      </span>
                    </div>

                    <div className="border-t border-surface-variant pt-4">
                      <ul className="space-y-3">
                        {item.exercises.map((ex, idx) => (
                          <li key={idx} className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-on-surface">{ex.name}</span>
                            <span className="font-label-caps text-on-surface-variant text-xs">{ex.setsReps}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDay(isSelected ? '' : item.day)}
                  className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8 flex flex-col justify-between group cursor-pointer hover:border-primary transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-label-caps text-on-surface-variant block mb-1 uppercase tracking-wider">
                        {item.day}
                      </span>
                      <h3 className="font-headline-sm group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-transform ${isSelected ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-surface-variant animate-fade-up">
                      <ul className="space-y-2 text-sm text-on-surface-variant">
                        {item.exercises.map((ex, idx) => (
                          <li key={idx} className="flex justify-between py-1">
                            <span className="font-medium text-on-surface">{ex.name}</span>
                            <span className="font-label-caps text-xs">{ex.setsReps}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Workout Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Log Completed Session</h3>
                <button onClick={() => setShowLogModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleLogWorkout} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Session Name</label>
                  <input
                    type="text"
                    value={logSessionName}
                    onChange={(e) => setLogSessionName(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="font-label-caps text-xs block mb-1 uppercase">Session Notes / PRs</label>
                  <textarea
                    rows={3}
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="E.g. Incline Bench 32kg for 10 reps, felt strong on last set."
                    className="w-full border border-outline-variant rounded-lg p-3 text-sm resize-none focus:border-primary outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    {logSuccess ? 'Saved to Supabase!' : 'Save Log'}
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
