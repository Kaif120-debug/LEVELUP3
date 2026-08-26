import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface SideNavBarProps {
  active: 'dashboard' | 'fitness' | 'career' | 'planner' | 'student' | 'creator' | 'business' | 'finance' | 'resources' | 'ai';
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, openAIModal, toggleNotifications, toggleSettings } = useApp();
  const { signOut, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    setIsMobileOpen(false);
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'home', path: '/dashboard' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness_center', path: '/fitness' },
    { id: 'career', label: 'Career', icon: 'work', path: '/career' },
    { id: 'planner', label: 'Planner', icon: 'calendar_today', path: '/planner' },
    { id: 'student', label: 'Student', icon: 'school', path: '/student' },
    { id: 'creator', label: 'Creator', icon: 'edit_note', path: '/creator-calendar' },
    { id: 'business', label: 'Business', icon: 'business_center', path: '/business' },
    { id: 'finance', label: 'Finance', icon: 'payments', path: '/finance' },
    { id: 'resources', label: 'Resources', icon: 'library_books', path: '/dashboard' },
    { id: 'ai', label: 'AI Assistant', icon: 'smart_toy', path: '#', onClick: () => { setIsMobileOpen(false); openAIModal(); } },
  ];

  const renderNavLinks = (isMobile = false) => (
    <div className="flex-1 overflow-y-auto flex flex-col gap-unit pr-1">
      {navItems.map((item) => {
        const isActive = active === item.id;
        if (item.onClick) {
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-left w-full cursor-pointer ${
                isActive
                  ? 'text-primary bg-primary-fixed/20 font-bold translate-x-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => {
              if (isMobile) setIsMobileOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'text-primary bg-primary-fixed/20 font-bold translate-x-1'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon' : ''}`}>
              {item.icon}
            </span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );

  const renderBottomActions = (isMobile = false) => (
    <div className="mt-auto flex flex-col gap-unit pt-stack-md border-t border-outline-variant">
      <button
        onClick={() => {
          if (isMobile) setIsMobileOpen(false);
          toggleNotifications();
        }}
        className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1">
            Notifications
          </span>
        </div>
        {unreadCount > 0 && (
          <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <Link
        to="/creator-brand"
        onClick={() => {
          if (isMobile) setIsMobileOpen(false);
        }}
        className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1 truncate">
          {user?.user_metadata?.full_name || state.profile.name || 'Profile'}
        </span>
      </Link>

      <button
        onClick={() => {
          if (isMobile) setIsMobileOpen(false);
          toggleSettings();
        }}
        className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all w-full text-left cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
        <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1">
          Settings
        </span>
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-2.5 text-error/80 hover:text-error hover:bg-error-container/20 rounded-lg transition-all w-full text-left cursor-pointer"
        title="Sign out of LEVELUP"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span className="font-label-caps text-label-caps uppercase tracking-widest pt-1">
          Log Out
        </span>
      </button>
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (Hidden on screens < lg (1024px))             */}
      {/* ========================================================================= */}
      <nav className="hidden lg:flex bg-surface fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant flex-col p-6 gap-stack-md z-50 select-none">
        <div className="mb-stack-lg">
          <Link to="/dashboard" className="font-headline-lg text-headline-lg text-primary block leading-tight">
            LEVELUP
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">Premium Growth</p>
        </div>

        {renderNavLinks(false)}
        {renderBottomActions(false)}
      </nav>

      {/* ========================================================================= */}
      {/* 2. COMPACT MOBILE HEADER (< lg (1024px))                                  */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant px-4 py-3 flex items-center justify-between w-full select-none shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="w-10 h-10 -ml-1 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <Link to="/dashboard" className="leading-tight">
            <span className="font-headline-sm text-primary font-bold tracking-tight block text-lg">LEVELUP</span>
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider -mt-0.5 block">Premium Growth</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleNotifications}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high relative cursor-pointer"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"></span>
            )}
          </button>

          <button
            onClick={() => openAIModal()}
            className="px-2.5 py-1.5 rounded-lg bg-primary-fixed/30 hover:bg-primary-fixed/50 text-primary flex items-center gap-1 text-xs font-bold font-label-caps uppercase transition-colors cursor-pointer"
            aria-label="AI Coach"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span className="hidden sm:inline">AI</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE DRAWER OVERLAY & PANEL                                          */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Drawer */}
          <div className="relative w-[280px] max-w-[85vw] bg-surface h-full z-50 flex flex-col p-5 gap-stack-md shadow-2xl border-r border-outline-variant overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="font-headline-lg text-headline-lg text-primary block leading-tight"
              >
                LEVELUP
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {renderNavLinks(true)}
            {renderBottomActions(true)}
          </div>
        </div>
      )}
    </>
  );
};
