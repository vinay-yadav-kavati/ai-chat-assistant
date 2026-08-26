import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChatPage } from './pages/ChatPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, isLoading: authLoading, isRecoveryMode, setIsRecoveryMode } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'forgot-password'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#forgot-password') {
      return 'forgot-password';
    }
    return 'login';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#forgot-password') {
        setAuthView('forgot-password');
      } else if (!window.location.hash || window.location.hash === '#login') {
        setAuthView('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (authLoading) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-neutral-600 bg-white border border-neutral-200 rounded-xl px-5 py-4 shadow-xs">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
          <span className="text-sm font-medium">Checking authentication session...</span>
        </div>
      </div>
    );
  }

  // 1. Supabase Password Recovery flow (User clicked reset link in email)
  if (isRecoveryMode) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setIsRecoveryMode(false);
          setAuthView('login');
        }}
        onNavigateToForgotPassword={() => {
          setIsRecoveryMode(false);
          setAuthView('forgot-password');
          window.location.hash = 'forgot-password';
        }}
        onNavigateToSignIn={() => {
          setIsRecoveryMode(false);
          setAuthView('login');
          window.location.hash = '';
        }}
      />
    );
  }

  // 2. Unauthenticated flows (Sign In / Sign Up / Forgot Password)
  if (!user) {
    if (authView === 'forgot-password') {
      return (
        <ForgotPasswordPage
          onBackToSignIn={() => {
            setAuthView('login');
            window.location.hash = '';
          }}
        />
      );
    }

    return (
      <LoginPage
        onForgotPassword={() => {
          setAuthView('forgot-password');
          window.location.hash = 'forgot-password';
        }}
      />
    );
  }

  // 3. Authenticated main app
  return <ChatPage />;
}

