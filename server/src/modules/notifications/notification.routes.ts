import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.get('/notifications', authenticate, notificationController.getNotifications);
router.post('/notifications/:id/read', authenticate, notificationController.markRead);
router.post('/notifications/read-all', authenticate, notificationController.markAllRead);
router.get('/notifications/unread-count', authenticate, notificationController.getUnreadCount);

export default router;
