import { writable, get } from 'svelte/store';

// Define the Todo type
/**
 * @typedef {Object} Todo
 * @property {string} _id - The todo ID
 * @property {string} title - The todo title
 * @property {boolean} completed - Whether the todo is completed
 * @property {string} user - The user ID who created the todo
 * @property {Date} createdAt - The creation date
 * @property {Date} updatedAt - The last update date
 */

/**
 * Creates a todos store with methods to manage todo items
 */
function createTodosStore() {
  const { subscribe, set, update } = writable(/** @type {Todo[]} */[]);
  
  const store = {
    subscribe,
    /**
     * Fetches todos from the server and updates the store
     * @returns {Promise<Todo[]>}
     */
    fetchTodos: async () => {
      try {
        const response = await fetch('/api/todos');
        if (!response.ok) throw new Error('Failed to fetch todos');
        
        const todos = await response.json();
        set(todos);
        return todos;
      } catch (error) {
        console.error('Error fetching todos:', error);
        return [];
      }
    },
    
    /**
     * Adds a new todo item
     * @param {string} title - The todo title
     * @returns {Promise<Todo|null>}
     */
    addTodo: async (title) => {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title })
        });
        
        if (!response.ok) throw new Error('Failed to add todo');
        
        const newTodo = await response.json();
        
        update(todos => [newTodo, ...todos]);
        return newTodo;
      } catch (error) {
        console.error('Error adding todo:', error);
        return null;
      }
    },
    
    /**
     * Toggles the completed status of a todo
     * @param {string} id - The todo ID
     */
    toggleTodo: async (id) => {
      update(todos => {
        const todo = todos.find(t => t._id === id);
        if (!todo) return todos;
        
        // Create a new array with the updated todo
        return todos.map(t => 
          t._id === id ? { ...t, completed: !t.completed } : t
        );
      });
      
      // We're optimistically updating UI, but we should also update server
      try {
        const currentTodos = get(store);
        const todo = currentTodos.find(t => t._id === id);
        
        if (todo) {
          await fetch(`/api/todos/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: todo.completed })
          });
        }
      } catch (error) {
        console.error('Error toggling todo:', error);
        // Ideally, we would revert the optimistic update here
      }
    }
  };
  
  return store;
}

export const todos = createTodosStore();
