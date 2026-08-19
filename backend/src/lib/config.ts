import dotenv from 'dotenv';
import path from 'path';

// Load root, backend, or frontend environment files
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'frontend/.env') });

function cleanEnv(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export const GEMINI_MODEL_PRIORITY: readonly string[] = [
  'gemini-3.7-flash', // Primary model (Verified active)
  'gemini-3.6-flash', // Fallback 1
  'gemini-3.5-flash', // Fallback 2
  'gemini-flash-latest', // Fallback 3
] as const;

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  geminiApiKey:
    cleanEnv(process.env.GEMINI_API_KEY) ||
    cleanEnv(process.env.VITE_GEMINI_API_KEY) ||
    '',
  geminiModel: cleanEnv(process.env.GEMINI_MODEL) || 'gemini-3.7-flash',
  geminiModelPriority: GEMINI_MODEL_PRIORITY,
  supabaseUrl:
    cleanEnv(process.env.SUPABASE_URL) ||
    cleanEnv(process.env.VITE_SUPABASE_URL) ||
    '',
  supabaseServiceRoleKey:
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || '',
  supabaseAnonKey:
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.VITE_SUPABASE_ANON_KEY) ||
    '',
  frontendUrl: cleanEnv(process.env.FRONTEND_URL) || 'http://localhost:3000',
  nodeEnv: cleanEnv(process.env.NODE_ENV) || 'development',
};
