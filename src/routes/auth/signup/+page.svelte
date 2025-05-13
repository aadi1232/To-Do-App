<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		error = '';

		if (!username || !email || !password || !confirmPassword) {
			error = 'All fields are required';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					email,
					password
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Check for service unavailable (database connection issues)
				if (response.status === 503) {
					throw new Error(`Service unavailable: ${data.error || 'Database connection failed'}`);
				}
				throw new Error(data.message || 'Something went wrong');
			}

			// Redirect to home page after successful signup
			goto('/');
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-white">
	<div class="w-full max-w-md rounded-md border border-gray-300 p-8">
		<h1 class="mb-6 text-center text-2xl font-bold">Sign Up</h1>

		{#if error}
			<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit}>
			<div class="mb-4">
				<label for="username" class="mb-1 block text-sm font-medium text-gray-700">
					Username
				</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="w-full rounded-md border border-gray-300 px-3 py-2"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="w-full rounded-md border border-gray-300 px-3 py-2"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="w-full rounded-md border border-gray-300 px-3 py-2"
					required
				/>
			</div>

			<div class="mb-6">
				<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
					Confirm Password
				</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					class="w-full rounded-md border border-gray-300 px-3 py-2"
					required
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
				disabled={loading}
			>
				{loading ? 'Processing...' : 'Sign Up'}
			</button>
		</form>

		<div class="mt-4 text-center">
			<p class="text-sm text-gray-600">
				Already have an account? <a href="/auth/login" class="text-black underline">Log In</a>
			</p>
		</div>
	</div>
</div>
