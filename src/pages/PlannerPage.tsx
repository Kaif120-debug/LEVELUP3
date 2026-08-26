import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';

export const PlannerPage: React.FC = () => {
  const { state, togglePriority, addPriority, toggleHabit, addTimeBlock, deleteTimeBlock, openAIModal } = useApp();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const [tbHour, setTbHour] = useState(9);
  const [tbTitle, setTbTitle] = useState('');
  const [tbCategory, setTbCategory] = useState<'Deep Work' | 'Meeting' | 'Workout' | 'Study' | 'Personal'>('Deep Work');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addPriority(taskTitle, taskPriority);
    setTaskTitle('');
    setShowNewTaskModal(false);
  };

  const handleAddTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tbTitle.trim()) return;
    addTimeBlock({
      hour: Number(tbHour),
      title: tbTitle,
      category: tbCategory,
    });
    setTbTitle('');
    setShowTimeBlockModal(false);
  };

  const hours = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5];

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="planner" />
      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen bg-surface-container-lowest overflow-x-hidden w-full">
        {/* Header */}
        <header className="min-h-[5rem] py-3 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-margin-desktop sticky top-0 bg-surface/90 backdrop-blur-md z-30 gap-3">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-lg text-on-surface">Daily Planner</h2>
            <span className="text-on-surface-variant font-body-md mt-1">{todayDateString}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openAIModal('Optimize my daily time blocks and tasks based on high energy focus')}
              className="border border-primary text-primary px-4 py-2 rounded font-label-caps uppercase text-xs hover:bg-primary-fixed/20 transition-colors"
            >
              AI Day Optimizer
            </button>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-primary-container text-on-primary px-5 py-2.5 rounded font-label-caps uppercase tracking-widest text-xs hover:bg-primary transition-colors cursor-pointer"
            >
              New Task
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-margin-desktop flex flex-col lg:flex-row gap-gutter h-full overflow-y-auto">
          {/* Left: Time Block Schedule (flex-[2]) */}
          <section className="flex-[2] bg-surface border border-outline-variant/60 rounded-xl overflow-hidden flex flex-col relative shadow-sm">
            <div className="h-12 border-b border-outline-variant/60 bg-surface flex items-center justify-between px-6 sticky top-0 z-10 uppercase text-xs font-bold text-on-surface tracking-wider">
              <span>Time Block Schedule</span>
              <button
                onClick={() => setShowTimeBlockModal(true)}
                className="text-primary hover:underline text-xs flex items-center gap-1 font-label-caps"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Block
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-0">
              {hours.map((h) => {
                const blocksAtHour = state.planner.timeBlocks.filter((b) => b.hour === h);
                return (
                  <div key={h} className="h-20 border-b border-surface-variant flex relative group">
                    <div className="w-16 text-on-surface-variant pt-2 text-sm font-medium">
                      {h} {h >= 6 && h <= 11 ? 'AM' : 'PM'}
                    </div>

                    <div className="flex-1 relative flex items-center">
                      {blocksAtHour.map((b) => (
                        <div
                          key={b.id}
                          className={`absolute top-2 w-[95%] h-[60px] border rounded-lg p-3 shadow-sm z-10 flex justify-between items-center transition-all ${
                            b.category === 'Deep Work'
                              ? 'bg-primary-fixed border-primary/30 text-on-primary-fixed'
                              : b.category === 'Meeting'
                              ? 'bg-surface-container-high border-outline-variant text-on-surface'
                              : b.category === 'Workout'
                              ? 'bg-primary-fixed-dim/30 border-primary/40 text-primary'
                              : 'bg-surface-container-low border-surface-variant text-on-surface'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                              {b.category}
                            </span>
                            <h4 className="font-medium text-sm leading-tight">{b.title}</h4>
                          </div>
                          <button
                            onClick={() => deleteTimeBlock(b.id)}
                            className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Remove Block"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right: Priorities & Habits (flex-1) */}
          <section className="flex-1 space-y-gutter overflow-y-auto">
            {/* Priorities Card */}
            <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-on-surface">Priorities</h3>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="text-primary hover:underline text-xs font-label-caps uppercase"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-4">
                {state.planner.priorities.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 cursor-pointer group p-1.5 rounded hover:bg-surface-container-low transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => togglePriority(task.id)}
                      className="mt-1 rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className={`text-sm ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="block text-[11px] text-on-surface-variant mt-0.5">
                          {task.dueDate} {task.priority && `• ${task.priority} Priority`}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Habits Card */}
            <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Habits</h3>
                  <p className="text-xs text-on-surface-variant">Tap icon to toggle today's check-in</p>
                </div>
                <span className="text-xs bg-primary-fixed/30 text-primary font-bold px-2 py-0.5 rounded-full">
                  Daily
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {state.planner.habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        habit.completedToday
                          ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-105'
                          : 'bg-surface-container-high text-on-surface group-hover:bg-surface-container-highest'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
                    </div>
                    <span className="text-[11px] font-bold text-center text-on-surface leading-tight">
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-primary font-semibold">
                      {habit.streak}d streak
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* New Priority Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">New Priority Task</h3>
                <button onClick={() => setShowNewTaskModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="E.g. Review Figma token design specs"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1">Priority Level</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Time Block Modal */}
        {showTimeBlockModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Schedule Time Block</h3>
                <button onClick={() => setShowTimeBlockModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddTimeBlock} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Block Title</label>
                  <input
                    type="text"
                    value={tbTitle}
                    onChange={(e) => setTbTitle(e.target.value)}
                    placeholder="E.g. Deep Work: System Architecture"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Start Hour</label>
                    <select
                      value={tbHour}
                      onChange={(e) => setTbHour(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}:00 {h >= 6 && h <= 11 ? 'AM' : 'PM'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Category</label>
                    <select
                      value={tbCategory}
                      onChange={(e) => setTbCategory(e.target.value as any)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                    >
                      <option value="Deep Work">Deep Work</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Workout">Workout</option>
                      <option value="Study">Study</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowTimeBlockModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Schedule Block
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
