import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { MessageComposer } from '../components/MessageComposer';

export const ChatPage: React.FC = () => {
  const { user, token, signOut } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Fetch user conversations from backend on mount or token change
  const loadConversations = useCallback(async () => {
    if (!token) return;
    setIsLoadingConversations(true);
    setError(null);
    try {
      const convs = await api.getConversations(token);
      setConversations(convs);

      // Auto-select first conversation if exists and none currently selected
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err?.message || 'Failed to load conversations from server.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Fetch conversation details & messages when active conversation changes
  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!token) return;
      setIsLoadingMessages(true);
      setError(null);
      try {
        const details = await api.getConversationById(conversationId, token);
        setMessages(details.messages || []);
      } catch (err: any) {
        console.error('Failed to load messages for conversation:', err);
        setError(err?.message || 'Failed to load messages.');
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // 3. Create a new conversation
  const handleNewChat = async () => {
    if (!token || isCreatingChat) return;
    setIsCreatingChat(true);
    setError(null);
    try {
      const newConv = await api.createConversation(token);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setIsSidebarOpen(false);
    } catch (err: any) {
      console.error('Failed to create new conversation:', err);
      setError(err?.message || 'Failed to create new conversation.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  // 4. Select an existing conversation
  const handleSelectConversation = (id: string) => {
    if (id === activeConversationId) return;
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  // 5. Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await api.deleteConversation(id, token);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);

      // If active conversation was deleted, pick the next or set to null
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      setError(err?.message || 'Failed to delete conversation.');
    }
  };

  // 6. Send user message & receive assistant response
  const handleSendMessage = async (content: string) => {
    if (!token || isSendingMessage || !content.trim()) return;

    let targetConvId = activeConversationId;

    // If no active conversation exists, create one first
    if (!targetConvId) {
      try {
        setIsCreatingChat(true);
        const newConv = await api.createConversation(token);
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        targetConvId = newConv.id;
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize a conversation.');
        setIsCreatingChat(false);
        return;
      } finally {
        setIsCreatingChat(false);
      }
    }

    const trimmed = content.trim();

    // Optimistic user message representation
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: targetConvId,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setIsSendingMessage(true);
    setError(null);

    try {
      const assistantMessage = await api.sendChatMessage(targetConvId, trimmed, token);
      // Append assistant message upon successful response
      setMessages((prev) => [...prev, assistantMessage]);

      // If the conversation was named "New Chat", update its title from first message snippet
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId && (c.title === 'New Chat' || !c.title)) {
            return {
              ...c,
              title: trimmed.length > 30 ? `${trimmed.slice(0, 30)}...` : trimmed,
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err?.message || 'Failed to generate response. Please try again.');
      // Remove optimistic message if submission completely failed
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div id="chat-page-root" className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        userEmail={user?.email}
        onSignOut={signOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoadingConversations={isLoadingConversations}
        isCreatingChat={isCreatingChat}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white relative overflow-hidden">
        <ChatHeader
          title={activeConversation?.title || 'AI Chat Assistant'}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
        />

        <MessageList
          messages={messages}
          isLoading={isSendingMessage || isLoadingMessages}
          error={error}
          onDismissError={() => setError(null)}
          hasSelectedConversation={Boolean(activeConversationId)}
          onNewChat={handleNewChat}
        />

        <MessageComposer
          onSend={handleSendMessage}
          disabled={isSendingMessage || isLoadingMessages || isCreatingChat}
          placeholder={
            !activeConversationId
              ? 'Type a message to start a new chat...'
              : 'Type a message... (Press Enter to send, Shift+Enter for new line)'
          }
        />
      </main>
    </div>
  );
};
