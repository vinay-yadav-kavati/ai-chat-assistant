export interface User {
  id: string;
  email?: string;
  is_anonymous?: boolean;
}

export interface Conversation {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface HealthResponse {
  status: 'ok';
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}
