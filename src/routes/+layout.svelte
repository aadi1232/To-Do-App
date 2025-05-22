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
	import { fetchCurrentUser, user } from '$lib/stores/user';
	import posthog from 'posthog-js';

	onMount(async () => {
		if (browser) {
			posthog.init('phc_e52xCDt7vkMC1LXwvQqWS36BTIlK4HgN01M5dt86g5H', {
				api_host: 'https://us.i.posthog.com',
				person_profiles: 'always'
			});

			const userData = await fetchCurrentUser();

			if (userData) {
				initSocketConnection();
				posthog.identify(userData._id, {
					email: userData.email,
					username: userData.username
				});
			}
		}
	});
	// Define User type to match store definition
	type User = {
		_id: string;
		username: string;
		email?: string;
		profileImage?: string;
	};

	let { children } = $props();

	// Add socket connection retry logic
	let socketInitAttempts = 0;
	const MAX_SOCKET_INIT_ATTEMPTS = 3;
	let socketInitTimeout: ReturnType<typeof setTimeout> | null = null;

	// Initialize user data and socket connection
	onMount(async () => {
		if (browser) {
			// Fetch current user (this will update the user store)
			const userData = await fetchCurrentUser();

			// Initialize socket only if user is logged in
			if (userData) {
				// Initialize socket connection if user is logged in
				initSocketConnection();
			}
		}
	});

	// Initialize socket connection with retry logic
	async function initSocketConnection() {
		try {
			const currentUser = $user as User | null;
			if (currentUser && currentUser._id) {
				// Fetch user groups
				const groups = await getUserGroups();
				const groupIds = groups.map((group) => group._id);

				// Initialize socket with user ID and group IDs
				await initializeSocket(currentUser._id.toString(), groupIds);
			}
		} catch (error) {
			console.error('Socket connection error:', error);
			// Retry logic for socket connection
			socketInitAttempts++;
			if (socketInitAttempts < MAX_SOCKET_INIT_ATTEMPTS) {
				console.log(
					`Retrying socket connection (attempt ${socketInitAttempts + 1}/${MAX_SOCKET_INIT_ATTEMPTS})...`
				);
				socketInitTimeout = setTimeout(initSocketConnection, 2000);
			} else {
				console.error(
					`Failed to connect to socket server after ${MAX_SOCKET_INIT_ATTEMPTS} attempts`
				);
			}
		}
	}

	// Watch for user changes to handle socket connection
	$effect(() => {
		const currentUser = $user as User | null;
		if (currentUser && !$connected) {
			// If user logs in and socket isn't connected, try to connect
			initSocketConnection();
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (socketInitTimeout) {
			clearTimeout(socketInitTimeout);
		}
		cleanup();
	});
</script>

<div class="min-h-screen">
	<Header />
	<KeyboardShortcuts />
	<ShortcutsTooltip />
	<NotificationsContainer />
	{@render children()}
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
