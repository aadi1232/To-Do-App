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
      return res.status(400).json({ message: 'Group ID is required' });
    }
    
    // Verify user has access to this group
    const hasAccess = await groupTodoService.userHasAccessToGroup(req.user._id, groupId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this group' });
    }
    
    // Get all group todos
    const todos = await groupTodoService.getTodosByGroup(groupId);
    console.log(`Found ${todos.length} group todos to sync`);
    
    // Sync todos to Typesense
    const success = await typesenseService.syncGroupTodosToTypesense(todos);
    
    if (success) {
      return res.json({ 
        message: 'Group todos successfully indexed',
        count: todos.length
      });
    } else {
      return res.status(500).json({ message: 'Failed to index group todos' });
    }
  } catch (error) {
    console.error('Error syncing group todos:', error);
    return res.status(500).json({ 
      message: 'Failed to sync group todos',
      error: error.message || 'Unknown error'
    });
  }
} 