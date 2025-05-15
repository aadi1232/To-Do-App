<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { connected } from '$lib/stores/socket.js';

	// Define types for our props
	export let groupId: string; // Required prop to specify which group's todos to search
	export let onToggleTodo = (todoId: string) => {}; // Allow parent to handle todo toggle
	export let onDeleteTodo = (todo: any) => {}; // Allow parent to handle todo deletion
	export let canEdit = true; // Whether the user can edit todos

	// Define types for component state
	let searchQuery = '';
	let searchResults: any[] = [];
	let loading = false;
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let initialized = false;
	let usingFallback = false; // Track if we're using fallback search
	let lastSearchTime = 0; // Track the last time we performed a search
	let syncInterval: ReturnType<typeof setInterval> | null = null; // For background sync

	// Type definitions for search results
	type Todo = {
		_id: string;
		title: string;
		completed: boolean;
		createdBy: any;
		highlights?: string[];
	};

	type Highlight = {
		field: string;
		snippet: string;
	};

	type SearchHit = {
		document: {
			id: string;
			title: string;
			completed: boolean;
			createdBy: any;
		};
		highlights?: Highlight[];
	};

	// Initialize search and socket events
	onMount(async () => {
		try {
			initialized = true; // Set initialized to true regardless of sync success
			usingFallback = true; // Assume fallback search by default

			// Optional: Sync todos to Typesense on component mount
			await syncSearchIndex();

			// Set up socket event listeners
			setupRealTimeEvents();

			// Start background sync for search index
			startBackgroundSync();
		} catch (error) {
			console.error('Failed to initialize group search:', error);
			// Ensure we're still using fallback search
			usingFallback = true;
		}
	});

	// Clean up on component unmount
	onDestroy(() => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Clean up socket event listeners
		removeRealTimeEvents();

		// Clear background sync
		if (syncInterval) {
			clearInterval(syncInterval);
			syncInterval = null;
		}
	});

	// Set up socket event listeners for real-time updates
	function setupRealTimeEvents() {
		if (typeof window !== 'undefined') {
			// Get a reference to the socket from the connected store
			const isConnected = get(connected);
			if (!isConnected) {
				console.log('Socket not connected, real-time updates unavailable');
				return;
			}

			console.log(`Setting up real-time event listeners for group ${groupId}`);

			// Listen for todo events from server.js, which will be injected into the global window
			window.addEventListener('todo:added', handleTodoChange);
			window.addEventListener('todo:updated', handleTodoChange);
			window.addEventListener('todo:deleted', handleTodoChange);
			window.addEventListener('todo:completed', handleTodoChange);
		}
	}

	// Remove socket event listeners
	function removeRealTimeEvents() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('todo:added', handleTodoChange);
			window.removeEventListener('todo:updated', handleTodoChange);
			window.removeEventListener('todo:deleted', handleTodoChange);
			window.removeEventListener('todo:completed', handleTodoChange);
		}
	}

	// Handle todo change events from socket
	function handleTodoChange(event: any) {
		console.log('Received real-time todo update:', event.type);

		try {
			// Get the event detail data
			const data = event.detail;

			// Check if this is for our group
			if (data && data.groupId === groupId) {
				console.log(`Todo ${event.type.split(':')[1]} in this group:`, data);

				// Check if we have a search query active
				if (searchQuery.trim()) {
					// If the todo title contains our search query, we should refresh
					const todoTitle = data.todo?.title?.toLowerCase() || '';
					const query = searchQuery.trim().toLowerCase();

					// Throttle refreshes to prevent too many API calls
					const now = Date.now();
					if (now - lastSearchTime > 500) {
						// Always refresh on deletes and updates to ensure list stays current
						if (
							event.type === 'todo:deleted' ||
							event.type === 'todo:updated' ||
							event.type === 'todo:completed' ||
							todoTitle.includes(query)
						) {
							console.log('Refreshing search due to relevant todo change');
							refreshSearch();
							lastSearchTime = now;
						}
					}
				}
			}
		} catch (error) {
			console.error('Error handling todo change event:', error);
		}
	}

	// Refresh the current search
	function refreshSearch() {
		if (searchQuery.trim()) {
			console.log('Refreshing search due to real-time update');
			handleSearch(true); // Skip debounce for real-time updates
		}
	}

	// Handle search input with debounce
	async function handleSearch(skipDebounce = false) {
		// Cancel any pending search
		if (searchTimeout) clearTimeout(searchTimeout);

		// Don't search if query is empty
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		const performSearch = async () => {
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

				console.log(`Making search request to: ${url.toString()}`);

				try {
					const response = await fetch(url.toString());
					console.log(`Search API response status: ${response.status}`);

					// Attempt to process the response regardless of status code
					try {
						const data = await response.json();
						console.log('Group search results:', data);

						// Update fallback status based on response
						usingFallback = data.fallback === true;

						if (data.hits && Array.isArray(data.hits)) {
							searchResults = data.hits.map((hit: SearchHit) => ({
								_id: hit.document.id,
								title: hit.document.title,
								completed: hit.document.completed,
								createdBy: hit.document.createdBy,
								// Format any highlighted content
								highlights: hit.highlights ? hit.highlights.map((h: Highlight) => h.snippet) : []
							}));
						} else {
							console.warn('Unexpected group search results format:', data);
							searchResults = [];
						}
					} catch (parseError) {
						console.error('Failed to parse search results:', parseError);
						const rawText = await response.text();
						console.log('Raw API response:', rawText);
						searchResults = [];
					}
				} catch (networkError) {
					console.error('Network error during search:', networkError);
					searchResults = [];
				}
			} catch (error) {
				console.error('Error during group search:', error);
				searchResults = [];
			} finally {
				loading = false;
				lastSearchTime = Date.now();
			}
		};

		// Skip debounce for real-time updates or use debounce for user input
		if (skipDebounce) {
			await performSearch();
		} else {
			// Set a debounce of 150ms to avoid excessive API calls
			searchTimeout = setTimeout(performSearch, 150);
		}
	}

	// Clear search and show all todos
	function clearSearch() {
		searchQuery = '';
		searchResults = [];
	}

	// Start background sync to periodically refresh search index
	function startBackgroundSync() {
		// Clear any existing interval first
		if (syncInterval) {
			clearInterval(syncInterval);
		}

		// Set new interval - sync every 10 seconds
		syncInterval = setInterval(() => {
			console.log('Background sync: refreshing search index');
			syncSearchIndex(true); // true means this is a background sync

			// Also refresh active search if there's a query
			if (searchQuery.trim()) {
				refreshSearch();
			}
		}, 10000); // Every 10 seconds

		console.log('Started background sync for search index');
	}

	// Sync the search index
	async function syncSearchIndex(isBackgroundSync = false) {
		try {
			if (!isBackgroundSync) {
				console.log(`Attempting to sync todos for group: ${groupId}`);
			}

			const response = await fetch(
				`/api/search/todos/group/sync?groupId=${encodeURIComponent(groupId)}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (!isBackgroundSync) {
				console.log(`Sync API response status: ${response.status}`);
			}

			// Process response regardless of status code
			try {
				const data = await response.json();

				if (!isBackgroundSync) {
					console.log('Sync API response data:', data);
				}

				// Update fallback status based on response
				usingFallback = data.fallback === true;

				if (usingFallback && !isBackgroundSync) {
					console.log(`Using fallback search: ${data.message || 'Typesense not available'}`);
				} else if (!isBackgroundSync) {
					console.log('Search system initialized with Typesense');
				}

				return true;
			} catch (jsonError) {
				if (!isBackgroundSync) {
					console.warn('Failed to parse search sync response:', jsonError);
					console.log('Raw response:', await response.text());
				}
				// Keep using fallback search
				return false;
			}
		} catch (syncError) {
			// Just log the error but continue with fallback search
			if (!isBackgroundSync) {
				console.warn('Search sync network request failed:', syncError);
				console.log('Will use fallback search instead');
			}
			return false;
		}
	}
</script>

<div class="mb-6">
	<div class="relative">
		<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
			<svg
				class="h-4 w-4 text-gray-500"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 20 20"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
				/>
			</svg>
		</div>
		<input
			type="search"
			bind:value={searchQuery}
			on:input={() => handleSearch(false)}
			class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
			placeholder="Search group todos..."
			aria-label="Search group todos"
		/>
		{#if searchQuery}
			<button
				type="button"
				class="absolute inset-y-0 end-2.5 my-auto flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
				on:click={clearSearch}
				aria-label="Clear search"
			>
				<svg
					class="h-3 w-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 14 14"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
					/>
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
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
			></div>
		</div>
	{/if}

	{#if searchResults.length > 0}
		<div
			transition:fade={{ duration: 150 }}
			class="mt-4 rounded-md border border-gray-200 bg-white shadow-sm"
		>
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
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
