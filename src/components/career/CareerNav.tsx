import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export type CareerTabId = 'resume' | 'portfolio' | 'tracker' | 'interview';

export interface CareerNavItem {
  id: CareerTabId;
  label: string;
  icon: string;
  path: string;
}

export const CAREER_NAV_ITEMS: CareerNavItem[] = [
  {
    id: 'resume',
    label: 'Resume Builder',
    icon: 'description',
    path: '/career',
  },
  {
    id: 'portfolio',
    label: 'Portfolio Builder',
    icon: 'web',
    path: '/portfolio',
  },
  {
    id: 'tracker',
    label: 'Job Applications Tracker',
    icon: 'view_kanban',
    path: '/career-tracker',
  },
  {
    id: 'interview',
    label: 'Interview Prep',
    icon: 'psychology',
    path: '/interview-prep',
  },
];

interface CareerNavProps {
  activeTab: CareerTabId;
  rightContent?: React.ReactNode;
  className?: string;
}

export const CareerNav: React.FC<CareerNavProps> = ({
  activeTab,
  rightContent,
  className = '',
}) => {
  const navigate = useNavigate();
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll active navigation item into visible view horizontally
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeEl = activeTabRef.current;

      const containerWidth = container.clientWidth;
      const activeLeft = activeEl.offsetLeft;
      const activeWidth = activeEl.clientWidth;

      // Center the active element in the scroll container
      const targetScrollLeft = activeLeft - containerWidth / 2 + activeWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div
      className={`w-full bg-surface border-b border-outline-variant/60 sticky top-0 z-30 backdrop-blur-md bg-surface/95 select-none ${className}`}
    >
      <div className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 w-full">
        {/* Horizontally Scrollable Career Tab Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full md:w-auto flex-nowrap min-w-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="tablist"
          aria-label="Career Sections Navigation"
        >
          {CAREER_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                ref={isActive ? activeTabRef : null}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (!isActive) {
                    navigate(item.path);
                  }
                }}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs ring-1 ring-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface bg-transparent'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[17px] sm:text-[18px] leading-none shrink-0 ${
                    isActive ? 'fill-icon text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Right Action Slot */}
        {rightContent && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};
