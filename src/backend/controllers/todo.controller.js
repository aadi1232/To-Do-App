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

		// First send the real-time notification through socket
		if (todo && todo.group) {
			// Extract group name from the request body if provided
			const groupName = req.body.groupName || '';

			// Send real-time notification using socket
			socketService.notifyTodoChange(
				todo.group.toString(),
				'added',
				{
					_id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed,
					taggedMembers: todo.taggedMembers ? todo.taggedMembers.map(m => m.toString()) : []
				},
				req.user._id.toString(),
				req.user.username,
				groupName
			);

			try {
				// Prepare notification message for the group
				const message = `${req.user.username} added a new todo in ${groupName || 'the group'}: ${todo.title}`;

				// Special notification for tagged members
				if (todo.taggedMembers && todo.taggedMembers.length > 0) {
					// For each tagged member, create a personalized notification
					for (const memberId of todo.taggedMembers) {
						const tagNotification = await fetch(
							`${req.protocol}://${req.get('host')}/api/notifications`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Cookie: req.headers.cookie,
									Authorization: req.headers.authorization || ''
								},
								body: JSON.stringify({
									recipient: memberId.toString(),
									type: 'todo:tagged',
									message: `${req.user.username} tagged you in a todo: ${todo.title}`,
									relatedGroup: groupId,
									relatedTodo: todo._id.toString(),
									data: {
										todoTitle: todo.title,
										groupName: groupName || '',
										taggedBy: req.user.username
									}
								})
							}
						);

						if (!tagNotification.ok) {
							console.error('Failed to create tag notification:', await tagNotification.text());
						}
					}
				}

				// Create regular group notification
				const notificationResult = await fetch(
					`${req.protocol}://${req.get('host')}/api/notifications/group`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Cookie: req.headers.cookie,
							Authorization: req.headers.authorization || ''
						},
						body: JSON.stringify({
							groupId: todo.group.toString(),
							type: 'todo:added',
							message,
							todoId: todo._id.toString(),
							todoTitle: todo.title
						})
					}
				);

				if (!notificationResult.ok) {
					console.error('Failed to create notifications:', await notificationResult.text());
				}
			} catch (notifyErr) {
				// Don't fail the main request if notification creation fails
				console.error('Error creating notifications:', notifyErr);
			}
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
			// Send real-time notification using socket
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

			// Also create persistent notifications for all group members
			try {
				// Get group name if possible (might need to fetch it)
				let groupName = '';
				try {
					const Group = (await import('../models/group.model.js')).default;
					const group = await Group.findById(todoData.group);
					if (group) {
						groupName = group.name;
					}
				} catch (groupErr) {
					console.error('Error fetching group name:', groupErr);
				}

				// Prepare notification message
				const message = `${req.user.username} deleted a todo from ${groupName || 'the group'}: ${todoData.title}`;

				// Make internal request to notification service
				const notificationResult = await fetch(
					`${req.protocol}://${req.get('host')}/api/notifications/group`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Cookie: req.headers.cookie, // Forward authentication
							Authorization: req.headers.authorization || ''
						},
						body: JSON.stringify({
							groupId: todoData.group.toString(),
							type: 'todo:deleted',
							message,
							todoId: todoData._id.toString(),
							todoTitle: todoData.title
						})
					}
				);

				if (!notificationResult.ok) {
					console.error('Failed to create notifications:', await notificationResult.text());
				}
			} catch (notifyErr) {
				// Don't fail the main request if notification creation fails
				console.error('Error creating notifications:', notifyErr);
			}
		}

		res.json({ message: 'Todo deleted successfully' });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
}
