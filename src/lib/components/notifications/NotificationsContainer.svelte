<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		notifications as socketNotifications,
		markAsRead as markSocketNotificationAsRead
	} from '$lib/stores/socket';
	import {
		notifications as persistentNotifications,
		markAsRead as markPersistentNotificationAsRead
	} from '$lib/stores/notifications';
	import NotificationToast from './NotificationToast.svelte';
	import { derived } from 'svelte/store';

	// Max number of toasts to show at once
	export let maxToasts = 3;

	// Active toasts are the ones currently being displayed
	let activeToasts = [];

	// Combine both notification sources
	const combinedNotifications = derived(
		[socketNotifications, persistentNotifications],
		([$socketNotifications, $persistentNotifications]) => {
			// Combine and sort by timestamp (newest first)
			const combined = [...$socketNotifications, ...$persistentNotifications].sort((a, b) => {
				const timeA = new Date(a.timestamp || a.createdAt || Date.now());
				const timeB = new Date(b.timestamp || b.createdAt || Date.now());
				return timeB.getTime() - timeA.getTime();
			});

			console.log('Combined notifications:', combined.length);
			return combined;
		}
	);

	// Subscribe to combined notifications store
	const unsubscribe = combinedNotifications.subscribe((notifs) => {
		// Get unread notifications
		const unread = notifs.filter((n) => !n.read);

		console.log('Unread notifications:', unread.length);

		// Limit to max number of toasts
		activeToasts = unread.slice(0, maxToasts);
	});

	// Handle dismissing a notification
	function handleDismiss(event) {
		const { id, type } = event.detail;

		// Check if it's a socket notification (id format) or persistent notification (_id format)
		if (
			id.startsWith('todo_') ||
			id.startsWith('inv_') ||
			id.startsWith('role_') ||
			id.startsWith('rem_') ||
			id.startsWith('join_')
		) {
			markSocketNotificationAsRead(id);
		} else {
			markPersistentNotificationAsRead(id);
		}
	}

	// Log active toasts for debugging
	$: if (activeToasts.length > 0) {
		console.log('Active toasts:', activeToasts);
	}

	// Clean up subscription on component destroy
	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="notifications-container z-50 space-y-4">
	{#each activeToasts as toast (toast.id || toast._id)}
		<NotificationToast
			notification={{
				id: toast.id || toast._id,
				type: toast.type,
				title: toast.title || 'Notification',
				message: toast.message,
				data: toast.data || {}
			}}
			on:dismiss={handleDismiss}
		/>
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
