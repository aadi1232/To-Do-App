<script lang="ts">
  import { todos } from '../stores/todos';
  import { fade } from 'svelte/transition';
  import type { Todo } from '../types';
  
  // Define the todo prop
  export let todo: Todo;
  
  let isEditing = false;
  let editedTitle = todo.title;
  let showDeleteConfirm = false;
  let isCompleting = false;
  let showCompleteConfirm = false;
  
  function handleEdit() {
    isEditing = true;
    editedTitle = todo.title;
  }
  
  async function handleSave() {
    if (editedTitle.trim()) {
      await todos.updateTodo(todo._id, { title: editedTitle });
      isEditing = false;
    }
  }
  
  function handleCancel() {
    isEditing = false;
    editedTitle = todo.title;
  }
  
  async function handleDelete() {
    if (showDeleteConfirm) {
      await todos.deleteTodo(todo._id);
      showDeleteConfirm = false;
    } else {
      showDeleteConfirm = true;
    }
  }
  
  function cancelDelete() {
    showDeleteConfirm = false;
  }
  
  function handleCheckboxClick() {
    showCompleteConfirm = true;
  }
  
  async function confirmCompletion() {
    if (isCompleting) return; // Prevent multiple clicks
    
    try {
      isCompleting = true;
      // When task is completed, delete it from the backend
      await todos.deleteTodo(todo._id);
      showCompleteConfirm = false;
    } catch (error) {
      console.error('Error completing todo:', error);
      // If there's an error, revert the checkbox
      todo.completed = !todo.completed;
    } finally {
      isCompleting = false;
    }
  }
  
  function cancelCompletion() {
    showCompleteConfirm = false;
    todo.completed = !todo.completed; // Revert the checkbox state
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<div 
  class="group flex items-center justify-between gap-2 rounded-md border p-3 shadow-sm transition-all hover:shadow-md"
  transition:fade
>
  <div class="flex items-center gap-2">
    <input
      type="checkbox"
      checked={todo.completed}
      on:change={handleCheckboxClick}
      class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      disabled={isCompleting}
    />
    
    {#if isEditing}
      <input
        type="text"
        bind:value={editedTitle}
        on:keydown={handleKeydown}
        on:blur={handleSave}
        class="flex-1 rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        autofocus
      />
    {:else}
      <span class={todo.completed ? 'text-gray-500' : ''} style="color: {todo.textColor || '#000000'}; background-color: {todo.isHighlighted ? '#fef08a' : 'transparent'};">
        {todo.title}
      </span>
    {/if}
  </div>
  
  <div class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
    {#if isEditing}
      <button
        on:click={handleSave}
        class="rounded p-1 text-green-600 hover:bg-green-50"
        title="Save"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button
        on:click={handleCancel}
        class="rounded p-1 text-gray-600 hover:bg-gray-50"
        title="Cancel"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {:else if showDeleteConfirm}
      <div class="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1">
        <span class="text-sm text-red-600">Delete?</span>
        <button
          on:click={handleDelete}
          class="rounded p-1 text-red-600 hover:bg-red-100"
          title="Confirm Delete"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          on:click={cancelDelete}
          class="rounded p-1 text-gray-600 hover:bg-gray-100"
          title="Cancel"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {:else if showCompleteConfirm}
      <div class="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1">
        <span class="text-sm text-green-600">Mark as completed?</span>
        <button
          on:click={confirmCompletion}
          class="rounded p-1 text-green-600 hover:bg-green-100"
          title="Confirm Completion"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          on:click={cancelCompletion}
          class="rounded p-1 text-gray-600 hover:bg-gray-100"
          title="Cancel"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {:else}
      <button
        on:click={handleEdit}
        class="rounded p-1 text-blue-600 hover:bg-blue-50"
        title="Edit"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        on:click={handleDelete}
        class="rounded p-1 text-red-600 hover:bg-red-50"
        title="Delete"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    {/if}
  </div>
</div> 