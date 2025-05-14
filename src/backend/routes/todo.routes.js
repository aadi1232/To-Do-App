import express from 'express';
import { createTodo, getTodos } from '../controllers/todo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTodo);
router.get('/', getTodos);

export default router;