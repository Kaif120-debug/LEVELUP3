import React from 'react';
import { useApp } from '../context/AppContext';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, closeNotifications, state, markNotificationRead, clearNotifications } = useApp();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="bg-surface w-full max-w-md h-full border-l border-outline-variant shadow-2xl flex flex-col animate-fade-up">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h3 className="font-headline-sm text-primary">Notifications</h3>
            <p className="text-xs text-on-surface-variant">Stay updated on milestones, jobs, and workouts</p>
          </div>
          <div className="flex items-center gap-2">
            {state.notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs font-label-caps uppercase text-secondary hover:text-primary px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeNotifications}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {state.notifications.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-2 text-outline-variant">notifications_off</span>
              <p className="font-medium">No new notifications</p>
              <p className="text-xs text-secondary mt-1">You're all caught up for today!</p>
            </div>
          ) : (
            state.notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-surface-container-lowest border-outline-variant opacity-75'
                    : 'bg-primary-fixed/20 border-primary/40 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-on-surface-variant">{notif.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{notif.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
