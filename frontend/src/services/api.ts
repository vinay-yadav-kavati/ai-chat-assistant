import { Conversation, Message, HealthResponse, ConversationWithMessages } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Frontend API Service Layer
 * Centralizes all communication with the Express backend sending Supabase Bearer tokens.
 */
export const api = {
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },

  async getConversations(token: string): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to fetch conversations (${res.status})`,
      );
    }

    const data = await res.json();
    return data.conversations || [];
  },

  async createConversation(
    token: string,
    title?: string,
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(title ? { title } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to create conversation (${res.status})`,
      );
    }

    const data = await res.json();
    return data.conversation;
  },

  async getConversationById(
    id: string,
    token: string,
  ): Promise<ConversationWithMessages> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to fetch conversation (${res.status})`,
      );
    }

    return res.json();
  },

  async deleteConversation(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to delete conversation (${res.status})`,
      );
    }
  },

  async getMessages(conversationId: string, token: string): Promise<Message[]> {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to load messages (${res.status})`,
      );
    }

    const data = await res.json();
    return data.messages || [];
  },

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    token: string,
  ): Promise<Message> {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, content }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Failed to add message (${res.status})`,
      );
    }

    const data = await res.json();
    return data.message;
  },

  /**
   * Step 4: AI Chat Endpoint with conversation memory.
   * Sends user message to the backend which passes existing messages to Gemini and returns assistant response.
   */
  async sendChatMessage(
    conversationId: string,
    content: string,
    token: string,
    signal?: AbortSignal,
  ): Promise<Message> {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/chat`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || `Chat request failed (${res.status})`,
      );
    }

    const data = await res.json();
    return data.message;
  },
};
