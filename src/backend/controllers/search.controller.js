import * as todoService from '../services/todo.service.js';
import * as typesenseService from '../services/typesense.service.js';

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
    return res.status(500).json({ 
      message: 'Failed to search todos',
      error: error.message || 'Unknown error'
    });
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
        count: todos.length
      });
    } else {
      console.error('Failed to sync todos to Typesense');
      return res.status(500).json({ message: 'Failed to index todos' });
    }
  } catch (error) {
    console.error('Error syncing todos index:', error);
    return res.status(500).json({ 
      message: 'Failed to sync todos index',
      error: error.message || 'Unknown error'
    });
  }
} 