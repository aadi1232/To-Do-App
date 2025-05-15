import * as todoService from '../services/todo.service.js';
import * as socketService from '../services/socket.service.js';

export async function createTodo(req, res) {
	try {
		const todo = await todoService.createTodo(req.user._id, req.body);
		if (todo.group) {
			socketService.notifyTodoChange(
				todo.group.toString(),
				'added',
				{
					_id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed
				},
				req.user._id.toString(),
				req.user.username
			);
		}
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
		if (todo.group) {
			socketService.notifyTodoChange(
				todo.group.toString(),
				'updated',
				{
					_id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed
				},
				req.user._id.toString(),
				req.user.username
			);
		}
		res.json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function deleteTodo(req, res) {
	try {
		const { todoId } = req.params;
		const result = await todoService.deleteTodo(req.user._id, todoId);
		if (result.group) {
			socketService.notifyTodoChange(
				result.group.toString(),
				'deleted',
				{
					_id: result._id.toString(),
					title: result.title,
					completed: result.completed
				},
				req.user._id.toString(),
				req.user.username
			);
		}
		res.json(result);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function createGroupTodo(req, res) {
	try {
		const { groupId } = req.params;
		const todo = await todoService.createGroupTodo(req.user._id, groupId, req.body);

		// Send notification through socket
		if (todo && todo.group) {
			// Extract group name from the request body if provided
			const groupName = req.body.groupName || '';

			socketService.notifyTodoChange(
				todo.group.toString(),
				'added',
				{
					_id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed
				},
				req.user._id.toString(),
				req.user.username,
				groupName
			);
		}

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

		// Send notification through socket for real-time updates
		if (todo && todo.group) {
			// Determine the event type based on what was updated
			let eventType = 'updated';
			if ('completed' in req.body) {
				eventType = req.body.completed ? 'completed' : 'updated';
			}

			// Extract group name from the request body if provided
			const groupName = req.body.groupName || '';

			socketService.notifyTodoChange(
				todo.group.toString(),
				eventType,
				{
					_id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed
				},
				req.user._id.toString(),
				req.user.username,
				groupName
			);
		}

		res.json(todo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}

export async function deleteGroupTodo(req, res) {
	try {
		const { todoId } = req.params;
		const todoData = await todoService.deleteGroupTodo(req.user._id, todoId);

		// If the group ID is available, send a notification through socket
		if (todoData && todoData.group) {
			// We can't get the group name from the body in DELETE requests
			// A client-side workaround is needed for this
			socketService.notifyTodoChange(
				todoData.group.toString(),
				'deleted',
				{
					_id: todoData._id.toString(),
					title: todoData.title,
					completed: todoData.completed
				},
				req.user._id.toString(),
				req.user.username
			);
		}

		res.json({ message: 'Todo deleted successfully' });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}
