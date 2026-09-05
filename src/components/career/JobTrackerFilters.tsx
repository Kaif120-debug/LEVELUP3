import React from 'react';
import {
  JobApplicationStatus,
  JobEmploymentType,
  JobWorkMode,
  JobPriority,
} from '../../types';

export interface FilterState {
  search: string;
  status: string; // 'ALL' or JobApplicationStatus
  workMode: string; // 'ALL' or JobWorkMode
  employmentType: string; // 'ALL' or JobEmploymentType
  priority: string; // 'ALL' or JobPriority
  sortBy: 'newest' | 'oldest' | 'company' | 'priority' | 'status';
}

interface JobTrackerFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  totalResults: number;
}

export const JobTrackerFilters: React.FC<JobTrackerFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.workMode !== 'ALL' ||
    filters.employmentType !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.sortBy !== 'newest';

  return (
    <div className="w-full bg-surface border border-outline-variant/60 rounded-xl p-3 sm:p-4 space-y-3">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by company, role, location, or notes..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle & Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-on-surface-variant whitespace-nowrap">
            Showing <strong className="text-on-surface font-bold">{totalResults}</strong> jobs
          </span>

          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('board')}
              title="Board / Kanban View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">view_kanban</span>
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="Table / List View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">table_rows</span>
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/40">
        {/* Status Filter */}
        <div className="flex items-center gap-1 text-xs">
          <label className="text-on-surface-variant text-[11px] font-medium uppercase font-label-caps mr-1 hidden sm:inline">
            Status:
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant rounded-md px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Work Mode Filter */}
        <div className="flex items-center gap-1 text-xs">
          <select
            value={filters.workMode}
            onChange={(e) => onFilterChange({ workMode: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant rounded-md px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Employment Type */}
        <div className="flex items-center gap-1 text-xs">
          <select
            value={filters.employmentType}
            onChange={(e) => onFilterChange({ employmentType: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant rounded-md px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 text-xs">
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant rounded-md px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1 text-xs sm:ml-auto">
          <label className="text-on-surface-variant text-[11px] font-medium uppercase font-label-caps mr-1 hidden md:inline">
            Sort:
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-surface-container-lowest border border-outline-variant rounded-md px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
          >
            <option value="newest">Applied: Newest First</option>
            <option value="oldest">Applied: Oldest First</option>
            <option value="company">Company: A to Z</option>
            <option value="priority">Priority: High to Low</option>
            <option value="status">Status Progression</option>
          </select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-[11px] text-error hover:underline flex items-center gap-1 px-2 py-1 rounded bg-error/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">restart_alt</span>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
