<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserGroups, getPendingInvitations, respondToInvitation } from '$lib/api/groups';
	import type { Group, GroupInvitation } from '$lib/types';

	let groups: Group[] = [];
	let invitations: GroupInvitation[] = [];
	let loading = true;
	let error: string | null = null;
	let currentUserId: string = '';

	onMount(async () => {
		try {
			// First get current user info
			const userResponse = await fetch('/api/auth/me');
			if (userResponse.ok) {
				const userData = await userResponse.json();
				currentUserId = userData._id;
			}

			// Fetch user's groups and pending invitations in parallel
			const [fetchedGroups, fetchedInvitations] = await Promise.all([
				getUserGroups(),
				getPendingInvitations()
			]);

			groups = fetchedGroups;

			// Filter out invitations to groups the user created
			invitations = fetchedInvitations.filter((invitation) => {
				// Only show invitations where the user is not the creator
				if (!invitation) return false;

				// Check if user is not the creator of the group
				if (typeof invitation.createdBy === 'object') {
					return invitation.createdBy._id !== currentUserId;
				} else {
					return invitation.createdBy !== currentUserId;
				}
			});
		} catch (err) {
			console.error('Error fetching groups data:', err);
			error = err instanceof Error ? err.message : 'Failed to load groups';
		} finally {
			loading = false;
		}
	});

	async function handleInvitationResponse(groupId: string, response: 'accepted' | 'declined') {
		try {
			await respondToInvitation(groupId, response);

			// Refresh the invitations list
			invitations = invitations.filter((invitation) => invitation._id !== groupId);

			// If accepted, refresh groups list
			if (response === 'accepted') {
				const updatedGroups = await getUserGroups();
				groups = updatedGroups;
			}
		} catch (err) {
			console.error('Error responding to invitation:', err);
			error = err instanceof Error ? err.message : 'Failed to respond to invitation';
		}
	}
</script>

<svelte:head>
	<title>My Groups | To-Do App</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-6">
	<h1 class="mb-6 text-2xl font-bold text-gray-800">My Groups</h1>

	{#if loading}
		<div class="flex h-48 items-center justify-center">
			<div class="animate-pulse text-gray-500">Loading...</div>
		</div>
	{:else if error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			<p>{error}</p>
		</div>
	{:else}
		<!-- Pending Invitations Section -->
		{#if invitations.length > 0}
			<div class="mb-10">
				<h2 class="mb-4 text-xl font-medium text-gray-700">Pending Invitations</h2>
				<div class="grid grid-cols-1 gap-3">
					{#each invitations as invitation}
						<div
							class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
						>
							<div class="flex items-center">
								<div
									class="mr-3 h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50"
								>
									{#if invitation.imageUrl}
										<img
											src={invitation.imageUrl}
											alt={invitation.name}
											class="h-full w-full object-cover"
										/>
									{:else}
										<div
											class="flex h-full w-full items-center justify-center bg-blue-500 text-sm font-medium text-white"
										>
											{invitation.name.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-grow">
									<h3 class="font-medium text-gray-800">{invitation.name}</h3>
									<p class="text-xs text-gray-500">Invited by {invitation.createdBy.username}</p>
								</div>
								<div class="ml-2 flex space-x-2">
									<button
										class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
										on:click={() => handleInvitationResponse(invitation._id, 'accepted')}
									>
										Accept
									</button>
									<button
										class="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
										on:click={() => handleInvitationResponse(invitation._id, 'declined')}
									>
										Decline
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- My Groups Section -->
		{#if groups.length > 0}
			<div>
				<div class="grid grid-cols-1 gap-3">
					{#each groups as group}
						<a
							href="/groups/{group._id}"
							class="block rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
						>
							<div class="flex items-center">
								<div
									class="mr-3 h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50"
								>
									{#if group.imageUrl}
										<img src={group.imageUrl} alt={group.name} class="h-full w-full object-cover" />
									{:else}
										<div
											class="flex h-full w-full items-center justify-center bg-blue-500 text-sm font-medium text-white"
										>
											{group.name.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								<div>
									<h3 class="font-medium text-gray-800">{group.name}</h3>
									<p class="text-xs text-gray-500">{group.members.length} members</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{:else if invitations.length === 0}
			<div class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-16 w-16 text-gray-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p class="mt-2 text-lg text-gray-600">You don't have any groups yet</p>
					<p class="text-gray-500">Create a group to collaborate with others</p>
				</div>
				<a
					href="/groups/create"
					class="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:ring-4 focus:ring-black focus:outline-none"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					Create a Group
				</a>
			</div>
		{/if}
	{/if}

	<!-- Create Group Button -->
	{#if groups.length > 0}
		<div class="mt-8 flex justify-center">
			<a
				href="/groups/create"
				class="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:ring-4 focus:ring-black focus:outline-none"

			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
				Create a New Group
			</a>
		</div>
	{/if}
</div>
