<script>
  import { todos } from '../stores/todos.js';
  import { getSuggestions } from '../utils/ai/suggestTask.js';
  import { onDestroy } from 'svelte';
  
  let todoText = '';
  let suggestions = [];
  let loading = false;
  let suggestionsVisible = false;
  let selectedIndex = -1;
  let debounceTimeout;
  
  // Fetch suggestions when input changes
  async function fetchSuggestions() {
    if (todoText.trim().length < 2) {
      suggestions = [];
      return;
    }
    
    loading = true;
    try {
      suggestions = await getSuggestions(todoText);
      suggestionsVisible = suggestions.length > 0;
      selectedIndex = -1;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions = [];
    } finally {
      loading = false;
    }
  }
  
  // Debounce input to avoid too many API calls
  function handleInput() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 500); // 500ms debounce
  }
  
  // Submit the form to add a new todo
  async function handleSubmit() {
    if (!todoText.trim()) return;
    
    try {
      await todos.addTodo(todoText);
      todoText = '';
      suggestions = [];
      suggestionsVisible = false;
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }
  
  // Handle arrow key navigation and selection
  function handleKeydown(event) {
    if (!suggestionsVisible) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          event.preventDefault();
          todoText = suggestions[selectedIndex];
          suggestionsVisible = false;
        }
        break;
      case 'Escape':
        event.preventDefault();
        suggestionsVisible = false;
        break;
    }
  }
  
  // Select a suggestion
  function selectSuggestion(suggestion) {
    todoText = suggestion;
    suggestionsVisible = false;
  }
  
  // Clean up debounce timer
  onDestroy(() => {
    clearTimeout(debounceTimeout);
  });
</script>

<div class="relative">
  <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
    <div class="relative flex-1">
      <input
        type="text"
        bind:value={todoText}
        on:input={handleInput}
        on:keydown={handleKeydown}
        on:blur={() => {
          // Delay hiding suggestions to allow for clicks
          setTimeout(() => {
            suggestionsVisible = false;
          }, 200);
        }}
        on:focus={() => {
          // Show suggestions again if we have any
          suggestionsVisible = suggestions.length > 0;
        }}
        placeholder="Add a new todo..."
        class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      
      {#if loading}
        <div class="absolute right-3 top-2.5">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
        </div>
      {/if}
      
      {#if suggestionsVisible && suggestions.length > 0}
        <div class="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <ul class="py-1">
            {#each suggestions as suggestion, i}
              <li
                class="cursor-pointer px-4 py-2 hover:bg-gray-100 {i === selectedIndex ? 'bg-gray-100' : ''}"
                on:mousedown={() => selectSuggestion(suggestion)}
                on:mouseover={() => (selectedIndex = i)}
              >
                {suggestion}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
    
    <button
      type="submit"
      class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Add
    </button>
  </form>
</div> 