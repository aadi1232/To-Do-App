<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Group, Todo } from '$lib/types';

	/** @type {import('./$types').PageData} */
	export let data;

	let group = data.group;
	let todos = data.todos || [];
	let error = data.error;

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
	<title>{group ? group.name : 'Shared Group'} | To-Do App</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<div class="container mx-auto max-w-4xl p-6">
		<div class="mb-6 rounded-md border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-800">
			This is a read-only view of a shared group
		</div>

		{#if error}
			<div class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
				<p class="mb-4 text-gray-700">{error}</p>
				<p class="mb-4 text-sm text-gray-500">This shared link may have expired or is invalid.</p>
				<a
					href="/"
					class="inline-block rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
				>
					Go to Home Page
				</a>
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
					</div>
				</div>
			</div>

			<!-- Group To-Dos -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="todos-section">
					<h2 class="mb-4 text-xl font-medium">Group To-Dos</h2>

					{#if todos.length === 0}
						<p class="py-8 text-center text-gray-500">No todos yet in this group.</p>
					{:else}
						<ul class="space-y-2">
							{#each todos as todo}
								<li
									class="flex items-center justify-between rounded border border-gray-200 bg-white p-3 shadow-sm"
								>
									<div class="flex items-center">
										<input
											type="checkbox"
											checked={todo.completed}
											disabled={true}
											class="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class={todo.completed ? 'text-gray-500 line-through' : ''}>
											{todo.title}
										</span>
									</div>
									<div class="flex items-center">
										<span class="text-xs text-gray-500">
											{typeof todo.createdBy === 'string' ? 'Unknown' : todo.createdBy.username}
										</span>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex h-64 items-center justify-center">
				<div class="animate-pulse text-gray-600">Loading shared group...</div>
			</div>
		{/if}
	</div>
</div>
