<script>
  import { todos } from '../stores/todos.js';
  
  // Define the todo prop
  export let todo;
</script>

<div class="flex items-center gap-2 rounded-md border p-3 shadow-sm">
  <input
    type="checkbox"
    checked={todo.completed}
    on:change={() => todos.toggleTodo(todo._id)}
    class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
  
  <span class={todo.completed ? 'line-through text-gray-500' : ''}>
    {todo.title}
  </span>
</div> 