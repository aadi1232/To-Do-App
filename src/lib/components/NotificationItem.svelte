<script>
	import { markAsRead } from '$lib/stores/notifications';

	/**
	 * @type {import('$lib/stores/notifications').Notification}
	 */
	export let notification;

	function formatTimestamp(timestamp) {
		try {
			const date = new Date(timestamp);

			// For today, just show time
			const today = new Date();
			const isToday =
				date.getDate() === today.getDate() &&
				date.getMonth() === today.getMonth() &&
				date.getFullYear() === today.getFullYear();

			if (isToday) {
				return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			}

			// For this year, show month and day
			const isThisYear = date.getFullYear() === today.getFullYear();
			if (isThisYear) {
				return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
			}

			// Otherwise show full date
			return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
		} catch (error) {
			return timestamp;
		}
	}

	function getIcon(type) {
		switch (type) {
			case 'todo:added':
				return '➕';
			case 'todo:deleted':
				return '🗑️';
			case 'todo:completed':
				return '✅';
			case 'group:invite':
				return '✉️';
			case 'group:join':
				return '👥';
			default:
				return '🔔';
		}
	}

	function handleClick() {
		if (!notification.read) {
			markAsRead(notification._id);
		}
	}
</script>

<div
	class="flex cursor-pointer border-b border-gray-100 p-3 hover:bg-gray-50"
	class:opacity-70={notification.read}
	on:click={handleClick}
	role="menuitem"
>
	<div class="mr-3 text-lg">
		{getIcon(notification.type)}
	</div>

	<div class="flex-1 overflow-hidden">
		<div class="text-sm font-medium text-gray-900">
			{notification.type.split(':')[0].charAt(0).toUpperCase() +
				notification.type.split(':')[0].slice(1)}
			{notification.type.split(':')[1].charAt(0).toUpperCase() +
				notification.type.split(':')[1].slice(1)}
		</div>

		<p class="mt-1 truncate text-sm text-gray-600">
			{notification.message}
		</p>

		<div class="mt-1 text-xs text-gray-500">
			{formatTimestamp(notification.createdAt || notification.timestamp)}
		</div>
	</div>

	{#if !notification.read}
		<div class="ml-2 self-center">
			<div class="h-2 w-2 rounded-full bg-black"></div>
		</div>
	{/if}
</div>
