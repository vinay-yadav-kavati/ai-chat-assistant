import React from 'react';
import { Menu, Plus, Bot } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = 'AI Chat Assistant',
  onToggleSidebar,
  onNewChat,
}) => {
  return (
    <header
      id="chat-header"
      className="h-14 border-b border-neutral-200 px-4 flex items-center justify-between bg-white shrink-0 z-10"
    >
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-4 h-4 text-neutral-700 shrink-0 hidden sm:block" />
          <h1 className="text-sm font-semibold text-neutral-900 truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onNewChat && (
          <button
            id="btn-header-new-chat"
            type="button"
            onClick={onNewChat}
            title="Start new chat"
            className="flex md:hidden items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        )}
      </div>
    </header>
  );
};
