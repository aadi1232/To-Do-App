<script>
	import { notifications, loadingNotifications } from '$lib/stores/notifications';
	import NotificationItem from './NotificationItem.svelte';
</script>

<div>
	{#if $loadingNotifications}
		<div class="flex justify-center py-4">
			<div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
		</div>
	{:else if $notifications.length === 0}
		<div class="py-4 text-center text-sm text-gray-500">
			<p>No notifications yet</p>
		</div>
	{:else}
		<div class="max-h-96 overflow-y-auto">
			{#each $notifications as notification (notification._id)}
				<NotificationItem {notification} />
			{/each}
			{#if notificationCount > 0}
				<button
					on:click={handleMarkAllRead}
					class="text-xs font-medium text-black hover:text-gray-700"
				>
					Mark all as read
				</button>
			{/if}
		</div>
	{/if}
</div>
