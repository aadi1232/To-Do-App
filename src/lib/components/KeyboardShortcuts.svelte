<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let isMac = false;

	onMount(() => {
		// Detect if the user is on macOS
		isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

		// Add keyboard event listener
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			// Clean up event listener on component destroy
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function handleKeyDown(event: KeyboardEvent) {
		// Check if the key event has meta (Command on Mac) or control (on Windows/Linux) key pressed
		const modKey = isMac ? event.metaKey : event.ctrlKey;

		if (modKey) {
			switch (event.key.toLowerCase()) {
				case 'g':
					event.preventDefault(); // Prevent default browser action
					goto('/groups/create');
					break;
				case 'm':
					event.preventDefault(); // Prevent default browser action
					goto('/');
					break;
				case 'z':
					event.preventDefault(); // Prevent default browser action
					goto('/profile');
					break;
			}
		}
	}
</script>

<!-- This is a non-visible component that just adds functionality -->
