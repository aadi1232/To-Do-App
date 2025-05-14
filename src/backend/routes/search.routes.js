import express from 'express';
import * as searchController from '../controllers/search.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication to all search routes
router.use(protect);

// Routes for searching
router.get('/todos', searchController.searchTodos);
router.post('/todos/sync', searchController.syncTodosIndex);

export default router; 