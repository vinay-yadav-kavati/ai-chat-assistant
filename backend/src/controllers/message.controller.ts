import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  getMessagesByConversationIdAndUser,
  insertMessageForUser,
} from '../services/message.service.js';

/**
 * GET /api/conversations/:id/messages
 * Return messages belonging to the authenticated user's conversation.
 */
export async function getMessages(
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

    const messages = await getMessagesByConversationIdAndUser(
      conversationId,
      userId,
      req.token
    );

    if (messages === null) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Conversation not found or does not belong to the user.' },
      });
      return;
    }

    res.json({
      conversationId,
      messages,
    });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to retrieve messages.' },
    });
  }
}

/**
 * POST /api/conversations/:id/messages
 * Add a message to an existing conversation.
 */
export async function createMessage(
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

    const { role = 'user', content } = req.body;

    // Validate role
    if (role !== 'user' && role !== 'assistant') {
      res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Role must be either "user" or "assistant".',
        },
      });
      return;
    }

    // Validate content
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Message content is required and cannot be empty.',
        },
      });
      return;
    }

    const message = await insertMessageForUser(
      conversationId,
      userId,
      role,
      content,
      req.token
    );

    res.status(201).json({ message });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: err.message || 'Conversation not found.' },
      });
      return;
    }

    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to add message.' },
    });
  }
}
