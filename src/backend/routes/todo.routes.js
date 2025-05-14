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
router.post('/group/:groupId', createGroupTodo);
router.get('/group/:groupId', getGroupTodos);
router.put('/group/:todoId', updateGroupTodo);
router.delete('/group/:todoId', deleteGroupTodo);

export default router;
