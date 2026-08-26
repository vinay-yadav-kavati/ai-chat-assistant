import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getConversations,
  createConversation,
  getConversationById,
  deleteConversation,
  updateConversation,
} from '../controllers/conversation.controller.js';
import {
  getMessages,
  createMessage,
} from '../controllers/message.controller.js';
import { handleChat } from '../controllers/chat.controller.js';

const router = Router();

// Protect all conversation, message, and chat endpoints with Supabase Auth
router.use(authMiddleware);

// Conversation endpoints
router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversationById);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

// Message endpoints
router.get('/:id/messages', getMessages);
router.post('/:id/messages', createMessage);

// AI Chat with Conversation-Level Memory endpoint
router.post('/:id/chat', handleChat);

export default router;
