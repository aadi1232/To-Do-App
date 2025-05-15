// This file centralizes all routes in the Express backend
import express from 'express';
import userRoutes from './user.routes.js';
import todoRoutes from './todo.routes.js';
import groupRoutes from './group.routes.js';
import aiRoutes from './ai.routes.js';
import searchRoutes from './search.routes.js';
import notificationRoutes from './notification.routes.js';

const router = express.Router();

// Register all routes
router.use('/users', userRoutes);
router.use('/todos', todoRoutes);
router.use('/groups', groupRoutes);
router.use('/ai', aiRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);

export default router;
