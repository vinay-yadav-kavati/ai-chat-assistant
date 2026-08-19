import React, { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message... (Press Enter to send, Shift+Enter for new line)',
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-adjust textarea height to fit content up to a max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div
      id="message-composer-container"
      className="p-3 md:p-4 border-t border-neutral-200 bg-white"
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 max-w-4xl mx-auto"
      >
        <textarea
          ref={textareaRef}
          id="message-composer-textarea"
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 max-h-40 min-h-[44px] py-2.5 px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed leading-relaxed"
        />

        <button
          id="btn-send-message"
          type="submit"
          disabled={disabled || !content.trim()}
          aria-label="Send message"
          className="h-[44px] w-[44px] flex items-center justify-center text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs shrink-0"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      <p className="text-[11px] text-neutral-400 text-center mt-2 hidden sm:block">
        AI Chat Assistant · Powered by Gemini · Built with Supabase Memory
      </p>
    </div>
  );
};
