import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client for backend operations and auth verification.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = config.supabaseUrl;
  const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;

  if (!url || !key) {
    return null;
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
};

/**
 * Returns a Supabase client scoped to the authenticated user's JWT.
 * Enforces PostgreSQL Row Level Security (RLS) directly at the database engine level.
 */
export const createUserSupabaseClient = (accessToken: string): SupabaseClient | null => {
  const url = config.supabaseUrl;
  const key = config.supabaseAnonKey || config.supabaseServiceRoleKey;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
