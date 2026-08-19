import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut, X, Loader2, Bot } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  userEmail?: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  isLoadingConversations?: boolean;
  isCreatingChat?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  userEmail,
  onSignOut,
  isOpen,
  onClose,
  isLoadingConversations = false,
  isCreatingChat = false,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-900/40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar-container"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-neutral-900 text-neutral-100 flex flex-col h-full border-r border-neutral-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Nexa an AI Assistant</h2>
            </div>
          </div>

          <button
            id="btn-close-sidebar"
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            id="btn-new-chat"
            type="button"
            onClick={onNewChat}
            disabled={isCreatingChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700/90 border border-neutral-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingChat ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                <span>Creating chat...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-neutral-300" />
                <span>New Chat</span>
              </>
            )}
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Conversations
          </div>

          {isLoadingConversations && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-neutral-400 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading chats...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-neutral-400">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations yet</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Click "New Chat" to start</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeId === conv.id;
              return (
                <div
                  key={conv.id}
                  id={`conv-wrapper-${conv.id}`}
                  className={`group relative flex items-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <button
                    id={`conv-item-${conv.id}`}
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-xs text-left truncate"
                  >
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'
                      }`}
                    />
                    <span className="truncate">{conv.title || 'New Chat'}</span>
                  </button>

                  <button
                    id={`btn-delete-conv-${conv.id}`}
                    type="button"
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    title="Delete conversation"
                    aria-label={`Delete conversation ${conv.title || 'New Chat'}`}
                    className="p-2 mr-1 text-neutral-400 hover:text-rose-400 rounded-md hover:bg-neutral-700/60 transition-colors opacity-80 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User & Sign Out Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 border border-neutral-800">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-neutral-200 truncate" title={userEmail}>
                {userEmail || 'Authenticated User'}
              </p>
            </div>
            <button
              id="btn-sidebar-signout"
              type="button"
              onClick={onSignOut}
              title="Sign Out"
              aria-label="Sign out of account"
              className="p-1.5 text-neutral-400 hover:text-rose-300 hover:bg-neutral-700/60 rounded-md transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
