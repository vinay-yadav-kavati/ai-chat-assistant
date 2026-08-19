import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, isLoading: authLoading } = useAuth();

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

  if (!user) {
    return <LoginPage />;
  }

  return <ChatPage />;
}
