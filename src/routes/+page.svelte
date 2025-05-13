<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';

	interface User {
		username: string;
		profileImage?: string;
		// Add other user properties as needed
	}

	let user: User | null = null;
	let loading = true;
	let dbError: string | null = null;

	onMount(async () => {
		try {
			// Try to fetch the user profile
			const response = await fetch('/api/auth/me');

			if (response.ok) {
				user = await response.json();
			} else if (response.status === 503) {
				// Database connection issues
				const data = await response.json();
				dbError = data.error || 'Database unavailable';
			}
		} catch (error) {
			console.error('Failed to fetch user:', error);
		} finally {
			loading = false;
		}
	});

	function handleLogout() {
		fetch('/api/auth/logout', {
			method: 'POST'
		}).then(() => {
			user = null;
			goto('/auth/login');
		});
	}
</script>

<div class="min-h-screen bg-white">
	<Header />

	<!-- Main content -->
	<main class="container mx-auto p-4">
		{#if user}
			<div class="mt-8 text-center">
				<h2 class="text-lg font-medium">Welcome, {user.username}!</h2>
				<p class="mt-2 text-gray-600">This is your Todo application.</p>

				<!-- Add your Todo app content here -->
			</div>
		{:else if !loading}
			<div class="mt-16 text-center">
				<h2 class="text-lg font-medium">Welcome to the Todo App</h2>
				<p class="mt-2 text-gray-600">Please log in or sign up to get started.</p>
			</div>
		{/if}
	</main>

	{#if dbError}
		<div class="fixed right-4 bottom-4 max-w-md rounded-md bg-yellow-100 p-4 shadow-md">
			<div class="flex">
				<div class="flex-shrink-0">
					<!-- Warning icon -->
					<svg
						class="h-5 w-5 text-yellow-600"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 012 0v6a1 1 0 01-2 0V5zm1 9a1 1 0 100 2 1 1 0 000-2z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-yellow-800">Database Connection Issue</h3>
					<div class="mt-1 text-xs text-yellow-700">
						<p>{dbError}</p>
						<p class="mt-1">Some features may be unavailable. Please try again later.</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
