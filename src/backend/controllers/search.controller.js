import * as todoService from '../services/todo.service.js';
import * as typesenseService from '../services/typesense.service.js';
import * as groupTodoService from '../services/groupTodo.service.js';
import Todo from '../models/todo.model.js';

/**
 * Search todos for the current user
 */
export async function searchTodos(req, res) {
	try {
		// Log the entire request object to debug
		console.log('Search request received:');
		console.log('URL:', req.url);
		console.log('Query params:', req.query);
		console.log('Request params:', req.params);
		console.log('Request path:', req.path);

		// Extract query from different possible locations
		let query = req.query.query;

		// If query not found in query params, check URL for manual parsing
		if (!query && req.url && req.url.includes('?')) {
			const urlParts = req.url.split('?');
			if (urlParts.length > 1) {
				const queryParams = new URLSearchParams(urlParts[1]);
				query = queryParams.get('query');
				console.log('Extracted query from URL manually:', query);
			}
		}

		console.log('Express search controller received query:', query);

		if (!query || query.trim() === '') {
			return res.status(400).json({ message: 'Search query is required' });
		}

		// Search todos using Typesense
		console.log(`Searching Typesense with user ID: ${req.user._id} and query: ${query}`);
		const searchResults = await typesenseService.searchTodos(req.user._id, query.trim());

		// Log result summary
		console.log(`Search found ${searchResults.hits?.length || 0} results`);

		// Return the results
		return res.status(200).json(searchResults);
	} catch (error) {
		console.error('Error searching todos:', error);
		return res.status(500).json({ message: 'Error searching todos', error: error.message });
	}
}

/**
 * Sync all user todos to Typesense index
 */
export async function syncTodosIndex(req, res) {
	try {
		// Get all user todos
		console.log(`Syncing todos for user: ${req.user._id}`);
		const todos = await todoService.getTodosByUser(req.user._id);
		console.log(`Found ${todos.length} todos to sync`);

		// Sync todos to Typesense
		const success = await typesenseService.syncTodosToTypesense(todos);

		if (success) {
			console.log('Todos successfully synced to Typesense');
			return res.status(200).json({
				message: 'Todos successfully indexed',
				count: todos.length,
				fallback: false
			});
		} else {
			console.error('Failed to sync todos to Typesense');
			return res.status(200).json({
				message: 'Using fallback search (Typesense not available)',
				count: todos.length,
				fallback: true
			});
		}
	} catch (error) {
		console.error('Error syncing todos index:', error);
		return res.status(500).json({
			message: 'Failed to sync todos index',
			error: error.message || 'Unknown error',
			fallback: true
		});
	}
}

/**
 * Search group todos
 */
export async function searchGroupTodos(req, res) {
	try {
		console.log('Group search request received:');
		console.log('URL:', req.url);
		console.log('Query params:', req.query);

		// Extract query
		let query = req.query.query;
		const groupId = req.query.groupId;

		if (!query || query.trim() === '') {
			return res.status(400).json({ message: 'Search query is required' });
		}

		if (!groupId) {
			return res.status(400).json({ message: 'Group ID is required' });
		}

		console.log(`Searching Typesense for group ID: ${groupId} with query: ${query}`);

		// Verify user has access to this group
		const hasAccess = await groupTodoService.userHasAccessToGroup(req.user._id, groupId);
		if (!hasAccess) {
			return res.status(403).json({ message: 'You do not have access to this group' });
		}

		// Search todos using Typesense
		const searchResults = await typesenseService.searchGroupTodos(groupId, query.trim());

		// Log result summary
		console.log(`Group search found ${searchResults.hits?.length || 0} results`);

		// Return the results
		return res.status(200).json(searchResults);
	} catch (error) {
		console.error('Error searching group todos:', error);
		return res.status(500).json({ message: 'Error searching group todos', error: error.message });
	}
}

/**
 * Sync all group todos to Typesense index
 */
export async function syncGroupTodosIndex(req, res) {
	try {
		console.log('Starting group todos sync:');
		console.log('Request URL:', req.url);
		console.log('Query params:', req.query);

		const groupId = req.query.groupId;

		if (!groupId) {
			console.error('Missing groupId in sync request');
			return res.status(400).json({
				message: 'Group ID is required',
				fallback: true
			});
		}

		// Verify user has access to this group
		try {
			const hasAccess = await groupTodoService.userHasAccessToGroup(req.user._id, groupId);
			if (!hasAccess) {
				console.error(`User ${req.user._id} has no access to group ${groupId}`);
				return res.status(403).json({
					message: 'You do not have access to this group',
					fallback: true
				});
			}
		} catch (accessErr) {
			console.error('Error checking group access:', accessErr);
			// Return 200 with fallback enabled rather than error
			return res.status(200).json({
				message: 'Using fallback search due to access check error',
				error: accessErr.message,
				fallback: true
			});
		}

		// Get all group todos
		let todos = [];
		try {
			console.log(`Fetching todos for group: ${groupId}`);
			todos = await groupTodoService.getTodosByGroup(groupId);
			console.log(`Found ${todos.length} group todos to sync`);
		} catch (todosErr) {
			console.error('Error fetching group todos:', todosErr);
			return res.status(200).json({
				message: 'Using fallback search due to todos fetch error',
				error: todosErr.message,
				fallback: true
			});
		}

		// Sync todos to Typesense
		try {
			const success = await typesenseService.syncGroupTodosToTypesense(todos);

			if (success) {
				console.log('Group todos successfully synced to Typesense');
				return res.status(200).json({
					message: 'Group todos successfully indexed',
					count: todos.length,
					fallback: false
				});
			} else {
				console.log('Typesense not available, using fallback search');
				return res.status(200).json({
					message: 'Using fallback search (Typesense not available)',
					count: todos.length,
					fallback: true
				});
			}
		} catch (syncErr) {
			console.error('Error during Typesense sync:', syncErr);
			return res.status(200).json({
				message: 'Using fallback search due to sync error',
				error: syncErr.message,
				fallback: true
			});
		}
	} catch (error) {
		console.error('Unhandled error in group todos sync:', error);
		// Always use a 200 response with fallback=true instead of 500 error
		return res.status(200).json({
			message: 'Using fallback search due to unhandled error',
			error: error.message || 'Unknown error',
			fallback: true
		});
	}
}

/**
 * Sync all user todos to Typesense
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function syncTodos(req, res) {
	try {
		const userId = req.user._id;

		// Fetch all todos for this user
		const todos = await Todo.find({ user: userId, group: null });

		// Sync to Typesense
		const success = await typesenseService.syncTodosToTypesense(todos);

		return res.status(200).json({
			success,
			message: success ? 'Todos synced successfully' : 'Sync skipped, Typesense not available',
			fallback: !success
		});
	} catch (error) {
		console.error('Error syncing todos:', error);
		return res.status(500).json({ message: 'Error syncing todos', error: error.message });
	}
}

/**
 * Sync all group todos to Typesense
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function syncGroupTodos(req, res) {
	try {
		const { groupId } = req.query;

		if (!groupId) {
			return res.status(400).json({ message: 'Group ID is required' });
		}

		// Fetch all todos for this group
		const todos = await Todo.find({ group: groupId });

		// Sync to Typesense
		const success = await typesenseService.syncGroupTodosToTypesense(todos);

		return res.status(200).json({
			success,
			message: success
				? 'Group todos synced successfully'
				: 'Sync skipped, Typesense not available',
			fallback: !success
		});
	} catch (error) {
		console.error('Error syncing group todos:', error);
		return res.status(500).json({ message: 'Error syncing group todos', error: error.message });
	}
}
