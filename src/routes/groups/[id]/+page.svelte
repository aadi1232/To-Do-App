<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { inviteUserToGroup } from '$lib/api/groups';
	import { getGroupTodos, createGroupTodo, updateGroupTodo, deleteGroupTodo } from '$lib/api/todos';
	import type { Group, User, Todo } from '$lib/types';

	const groupId = $page.params.id;

	let group: Group | null = null;
	let todos: Todo[] = [];
	let loading = true;
	let error: string | null = null;
	let currentUser: User | null = null;
	let userRole: string | null = null;
	let notificationMessage: string | null = null;
	let notificationType: 'success' | 'error' = 'success';

	// Form states
	let newTodoTitle = '';
	let newInviteEmail = '';
	let activeTab = 'todos';
	let todoLoading = false;
	let inviteLoading = false;

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

			// Fetch todos for the group
			await fetchTodos();

			loading = false;
		} catch (err) {
			console.error('Error loading group:', err);
			error = err instanceof Error ? err.message : 'Failed to load group';
			loading = false;
		}
	});

	async function fetchTodos() {
		try {
			const fetchedTodos = await getGroupTodos(groupId);
			todos = fetchedTodos;
		} catch (err) {
			console.error('Error fetching todos:', err);
			showNotification('Failed to load todos', 'error');
		}
	}

	async function handleAddTodo() {
		if (!newTodoTitle.trim()) {
			showNotification('Todo title cannot be empty', 'error');
			return;
		}

		todoLoading = true;

		try {
			await createGroupTodo(groupId, { title: newTodoTitle.trim() });
			newTodoTitle = '';
			await fetchTodos();
			showNotification('Todo added successfully');
		} catch (err) {
			console.error('Error adding todo:', err);
			showNotification(err instanceof Error ? err.message : 'Failed to add todo', 'error');
		} finally {
			todoLoading = false;
		}
	}

	async function handleToggleTodo(todo: Todo) {
		try {
			await updateGroupTodo(todo._id, { completed: !todo.completed });
			await fetchTodos();
		} catch (err) {
			console.error('Error updating todo:', err);
			showNotification(err instanceof Error ? err.message : 'Failed to update todo', 'error');
		}
	}

	async function handleDeleteTodo(todo: Todo) {
		try {
			await deleteGroupTodo(todo._id);
			await fetchTodos();
			showNotification('Todo deleted successfully');
		} catch (err) {
			console.error('Error deleting todo:', err);
			showNotification(err instanceof Error ? err.message : 'Failed to delete todo', 'error');
		}
	}

	async function handleInviteUser() {
		if (!newInviteEmail.trim()) {
			showNotification('Email cannot be empty', 'error');
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newInviteEmail)) {
			showNotification('Please enter a valid email address', 'error');
			return;
		}

		inviteLoading = true;

		try {
			const updatedGroup = await inviteUserToGroup(groupId, newInviteEmail);
			newInviteEmail = '';

			// Update the local group data
			if (updatedGroup) {
				group = updatedGroup;
			}

			showNotification('Invitation sent successfully');
		} catch (err) {
			console.error('Error inviting user:', err);
			showNotification(err instanceof Error ? err.message : 'Failed to invite user', 'error');
		} finally {
			inviteLoading = false;
		}
	}

	function changeTab(tab: string) {
		activeTab = tab;
	}

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

	function isAdmin() {
		return userRole === 'admin' || userRole === 'co-lead';
	}

	function canAddTodos() {
		return userRole !== 'member'; // admin, co-lead, elder can add todos
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
					<button
						class="px-1 py-4 text-sm font-medium {activeTab === 'todos'
							? 'border-b-2 border-black text-black'
							: 'text-gray-500 hover:text-gray-700'}"
						on:click={() => changeTab('todos')}
					>
						To-Dos
					</button>
					<button
						class="px-1 py-4 text-sm font-medium {activeTab === 'members'
							? 'border-b-2 border-black text-black'
							: 'text-gray-500 hover:text-gray-700'}"
						on:click={() => changeTab('members')}
					>
						Members
					</button>
					{#if isAdmin()}
						<button
							class="px-1 py-4 text-sm font-medium {activeTab === 'settings'
								? 'border-b-2 border-black text-black'
								: 'text-gray-500 hover:text-gray-700'}"
							on:click={() => changeTab('settings')}
						>
							Settings
						</button>
					{/if}
				</nav>
			</div>

			<!-- Group Content -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				{#if activeTab === 'todos'}
					<div class="todos-section">
						<h2 class="mb-4 text-xl font-medium">Group To-Dos</h2>

						{#if canAddTodos()}
							<form class="mb-6" on:submit|preventDefault={handleAddTodo}>
								<div class="flex">
									<input
										type="text"
										bind:value={newTodoTitle}
										placeholder="Add a new todo..."
										class="flex-grow rounded-l border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
									/>
									<button
										type="submit"
										class="rounded-r bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
										disabled={todoLoading || !newTodoTitle.trim()}
									>
										{todoLoading ? 'Adding...' : 'Add'}
									</button>
								</div>
							</form>
						{/if}

						{#if todos.length === 0}
							<p class="py-8 text-center text-gray-500">
								No todos yet. {canAddTodos() ? 'Add one to get started!' : ''}
							</p>
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
												on:change={() => handleToggleTodo(todo)}
												class="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<span class={todo.completed ? 'text-gray-500 line-through' : ''}>
												{todo.title}
											</span>
										</div>
										<div class="flex items-center space-x-2">
											<span class="text-xs text-gray-500">
												{typeof todo.createdBy === 'string' ? 'Unknown' : todo.createdBy.username}
											</span>
											{#if canAddTodos()}
												<button
													on:click={() => handleDeleteTodo(todo)}
													class="ml-2 text-red-500 hover:text-red-700"
													title="Delete"
												>
													<svg
														class="h-5 w-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M6 18L18 6M6 6l12 12"
														></path>
													</svg>
												</button>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{:else if activeTab === 'members'}
					<div class="members-section">
						<h2 class="mb-4 text-xl font-medium">Group Members</h2>

						{#if isAdmin()}
							<div class="mb-6">
								<form on:submit|preventDefault={handleInviteUser} class="flex items-end space-x-2">
									<div class="flex-grow">
										<label for="inviteEmail" class="mb-1 block text-sm font-medium text-gray-700">
											Invite New Member
										</label>
										<input
											id="inviteEmail"
											type="email"
											bind:value={newInviteEmail}
											placeholder="Enter email address"
											class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
										/>
									</div>
									<button
										type="submit"
										class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
										disabled={inviteLoading || !newInviteEmail.trim()}
									>
										{inviteLoading ? 'Sending...' : 'Invite'}
									</button>
								</form>
							</div>
						{/if}

						<ul class="space-y-4">
							{#each group.members as member}
								<li
									class="flex items-center justify-between rounded border border-gray-200 bg-white p-4 shadow-sm"
								>
									<div class="flex items-center">
										<div class="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
											{#if typeof member.user !== 'string' && member.user.profileImage}
												<img
													src={member.user.profileImage}
													alt={getMemberName(member)}
													class="h-full w-full object-cover"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-blue-500 text-white"
												>
													{getMemberName(member).charAt(0).toUpperCase()}
												</div>
											{/if}
										</div>
										<div>
											<p class="font-medium">{getMemberName(member)}</p>
											<p class="text-xs text-gray-500">
												{getMemberEmail(member)}
											</p>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<span
											class="rounded-full px-3 py-1 text-xs font-medium {getRoleBadgeClass(
												member.role
											)}"
										>
											{member.role}
										</span>
										<span class="text-xs text-gray-500">
											{member.invitationStatus === 'pending' ? '(Pending)' : ''}
										</span>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{:else if activeTab === 'settings' && isAdmin()}
					<div class="settings-section">
						<h2 class="mb-4 text-xl font-medium">Group Settings</h2>

						<div class="space-y-4">
							<div class="rounded border border-gray-200 bg-gray-50 p-4">
								<h3 class="mb-2 font-medium">Manage Group</h3>
								<p class="mb-4 text-sm text-gray-600">
									You can update group settings or delete the group.
								</p>

								<div class="flex space-x-2">
									<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
										Edit Group
									</button>
									<button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
										Delete Group
									</button>
								</div>
							</div>

							<div class="rounded border border-gray-200 bg-gray-50 p-4">
								<h3 class="mb-2 font-medium">Member Permissions</h3>
								<p class="text-sm text-gray-600">
									<strong>Admin:</strong> Full control over group and members<br />
									<strong>Co-lead:</strong> Can add/remove todos and members<br />
									<strong>Elder:</strong> Can add/remove todos but not members<br />
									<strong>Member:</strong> Can only view and complete todos
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
