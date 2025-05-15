<script lang="ts">
	import { createGroup } from '$lib/api/groups';
	import { goto } from '$app/navigation';
	import type { CreateGroupData } from '$lib/types';

	let groupName = '';
	let imageUrl = '';
	let inviteeEmail = '';
	let invitees: { email: string }[] = [];
	let loading = false;
	let error: string | null = null;
	let success = false;

	function addInvitee() {
		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(inviteeEmail)) {
			error = 'Please enter a valid email address';
			return;
		}

		// Check if email already added
		if (invitees.some((i) => i.email === inviteeEmail)) {
			error = 'This email is already in the invitees list';
			return;
		}

		// Add to invitees list
		invitees = [...invitees, { email: inviteeEmail }];
		inviteeEmail = '';
		error = null;
	}

	function removeInvitee(email: string) {
		invitees = invitees.filter((i) => i.email !== email);
	}

	async function handleSubmit() {
		if (!groupName.trim()) {
			error = 'Group name is required';
			return;
		}

		const groupData: CreateGroupData = {
			name: groupName.trim(),
			invitees
		};

		if (imageUrl.trim()) {
			groupData.imageUrl = imageUrl.trim();
		}

		loading = true;
		error = null;

		try {
			const newGroup = await createGroup(groupData);
			success = true;

			// Redirect to the group page after a short delay
			setTimeout(() => {
				goto('/groups');
			}, 1500);
		} catch (err) {
			console.error('Error creating group:', err);
			error = err instanceof Error ? err.message : 'Failed to create group';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Group | To-Do App</title>
</svelte:head>

<div class="container mx-auto max-w-lg px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Create a New Group</h1>

	{#if success}
		<div class="mb-4 rounded border border-gray-400 bg-gray-100 px-4 py-3 text-gray-700">
			<p>Group created successfully! Redirecting...</p>
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="rounded-lg border bg-white p-6 shadow-sm">
			{#if error}
				<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					<p>{error}</p>
				</div>
			{/if}

			<!-- Group Name -->
			<div class="mb-4">
				<label for="groupName" class="mb-2 block font-medium text-gray-700">Group Name*</label>
				<input
					type="text"
					id="groupName"
					bind:value={groupName}
					class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
					placeholder="Enter group name"
					required
				/>
			</div>

			<!-- Group Image URL -->
			<div class="mb-4">
				<label for="imageUrl" class="mb-2 block font-medium text-gray-700"
					>Group Image URL (optional)</label
				>
				<input
					type="url"
					id="imageUrl"
					bind:value={imageUrl}
					class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
					placeholder="https://example.com/image.jpg"
				/>
			</div>

			<!-- Invitees Section -->
			<div class="mb-6">
				<label class="mb-2 block font-medium text-gray-700">Invite Members (optional)</label>

				<div class="mb-2 flex">
					<input
						type="email"
						bind:value={inviteeEmail}
						class="flex-1 rounded-l border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
						placeholder="Enter email address"
					/>
					<button
						type="button"
						on:click={addInvitee}
						class="rounded-r bg-black px-4 py-2 text-white hover:bg-gray-800"
					>
						Add
					</button>
				</div>

				{#if invitees.length > 0}
					<div class="mt-3">
						<p class="mb-2 text-sm text-gray-600">Invitees:</p>
						<ul class="space-y-2">
							{#each invitees as invitee}
								<li class="flex items-center justify-between rounded bg-gray-100 px-3 py-2">
									<span>{invitee.email}</span>
									<button
										type="button"
										on:click={() => removeInvitee(invitee.email)}
										class="text-red-500 hover:text-red-700"
									>
										&times;
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<!-- Submit Button -->
			<div class="flex justify-end">
				<button
					type="submit"
					class="rounded bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
					disabled={loading}
				>
					{loading ? 'Creating...' : 'Create Group'}
				</button>
			</div>
		</form>

		<div class="mt-4 text-center">
			<a href="/groups" class="text-black hover:underline">Back to groups</a>
		</div>
	{/if}
</div>
