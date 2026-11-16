
import React, {
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';

import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;

      if (!mounted) return;

      setAuthState({
        user: session?.user ?? null,
        loading: false,
        isAuthenticated: Boolean(session?.user)
      });
    });

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted && !authEventReceived) {
          setAuthState({
            user: data.session?.user ?? null,
            loading: false,
            isAuthenticated: Boolean(data.session?.user)
          });
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);

        if (mounted && !authEventReceived) {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password.
  const signIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;
  };

  // Register with email and password.
  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ needsEmailConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim()
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;

    return {
      needsEmailConfirmation: !data.session
    };
  };

  // Logout user.
  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
