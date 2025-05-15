import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Routes
router.post('/group', notificationController.notifyGroupMembers);
router.get('/', notificationController.getUserNotifications);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

export default router;
