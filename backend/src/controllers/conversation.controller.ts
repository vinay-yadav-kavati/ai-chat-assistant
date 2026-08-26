import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  createConversationForUser,
  getConversationsByUserId,
  getConversationByIdAndUser,
  deleteConversationByIdAndUser,
  updateConversationTitle,
} from '../services/conversation.service.js';
import { getMessagesByConversationIdAndUser } from '../services/message.service.js';

/**
 * GET /api/conversations
 * List all conversations belonging to the authenticated user.
 */
export async function getConversations(
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

    const conversations = await getConversationsByUserId(userId, req.token);
    res.json({ conversations });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch conversations.' },
    });
  }
}

/**
 * POST /api/conversations
 * Create a new conversation for the authenticated user.
 */
export async function createConversation(
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

    const { title } = req.body;
    if (title !== undefined && typeof title !== 'string') {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Title must be a string if provided.' },
      });
      return;
    }

    const conversation = await createConversationForUser(userId, title, req.token);
    res.status(201).json({ conversation });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create conversation.' },
    });
  }
}

/**
 * GET /api/conversations/:id
 * Retrieve a specific conversation and its messages for the authenticated user.
 */
export async function getConversationById(
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

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Conversation ID is required.' },
      });
      return;
    }

    const conversation = await getConversationByIdAndUser(id, userId, req.token);
    if (!conversation) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' },
      });
      return;
    }

    const messages = await getMessagesByConversationIdAndUser(id, userId, req.token);

    res.json({
      conversation,
      messages: messages || [],
    });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to retrieve conversation.' },
    });
  }
}

/**
 * DELETE /api/conversations/:id
 * Delete a specific conversation belonging to the authenticated user.
 */
export async function deleteConversation(
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

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Conversation ID is required.' },
      });
      return;
    }

    const deleted = await deleteConversationByIdAndUser(id, userId, req.token);
    if (!deleted) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Conversation not found or does not belong to user.' },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete conversation.' },
    });
  }
}

/**
 * PATCH /api/conversations/:id
 * Update a conversation title belonging to the authenticated user.
 */
export async function updateConversation(
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

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Conversation ID is required.' },
      });
      return;
    }

    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Conversation title is required and cannot be empty.' },
      });
      return;
    }

    const updated = await updateConversationTitle(id, userId, title, req.token);
    if (!updated) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Conversation not found or does not belong to user.' },
      });
      return;
    }

    res.json({
      conversation: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update conversation.' },
    });
  }
}

