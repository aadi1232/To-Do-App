<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';

	// Define user interface
	interface User {
		_id: string;
		username: string;
		email: string;
		profileImage?: string;
		createdAt?: string;
	}

	// Define group invite interface
	interface GroupInvite {
		id: string;
		groupName: string;
		invitedBy: string;
		invitedAt: string;
	}

	let user: User | null = null;
	let loading = true;
	let error: string | null = null;
	let profileImage = '';
	let newImageUrl = '';
	let updateSuccess = false;
	let updateError: string | null = null;

	// Mock group invites data
	const groupInvites: GroupInvite[] = [
		{
			id: 'invite1',
			groupName: 'Project Alpha',
			invitedBy: 'Jane Smith',
			invitedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
		},
		{
			id: 'invite2',
			groupName: 'Marketing Team',
			invitedBy: 'John Doe',
			invitedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
		}
	];

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

			const userData = await response.json();
			user = userData;
			profileImage =
				userData.profileImage ||
				'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.username);
			loading = false;
		} catch (err) {
			console.error('Error loading profile:', err);
			error = err instanceof Error ? err.message : 'Failed to load profile';
			loading = false;
		}
	});

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
			profileImage = newImageUrl;
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

	function acceptInvite(inviteId: string) {
		// This would be implemented with a real API call
		console.log(`Accepting invite ${inviteId}`);
		alert(`Invite accepted! (This is a mock response)`);
	}

	function declineInvite(inviteId: string) {
		// This would be implemented with a real API call
		console.log(`Declining invite ${inviteId}`);
		alert(`Invite declined! (This is a mock response)`);
	}
</script>

<svelte:head>
	<title>User Profile</title>
</svelte:head>

<div class="min-h-screen bg-white">

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
						<img
							src={profileImage}
							alt="{user.username}'s profile"
							class="h-32 w-32 rounded-full border-2 border-gray-200 object-cover"
						/>
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

			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold">Group Invitations</h3>

				{#if groupInvites.length === 0}
					<p class="text-gray-600">No pending invitations</p>
				{:else}
					<ul class="divide-y divide-gray-200">
						{#each groupInvites as invite}
							<li class="flex flex-col justify-between gap-4 py-4 sm:flex-row">
								<div>
									<h4 class="font-medium">{invite.groupName}</h4>
									<p class="text-sm text-gray-600">Invited by: {invite.invitedBy}</p>
									<p class="text-sm text-gray-500">
										Invited: {new Date(invite.invitedAt).toLocaleDateString()}
									</p>
								</div>
								<div class="flex gap-2 sm:self-center">
									<button
										on:click={() => acceptInvite(invite.id)}
										class="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
									>
										Accept
									</button>
									<button
										on:click={() => declineInvite(invite.id)}
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
