<script>
	import { onMount, onDestroy } from 'svelte';
	import { notifications, markAsRead } from '$lib/stores/socket';
	import NotificationToast from './NotificationToast.svelte';

	// Max number of toasts to show at once
	export let maxToasts = 3;

	// Active toasts are the ones currently being displayed
	let activeToasts = [];

	// Subscribe to notifications store
	const unsubscribe = notifications.subscribe((notifs) => {
		// Get unread notifications
		const unread = notifs.filter((n) => !n.read);

		// Limit to max number of toasts
		activeToasts = unread.slice(0, maxToasts);
	});

	// Handle dismissing a notification
	function handleDismiss(event) {
		const { id } = event.detail;
		markAsRead(id);
	}

	// Clean up subscription on component destroy
	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="notifications-container z-50 space-y-4">
	{#each activeToasts as toast (toast.id)}
		<NotificationToast notification={toast} on:dismiss={handleDismiss} />
	{/each}
</div>

<style>
	.notifications-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		width: 100%;
		max-width: 24rem;
		pointer-events: none;
	}

	.notifications-container :global(*) {
		pointer-events: auto;
	}
</style>
