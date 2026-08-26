import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-low">
        <div className="flex flex-col items-center gap-4">
          <div className="font-display-lg text-3xl text-primary animate-pulse tracking-tight font-bold">
            LEVELUP
          </div>
          <div className="flex items-center gap-2 text-xs font-label-caps uppercase text-on-surface-variant tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            Authenticating Session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated user to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
