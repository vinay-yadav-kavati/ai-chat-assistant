import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  X,
  Loader2,
  Bot,
  MoreVertical,
  Pencil,
  Check,
} from 'lucide-react';
import { Conversation } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface SidebarProps {
  conversations: Conversation[];
  activeId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation?: (id: string, newTitle: string) => Promise<void> | void;
  onDeleteConversation: (id: string, e?: React.MouseEvent) => Promise<void> | void;
  userEmail?: string;
  isAnonymous?: boolean;
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
  onRenameConversation,
  onDeleteConversation,
  userEmail,
  isAnonymous = false,
  onSignOut,
  isOpen,
  onClose,
  isLoadingConversations = false,
  isCreatingChat = false,
}) => {
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contextual three-dot menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline rename state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const editInputRef = useRef<HTMLInputElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus and select text when entering rename mode
  useEffect(() => {
    if (editingConvId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingConvId]);

  // Close three-dot menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!activeMenuId) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setActiveMenuId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

  const handleOpenDeleteModal = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setConversationToDelete(conv);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setConversationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteConversation(conversationToDelete.id);
      setConversationToDelete(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingConvId(conv.id);
    setEditTitle(conv.title || 'New Chat');
  };

  const handleCancelRename = () => {
    if (isRenaming) return;
    setEditingConvId(null);
  };

  const handleSaveRename = async (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed || isRenaming) return;

    const currentConv = conversations.find((c) => c.id === id);
    if (currentConv && currentConv.title === trimmed) {
      setEditingConvId(null);
      return;
    }

    if (!onRenameConversation) {
      setEditingConvId(null);
      return;
    }

    setIsRenaming(true);
    try {
      await onRenameConversation(id, trimmed);
      setEditingConvId(null);
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    } finally {
      setIsRenaming(false);
    }
  };

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
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 pb-12">
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
              const isEditing = editingConvId === conv.id;
              const isMenuOpen = activeMenuId === conv.id;

              if (isEditing) {
                return (
                  <div
                    key={conv.id}
                    id={`rename-wrapper-${conv.id}`}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-800 border border-neutral-600 rounded-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <input
                      ref={editInputRef}
                      id={`input-rename-conv-${conv.id}`}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveRename(conv.id);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelRename();
                        }
                      }}
                      disabled={isRenaming}
                      aria-label="Edit conversation title"
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none min-w-0"
                      autoFocus
                    />
                    <button
                      id={`btn-save-rename-${conv.id}`}
                      type="button"
                      onClick={() => handleSaveRename(conv.id)}
                      disabled={isRenaming || !editTitle.trim()}
                      title="Save title"
                      aria-label="Save title"
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-neutral-700 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRenaming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      id={`btn-cancel-rename-${conv.id}`}
                      type="button"
                      onClick={handleCancelRename}
                      disabled={isRenaming}
                      title="Cancel rename"
                      aria-label="Cancel rename"
                      className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

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

                  {/* Three-dot Actions Menu Button */}
                  <div
                    ref={isMenuOpen ? menuContainerRef : null}
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      id={`btn-menu-conv-${conv.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : conv.id);
                      }}
                      title="More actions"
                      aria-label={`Actions for ${conv.title || 'New Chat'}`}
                      aria-expanded={isMenuOpen}
                      className={`p-1.5 mr-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-700/60 transition-colors focus:opacity-100 ${
                        isMenuOpen
                          ? 'opacity-100 bg-neutral-700 text-white'
                          : 'opacity-80 md:opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Contextual Menu Dropdown */}
                    {isMenuOpen && (
                      <div
                        id={`menu-dropdown-${conv.id}`}
                        role="menu"
                        aria-orientation="vertical"
                        className="absolute right-0 top-full mt-1 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          id={`btn-action-rename-${conv.id}`}
                          role="menuitem"
                          type="button"
                          onClick={(e) => handleStartRename(conv, e)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          id={`btn-action-delete-${conv.id}`}
                          role="menuitem"
                          type="button"
                          onClick={(e) => handleOpenDeleteModal(conv, e)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User & Sign Out Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 border border-neutral-800">
            <div className="min-w-0 pr-2">
              <p
                className="text-xs font-medium text-neutral-200 truncate"
                title={isAnonymous ? 'Demo User (Temporary Session)' : (userEmail || 'Authenticated User')}
              >
                {isAnonymous ? 'Demo User' : (userEmail || 'Authenticated User')}
              </p>
              {isAnonymous && (
                <p className="text-[10px] text-neutral-400 leading-tight">Temporary Session</p>
              )}
            </div>
            <button
              id="btn-sidebar-signout"
              type="button"
              onClick={onSignOut}
              title={isAnonymous ? 'End Demo Session' : 'Sign Out'}
              aria-label={isAnonymous ? 'End Demo Session' : 'Sign out of account'}
              className="p-1.5 text-neutral-400 hover:text-rose-300 hover:bg-neutral-700/60 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(conversationToDelete)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};
