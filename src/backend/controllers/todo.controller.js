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

export async function getTodoById(req, res) {
	try {
		const { todoId } = req.params;
		const todo = await todoService.getTodoById(req.user._id, todoId);
		
		if (!todo) {
			return res.status(404).json({ message: 'Todo not found' });
		}
		
		res.json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function updateTodo(req, res) {
	try {
		const { todoId } = req.params;
		const todo = await todoService.updateTodo(req.user._id, todoId, req.body);
		res.json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function deleteTodo(req, res) {
	try {
		const { todoId } = req.params;
		const result = await todoService.deleteTodo(req.user._id, todoId);
		res.json(result);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function createGroupTodo(req, res) {
	try {
		const { groupId } = req.params;
		const todo = await todoService.createGroupTodo(req.user._id, groupId, req.body);
		res.status(201).json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function getGroupTodos(req, res) {
	try {
		const { groupId } = req.params;
		const todos = await todoService.getGroupTodos(req.user._id, groupId);
		res.json(todos);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function updateGroupTodo(req, res) {
	try {
		const { todoId } = req.params;
		const todo = await todoService.updateGroupTodo(req.user._id, todoId, req.body);
		res.json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function deleteGroupTodo(req, res) {
	try {
		const { todoId } = req.params;
		await todoService.deleteGroupTodo(req.user._id, todoId);
		res.json({ message: 'Todo deleted successfully' });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}
