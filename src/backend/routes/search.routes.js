import express from 'express';
import * as searchController from '../controllers/search.controller.js';
import * as groupTodoController from '../controllers/groupTodo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication to all search routes
router.use(protect);

// Routes for searching personal todos
router.get('/todos', searchController.searchTodos);
router.post('/todos/sync', searchController.syncTodosIndex);

// Routes for searching group todos
router.get('/todos/group', groupTodoController.searchGroupTodos);
router.post('/todos/group/sync', groupTodoController.syncGroupTodosIndex);

export default router; 