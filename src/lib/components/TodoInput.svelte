<script lang="ts">
	import { todos } from '../stores/todos';
	import { getSuggestions } from '../utils/ai/suggestTask.js';
	import { onDestroy } from 'svelte';

	let todoText = '';
	let suggestions: string[] = [];
	let loading = false;
	let suggestionsVisible = false;
	let selectedIndex = -1;
	let debounceTimeout: number | null = null;
	let textColor = '#000000'; // Default text color
	let isHighlighted = false; // Default highlight state
	let deadline: 'today' | 'tomorrow' | 'later' | null = null; // Default deadline

	// Fetch suggestions when input changes
	async function fetchSuggestions(): Promise<void> {
		if (todoText.trim().length < 2) {
			suggestions = [];
			suggestionsVisible = false;
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
	function handleInput(): void {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
		debounceTimeout = window.setTimeout(() => {
			fetchSuggestions();
		}, 500); // 500ms debounce
	}

	// Submit the form to add a new todo
	async function handleSubmit(): Promise<void> {
		if (!todoText.trim()) return;

		try {
			// Add color, highlight and deadline information to the todo
			const todoData = {
				title: todoText,
				textColor,
				isHighlighted,
				deadline
			};
			await todos.addTodo(todoData);
			todoText = '';
			textColor = '#000000'; // Reset to default color
			isHighlighted = false; // Reset highlight state
			deadline = null; // Reset deadline
			suggestions = [];
			suggestionsVisible = false;
		} catch (error) {
			console.error('Error adding todo:', error);
		}
	}

	// Handle arrow key navigation and selection
	function handleKeydown(event: KeyboardEvent): void {
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
	function selectSuggestion(suggestion: string): void {
		todoText = suggestion;
		suggestionsVisible = false;
	}

	// Clean up debounce timer
	onDestroy(() => {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
	});

	function getDeadlineColor(dl: string | null) {
		if (!dl) return 'bg-gray-100 text-gray-700 border-gray-200';
		switch (dl) {
			case 'today':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'tomorrow':
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case 'later':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	function getDeadlineIcon(dl: string | null) {
		if (!dl) return '';
		switch (dl) {
			case 'today':
				return '📅';
			case 'tomorrow':
				return '🗓️';
			case 'later':
				return '⏳';
			default:
				return '';
		}
	}
</script>

<div class="relative">
	<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-2">
		<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div class="relative flex-1">
				<div class="flex items-center gap-2">
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
							if (suggestions.length > 0) {
								suggestionsVisible = true;
							}
						}}
						placeholder="Add a new todo..."
						class="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
						style="color: {textColor};"
					/>
					<input
						type="color"
						bind:value={textColor}
						class="h-8 w-8 cursor-pointer rounded border border-gray-300 p-1"
						title="Choose text color"
					/>
					<button
						type="button"
						on:click={() => (isHighlighted = !isHighlighted)}
						class="rounded border border-gray-300 p-1.5 {isHighlighted
							? 'bg-yellow-200'
							: 'bg-white'}"
						title="Toggle highlight"
						aria-label="Toggle highlight"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</button>
				</div>

				<div class="mt-3 flex flex-wrap items-center gap-2">
					<span class="text-sm font-medium text-gray-700">When:</span>
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${deadline === 'today' ? getDeadlineColor('today') : 'bg-gray-50 text-gray-700 border-gray-200'}`}
							on:click={() => deadline = deadline === 'today' ? null : 'today'}
							aria-pressed={deadline === 'today'}
						>
							<span class="text-sm mr-1">{getDeadlineIcon('today')}</span>
							Today
						</button>
						<button
							type="button"
							class={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${deadline === 'tomorrow' ? getDeadlineColor('tomorrow') : 'bg-gray-50 text-gray-700 border-gray-200'}`}
							on:click={() => deadline = deadline === 'tomorrow' ? null : 'tomorrow'}
							aria-pressed={deadline === 'tomorrow'}
						>
							<span class="text-sm mr-1">{getDeadlineIcon('tomorrow')}</span>
							Tomorrow
						</button>
						<button
							type="button"
							class={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${deadline === 'later' ? getDeadlineColor('later') : 'bg-gray-50 text-gray-700 border-gray-200'}`}
							on:click={() => deadline = deadline === 'later' ? null : 'later'}
							aria-pressed={deadline === 'later'}
						>
							<span class="text-sm mr-1">{getDeadlineIcon('later')}</span>
							Later
						</button>
					</div>

					<button
						type="submit"
						class="ml-auto rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none disabled:opacity-50"
						disabled={loading || !todoText.trim()}
					>
						{loading ? 'Adding...' : 'Add Task'}
					</button>
				</div>

				{#if suggestionsVisible}
					<div
						class="absolute top-full right-0 left-0 z-10 mt-1 rounded-md border border-gray-200 bg-white shadow-lg"
					>
						<div class="py-1">
							{#if loading}
								<div class="flex flex-col items-center py-3">
									<div
										class="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
									></div>
									<p class="text-xs text-gray-500">AI is generating suggestions...</p>
								</div>
							{:else}
								<p class="px-3 py-2 text-xs font-medium text-gray-500">AI suggestions:</p>
								{#each suggestions as suggestion, i}
									<div
										class="cursor-pointer px-3 py-2 hover:bg-gray-100 {i === selectedIndex
											? 'bg-gray-100'
											: ''}"
										on:mousedown={() => selectSuggestion(suggestion)}
										on:mouseover={() => (selectedIndex = i)}
										role="option"
										aria-selected={i === selectedIndex}
									>
										{suggestion}
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</form>
</div>
