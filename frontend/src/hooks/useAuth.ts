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
  isRecoveryMode: boolean;
  recoveryError: string | null;
  setIsRecoveryMode: (mode: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | Error | null; needsEmailConfirmation?: boolean }>;
  signInAnonymously: () => Promise<{ error: AuthError | Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRecoveryError(null);
  }, []);

  useEffect(() => {
    // Check URL parameters / hash for recovery tokens or errors
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash.includes('error=') || search.includes('error=')) {
        const rawParams = hash.includes('error=') ? hash.replace(/^#/, '') : search.replace(/^\?/, '');
        const params = new URLSearchParams(rawParams);
        const errorDesc = params.get('error_description') || params.get('error');
        if (errorDesc) {
          const decoded = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
          setRecoveryError(decoded);
          setIsRecoveryMode(true);
        }
      } else if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setIsRecoveryMode(true);
      }
    }

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
            is_anonymous: data.session.user.is_anonymous,
          });
        }
      })
      .catch((err) => {
        console.error('Unexpected error retrieving session:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Listen for auth state changes (sign in, sign out, token refresh, password recovery)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
          setRecoveryError(null);
        }

        setSession(currentSession);
        if (currentSession) {
          setToken(currentSession.access_token);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            is_anonymous: currentSession.user.is_anonymous,
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

        // If email confirmation is disabled in Supabase, an active session is returned automatically.
        // Sign out to guarantee user is redirected to Sign In and must enter their password to continue.
        if (data.session) {
          await supabase.auth.signOut();
        }

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

  const signInAnonymously = useCallback(async (): Promise<{ error: AuthError | Error | null }> => {
    if (!supabase) {
      const err = new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setError(err.message);
      return { error: err };
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data, error: anonError } = await supabase.auth.signInAnonymously();

      if (anonError) {
        setError(anonError.message);
        return { error: anonError };
      }

      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          is_anonymous: data.session.user.is_anonymous,
        });
      }

      return { error: null };
    } catch (err: any) {
      const fallbackError = new Error(err.message || 'An unexpected error occurred during anonymous sign-in.');
      setError(fallbackError.message);
      return { error: fallbackError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPasswordForEmail = useCallback(
    async (email: string): Promise<{ error: AuthError | Error | null }> => {
      if (!supabase) {
        const err = new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setError(err.message);
        return { error: err };
      }

      setError(null);
      setIsLoading(true);

      try {
        const redirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : undefined;

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

        if (resetError) {
          setError(resetError.message);
          return { error: resetError };
        }

        return { error: null };
      } catch (err: any) {
        const fallbackError = new Error(err.message || 'An unexpected error occurred while requesting password reset.');
        setError(fallbackError.message);
        return { error: fallbackError };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: AuthError | Error | null }> => {
      if (!supabase) {
        const err = new Error('Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setError(err.message);
        return { error: err };
      }

      setError(null);
      setIsLoading(true);

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          setError(updateError.message);
          return { error: updateError };
        }

        setIsRecoveryMode(false);
        setRecoveryError(null);

        // Clean up hash parameters from URL
        if (typeof window !== 'undefined' && (window.location.hash || window.location.search)) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        return { error: null };
      } catch (err: any) {
        const fallbackError = new Error(err.message || 'An unexpected error occurred while updating password.');
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
      setIsRecoveryMode(false);
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
      setIsRecoveryMode(false);
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
    isRecoveryMode,
    recoveryError,
    setIsRecoveryMode,
    signIn,
    signUp,
    signInAnonymously,
    resetPasswordForEmail,
    updatePassword,
    signOut,
    clearError,
  };
}

