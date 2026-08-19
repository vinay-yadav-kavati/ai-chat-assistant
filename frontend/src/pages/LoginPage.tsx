import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { signIn, signUp, isLoading, error: authError, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signin') {
      const result = await signIn(email, password);
      if (!result.error) {
        onLoginSuccess?.();
      }
    } else {
      const result = await signUp(email, password);
      if (!result.error) {
        if (result.needsEmailConfirmation) {
          setSuccessMessage('Sign up successful! Please check your email to confirm your account, or sign in if confirmation is disabled.');
        } else {
          setSuccessMessage('Account created successfully!');
          onLoginSuccess?.();
        }
      }
    }
  };

  const displayError = localError || authError;

  return (
    <div id="login-page-container" className="min-h-screen flex items-center justify-center p-6 bg-neutral-100/60">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight [font-family:'Times_New_Roman',serif]">
            {mode === 'signin' ? 'Sign In to Nexa' : 'Create an Account'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'signin'
              ? '“Welcome back! Continue where you left off.”'
              : 'Your conversations, your context. Create an account to get started.'}
          </p>
        </div>

        {!isConfigured && (
          <div id="auth-unconfigured-warning" className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              Supabase Configuration Missing
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Please configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">frontend/.env</code>.
            </p>
          </div>
        )}

        {displayError && (
          <div id="auth-error-alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{displayError}</span>
          </div>
        )}

        {successMessage && (
          <div id="auth-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                id="login-email-input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading || !isConfigured}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                id="login-password-input"
                type="password"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading || !isConfigured}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-neutral-400">Minimum 6 characters</p>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isLoading || !isConfigured}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-200 text-center">
          <button
            id="btn-toggle-auth-mode"
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setLocalError(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium hover:underline transition-colors cursor-pointer"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
