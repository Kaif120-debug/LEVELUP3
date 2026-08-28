import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getAuthRedirectUrl } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ data: any; error: AuthError | Error | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: AuthError | Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active session on mount
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase auth session error:', error.message);
        }
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes (login, logout, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      if (!isSupabaseConfigured) {
        return {
          data: null,
          error: new Error('Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'),
        };
      }
      const emailRedirectTo = getAuthRedirectUrl('/onboarding');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
          emailRedirectTo,
        },
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) {
        return {
          data: null,
          error: new Error('Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'),
        };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!isSupabaseConfigured) {
        return {
          data: null,
          error: new Error('Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'),
        };
      }
      const redirectTo = getAuthRedirectUrl('/dashboard');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) return { data, error };
      if (data?.url) {
        // Open OAuth in new tab/popup to prevent iframe X-Frame-Options blocking
        window.open(data.url, '_blank', 'width=550,height=650');
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        return { error };
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!isSupabaseConfigured) {
        return {
          data: null,
          error: new Error('Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'),
        };
      }
      const redirectTo = getAuthRedirectUrl('/update-password');
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!isSupabaseConfigured) {
        return {
          data: null,
          error: new Error('Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'),
        };
      }
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
