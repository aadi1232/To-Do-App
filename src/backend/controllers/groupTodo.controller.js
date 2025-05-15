import * as groupTodoService from '../services/groupTodo.service.js';
import * as typesenseService from '../services/typesense.service.js';

/**
 * Search todos for a specific group
 */
export async function searchGroupTodos(req, res) {
	try {
		console.log('Group search request received:');
		console.log('URL:', req.url);
		console.log('Query params:', req.query);

		// Extract query from different possible locations
		let query = req.query.query;
		let groupId = req.query.groupId;

		// If not found in query params, try to extract from URL for SvelteKit requests
		if ((!query || !groupId) && req.url && req.url.includes('?')) {
			const urlParts = req.url.split('?');
			if (urlParts.length > 1) {
				const queryParams = new URLSearchParams(urlParts[1]);

				if (!query) {
					query = queryParams.get('query');
					console.log('Extracted query from URL manually:', query);
				}

				if (!groupId) {
					groupId = queryParams.get('groupId');
					console.log('Extracted groupId from URL manually:', groupId);
				}
			}
		}

		console.log(`Group Todo Controller - Final params: query=${query}, groupId=${groupId}`);

		if (!query || !query.trim()) {
			return res.status(400).json({ message: 'Search query is required' });
		}

		if (!groupId) {
			return res.status(400).json({ message: 'Group ID is required' });
		}

		// Verify user has access to this group
		const hasAccess = await groupTodoService.userHasAccessToGroup(req.user._id, groupId);
		if (!hasAccess) {
			return res.status(403).json({ message: 'You do not have access to this group' });
		}

		// Search todos using Typesense
		const searchResults = await typesenseService.searchGroupTodos(groupId, query.trim());

		// Log results summary
		console.log(`Group search found ${searchResults.hits?.length || 0} results`);

		return res.json(searchResults);
	} catch (error) {
		console.error('Error searching group todos:', error);
		return res.status(500).json({
			message: 'Failed to search group todos',
			error: error.message || 'Unknown error'
		});
	}
}

/**
 * Sync todos for a specific group to Typesense
 */
export async function syncGroupTodosIndex(req, res) {
	try {
		console.log('Group sync request received:');
		console.log('URL:', req.url);
		console.log('Query params:', req.query);
		console.log('Request body:', req.body);
		console.log('User ID:', req.user?._id);

		// Extract groupId from query params
		let groupId = req.query.groupId;

		// If not found in query params, try to extract from URL for SvelteKit requests
		if (!groupId && req.url && req.url.includes('?')) {
			const urlParts = req.url.split('?');
			if (urlParts.length > 1) {
				const queryParams = new URLSearchParams(urlParts[1]);
				groupId = queryParams.get('groupId');
				console.log('Extracted groupId from URL manually:', groupId);
			}
		}

		console.log(`Group Todo Controller - Final params: groupId=${groupId}`);

		if (!groupId) {
			console.error('Missing groupId in sync request');
			return res.status(200).json({
				message: 'Group ID is required',
				fallback: true
			});
		}

		// Verify user has access to this group
		try {
			const hasAccess = await groupTodoService.userHasAccessToGroup(req.user._id, groupId);
			if (!hasAccess) {
				console.error(`User ${req.user._id} has no access to group ${groupId}`);
				return res.status(200).json({
					message: 'You do not have access to this group',
					fallback: true
				});
			}
		} catch (accessErr) {
			console.error('Error checking group access:', accessErr);
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
		// Always return 200 with fallback enabled instead of 500 error
		return res.status(200).json({
			message: 'Using fallback search due to unhandled error',
			error: error.message || 'Unknown error',
			fallback: true
		});
	}
}
