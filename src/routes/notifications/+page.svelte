<script>
	import { onMount } from 'svelte';
	import {
		notifications,
		loadingNotifications,
		markAllAsRead,
		fetchNotifications
	} from '$lib/stores/notifications';
	import NotificationItem from '$lib/components/NotificationItem.svelte';

	let isLoading = true;

	onMount(async () => {
		// Fetch notifications when component mounts
		await fetchNotifications();
		isLoading = false;
	});

	function handleMarkAllAsRead() {
		markAllAsRead();
	}
</script>

<svelte:head>
	<title>Notifications | To-Do App</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="container mx-auto max-w-3xl">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Notifications</h1>

			<button
				class="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
				on:click={handleMarkAllAsRead}
				disabled={$notifications.length === 0 || $notifications.every((n) => n.read)}
			>
				Mark All as Read
			</button>
		</div>

		<div class="rounded-lg bg-white shadow">
			{#if isLoading || $loadingNotifications}
				<div class="flex justify-center py-20">
					<div
						class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black"
					></div>
				</div>
			{:else if $notifications.length === 0}
				<div class="py-16 text-center">
					<p class="text-gray-500">You don't have any notifications yet.</p>
				</div>
			{:else}
				<div>
					{#each $notifications as notification (notification._id)}
						<NotificationItem {notification} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
