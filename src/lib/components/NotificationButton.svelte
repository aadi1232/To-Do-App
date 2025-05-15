<script>
	import { onMount } from 'svelte';
	import { unreadCount, markAllAsRead, fetchNotifications } from '$lib/stores/notifications';

	let showDropdown = false;

	// Refresh notifications when component mounts
	onMount(() => {
		// Fetch fresh notifications
		fetchNotifications();

		// Set up click handler for clicking outside dropdown
		const handleClickOutside = (event) => {
			const button = document.querySelector('.notification-button');
			const dropdown = document.querySelector('.notification-dropdown');

			if (
				button &&
				dropdown &&
				!button.contains(event.target) &&
				!dropdown.contains(event.target)
			) {
				showDropdown = false;
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	function toggleDropdown() {
		showDropdown = !showDropdown;

		if (showDropdown) {
			// Fetch fresh notifications when opening dropdown
			fetchNotifications();
		}
	}

	function handleMarkAllAsRead() {
		markAllAsRead();
		// Don't close dropdown
	}
</script>

<div class="relative inline-block">
	<button
		class="notification-button relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
		on:click={toggleDropdown}
		aria-label="Notifications"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
			/>
		</svg>

		{#if $unreadCount > 0}
			<span
				class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
			>
				{$unreadCount > 9 ? '9+' : $unreadCount}
			</span>
		{/if}
	</button>

	{#if showDropdown}
		<div
			class="notification-dropdown ring-opacity-5 absolute right-0 z-50 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
		>
			<div class="flex items-center justify-between border-b p-3">
				<h3 class="text-sm font-medium text-gray-900">Notifications</h3>
				{#if $unreadCount > 0}
					<button
						class="text-xs font-medium text-black hover:text-gray-700"
						on:click={handleMarkAllAsRead}
					>
						Mark all as read
					</button>
				{/if}
			</div>

			<div class="max-h-80 overflow-y-auto" role="none">
				{#if $unreadCount === 0}
					<div class="py-6 text-center text-sm text-gray-500">
						<p>No new notifications</p>
					</div>
				{:else}
					<!-- This would be replaced with a proper notification list component -->
					<slot></slot>
				{/if}
			</div>
		</div>
	{/if}
</div>
