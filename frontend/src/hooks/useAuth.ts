import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import type { Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  token: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 1. Get initial active session
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) {
          console.error('Error fetching Supabase session:', sessionError);
          setError(sessionError.message);
        } else if (data.session) {
          setSession(data.session);
          setToken(data.session.access_token);
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
          });
        }
      })
      .catch((err) => {
        console.error('Unexpected error retrieving session:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Listen for auth state changes (sign in, sign out, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession) {
          setToken(currentSession.access_token);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
          });
        } else {
          setToken(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
      if (!supabase) {
        const err = new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setError(err.message);
        return { error: err };
      }

      setError(null);
      setIsLoading(true);

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return { error: signInError };
        }

        return { error: null };
      } catch (err: any) {
        const fallbackError = new Error(err.message || 'An unexpected sign-in error occurred.');
        setError(fallbackError.message);
        return { error: fallbackError };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | Error | null; needsEmailConfirmation?: boolean }> => {
      if (!supabase) {
        const err = new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setError(err.message);
        return { error: err };
      }

      setError(null);
      setIsLoading(true);

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return { error: signUpError };
        }

        // If email confirmation is enabled in Supabase, user session won't exist immediately
        const needsEmailConfirmation = !data.session;
        return { error: null, needsEmailConfirmation };
      } catch (err: any) {
        const fallbackError = new Error(err.message || 'An unexpected sign-up error occurred.');
        setError(fallbackError.message);
        return { error: fallbackError };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) {
      setUser(null);
      setSession(null);
      setToken(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
      }
      setUser(null);
      setSession(null);
      setToken(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign out.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    token,
    isLoading,
    isConfigured: isSupabaseConfigured,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };
}
