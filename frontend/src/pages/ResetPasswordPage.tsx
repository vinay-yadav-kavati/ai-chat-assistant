import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, AlertCircle, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface ResetPasswordPageProps {
  onSuccess?: () => void;
  onNavigateToForgotPassword?: () => void;
  onNavigateToSignIn?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onSuccess,
  onNavigateToForgotPassword,
  onNavigateToSignIn,
}) => {
  const { updatePassword, isLoading, error: authError, recoveryError, isConfigured } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!password || !confirmPassword) {
      setLocalError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    const result = await updatePassword(password);
    if (!result.error) {
      setIsSuccess(true);
    }
  };

  const displayError = localError || recoveryError || authError;

  return (
    <div id="reset-password-page-container" className="min-h-screen flex items-center justify-center p-6 bg-neutral-100/60">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight [font-family:'Times_New_Roman',serif]">
            Set New Password
          </h1>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Enter your new password below to secure and access your Nexa account.
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

        {displayError && !isSuccess && (
          <div id="reset-password-error-alert" className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-tight">{displayError}</span>
            </div>
            {recoveryError && onNavigateToForgotPassword && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-xs font-semibold text-rose-900 hover:underline cursor-pointer"
                >
                  Request a new password reset link &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6">
            <div id="reset-password-success-alert" className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Password updated successfully</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Your password has been changed. You can now continue using Nexa with your new credentials.
                </p>
              </div>
            </div>

            <button
              id="btn-continue-after-reset"
              type="button"
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                } else if (onNavigateToSignIn) {
                  onNavigateToSignIn();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Continue to Nexa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="reset-new-password-input"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading || !isConfigured}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-neutral-400">Minimum 6 characters</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="reset-confirm-password-input"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading || !isConfigured}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              id="btn-submit-new-password"
              type="submit"
              disabled={isLoading || !isConfigured}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-neutral-200 text-center">
          <button
            id="btn-reset-back-to-signin"
            type="button"
            onClick={onNavigateToSignIn}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium hover:underline transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
