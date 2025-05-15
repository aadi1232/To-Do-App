import { writable } from 'svelte/store';
import type { Todo } from '../types';
import type { CreateTodoData } from '../types/index';
import { 
  getUserTodos, 
  createTodo as apiCreateTodo, 
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo 
} from '../api/todos';

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
  const { subscribe, set, update } = writable<Todo[]>([]);
  
  return {
    subscribe,
    
    /**
     * Fetches todos from the server and updates the store
     * @returns {Promise<Todo[]>}
     */
    fetchTodos: async () => {
      try {
        const todos = await getUserTodos();
        set(todos);
        return todos;
      } catch (error) {
        console.error('Error fetching todos:', error);
        return [];
      }
    },
    
    /**
     * Adds a new todo item
     * @param {string | CreateTodoData} input - The todo title or data
     * @returns {Promise<Todo|null>}
     */
    addTodo: async (input: string | CreateTodoData) => {
      try {
        const todoData = typeof input === 'string' ? { title: input } : input;
        const newTodo = await apiCreateTodo(todoData);
        update(todos => [newTodo, ...todos]);
        return newTodo;
      } catch (error) {
        console.error('Error adding todo:', error);
        return null;
      }
    },
    
    /**
     * Updates a todo item
     * @param {string} id - The todo ID
     * @param {Partial<CreateTodoData>} data - The data to update
     * @returns {Promise<Todo|null>}
     */
    updateTodo: async (id: string, data: Partial<CreateTodoData>) => {
      let currentTodo: Todo | undefined = undefined;
      
      update(todos => {
        const todoIndex = todos.findIndex(t => t._id === id);
        if (todoIndex === -1) return todos;
        
        currentTodo = todos[todoIndex];
        const updatedTodos = [...todos];
        updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], ...data };
        
        return updatedTodos;
      });
      
      try {
        const updatedTodo = await apiUpdateTodo(id, data);
        
        update(todos => todos.map(t => 
          t._id === id ? updatedTodo : t
        ));
        
        return updatedTodo;
      } catch (error) {
        console.error('Error updating todo:', error);
        
        if (currentTodo) {
          update(todos => todos.map(t => 
            t._id === id ? currentTodo! : t
          ));
        }
        
        return null;
      }
    },
    
    /**
     * Toggles the completed status of a todo
     * @param {string} id - The todo ID
     * @returns {Promise<Todo|null>}
     */
    toggleTodo: async (id: string) => {
      let currentTodo: Todo | undefined = undefined;
      
      update(todos => {
        const todo = todos.find(t => t._id === id);
        if (!todo) return todos;
        
        currentTodo = { ...todo };
        
        return todos.map(t => 
          t._id === id ? { ...t, completed: !t.completed } : t
        );
      });
      
      if (currentTodo) {
        return await apiUpdateTodo(id, { completed: !currentTodo.completed });
      }
      
      return null;
    },
    
    /**
     * Deletes a todo item
     * @param {string} id - The todo ID
     * @returns {Promise<boolean>}
     */
    deleteTodo: async (id: string) => {
      let removedTodo: Todo | undefined = undefined;
      let todoIndex = -1;
      
      update(todos => {
        todoIndex = todos.findIndex(t => t._id === id);
        if (todoIndex === -1) return todos;
        
        removedTodo = todos[todoIndex];
        const updatedTodos = [...todos];
        updatedTodos.splice(todoIndex, 1);
        
        return updatedTodos;
      });
      
      try {
        await apiDeleteTodo(id);
        return true;
      } catch (error) {
        console.error('Error deleting todo:', error);
        
        if (removedTodo && todoIndex !== -1) {
          update(todos => {
            const updatedTodos = [...todos];
            updatedTodos.splice(todoIndex, 0, removedTodo!);
            return updatedTodos;
          });
        }
        
        return false;
      }
    }
  };
}

export const todos = createTodosStore();
