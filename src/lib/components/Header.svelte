<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { showShortcutsTooltip } from '$lib/stores/shortcuts';

	interface User {
		_id: string;
		username: string;
		profileImage?: string;
	}

	let user: User | null = null;
	let loading = true;

	onMount(async () => {
		try {
			// Fetch user info to check if logged in
			const response = await fetch('/api/auth/me');

			if (response.ok) {
				user = await response.json();
			}
		} catch (error) {
			console.error('Error fetching user:', error);
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			if (response.ok) {
				user = null;
				goto('/auth/login');
			}
		} catch (error) {
			console.error('Error logging out:', error);
		}
	}

	function showShortcuts() {
		showShortcutsTooltip.set(true);
	}
</script>

<!-- Header with profile section -->
<header class="border-b border-gray-200 bg-white p-4">
	<div class="container mx-auto flex items-center justify-between">
		<div class="flex items-center">
			<h1 class="mr-6 text-xl font-bold">To-Do App</h1>

			{#if user && !loading}
				<nav class="flex space-x-4">
					<a href="/" class="rounded px-3 py-2 hover:bg-gray-100">Home</a>
					<a href="/groups" class="rounded px-3 py-2 hover:bg-gray-100">Show Groups</a>
					<a href="/groups/create" class="rounded px-3 py-2 hover:bg-gray-100">Create Group</a>
				</nav>
			{/if}
		</div>

		{#if loading}
			<div class="h-10 w-36 animate-pulse rounded bg-gray-200"></div>
		{:else if user}
			<div class="flex items-center gap-3">
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
						{#if user.profileImage && user.profileImage.length > 2}
							<img src={user.profileImage} alt={user.username} class="h-full w-full object-cover" />
						{:else}
							{user.profileImage || user.username.charAt(0).toUpperCase()}
						{/if}
					</div>
					<span>{user.username}</span>
				</a>
				<button
					class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-100"
					on:click={handleLogout}
				>
					Logout
				</button>
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
</header>
