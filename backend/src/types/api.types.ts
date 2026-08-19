export interface User {
  id: string;
  email?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
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

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface CreateConversationRequest {
  title?: string;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetConversationDetailsResponse {
  conversation: Conversation;
  messages: Message[];
}

export interface DeleteConversationResponse {
  success: boolean;
  message: string;
}

export interface CreateMessageRequest {
  role: 'user' | 'assistant';
  content: string;
}

export interface CreateMessageResponse {
  message: Message;
}

export interface GetMessagesResponse {
  conversationId: string;
  messages: Message[];
}

export interface ChatRequest {
  content: string;
}

export interface ChatResponse {
  message: Message;
}
