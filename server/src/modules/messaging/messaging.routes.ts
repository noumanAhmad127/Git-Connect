import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as messagingController from './messaging.controller.js';

const router = Router();

router.get('/conversations', authenticate, messagingController.getConversations);
router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  messagingController.getMessages,
);
router.post('/conversations/:conversationId/read', authenticate, messagingController.markAsRead);
router.post('/messages', authenticate, messagingController.sendMessage);
router.get('/messages/unread-count', authenticate, messagingController.getUnreadCount);

export default router;
