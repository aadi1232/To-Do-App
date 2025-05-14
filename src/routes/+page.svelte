<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import TodoInput from '$lib/components/TodoInput.svelte';
	import TodoList from '$lib/components/TodoList.svelte';

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
	<!-- Main content -->
	<main class="container mx-auto p-4">
		{#if user}
			<div class="mx-auto mt-8 max-w-2xl">
				<h2 class="mb-6 text-center text-2xl font-medium">Your Todo List</h2>
				
				<!-- Todo Input with AI Suggestions -->
				<div class="mb-6">
					<TodoInput />
				</div>
				
				<!-- Todo List -->
				<TodoList />
			</div>
		{:else if !loading}
			<div class="mt-16 text-center">
				<h2 class="text-lg font-medium">Welcome to the Todo App</h2>
				<p class="mt-2 text-gray-600">Please log in or sign up to get started.</p>
				<div class="mt-4">
					<a href="/auth/login" class="mx-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Log In</a>
					<a href="/auth/signup" class="mx-2 inline-block rounded-md border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">Sign Up</a>
				</div>
			</div>
		{:else}
			<div class="flex justify-center pt-20">
				<div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
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
