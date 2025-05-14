<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createGroup } from '$lib/api';
	import type { CreateGroupData } from '$lib/types';
	import { fade } from 'svelte/transition';

	let loading = false;
	let error: string | null = null;
	let success = false;

	// Form data
	let groupName = '';
	let imageUrl = '';
	let inviteeEmail = '';
	let invitees: { email: string }[] = [];

	// Form validation
	let nameError: string | null = null;
	let emailError: string | null = null;

	// Check if user is authenticated
	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (!response.ok) {
				if (response.status === 401) {
					// Not authenticated, redirect to login
					goto('/auth/login');
					return;
				}
			}
		} catch (err) {
			console.error('Authentication check failed:', err);
			error = 'Authentication check failed';
		}
	});

	function addInvitee() {
		// Validate email
		if (!inviteeEmail) {
			emailError = 'Please enter an email';
			return;
		}

		// Simple email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(inviteeEmail)) {
			emailError = 'Please enter a valid email';
			return;
		}

		// Check if email already in list
		if (invitees.some((i) => i.email === inviteeEmail)) {
			emailError = 'This email is already in the list';
			return;
		}

		// Add to list
		invitees = [...invitees, { email: inviteeEmail }];
		inviteeEmail = '';
		emailError = null;
	}

	function removeInvitee(email: string) {
		invitees = invitees.filter((i) => i.email !== email);
	}

	async function handleSubmit() {
		// Reset errors
		nameError = null;
		error = null;

		// Validate form
		if (!groupName.trim()) {
			nameError = 'Group name is required';
			return;
		}

		try {
			loading = true;

			// Prepare data
			const groupData: CreateGroupData = {
				name: groupName.trim(),
				invitees
			};

			// Add image URL if provided
			if (imageUrl.trim()) {
				groupData.imageUrl = imageUrl.trim();
			}

			// Create group
			await createGroup(groupData);

			// Show success
			success = true;
			loading = false;

			// Redirect after delay
			setTimeout(() => {
				goto('/profile');
			}, 2000);
		} catch (err) {
			console.error('Error creating group:', err);
			error = err instanceof Error ? err.message : 'Failed to create group';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Group</title>
</svelte:head>

<div class="min-h-screen bg-white py-8">
	<div class="container mx-auto max-w-2xl px-4">
		<div class="mb-6 flex items-center">
			<button
				class="mr-4 flex items-center text-gray-600 hover:text-gray-900"
				on:click={() => goto('/profile')}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="ml-1">Back</span>
			</button>
			<h1 class="text-2xl font-bold">Create New Group</h1>
		</div>

		{#if success}
			<div class="mb-6 rounded-lg bg-green-100 p-4 text-green-800" transition:fade>
				Group created successfully! Redirecting to your profile...
			</div>
		{/if}

		{#if error}
			<div class="mb-6 rounded-lg bg-red-100 p-4 text-red-800" transition:fade>
				{error}
			</div>
		{/if}

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<form on:submit|preventDefault={handleSubmit}>
				<!-- Group Name -->
				<div class="mb-4">
					<label for="groupName" class="mb-2 block font-medium text-gray-700">
						Group Name <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="groupName"
						bind:value={groupName}
						class="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
						placeholder="Enter group name"
					/>
					{#if nameError}
						<p class="mt-1 text-sm text-red-600">{nameError}</p>
					{/if}
				</div>

				<!-- Group Image URL -->
				<div class="mb-4">
					<label for="imageUrl" class="mb-2 block font-medium text-gray-700">
						Group Image URL (optional)
					</label>
					<input
						type="text"
						id="imageUrl"
						bind:value={imageUrl}
						class="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
						placeholder="Enter image URL"
					/>
				</div>

				<!-- Invitees -->
				<div class="mb-4">
					<label class="mb-2 block font-medium text-gray-700">Invite Members (by email)</label>

					<div class="mb-2 flex">
						<input
							type="email"
							bind:value={inviteeEmail}
							class="flex-grow rounded-l border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
							placeholder="Enter email address"
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addInvitee())}
						/>
						<button
							type="button"
							on:click={addInvitee}
							class="rounded-r bg-gray-800 px-4 py-2 text-white hover:bg-black"
						>
							Add
						</button>
					</div>

					{#if emailError}
						<p class="mt-1 text-sm text-red-600">{emailError}</p>
					{/if}

					{#if invitees.length > 0}
						<div class="mt-3 rounded border border-gray-200 p-3">
							<h4 class="mb-2 font-medium">Invitees:</h4>
							<ul class="space-y-2">
								{#each invitees as invitee}
									<li class="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
										<span>{invitee.email}</span>
										<button
											type="button"
											on:click={() => removeInvitee(invitee.email)}
											class="text-gray-500 hover:text-red-600"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
													clip-rule="evenodd"
												/>
											</svg>
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<!-- Submit Button -->
				<div class="mt-6">
					<button
						type="submit"
						class="w-full rounded bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
						disabled={loading}
					>
						{#if loading}
							Creating Group...
						{:else}
							Create Group
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
