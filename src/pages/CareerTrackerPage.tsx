import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { CareerNav } from '../components/career/CareerNav';
import { useApp } from '../context/AppContext';
import { JobApplication } from '../types';

export const CareerTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, addJob, updateJobStage, deleteJob } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [stage, setStage] = useState<JobApplication['stage']>('Applied');
  const [notes, setNotes] = useState('');

  const columns: JobApplication['stage'][] = ['Saved', 'Applied', 'Shortlisted', 'Interview', 'Offer'];

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    addJob({
      company,
      role,
      location,
      salary: salary || undefined,
      stage,
      notes: notes || undefined,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });

    setCompany('');
    setRole('');
    setSalary('');
    setNotes('');
    setShowAddModal(false);
  };

  const totalApps = state.career.jobs.length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      <SideNavBar active="career" />
      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen bg-surface-container-lowest w-full lg:w-[calc(100%-280px)]">
        {/* Top Sub-Navigation Bar */}
        <CareerNav activeTab="tracker" />

        {/* Header */}
        <header className="px-4 sm:px-margin-desktop py-4 sm:py-stack-md border-b border-outline-variant bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-on-surface">Job Tracker</h2>
            <p className="text-on-surface-variant font-body-md text-sm">Manage your career pipeline.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-surface-container-low px-4 sm:px-6 py-2 sm:py-3 rounded border border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Total Apps</p>
              <p className="text-stat-number text-primary leading-tight font-bold">{totalApps}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-container text-on-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Job
            </button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-margin-desktop flex gap-4 sm:gap-gutter pb-12">
          {columns.map((col) => {
            const jobsInCol = state.career.jobs.filter((j) => j.stage === col);
            return (
              <div key={col} className="w-[320px] flex-shrink-0 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2 font-headline-sm text-sm font-bold uppercase tracking-wider text-on-surface">
                  <span>{col}</span>
                  <span className="bg-surface-container px-2.5 py-0.5 rounded-full text-xs font-bold text-on-surface-variant">
                    {jobsInCol.length}
                  </span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-10 min-h-[400px]">
                  {jobsInCol.map((job) => (
                    <div
                      key={job.id}
                      className="bg-surface border border-outline-variant/60 rounded-xl p-6 hover:border-primary transition-all shadow-sm group"
                    >
                      <div className="flex justify-between items-center mb-3 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-lg">domain</span>
                        <span className="uppercase font-label-caps">{job.date}</span>
                      </div>
                      <h4 className="font-headline-sm text-sm font-bold text-on-surface mb-0.5">{job.company}</h4>
                      <p className="text-on-surface-variant text-xs mb-3">{job.role}</p>

                      {job.salary && (
                        <p className="text-xs font-bold text-primary mb-3">{job.salary}</p>
                      )}

                      {job.notes && (
                        <p className="text-xs text-on-surface-variant italic mb-3 bg-surface-container-low p-2 rounded">
                          "{job.notes}"
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30 text-xs">
                        <span className="bg-surface-container-low text-on-surface text-[11px] px-2 py-1 rounded">
                          {job.location}
                        </span>
                        <div className="flex items-center gap-1">
                          <select
                            value={job.stage}
                            onChange={(e) => updateJobStage(job.id, e.target.value as JobApplication['stage'])}
                            className="text-[11px] bg-surface-container-high rounded px-1.5 py-0.5 border border-outline-variant outline-none"
                          >
                            {columns.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="text-on-surface-variant hover:text-error p-1 rounded"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {jobsInCol.length === 0 && (
                    <div className="border border-dashed border-outline-variant/60 rounded-xl p-8 text-center text-xs text-on-surface-variant">
                      No applications in {col}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Job Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Add Job Application</h3>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddJob} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="E.g. Apple, Stripe, Linear"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="E.g. Senior Product Designer"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Remote / SF"
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$180k - $210k"
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1">Initial Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as JobApplication['stage'])}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Referral contact, portfolio notes, interview round..."
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Add to Pipeline
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
