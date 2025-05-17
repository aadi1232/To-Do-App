<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { showShortcutsTooltip } from '$lib/stores/shortcuts';
	import NotificationButton from './NotificationButton.svelte';
	import NotificationList from './NotificationList.svelte';
	import { unreadCount } from '$lib/stores/notifications';
	import { user, userLoading, logoutUser, fetchCurrentUser } from '$lib/stores/user';

	// Define the User type to match the store's JSDoc
	type User = {
		_id: string;
		username: string;
		email?: string;
		profileImage?: string;
	};

	// Add state for mobile menu
	let mobileMenuOpen = false;
	let userMenuOpen = false;

	onMount(async () => {
		// No need to fetch here, it will be handled by the layout
		// If for some reason the user isn't loaded yet, trigger a fetch
		if (!$user && !$userLoading) {
			await fetchCurrentUser();
		}
	});

	async function handleLogout() {
		const success = await logoutUser();
		if (success) {
			goto('/auth/login');
		}
	}

	function showShortcuts() {
		showShortcutsTooltip.set(true);
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	function closeMenus() {
		mobileMenuOpen = false;
		userMenuOpen = false;
	}
</script>

<!-- Header with profile section -->
<header class="border-b border-gray-200 bg-white p-4">
	<div class="container mx-auto flex items-center justify-between">
		<div class="flex items-center">
			<h1 class="text-xl font-bold">To-Do App</h1>

			<!-- Desktop Navigation -->
			{#if $user && !$userLoading}
				<nav class="ml-6 hidden space-x-4 md:flex">
					<a href="/" class="rounded px-3 py-2 hover:bg-gray-100">Home</a>
					<a href="/groups" class="rounded px-3 py-2 hover:bg-gray-100">Show Groups</a>
					<a href="/groups/create" class="rounded px-3 py-2 hover:bg-gray-100">Create Group</a>
					<a href="/notifications" class="rounded px-3 py-2 hover:bg-gray-100">Notifications</a>
				</nav>
			{/if}
		</div>

		<!-- Mobile menu button -->
		{#if $user && !$userLoading}
			<button
				class="flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden"
				on:click={toggleMobileMenu}
				aria-expanded={mobileMenuOpen}
				aria-label="Main menu"
			>
				<svg
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					{#if mobileMenuOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</button>
		{/if}

		{#if $userLoading}
			<div class="h-10 w-36 animate-pulse rounded bg-gray-200"></div>
		{:else if $user}
			{@const typedUser = $user as User}
			<div class="hidden items-center gap-3 md:flex">
				<button
					class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
					on:click={showShortcuts}
					title="Keyboard Shortcuts"
					aria-label="Show keyboard shortcuts"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
				</button>

				<a href="/profile" class="flex items-center gap-2">
					<div
						class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black text-white"
					>
						{#if typedUser.profileImage && typedUser.profileImage.length > 2}
							<img
								src={typedUser.profileImage}
								alt={typedUser.username}
								class="h-full w-full object-cover"
							/>
						{:else}
							{typedUser.profileImage || typedUser.username.charAt(0).toUpperCase()}
						{/if}
					</div>
					<span>{typedUser.username}</span>
				</a>
				<button
					class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-100"
					on:click={handleLogout}
				>
					Logout
				</button>
			</div>

			<!-- User dropdown for mobile -->
			<div class="relative md:hidden">
				<button
					class="flex items-center gap-2"
					on:click={toggleUserMenu}
					aria-expanded={userMenuOpen}
					aria-haspopup="true"
				>
					<div
						class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black text-white"
					>
						{#if typedUser.profileImage && typedUser.profileImage.length > 2}
							<img
								src={typedUser.profileImage}
								alt={typedUser.username}
								class="h-full w-full object-cover"
							/>
						{:else}
							{typedUser.profileImage || typedUser.username.charAt(0).toUpperCase()}
						{/if}
					</div>
					<svg
						class="h-5 w-5 text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>

				{#if userMenuOpen}
					<div
						class="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="user-menu"
					>
						<div class="border-b px-4 py-2 text-sm text-gray-700">
							{typedUser.username}
						</div>
						<a
							href="/profile"
							class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
							role="menuitem"
							on:click={closeMenus}
						>
							Your Profile
						</a>
						<button
							class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
							on:click={showShortcuts}
							role="menuitem"
						>
							Keyboard Shortcuts
						</button>
						<button
							class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
							on:click={() => {
								handleLogout();
								closeMenus();
							}}
							role="menuitem"
						>
							Log out
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex gap-2">
				<button
					class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
					on:click={showShortcuts}
					title="Keyboard Shortcuts"
					aria-label="Show keyboard shortcuts"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
				</button>
				<a
					href="/auth/login"
					class="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
				>
					Log In
				</a>
				<a
					href="/auth/signup"
					class="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
				>
					Sign Up
				</a>
			</div>
		{/if}
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen && $user}
		<div class="md:hidden" id="mobile-menu">
			<div class="mt-2 space-y-1 border-t px-2 pt-2 pb-3">
				<a
					href="/"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
					on:click={closeMenus}
				>
					Home
				</a>
				<a
					href="/groups"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
					on:click={closeMenus}
				>
					Show Groups
				</a>
				<a
					href="/groups/create"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
					on:click={closeMenus}
				>
					Create Group
				</a>
				<a
					href="/notifications"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
					on:click={closeMenus}
				>
					Notifications
				</a>
			</div>
		</div>
	{/if}
</header>
