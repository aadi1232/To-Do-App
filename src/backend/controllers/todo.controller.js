import * as todoService from '../services/todo.service.js';

export async function createTodo(req, res) {
    try {
        const todo = await todoService.createTodo(req.user._id, req.body);
        res.status(201).json(todo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function getTodos(req, res) {
    try {
        const todos = await todoService.getTodosByUser(req.user._id);
        res.json(todos);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}