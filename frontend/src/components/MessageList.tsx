import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Bot, User as UserIcon, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onDismissError?: () => void;
  hasSelectedConversation: boolean;
  onNewChat?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  error,
  onDismissError,
  hasSelectedConversation,
  onNewChat,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message whenever messages array changes or loading toggles
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state: No conversation selected
  if (!hasSelectedConversation) {
    return (
      <div
        id="no-conversation-empty-state"
        className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-50/50 overflow-y-auto"
      >
        <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-neutral-800 mb-1">AI Chat Assistant</h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-6">
          Select a conversation from the sidebar or start a new chat to begin asking questions.
        </p>
        {onNewChat && (
          <button
            id="btn-empty-new-chat"
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Chat</span>
          </button>
        )}
      </div>
    );
  }

  // Empty state: Conversation selected but has no messages yet
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        id="new-conversation-empty-state"
        className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-50/50 overflow-y-auto"
      >
        <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 shadow-xs">
          <Sparkles className="w-6 h-6 text-neutral-500" />
        </div>
        <h2 className="text-sm font-semibold text-neutral-800 mb-1">Start a conversation</h2>
        <p className="text-xs text-neutral-500 max-w-xs">
          Ask anything or continue the conversation…
        </p>
      </div>
    );
  }

  return (
    <div
      id="message-list-container"
      className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-5 bg-neutral-50/30"
    >
      {/* Optional Error Banner */}
      {error && (
        <div
          id="message-list-error-banner"
          className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-800"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="text-rose-600 hover:text-rose-900 font-medium text-[11px] underline shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            id={`message-bubble-${msg.id}`}
            className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div
                className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5 shadow-xs"
                title="AI Assistant"
              >
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            {isUser ? (
              <div
                className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words bg-neutral-900 text-white rounded-tr-xs shadow-xs"
              >
                <p>{msg.content}</p>
              </div>
            ) : (
              <div
                className="max-w-[90%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words bg-white text-neutral-900 border border-neutral-200 rounded-tl-xs shadow-xs overflow-hidden"
              >
                <MarkdownRenderer content={msg.content} />
              </div>
            )}

            {isUser && (
              <div
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center shrink-0 mt-0.5"
                title="You"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      })}

      {/* Assistant Loading Indicator */}
      {isLoading && (
        <div id="message-loading-indicator" className="flex items-start gap-2.5 justify-start">
          <div
            className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5 shadow-xs"
            title="AI Assistant"
          >
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div
            className="bg-white border border-neutral-200 rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-xs flex items-center gap-1.5"
            role="status"
            aria-label="Nexa is generating a response"
          >
            <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block animate-typing-dot-1" />
            <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block animate-typing-dot-2" />
            <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block animate-typing-dot-3" />
            <span className="sr-only">Nexa is typing...</span>
          </div>
        </div>
      )}

      {/* Scroll Anchor */}
      <div ref={scrollEndRef} className="h-1" />
    </div>
  );
};
