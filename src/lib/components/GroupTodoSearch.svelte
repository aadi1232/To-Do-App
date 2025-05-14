<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let groupId; // Required prop to specify which group's todos to search
  export let onToggleTodo = (todoId) => {}; // Allow parent to handle todo toggle
  export let onDeleteTodo = (todo) => {}; // Allow parent to handle todo deletion
  export let canEdit = true; // Whether the user can edit todos
  
  let searchQuery = '';
  let searchResults = [];
  let loading = false;
  let searchTimeout;
  let initialized = false;
  let usingFallback = false; // Track if we're using fallback search
  
  // Initialize search
  onMount(async () => {
    try {
      // Optional: Sync todos to Typesense on component mount
      const response = await fetch(`/api/search/todos/group/sync?groupId=${encodeURIComponent(groupId)}`, {
        method: 'POST'
      });
      
      // Check if we're using fallback search from the response
      if (response.ok) {
        const data = await response.json();
        usingFallback = data.fallback === true;
        if (usingFallback) {
          console.log('Using fallback search as Typesense is not available');
        }
      }
      
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize group search:', error);
      usingFallback = true; // Assume fallback if sync fails
    }
  });
  
  // Handle search input with debounce
  async function handleSearch() {
    // Cancel any pending search
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Don't search if query is empty
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    
    // Set a debounce of 300ms to avoid excessive API calls
    searchTimeout = setTimeout(async () => {
      loading = true;
      
      try {
        // Make sure the query is properly encoded and formatted
        const query = searchQuery.trim();
        const encodedQuery = encodeURIComponent(query);
        console.log(`Searching group todos with query: ${query} (encoded: ${encodedQuery})`);
        
        // Create URL object to ensure proper URL formatting
        const url = new URL('/api/search/todos/group', window.location.origin);
        url.searchParams.append('query', query);
        url.searchParams.append('groupId', groupId);
        
        const response = await fetch(url.toString());
        
        if (response.ok) {
          const data = await response.json();
          console.log("Group search results:", data);
          
          // Update fallback status based on response
          usingFallback = data.fallback === true;
          
          if (data.hits && Array.isArray(data.hits)) {
            searchResults = data.hits.map(hit => ({
              _id: hit.document.id,
              title: hit.document.title,
              completed: hit.document.completed,
              createdBy: hit.document.createdBy,
              // Format any highlighted content
              highlights: hit.highlights ? hit.highlights.map(h => h.snippet) : []
            }));
          } else {
            console.warn("Unexpected group search results format:", data);
            searchResults = [];
          }
        } else {
          const errorText = await response.text();
          console.error(`Group search failed (${response.status}):`, errorText);
          try {
            // Try to parse as JSON for better error reporting
            const errorJson = JSON.parse(errorText);
            console.error("Error details:", errorJson);
          } catch (e) {
            // Not JSON, use as is
          }
        }
      } catch (error) {
        console.error('Error during group search:', error);
      } finally {
        loading = false;
      }
    }, 300);
  }
  
  // Clear search and show all todos
  function clearSearch() {
    searchQuery = '';
    searchResults = [];
  }
</script>

<div class="mb-6">
  <div class="relative">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
      <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
      </svg>
    </div>
    <input 
      type="search" 
      bind:value={searchQuery}
      on:input={handleSearch}
      class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
      placeholder="Search group todos..."
      aria-label="Search group todos"
    />
    {#if searchQuery}
      <button 
        type="button" 
        class="absolute end-2.5 inset-y-0 my-auto h-6 w-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        on:click={clearSearch}
        aria-label="Clear search"
      >
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    {/if}
    
    {#if usingFallback}
      <div class="mt-1 text-xs text-gray-500">
        Using basic search mode (Typesense not available)
      </div>
    {/if}
  </div>
  
  {#if loading}
    <div class="mt-2 flex justify-center">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
    </div>
  {/if}
  
  {#if searchResults.length > 0}
    <div transition:fade={{ duration: 150 }} class="mt-4 rounded-md border border-gray-200 bg-white shadow-sm">
      <ul class="divide-y divide-gray-100">
        {#each searchResults as result}
          <li class="flex px-4 py-3">
            <div class="flex flex-grow items-center">
              <input
                type="checkbox"
                checked={result.completed}
                on:change={() => onToggleTodo(result._id)}
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!canEdit}
              />
              <div class="ml-3">
                {#if result.highlights && result.highlights.length > 0}
                  <!-- Display highlighted text -->
                  <p class="text-sm">
                    {@html result.highlights[0]}
                  </p>
                {:else}
                  <p class="text-sm">{result.title}</p>
                {/if}
              </div>
            </div>
            {#if canEdit}
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">
                  {typeof result.createdBy === 'string' ? 'Unknown' : result.createdBy.username}
                </span>
                <button
                  on:click={() => onDeleteTodo(result)}
                  class="ml-2 text-red-500 hover:text-red-700"
                  title="Delete"
                  aria-label="Delete todo"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div> 