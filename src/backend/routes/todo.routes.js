import express from 'express';
import {
	createTodo,
	getTodos,
	getTodoById,
	updateTodo,
	deleteTodo,
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
router.get('/:todoId', getTodoById);
router.put('/:todoId', updateTodo);
router.delete('/:todoId', deleteTodo);

// Group todo routes
router.post('/by-group/:groupId', createGroupTodo);
router.get('/by-group/:groupId', getGroupTodos);
router.put('/by-id/:todoId', updateGroupTodo);
router.delete('/by-id/:todoId', deleteGroupTodo);

export default router;
