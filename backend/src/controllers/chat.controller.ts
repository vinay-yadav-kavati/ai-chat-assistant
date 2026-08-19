import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  getMessagesByConversationIdAndUser,
  insertMessageForUser,
} from '../services/message.service.js';
import { generateChatResponse } from '../services/gemini.service.js';

/**
 * POST /api/conversations/:id/chat
 * Handles multi-turn AI chat by retrieving existing conversation history from Supabase,
 * forwarding context to Google Gemini API, and persisting both user and model messages upon success.
 */
export async function handleChat(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User is not authenticated.' },
      });
      return;
    }

    const conversationId = req.params.conversationId || req.params.id;
    if (!conversationId) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Conversation ID is required.' },
      });
      return;
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Message content is required and cannot be empty.',
        },
      });
      return;
    }

    const userPrompt = content.trim();

    // 1. Verify ownership and load existing conversation messages from Supabase
    const existingMessages = await getMessagesByConversationIdAndUser(
      conversationId,
      userId,
      req.token
    );

    if (existingMessages === null) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found or does not belong to the user.',
        },
      });
      return;
    }

    // 2. Call Gemini API with conversation history context
    let assistantReplyText: string;
    try {
      assistantReplyText = await generateChatResponse(existingMessages, userPrompt);
    } catch (geminiError: any) {
      console.error('Gemini API execution failed:', geminiError);
      res.status(500).json({
        error: {
          code: 'AI_SERVICE_ERROR',
          message: geminiError.message || 'Failed to generate response from Gemini API.',
        },
      });
      return;
    }

    // 3. Persist user prompt to Supabase
    await insertMessageForUser(
      conversationId,
      userId,
      'user',
      userPrompt,
      req.token
    );

    // 4. Persist assistant response to Supabase
    const assistantMessage = await insertMessageForUser(
      conversationId,
      userId,
      'assistant',
      assistantReplyText,
      req.token
    );

    // 5. Return the newly created assistant message
    res.json({
      message: assistantMessage,
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred during chat processing.',
      },
    });
  }
}
