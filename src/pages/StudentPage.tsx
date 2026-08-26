import React, { useState, useMemo } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';
import { StudyCoachDashboard } from '../components/student/StudyCoachDashboard';
import { isDueToday } from '../utils/dateUtils';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Flame,
  FileCode,
  GraduationCap,
  Plus,
  X,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
} from 'lucide-react';

export const StudentPage: React.FC = () => {
  const {
    state,
    studentCourses,
    addAssignment,
    updateAssignment,
    updateAssignmentStatus,
    deleteAssignment,
    openUpgradeModal,
  } = useApp();
  const [mainTab, setMainTab] = useState<'coach' | 'overview'>('coach');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [subject, setSubject] = useState('');
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Assignment['status']>('In Progress');

  // Edit Modal State
  const [editSubject, setEditSubject] = useState('');
  const [editTask, setEditTask] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<Assignment['status']>('In Progress');

  const handleOpenAddModal = () => {
    setSubject(studentCourses[0]?.name || '');
    setTask('');
    setDueDate(
      new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    setStatus('In Progress');
    setShowAddModal(true);
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !task.trim()) return;

    addAssignment({
      subject,
      task,
      dueDate: dueDate.trim() || 'Today',
      status,
    });

    setSubject('');
    setTask('');
    setDueDate('');
    setShowAddModal(false);
  };

  const handleStartEdit = (as: Assignment) => {
    setEditingAssignment(as);
    setEditSubject(as.subject);
    setEditTask(as.task);
    setEditDueDate(as.dueDate);
    setEditStatus(as.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editSubject.trim() || !editTask.trim()) return;

    updateAssignment(editingAssignment.id, {
      subject: editSubject.trim(),
      task: editTask.trim(),
      dueDate: editDueDate.trim(),
      status: editStatus,
    });
    setEditingAssignment(null);
  };

  const student = state.student;

  // Reactively compute tasks due on today's local calendar date
  const todaysTasks = useMemo(() => {
    return student.assignments.filter((as) => isDueToday(as.dueDate));
  }, [student.assignments]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="student" />
      <main className="lg:ml-[280px] ml-0 flex-1 py-6 sm:py-8 lg:py-stack-lg px-4 sm:px-6 lg:px-margin-desktop bg-background min-h-screen overflow-y-auto w-full overflow-x-hidden">
        <div className="max-w-container-max mx-auto space-y-6 sm:space-y-8 animate-fade-up">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant/40 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-fixed/20 text-primary">
                  Academic Intelligence
                </span>
              </div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Student Workspace</h2>
              <p className="font-body-lg text-on-surface-variant">
                Your AI-powered personal study coach, curriculum planner, and exam strategist.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-surface-container-high rounded-xl border border-outline-variant/50">
              <button
                onClick={() => setMainTab('coach')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  mainTab === 'coach'
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Study Coach</span>
              </button>
              <button
                onClick={() => setMainTab('overview')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  mainTab === 'overview'
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Courses & Tasks</span>
              </button>
            </div>
          </header>

          {/* TAB 1: AI STUDY COACH STUDIO */}
          {mainTab === 'coach' && (
            <StudyCoachDashboard onBackToOverview={() => setMainTab('overview')} />
          )}

          {/* TAB 2: ACADEMIC OVERVIEW & ASSIGNMENTS */}
          {mainTab === 'overview' && (
            <div className="space-y-8 animate-fade-up">
              {/* Quick AI Coach Launch Banner */}
              <div className="p-6 rounded-2xl bg-surface border border-primary/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary-fixed/20 text-primary">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h4 className="font-title-md text-on-surface font-semibold">
                      Need help studying for {studentCourses[0]?.name || 'your upcoming milestone'}?
                    </h4>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Generate customized study plans, ask questions, or take an AI diagnostic quiz in seconds.
                  </p>
                </div>

                <button
                  onClick={() => setMainTab('coach')}
                  className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-caps text-xs uppercase font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Study Coach</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                {/* Left Section (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-gutter">
                  {/* Next Milestone Card */}
                  <div className="bg-surface border border-outline-variant/60 p-8 rounded-xl relative overflow-hidden group shadow-sm">
                    <p className="font-label-caps text-secondary uppercase mb-4 tracking-widest text-xs">
                      Next Milestone
                    </p>
                    <div className="flex items-end gap-6 mb-2">
                      <span className="font-display-xl text-primary leading-none">
                        {student.milestoneDays}
                      </span>
                      <div className="pb-2">
                        <h3 className="font-headline-lg text-on-surface leading-tight">Days Remaining</h3>
                        <p className="text-on-surface-variant text-sm font-medium">{student.milestoneName}</p>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 mt-6 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-container h-full transition-all duration-700"
                        style={{ width: `${student.milestoneProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Active Assignments Table */}
                  <div className="bg-surface border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-lowest">
                      <div>
                        <h3 className="font-headline-sm text-on-surface">Active Assignments & Projects</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Track deadlines, project milestones, and assignment progress.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenAddModal}
                        className="text-primary font-label-caps border border-primary/50 px-4 py-2 rounded text-xs uppercase hover:bg-primary-fixed/20 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container-low border-b border-outline-variant/40">
                          <tr>
                            <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Subject</th>
                            <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Task</th>
                            <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Due Date</th>
                            <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant">Status</th>
                            <th className="p-4 uppercase font-label-caps text-xs text-on-surface-variant text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30 text-sm">
                          {student.assignments.length > 0 ? (
                            student.assignments.map((as) => (
                              <tr key={as.id} className="hover:bg-surface-container-lowest transition-colors">
                                <td className="p-4 font-bold text-primary">{as.subject}</td>
                                <td className="p-4 font-medium text-on-surface">{as.task}</td>
                                <td className="p-4 text-on-surface-variant text-xs">
                                  <span className={isDueToday(as.dueDate) ? 'font-bold text-primary' : ''}>
                                    {as.dueDate}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={as.status}
                                    onChange={(e) =>
                                      updateAssignmentStatus(as.id, e.target.value as Assignment['status'])
                                    }
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant/40 outline-none cursor-pointer ${
                                      as.status === 'Completed'
                                        ? 'bg-primary-fixed text-on-primary-fixed'
                                        : as.status === 'In Progress'
                                        ? 'bg-surface-container-high text-on-surface'
                                        : 'bg-secondary-container text-on-secondary-container'
                                    }`}
                                  >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending Review">Pending Review</option>
                                  </select>
                                </td>
                                <td className="p-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleStartEdit(as)}
                                      title="Edit assignment"
                                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteAssignment(as.id)}
                                      title="Delete assignment"
                                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">
                                No assignments yet. Click &quot;Add New&quot; to create your first assignment or project task.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Section (4 cols) */}
                <div className="lg:col-span-4 space-y-gutter">
                  {/* Today's Schedule */}
                  <div className="bg-surface border border-outline-variant/60 p-8 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-headline-sm text-on-surface">Today&apos;s Schedule</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {todaysTasks.length} {todaysTasks.length === 1 ? 'task' : 'tasks'} due today
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>

                    <div className="space-y-4 border-l-2 border-primary/40 pl-6 relative">
                      {todaysTasks.length > 0 ? (
                        todaysTasks.map((as) => (
                          <div key={as.id} className="pb-4 relative group">
                            <div
                              className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full transition-colors ${
                                as.status === 'Completed'
                                  ? 'bg-outline ring-4 ring-surface'
                                  : 'bg-primary ring-4 ring-surface'
                              }`}
                            ></div>
                            <p className="text-xs uppercase text-secondary font-label-caps font-bold">
                              {as.subject} · {as.status}
                            </p>
                            <p
                              className={`font-medium text-sm mt-0.5 leading-snug ${
                                as.status === 'Completed'
                                  ? 'text-on-surface-variant line-through'
                                  : 'text-on-surface'
                              }`}
                            >
                              {as.task}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-sm text-on-surface-variant">
                          No tasks scheduled for today.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Assignment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-on-surface">Add Assignment</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g. Computer Science, Physics"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Task / Assignment Name
                  </label>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="E.g. DSA APPROACH"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="E.g. 22 August 2026 or 2026-08-22"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Accepts dates like &quot;22 August 2026&quot;, &quot;2026-08-22&quot;, or &quot;Today&quot;.
                  </p>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Assignment['status'])}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-outline-variant/60 rounded-lg font-label-caps text-xs uppercase text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded-lg font-label-caps text-xs uppercase hover:bg-primary transition-colors font-semibold cursor-pointer shadow-sm"
                  >
                    Save Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {editingAssignment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-on-surface">Edit Assignment</h3>
                <button
                  onClick={() => setEditingAssignment(null)}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Task / Assignment Name
                  </label>
                  <input
                    type="text"
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Accepts dates like &quot;22 August 2026&quot;, &quot;2026-08-22&quot;, or &quot;Today&quot;.
                  </p>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1.5 font-semibold text-on-surface-variant">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Assignment['status'])}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => setEditingAssignment(null)}
                    className="px-4 py-2 border border-outline-variant/60 rounded-lg font-label-caps text-xs uppercase text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded-lg font-label-caps text-xs uppercase hover:bg-primary transition-colors font-semibold cursor-pointer shadow-sm"
                  >
                    Save Changes
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

