<script lang="ts">
  import { onMount } from 'svelte';
  import { todos } from '../stores/todos';
  import TodoItem from './TodoItem.svelte';
  import type { Todo } from '../types';
  
  let loading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      await todos.fetchTodos();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load todos';
    } finally {
      loading = false;
    }
  });
</script>

<div class="mt-6">
  {#if loading}
    <div class="flex justify-center py-8">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
    </div>
  {:else if error}
    <div class="mt-4 rounded-md bg-red-50 p-4 text-center text-red-700">
      {error}
    </div>
  {:else if $todos.length === 0}
    <div class="mt-4 text-center text-gray-500">
      <p>No todo items yet. Add one above!</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each $todos as todo (todo._id)}
        <TodoItem {todo} />
      {/each}
    </div>
  {/if}
</div> 