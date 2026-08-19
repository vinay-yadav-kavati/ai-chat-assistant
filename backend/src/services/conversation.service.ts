import { Conversation } from '../types/api.types.js';
import { getSupabaseClient, createUserSupabaseClient } from '../lib/supabase.js';

function getClient(token?: string) {
  const client = token ? createUserSupabaseClient(token) : getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available. Check configuration.');
  }
  return client;
}

/**
 * Creates a new conversation record for the authenticated user.
 */
export async function createConversationForUser(
  userId: string,
  title?: string,
  token?: string
): Promise<Conversation> {
  const client = getClient(token);
  const cleanTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'New Chat';

  const { data, error } = await client
    .from('conversations')
    .insert({
      user_id: userId,
      title: cleanTitle,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create conversation: ${error?.message || 'Unknown database error'}`);
  }

  return data as Conversation;
}

/**
 * Retrieves all conversations belonging to the authenticated user, ordered by updated_at descending.
 */
export async function getConversationsByUserId(
  userId: string,
  token?: string
): Promise<Conversation[]> {
  const client = getClient(token);

  const { data, error } = await client
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to retrieve conversations: ${error.message}`);
  }

  return (data || []) as Conversation[];
}

/**
 * Retrieves a single conversation by ID verifying authenticated user ownership.
 */
export async function getConversationByIdAndUser(
  conversationId: string,
  userId: string,
  token?: string
): Promise<Conversation | null> {
  const client = getClient(token);

  const { data, error } = await client
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to retrieve conversation: ${error.message}`);
  }

  return data ? (data as Conversation) : null;
}

/**
 * Deletes a conversation by ID, enforcing user ownership. Cascading deletes attached messages.
 */
export async function deleteConversationByIdAndUser(
  conversationId: string,
  userId: string,
  token?: string
): Promise<boolean> {
  const client = getClient(token);

  const { data, error } = await client
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select('id');

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }

  return Boolean(data && data.length > 0);
}


/**
 * Updates a conversation title while enforcing authenticated user ownership.
 */
export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string,
  token?: string
): Promise<Conversation> {
  const client = getClient(token);

  const cleanTitle = title.trim().slice(0, 60);

  const { data, error } = await client
    .from('conversations')
    .update({
      title: cleanTitle,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update conversation title: ${
        error?.message || 'Unknown database error'
      }`
    );
  }

  return data as Conversation;
}