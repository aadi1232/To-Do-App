import "clsx";
import { p as pop, d as push } from "../../chunks/index3.js";
import "../../chunks/client.js";
import "socket.io-client";
import { w as writable } from "../../chunks/index2.js";
import { d as deleteTodo, u as updateTodo, c as createTodo, g as getUserTodos } from "../../chunks/todos.js";
function createTodosStore() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    /**
     * Fetches todos from the server and updates the store
     * @returns {Promise<Todo[]>}
     */
    fetchTodos: async () => {
      try {
        const todos2 = await getUserTodos();
        set(todos2);
        return todos2;
      } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
      }
    },
    /**
     * Adds a new todo item
     * @param {string | CreateTodoData} input - The todo title or data
     * @returns {Promise<Todo|null>}
     */
    addTodo: async (input) => {
      try {
        const todoData = typeof input === "string" ? { title: input } : input;
        const newTodo = await createTodo(todoData);
        update((todos2) => [newTodo, ...todos2]);
        return newTodo;
      } catch (error) {
        console.error("Error adding todo:", error);
        return null;
      }
    },
    /**
     * Updates a todo item
     * @param {string} id - The todo ID
     * @param {Partial<CreateTodoData>} data - The data to update
     * @returns {Promise<Todo|null>}
     */
    updateTodo: async (id, data) => {
      let currentTodo = void 0;
      update((todos2) => {
        const todoIndex = todos2.findIndex((t) => t._id === id);
        if (todoIndex === -1) return todos2;
        currentTodo = todos2[todoIndex];
        const updatedTodos = [...todos2];
        updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], ...data };
        return updatedTodos;
      });
      try {
        const updatedTodo = await updateTodo(id, data);
        update((todos2) => todos2.map(
          (t) => t._id === id ? updatedTodo : t
        ));
        return updatedTodo;
      } catch (error) {
        console.error("Error updating todo:", error);
        if (currentTodo) {
          update((todos2) => todos2.map(
            (t) => t._id === id ? currentTodo : t
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
    toggleTodo: async (id) => {
      let currentTodo = void 0;
      update((todos2) => {
        const todo = todos2.find((t) => t._id === id);
        if (!todo) return todos2;
        currentTodo = { ...todo };
        return todos2.map(
          (t) => t._id === id ? { ...t, completed: !t.completed } : t
        );
      });
      if (currentTodo) {
        return await updateTodo(id, { completed: !currentTodo.completed });
      }
      return null;
    },
    /**
     * Deletes a todo item
     * @param {string} id - The todo ID
     * @returns {Promise<boolean>}
     */
    deleteTodo: async (id) => {
      let removedTodo = void 0;
      let todoIndex = -1;
      update((todos2) => {
        todoIndex = todos2.findIndex((t) => t._id === id);
        if (todoIndex === -1) return todos2;
        removedTodo = todos2[todoIndex];
        const updatedTodos = [...todos2];
        updatedTodos.splice(todoIndex, 1);
        return updatedTodos;
      });
      try {
        await deleteTodo(id);
        return true;
      } catch (error) {
        console.error("Error deleting todo:", error);
        if (removedTodo && todoIndex !== -1) {
          update((todos2) => {
            const updatedTodos = [...todos2];
            updatedTodos.splice(todoIndex, 0, removedTodo);
            return updatedTodos;
          });
        }
        return false;
      }
    },
    /**
     * Moves a todo to the top of the list
     * @param {string} id - The todo ID
     * @returns {Promise<Todo|null>}
     */
    moveTodoToTop: async (id) => {
      try {
        let todoToMove;
        update((todos2) => {
          todoToMove = todos2.find((t) => t._id === id);
          if (!todoToMove) return todos2;
          const filteredTodos = todos2.filter((t) => t._id !== id);
          return [todoToMove, ...filteredTodos];
        });
        return todoToMove || null;
      } catch (error) {
        console.error("Error moving todo to top:", error);
        return null;
      }
    }
  };
}
createTodosStore();
function _page($$payload, $$props) {
  push();
  $$payload.out += `<div class="min-h-screen bg-white"><main class="container mx-auto p-4">`;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="flex flex-col items-center justify-center py-16"><div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div> <p class="mt-4 text-gray-600">Loading...</p></div>`;
  }
  $$payload.out += `<!--]--></main> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export {
  _page as default
};
