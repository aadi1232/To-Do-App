<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import ShortcutsTooltip from '$lib/components/ShortcutsTooltip.svelte';
	import NotificationsContainer from '$lib/components/notifications/NotificationsContainer.svelte';
	import { initializeSocket, cleanup, connected } from '$lib/stores/socket';
	import { getUserGroups } from '$lib/api/groups';

	let { children } = $props();

	// Add socket connection retry logic
	let socketInitAttempts = 0;
	const MAX_SOCKET_INIT_ATTEMPTS = 3;
	let socketInitTimeout: ReturnType<typeof setTimeout> | null = null;

	// Socket initialization - only for authenticated users
	async function initSocket() {
		if (!browser) return;

		socketInitAttempts++;
		console.log(`Socket initialization attempt ${socketInitAttempts}`);

		try {
			// Check if user is logged in
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const user = await response.json();

				// If user is logged in, fetch their groups and initialize socket
				if (user && user._id) {
					console.log('User authenticated, initializing socket:', user._id);

					try {
						// Get user's groups for socket rooms
						const groups = await getUserGroups();
						const groupIds = groups.map((group) => group._id);

						// Initialize the socket connection with user ID and group IDs
						initializeSocket(user._id, groupIds);

						// Reset attempts on success
						socketInitAttempts = 0;
					} catch (groupError) {
						console.error('Error fetching user groups:', groupError);
						// Still try to initialize socket even without groups
						initializeSocket(user._id, []);
					}
				} else {
					console.warn('User data incomplete or missing ID');
				}
			} else if (response.status === 401) {
				// User not authenticated, no need for socket
				console.log('User not authenticated, skipping socket initialization');
			} else {
				console.warn(`Auth check failed with status ${response.status}`);
				retrySocketInit();
			}
		} catch (error) {
			console.error('Error initializing socket:', error);
			retrySocketInit();
		}
	}

	function retrySocketInit() {
		if (socketInitAttempts < MAX_SOCKET_INIT_ATTEMPTS) {
			console.log(`Will retry socket init in ${socketInitAttempts * 2}s`);
			if (socketInitTimeout) {
				clearTimeout(socketInitTimeout);
			}
			socketInitTimeout = setTimeout(initSocket, socketInitAttempts * 2000);
		} else {
			console.error('Max socket initialization attempts reached');
		}
	}

	onMount(initSocket);

	onDestroy(() => {
		// Clean up socket connection and any timeouts
		cleanup();
		if (socketInitTimeout) {
			clearTimeout(socketInitTimeout);
		}
	});
</script>

<div class="app">
	<Header />
	<main>
		{@render children()}
	</main>
	<KeyboardShortcuts />
	<ShortcutsTooltip />
	<NotificationsContainer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding: 1rem;
	}
</style>
