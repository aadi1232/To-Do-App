import express from 'express';
import {
	createTodo,
	getTodos,
	createGroupTodo,
	getGroupTodos,
	updateGroupTodo,
	deleteGroupTodo
} from '../controllers/todo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Personal todo routes
router.post('/', createTodo);
router.get('/', getTodos);

// Group todo routes
router.post('/by-group/:groupId', createGroupTodo);
router.get('/by-group/:groupId', getGroupTodos);
router.put('/by-id/:todoId', updateGroupTodo);
router.delete('/by-id/:todoId', deleteGroupTodo);

export default router;
