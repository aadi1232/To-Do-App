<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { getPendingInvitations, respondToInvitation, getUserGroups } from '$lib/api';
	import type { User, GroupInvitation, Group } from '$lib/types';
	import { fade } from 'svelte/transition';

	// Define user
	let user: User | null = null;
	let loading = true;
	let error: string | null = null;
	let newImageUrl = '';
	let updateSuccess = false;
	let updateError: string | null = null;

	// Group state
	let pendingInvitations: GroupInvitation[] = [];
	let userGroups: Group[] = [];
	let loadingGroups = true;
	let groupError: string | null = null;
	let showCreateGroupModal = false;
	let notificationMessage: string | null = null;
	let notificationType: 'success' | 'error' = 'success';

	onMount(async () => {
		try {
			// Fetch user profile data
			const response = await fetch('/api/auth/me');

			if (!response.ok) {
				if (response.status === 401) {
					// Not authenticated, redirect to login
					goto('/auth/login');
					return;
				}
				throw new Error('Failed to fetch profile data');
			}

			user = await response.json();
			loading = false;

			// Load group data
			await loadGroupData();
		} catch (err) {
			console.error('Error loading profile:', err);
			error = err instanceof Error ? err.message : 'Failed to load profile';
			loading = false;
		}
	});

	async function loadGroupData() {
		try {
			loadingGroups = true;
			groupError = null;

			// Load pending invitations
			pendingInvitations = await getPendingInvitations();

			// Load user groups
			userGroups = await getUserGroups();

			loadingGroups = false;
		} catch (err) {
			console.error('Error loading group data:', err);
			groupError = err instanceof Error ? err.message : 'Failed to load group data';
			loadingGroups = false;
		}
	}

	async function updateProfileImage() {
		if (!newImageUrl.trim()) {
			updateError = 'Please enter a valid image URL';
			return;
		}

		try {
			updateSuccess = false;
			updateError = null;

			const response = await fetch('/api/users/profile/image', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ profileImage: newImageUrl })
			});

			if (!response.ok) {
				throw new Error('Failed to update profile image');
			}

			// Update the displayed image on success
			if (user) {
				user.profileImage = newImageUrl;
			}
			newImageUrl = '';
			updateSuccess = true;
		} catch (err) {
			console.error('Error updating profile image:', err);
			updateError = err instanceof Error ? err.message : 'Failed to update profile image';
		}
	}

	async function handleInviteResponse(inviteId: string, response: 'accepted' | 'declined') {
		try {
			await respondToInvitation(inviteId, response);

			// Show notification
			notificationMessage =
				response === 'accepted' ? 'You have joined the group!' : 'Invitation declined';
			notificationType = 'success';

			// Refresh data
			await loadGroupData();

			// Auto-hide notification after 3 seconds
			setTimeout(() => {
				notificationMessage = null;
			}, 3000);
		} catch (err) {
			console.error(`Error ${response} invite:`, err);
			notificationMessage = `Failed to ${response} invitation`;
			notificationType = 'error';

			// Auto-hide notification after 3 seconds
			setTimeout(() => {
				notificationMessage = null;
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>User Profile</title>
</svelte:head>

<div class="min-h-screen bg-white">
	{#if notificationMessage}
		<div
			class="fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg {notificationType === 'success'
				? 'bg-green-100 text-green-800'
				: 'bg-red-100 text-red-800'}"
			transition:fade
		>
			{notificationMessage}
		</div>
	{/if}

	

	<div class="container mx-auto max-w-4xl p-6">
		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<div class="animate-pulse text-gray-600">Loading profile...</div>
			</div>
		{:else if error}
			<div class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
				<p class="mb-4 text-gray-700">{error}</p>
				<button
					class="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
					on:click={() => goto('/auth/login')}
				>
					Return to Login
				</button>
			</div>
		{:else if user}
			<h1 class="mb-6 border-b border-gray-200 pb-2 text-2xl font-bold">User Profile</h1>

			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex flex-col items-center gap-6 md:flex-row md:items-start">
					<div class="relative h-32 w-32">
						{#if user.profileImage && user.profileImage.length > 2}
							<img
								src={user.profileImage}
								alt="{user.username}'s profile"
								class="h-32 w-32 rounded-full border-2 border-gray-200 object-cover"
							/>
						{:else}
							<div
								class="flex h-32 w-32 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-700"
							>
								{user.username.charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
					<div>
						<h2 class="text-xl font-semibold">{user.username}</h2>
						<p class="mt-1 text-gray-600">{user.email}</p>
						<p class="mt-2 text-sm text-gray-500">
							Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold">
					Update Profile Image
				</h3>
				<div class="flex flex-col gap-3 sm:flex-row">
					<input
						type="text"
						bind:value={newImageUrl}
						placeholder="Enter image URL"
						class="flex-grow rounded border border-gray-300 px-3 py-2"
					/>
					<button
						on:click={updateProfileImage}
						class="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
					>
						Update Image
					</button>
				</div>

				{#if updateSuccess}
					<div class="mt-3 rounded bg-gray-100 p-3 text-gray-700">
						Profile image updated successfully!
					</div>
				{/if}

				{#if updateError}
					<div class="mt-3 rounded bg-red-50 p-3 text-red-800">
						{updateError}
					</div>
				{/if}
			</div>

			<!-- Group Management Section -->
			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
					<h3 class="text-lg font-semibold">My Groups</h3>
					<button
						on:click={() => goto('/group/create')}
						class="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
					>
						Create Group
					</button>
				</div>

				{#if loadingGroups}
					<div class="py-4 text-center text-gray-600">
						<div class="animate-pulse">Loading groups...</div>
					</div>
				{:else if groupError}
					<div class="rounded bg-red-50 p-3 text-red-800">
						{groupError}
					</div>
				{:else if userGroups.length === 0}
					<p class="py-4 text-center text-gray-600">You are not a member of any groups yet.</p>
				{:else}
					<ul class="divide-y divide-gray-200">
						{#each userGroups as group}
							<li class="flex flex-col justify-between gap-4 py-4 sm:flex-row">
								<div class="flex items-center gap-3">
									{#if group.imageUrl && group.imageUrl.length > 2}
										<img
											src={group.imageUrl}
											alt={group.name}
											class="h-10 w-10 rounded-full border border-gray-200 object-cover"
										/>
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700"
										>
											{group.name.charAt(0).toUpperCase()}
										</div>
									{/if}
									<div>
										<h4 class="font-medium">{group.name}</h4>
										<p class="text-sm text-gray-600">
											{group.members.length} member{group.members.length !== 1 ? 's' : ''}
										</p>
									</div>
								</div>
								<div class="self-center">
									<button
										on:click={() => goto(`/group/${group._id}`)}
										class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
									>
										View Group
									</button>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Group Invitations Section -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold">Group Invitations</h3>

				{#if loadingGroups}
					<div class="py-4 text-center text-gray-600">
						<div class="animate-pulse">Loading invitations...</div>
					</div>
				{:else if pendingInvitations.length === 0}
					<p class="text-gray-600">No pending invitations</p>
				{:else}
					<ul class="divide-y divide-gray-200">
						{#each pendingInvitations as invite}
							<li class="flex flex-col justify-between gap-4 py-4 sm:flex-row">
								<div>
									<h4 class="font-medium">{invite.name}</h4>
									<p class="text-sm text-gray-600">
										Invited by: {typeof invite.createdBy === 'string'
											? invite.createdBy
											: invite.createdBy.username}
									</p>
									<p class="text-sm text-gray-500">
										Invited: {new Date(invite.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div class="flex gap-2 sm:self-center">
									<button
										on:click={() => handleInviteResponse(invite._id, 'accepted')}
										class="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
									>
										Accept
									</button>
									<button
										on:click={() => handleInviteResponse(invite._id, 'declined')}
										class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
									>
										Decline
									</button>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>
</div>
