import Todo from '../models/todo.model.js';
import Group from '../models/group.model.js';

/**
 * Get all todos for a specific group
 * @param {string} groupId - The group ID
 * @returns {Promise<Array<any>>} - Array of todos
 */
export async function getTodosByGroup(groupId) {
	try {
		// Fetch todos for the group
		const todos = await Todo.find({ group: groupId })
			.sort({ createdAt: -1 })
			.populate('createdBy', 'username email profileImage');

		return todos;
	} catch (error) {
		console.error('Error fetching group todos:', error);
		throw new Error('Failed to fetch group todos');
	}
}

/**
 * Check if a user has access to a group
 * @param {string} userId - The user ID
 * @param {string} groupId - The group ID
 * @returns {Promise<boolean>} - Whether the user has access
 */
export async function userHasAccessToGroup(userId, groupId) {
	try {
		// Check if user is a member of the group with accepted invitation
		const group = await Group.findOne({
			_id: groupId,
			'members.user': userId,
			'members.invitationStatus': 'accepted'
		});

		return !!group; // Convert to boolean
	} catch (error) {
		console.error('Error checking group access:', error);
		return false;
	}
}

/**
 * Create a new todo in a group
 * @param {string} userId - The user ID
 * @param {string} groupId - The group ID
 * @param {Object} data - The todo data
 * @returns {Promise<Object>} - The created todo
 */
export async function createTodo(userId, groupId, data) {
	try {
		const todoData = {
			...data,
			user: userId,
			group: groupId,
			createdBy: userId
		};

		const todo = await Todo.create(todoData);
		return todo;
	} catch (error) {
		console.error('Error creating group todo:', error);
		throw new Error('Failed to create group todo');
	}
}

/**
 * Update a group todo
 * @param {string} todoId - The todo ID
 * @param {Object} data - The updated data
 * @returns {Promise<Object>} - The updated todo
 */
export async function updateTodo(todoId, data) {
	try {
		const todo = await Todo.findById(todoId);

		if (!todo) {
			throw new Error('Todo not found');
		}

		Object.assign(todo, data);
		return await todo.save();
	} catch (error) {
		console.error('Error updating group todo:', error);
		throw new Error('Failed to update group todo');
	}
}

/**
 * Delete a group todo
 * @param {string} todoId - The todo ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export async function deleteTodo(todoId) {
	try {
		const todo = await Todo.findById(todoId);

		if (!todo) {
			throw new Error('Todo not found');
		}

		await Todo.deleteOne({ _id: todoId });
		return { message: 'Todo deleted successfully' };
	} catch (error) {
		console.error('Error deleting group todo:', error);
		throw new Error('Failed to delete group todo');
	}
}
