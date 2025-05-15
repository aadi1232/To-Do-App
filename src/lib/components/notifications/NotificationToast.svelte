<script>
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let notification;
	export let duration = 5000; // Default 5 seconds

	const dispatch = createEventDispatcher();

	let timeoutId;

	// Start auto-dismiss timer
	$: if (notification && duration > 0) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			dispatch('dismiss', { id: notification.id });
		}, duration);
	}

	// Clean up on destroy
	function onDestroy() {
		clearTimeout(timeoutId);
	}

	function handleDismiss() {
		clearTimeout(timeoutId);
		dispatch('dismiss', { id: notification.id });
	}

	function getIcon(type) {
		switch (type) {
			case 'group:invited':
				return '✉️';
			case 'group:joined':
				return '👥';
			case 'todo:added':
				return '➕';
			case 'todo:updated':
				return '✏️';
			case 'todo:deleted':
				return '🗑️';
			default:
				return '🔔';
		}
	}

	function getIconColor(type) {
		if (type.startsWith('group:')) {
			return 'text-blue-500';
		} else if (type === 'todo:added') {
			return 'text-green-500';
		} else if (type === 'todo:updated') {
			return 'text-orange-500';
		} else if (type === 'todo:deleted') {
			return 'text-red-500';
		}
		return 'text-gray-500';
	}
</script>

<div
	class="fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg"
	in:fly={{ x: 20, duration: 300 }}
	out:fade={{ duration: 200 }}
	on:outroend={onDestroy}
>
	<div class="p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<div
					class={`inline-flex h-8 w-8 items-center justify-center rounded-full ${getIconColor(notification.type)}`}
				>
					<span class="text-lg">{getIcon(notification.type)}</span>
				</div>
			</div>
			<div class="ml-3 w-0 flex-1 pt-0.5">
				<p class="text-sm font-medium text-gray-900">{notification.title}</p>
				<p class="mt-1 text-sm text-gray-500">{notification.message}</p>
			</div>
			<div class="ml-4 flex flex-shrink-0">
				<button
					type="button"
					class="inline-flex text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					on:click={handleDismiss}
				>
					<span class="sr-only">Close</span>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>
