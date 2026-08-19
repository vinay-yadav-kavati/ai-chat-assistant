import { Message } from '../types/api.types.js';
import { getSupabaseClient, createUserSupabaseClient } from '../lib/supabase.js';
import { getConversationByIdAndUser } from './conversation.service.js';

function getClient(token?: string) {
  const client = token ? createUserSupabaseClient(token) : getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available. Check configuration.');
  }
  return client;
}

/**
 * Retrieves all messages belonging to a conversation after verifying user ownership.
 * Returns messages ordered chronologically by created_at ascending.
 */
export async function getMessagesByConversationIdAndUser(
  conversationId: string,
  userId: string,
  token?: string
): Promise<Message[] | null> {
  // 1. Verify that the conversation exists and belongs to the authenticated user
  const conversation = await getConversationByIdAndUser(conversationId, userId, token);
  if (!conversation) {
    return null;
  }

  const client = getClient(token);

  // 2. Fetch messages ordered chronologically
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve messages: ${error.message}`);
  }

  return (data || []) as Message[];
}

/**
 * Inserts a new message into a conversation after verifying user ownership.
 * Also updates the conversation's updated_at timestamp.
 */
export async function insertMessageForUser(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  token?: string
): Promise<Message> {
  // 1. Verify that the conversation exists and belongs to the authenticated user
  const conversation = await getConversationByIdAndUser(conversationId, userId, token);
  if (!conversation) {
    const error: any = new Error('Conversation not found or does not belong to the user.');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const client = getClient(token);
  const cleanContent = content.trim();

  // 2. Insert message
  const { data: messageData, error: messageError } = await client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content: cleanContent,
    })
    .select('*')
    .single();

  if (messageError || !messageData) {
    throw new Error(`Failed to insert message: ${messageError?.message || 'Database error'}`);
  }

  // 3. Update conversation updated_at timestamp
  await client
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', userId);

  return messageData as Message;
}
