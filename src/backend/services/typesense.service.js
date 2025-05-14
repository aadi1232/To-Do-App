import Typesense from 'typesense';
import dotenv from 'dotenv';

dotenv.config();

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

// Initialize Typesense collection
export async function initTypesense() {
  try {
    // Check if collection exists
    const collections = await typesenseClient.collections().retrieve();
    const todoCollection = collections.find(collection => collection.name === 'todos');
    
    if (!todoCollection) {
      // Create the collection if it doesn't exist
      await typesenseClient.collections().create(todoSchema);
      console.log('Typesense todo collection created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Typesense initialization error:', error);
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
    
    const searchParameters = {
      q: query.trim(),
      query_by: 'title',
      filter_by: `userId:${userId}`,
      sort_by: 'created_at:desc',
      per_page: 100,
      highlight_full_fields: 'title'  // Enable full-field highlighting for better results
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
    // Instead of rethrowing, return an empty result set with the error details
    return { 
      hits: [], 
      error: error.message || 'Unknown error',
      isError: true
    };
  }
}

/**
 * Delete a todo from the index
 * @param {string} todoId - The todo ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTodoFromIndex(todoId) {
  try {
    await typesenseClient.collections('todos').documents(todoId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting todo from index:', error);
    return false;
  }
}

/**
 * Sync multiple todos to Typesense
 * @param {Array<Object>} todos - Array of todo objects
 * @returns {Promise<boolean>} Success status
 */
export async function syncTodosToTypesense(todos) {
  try {
    // Map todos to Typesense documents
    const documents = todos.map(todo => ({
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      userId: todo.user.toString(),
      created_at: Math.floor(new Date(todo.createdAt).getTime() / 1000)
    }));

    if (documents.length > 0) {
      // Import in batch
      await typesenseClient.collections('todos').documents().import(documents, { action: 'upsert' });
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing todos to Typesense:', error);
    return false;
  }
} 