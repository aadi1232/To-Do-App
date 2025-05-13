<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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
</script>

<!-- Header with profile section -->
<header class="border-b border-gray-200 bg-white p-4">
	<div class="container mx-auto flex items-center justify-between">
		<h1 class="text-xl font-bold">To-Do App</h1>

		{#if loading}
			<div class="h-10 w-36 animate-pulse rounded bg-gray-200"></div>
		{:else if user}
			<div class="flex items-center gap-3">
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
