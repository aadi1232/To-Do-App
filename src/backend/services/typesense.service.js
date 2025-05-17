import Typesense from 'typesense';
import dotenv from 'dotenv';

dotenv.config();

// Flag to track Typesense availability
let typesenseAvailable = false;

// Configure the Typesense client
const typesenseClient = new Typesense.Client({
	nodes: [
		{
			host: process.env.TYPESENSE_HOST || 'localhost',
			port: parseInt(process.env.TYPESENSE_PORT || '8108'),
			protocol: process.env.TYPESENSE_PROTOCOL || 'http'
		}
	],
	apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
	connectionTimeoutSeconds: 2
});

// Todo collection schema
const todoSchema = {
	name: 'todos',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'completed', type: 'bool' },
		{ name: 'userId', type: 'string' },
		{ name: 'created_at', type: 'int64' }
	],
	default_sorting_field: 'created_at'
};

// Group Todo collection schema
const groupTodoSchema = {
	name: 'group_todos',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'completed', type: 'bool' },
		{ name: 'groupId', type: 'string' },
		{ name: 'createdBy', type: 'string' }, // We'll store the user ID
		{ name: 'created_at', type: 'int64' }
	],
	default_sorting_field: 'created_at'
};

// Initialize Typesense collection
export async function initTypesense() {
	try {
		// Check if we're in a production environment and using localhost (which won't work in cloud)
		const isProduction = process.env.NODE_ENV === 'production';
		const isLocalhost =
			(process.env.TYPESENSE_HOST || 'localhost') === 'localhost' ||
			(process.env.TYPESENSE_HOST || '') === '127.0.0.1';

		// If we're in production but trying to use localhost, mark as unavailable and skip initialization
		if (isProduction && isLocalhost) {
			console.log('In production environment with localhost Typesense configuration.');
			console.log(
				'Using fallback search instead of attempting to connect to non-existent localhost service.'
			);
			typesenseAvailable = false;
			return false;
		}

		// Attempt to check health
		try {
			const health = await typesenseClient.health.retrieve();
			console.log('Typesense health check successful:', health);
		} catch (healthError) {
			console.error('Typesense health check failed:', healthError);
			console.log('Using fallback search as Typesense is not available');
			typesenseAvailable = false;
			return false;
		}

		// If we get here, health check passed, continue with normal initialization
		const collections = await typesenseClient.collections().retrieve();

		// Check for personal todos collection
		const todoCollection = collections.find((collection) => collection.name === 'todos');
		if (!todoCollection) {
			// Create the collection if it doesn't exist
			await typesenseClient.collections().create(todoSchema);
			console.log('Typesense todo collection created successfully');
		}

		// Check for group todos collection
		const groupTodoCollection = collections.find((collection) => collection.name === 'group_todos');
		if (!groupTodoCollection) {
			// Create the collection if it doesn't exist
			await typesenseClient.collections().create(groupTodoSchema);
			console.log('Typesense group todo collection created successfully');
		}

		// Mark Typesense as available
		typesenseAvailable = true;
		return true;
	} catch (error) {
		console.error('Typesense initialization error:', error);
		typesenseAvailable = false;
		return false;
	}
}

/**
 * Index a todo in Typesense
 * @param {Object} todo - The todo object to index
 * @param {string} todo._id - The todo ID
 * @param {string} todo.title - The todo title
 * @param {boolean} todo.completed - Whether the todo is completed
 * @param {Object} todo.user - The user ID (or object with toString())
 * @param {Date} todo.createdAt - Creation date
 * @returns {Promise<boolean>} Success status
 */
export async function indexTodo(todo) {
	if (!typesenseAvailable) return false;

	try {
		const document = {
			id: todo._id.toString(),
			title: todo.title,
			completed: todo.completed,
			userId: todo.user.toString(),
			created_at: Math.floor(new Date(todo.createdAt).getTime() / 1000)
		};

		await typesenseClient.collections('todos').documents().upsert(document);
		return true;
	} catch (error) {
		console.error('Error indexing todo:', error);
		return false;
	}
}

/**
 * Index a group todo in Typesense
 * @param {Object} todo - The group todo object to index
 * @returns {Promise<boolean>} Success status
 */
export async function indexGroupTodo(todo) {
	if (!typesenseAvailable) return false;

	try {
		const document = {
			id: todo._id.toString(),
			title: todo.title,
			completed: todo.completed,
			groupId: todo.group.toString(),
			createdBy: todo.createdBy.toString(),
			created_at: Math.floor(new Date(todo.createdAt).getTime() / 1000)
		};

		await typesenseClient.collections('group_todos').documents().upsert(document);
		return true;
	} catch (error) {
		console.error('Error indexing group todo:', error);
		return false;
	}
}

/**
 * Search todos by query
 * @param {string} userId - The user ID
 * @param {string} query - The search query
 * @returns {Promise<Object>} Search results
 */
export async function searchTodos(userId, query) {
	try {
		console.log(`Typesense search service: Searching for "${query}" for user ID: ${userId}`);

		if (!query || query.trim() === '') {
			console.error('Typesense search service: Empty query received');
			return { hits: [] };
		}

		// If Typesense is not available, fallback to basic search
		if (!typesenseAvailable) {
			console.log('Typesense not available, using fallback search');
			return fallbackSearchTodos(userId, query.trim());
		}

		const searchParameters = {
			q: query.trim(),
			query_by: 'title',
			filter_by: `userId:${userId}`,
			sort_by: 'created_at:desc',
			per_page: 100,
			highlight_full_fields: 'title' // Enable full-field highlighting for better results
		};

		console.log('Typesense search parameters:', JSON.stringify(searchParameters));

		const searchResults = await typesenseClient
			.collections('todos')
			.documents()
			.search(searchParameters);

		console.log(`Typesense found ${searchResults.hits?.length || 0} matching todos`);

		return searchResults;
	} catch (error) {
		console.error('Error searching todos in Typesense:', error);
		// On error, use the fallback search
		console.log('Using fallback search due to error');
		return fallbackSearchTodos(userId, query.trim());
	}
}

/**
 * Search group todos by query
 * @param {string} groupId - The group ID
 * @param {string} query - The search query
 * @returns {Promise<Object>} Search results
 */
export async function searchGroupTodos(groupId, query) {
	try {
		console.log(`Typesense search service: Searching for "${query}" for group ID: ${groupId}`);

		if (!query || query.trim() === '') {
			console.error('Typesense search service: Empty query received');
			return { hits: [] };
		}

		// If Typesense is not available, fallback to basic search
		if (!typesenseAvailable) {
			console.log('Typesense not available, using fallback search for group todos');
			return fallbackSearchGroupTodos(groupId, query.trim());
		}

		const searchParameters = {
			q: query.trim(),
			query_by: 'title',
			filter_by: `groupId:${groupId}`,
			sort_by: 'created_at:desc',
			per_page: 100,
			highlight_full_fields: 'title' // Enable full-field highlighting for better results
		};

		console.log('Typesense group search parameters:', JSON.stringify(searchParameters));

		const searchResults = await typesenseClient
			.collections('group_todos')
			.documents()
			.search(searchParameters);

		console.log(`Typesense found ${searchResults.hits?.length || 0} matching group todos`);

		return searchResults;
	} catch (error) {
		console.error('Error searching group todos in Typesense:', error);
		// On error, use the fallback search
		console.log('Using fallback search for group todos due to error');
		return fallbackSearchGroupTodos(groupId, query.trim());
	}
}

/**
 * Delete a todo from the index
 * @param {string} todoId - The todo ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTodoFromIndex(todoId) {
	if (!typesenseAvailable) return false;

	try {
		await typesenseClient.collections('todos').documents(todoId).delete();
		return true;
	} catch (error) {
		console.error('Error deleting todo from index:', error);
		return false;
	}
}

/**
 * Delete a group todo from the index
 * @param {string} todoId - The group todo ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteGroupTodoFromIndex(todoId) {
	if (!typesenseAvailable) return false;

	try {
		await typesenseClient.collections('group_todos').documents(todoId).delete();
		return true;
	} catch (error) {
		console.error('Error deleting group todo from index:', error);
		return false;
	}
}

/**
 * Sync multiple todos to Typesense
 * @param {Array<Object>} todos - Array of todo objects
 * @returns {Promise<boolean>} Success status
 */
export async function syncTodosToTypesense(todos) {
	if (!typesenseAvailable) {
		console.log('Typesense not available, skipping sync');
		return false;
	}

	try {
		// Map todos to Typesense documents
		const documents = todos.map((todo) => ({
			id: todo._id.toString(),
			title: todo.title,
			completed: todo.completed,
			userId: todo.user.toString(),
			created_at: Math.floor(new Date(todo.createdAt).getTime() / 1000)
		}));

		if (documents.length > 0) {
			// Import in batch
			await typesenseClient
				.collections('todos')
				.documents()
				.import(documents, { action: 'upsert' });
		}

		return true;
	} catch (error) {
		console.error('Error syncing todos to Typesense:', error);
		return false;
	}
}

/**
 * Sync multiple group todos to Typesense
 * @param {Array<Object>} todos - Array of group todo objects
 * @returns {Promise<boolean>} Success status
 */
export async function syncGroupTodosToTypesense(todos) {
	if (!typesenseAvailable) {
		console.log('Typesense not available, skipping group todos sync');
		return false;
	}

	try {
		// Map todos to Typesense documents
		const documents = todos.map((todo) => ({
			id: todo._id.toString(),
			title: todo.title,
			completed: todo.completed,
			groupId: todo.group.toString(),
			createdBy: todo.createdBy.toString(),
			created_at: Math.floor(new Date(todo.createdAt).getTime() / 1000)
		}));

		if (documents.length > 0) {
			// Import in batch
			await typesenseClient
				.collections('group_todos')
				.documents()
				.import(documents, { action: 'upsert' });
		}

		return true;
	} catch (error) {
		console.error('Error syncing group todos to Typesense:', error);
		return false;
	}
}

/**
 * Fallback search implementation when Typesense is not available
 * @param {string} userId - The user ID
 * @param {string} query - The search query
 * @returns {Promise<Object>} Search results in Typesense-like format
 */
async function fallbackSearchTodos(userId, query) {
	try {
		// Import todo service to get todos
		const todoService = await import('../services/todo.service.js');

		// Get the user's todos
		const todos = await todoService.getTodosByUser(userId);

		// Filter todos by query (case-insensitive search in title)
		const lowerQuery = query.toLowerCase();
		const matchingTodos = todos.filter((todo) => todo.title.toLowerCase().includes(lowerQuery));

		console.log(`Fallback search found ${matchingTodos.length} matching todos`);

		// Format results in a Typesense-like structure
		const hits = matchingTodos.map((todo) => {
			// Create highlighted text by wrapping matching part with <mark> tags
			const titleLower = todo.title.toLowerCase();
			const start = titleLower.indexOf(lowerQuery);
			let highlightedTitle = todo.title;

			if (start !== -1) {
				const end = start + lowerQuery.length;
				highlightedTitle =
					todo.title.substring(0, start) +
					'<mark>' +
					todo.title.substring(start, end) +
					'</mark>' +
					todo.title.substring(end);
			}

			return {
				document: {
					id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed,
					userId: todo.user.toString()
				},
				highlights: [
					{
						field: 'title',
						snippet: highlightedTitle
					}
				]
			};
		});

		return {
			hits,
			found: hits.length,
			fallback: true // indicate this is from fallback search
		};
	} catch (error) {
		console.error('Error in fallback todo search:', error);
		return { hits: [], found: 0, fallback: true };
	}
}

/**
 * Fallback search implementation for group todos when Typesense is not available
 * @param {string} groupId - The group ID
 * @param {string} query - The search query
 * @returns {Promise<Object>} Search results in Typesense-like format
 */
async function fallbackSearchGroupTodos(groupId, query) {
	try {
		// Import group todo service to get todos
		const groupTodoService = await import('./groupTodo.service.js');

		// Get the group's todos
		const todos = await groupTodoService.getTodosByGroup(groupId);

		// Filter todos by query (case-insensitive search in title)
		const lowerQuery = query.toLowerCase();
		const matchingTodos = todos.filter((todo) => todo.title.toLowerCase().includes(lowerQuery));

		console.log(`Fallback search found ${matchingTodos.length} matching group todos`);

		// Format results in a Typesense-like structure
		const hits = matchingTodos.map((todo) => {
			// Create highlighted text by wrapping matching part with <mark> tags
			const titleLower = todo.title.toLowerCase();
			const start = titleLower.indexOf(lowerQuery);
			let highlightedTitle = todo.title;

			if (start !== -1) {
				const end = start + lowerQuery.length;
				highlightedTitle =
					todo.title.substring(0, start) +
					'<mark>' +
					todo.title.substring(start, end) +
					'</mark>' +
					todo.title.substring(end);
			}

			return {
				document: {
					id: todo._id.toString(),
					title: todo.title,
					completed: todo.completed,
					groupId: todo.group.toString(),
					createdBy: todo.createdBy
				},
				highlights: [
					{
						field: 'title',
						snippet: highlightedTitle
					}
				]
			};
		});

		return {
			hits,
			found: hits.length,
			fallback: true // indicate this is from fallback search
		};
	} catch (error) {
		console.error('Error in fallback group todo search:', error);
		return { hits: [], found: 0, fallback: true };
	}
}
