<script>
	import { notifications, markAsRead, markAllAsRead } from '$lib/stores/socket';
	import { clickOutside } from '$lib/actions/clickOutside';

	export let isOpen = false;
	export let onClose = () => {};

	function handleNotificationClick(id) {
		markAsRead(id);
	}

	function handleMarkAllAsRead() {
		markAllAsRead();
	}

	function formatTime(timestamp) {
		if (!timestamp) return '';

		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));

		if (diffMinutes < 1) {
			return 'just now';
		}
		if (diffMinutes < 60) {
			return `${diffMinutes}m ago`;
		}

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) {
			return `${diffHours}h ago`;
		}

		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) {
			return `${diffDays}d ago`;
		}

		return date.toLocaleDateString();
	}

	function getIconForType(type) {
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
</script>

<div
	class="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg"
	class:hidden={!isOpen}
	use:clickOutside={{ enabled: isOpen, callback: onClose }}
>
	<div class="rounded-lg shadow-xs">
		<div class="p-3">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-900">Notifications</h3>
				{#if $notifications.length > 0}
					<button
						class="text-xs font-medium text-indigo-600 hover:text-indigo-500"
						on:click={handleMarkAllAsRead}
					>
						Mark all as read
					</button>
				{/if}
			</div>
		</div>
		<div class="border-t border-gray-100 px-4">
			{#if $notifications.length === 0}
				<div class="py-6 text-center text-sm text-gray-500">
					<p>No notifications yet</p>
				</div>
			{:else}
				<div class="max-h-80 overflow-y-auto">
					{#each $notifications as notification (notification.id)}
						<div
							class="flex cursor-pointer border-b border-gray-100 py-3 hover:bg-gray-50"
							class:opacity-60={notification.read}
							on:click={() => handleNotificationClick(notification.id)}
							on:keydown={(e) => e.key === 'Enter' && handleNotificationClick(notification.id)}
							role="button"
							tabindex="0"
						>
							<div class="mr-3 flex-shrink-0 self-center">
								<span class="text-lg">{getIconForType(notification.type)}</span>
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium text-gray-900">{notification.title}</p>
								<p class="line-clamp-2 text-sm text-gray-500">{notification.message}</p>
								<p class="mt-1 text-xs text-gray-400">{formatTime(notification.timestamp)}</p>
							</div>
							{#if !notification.read}
								<div class="ml-2 flex-shrink-0 self-center">
									<div class="h-2 w-2 rounded-full bg-indigo-600"></div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
