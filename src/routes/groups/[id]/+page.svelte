<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Group, User } from '$lib/types';

	const groupId = $page.params.id;

	let group: Group | null = null;
	let loading = true;
	let error: string | null = null;
	let currentUser: User | null = null;
	let userRole: string | null = null;
	let notificationMessage: string | null = null;
	let notificationType: 'success' | 'error' = 'success';

	onMount(async () => {
		try {
			// Check authentication
			const authResponse = await fetch('/api/auth/me');
			if (!authResponse.ok) {
				if (authResponse.status === 401) {
					goto('/auth/login');
					return;
				}
				throw new Error('Authentication failed');
			}

			currentUser = await authResponse.json();

			// Fetch group details
			const groupResponse = await fetch(`/api/groups/${groupId}`);
			if (!groupResponse.ok) {
				throw new Error('Failed to fetch group details');
			}

			const data = await groupResponse.json();
			group = data.group;

			// Determine user's role in the group
			if (group && currentUser) {
				const member = group.members.find((m) =>
					typeof m.user === 'string' ? m.user === currentUser?._id : m.user._id === currentUser?._id
				);

				if (member) {
					userRole = member.role;
				}
			}

			loading = false;
		} catch (err) {
			console.error('Error loading group:', err);
			error = err instanceof Error ? err.message : 'Failed to load group';
			loading = false;
		}
	});

	function showNotification(message: string, type: 'success' | 'error' = 'success') {
		notificationMessage = message;
		notificationType = type;

		setTimeout(() => {
			notificationMessage = null;
		}, 3000);
	}

	function getMemberName(member: any): string {
		if (typeof member.user === 'string') {
			return 'Unknown User';
		}
		return member.user.username;
	}

	function getMemberEmail(member: any): string {
		if (typeof member.user === 'string') {
			return '';
		}
		return member.user.email;
	}

	function getRoleBadgeClass(role: string): string {
		switch (role) {
			case 'admin':
				return 'bg-red-100 text-red-800';
			case 'co-lead':
				return 'bg-purple-100 text-purple-800';
			case 'elder':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>{group ? group.name : 'Group'} | To-Do App</title>
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
		<div class="mb-6">
			<button
				class="flex items-center text-gray-600 hover:text-gray-900"
				on:click={() => goto('/groups')}
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
				<span class="ml-1">Back to Groups</span>
			</button>
		</div>

		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<div class="animate-pulse text-gray-600">Loading group...</div>
			</div>
		{:else if error}
			<div class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
				<p class="mb-4 text-gray-700">{error}</p>
				<button
					class="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
					on:click={() => goto('/groups')}
				>
					Return to Groups
				</button>
			</div>
		{:else if group}
			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex flex-col items-center gap-6 md:flex-row md:items-start">
					<div class="relative h-24 w-24">
						{#if group.imageUrl && group.imageUrl.length > 2}
							<img
								src={group.imageUrl}
								alt={group.name}
								class="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
							/>
						{:else}
							<div
								class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-700"
							>
								{group.name.charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
					<div>
						<h1 class="text-2xl font-bold">{group.name}</h1>
						<p class="mt-1 text-gray-600">
							{group.members.length} member{group.members.length !== 1 ? 's' : ''}
						</p>
						<p class="mt-2 text-sm text-gray-500">
							Created: {new Date(group.createdAt).toLocaleDateString()}
						</p>
						{#if userRole}
							<div class="mt-2">
								<span
									class="rounded-full px-3 py-1 text-xs font-medium {getRoleBadgeClass(userRole)}"
								>
									Your role: {userRole}
								</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Group Tabs -->
			<div class="mb-6 border-b border-gray-200">
				<nav class="-mb-px flex space-x-8">
					<a href="#todos" class="border-b-2 border-black px-1 py-4 text-sm font-medium">
						To-Dos
					</a>
					<a
						href="#members"
						class="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Members
					</a>
					<a
						href="#settings"
						class="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Settings
					</a>
				</nav>
			</div>

			<!-- Group Content - Placeholder -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<p class="text-center text-gray-600">Group content will be displayed here</p>
			</div>
		{/if}
	</div>
</div>
