<script>
	import { onMount } from 'svelte';
	import { addNotification, playNotificationSound, connected } from '$lib/stores/socket';

	let userId = '';
	let groupId = '';
	let socketConnected = false;
	let apiStatus = '';

	$: socketConnected = $connected;

	onMount(async () => {
		try {
			// Get current user
			const userResponse = await fetch('/api/auth/me');
			if (userResponse.ok) {
				const userData = await userResponse.json();
				userId = userData._id;
			}

			// Get user's groups
			if (userId) {
				const groupsResponse = await fetch('/api/groups');
				if (groupsResponse.ok) {
					const groupsData = await groupsResponse.json();
					if (groupsData.groups && groupsData.groups.length > 0) {
						groupId = groupsData.groups[0]._id;
					}
				}
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	// Local notification functions (client-side only)
	function sendGroupInviteNotification() {
		addNotification({
			id: `test_inv_${Date.now()}`,
			type: 'group:invited',
			title: 'Group Invitation',
			message: 'You have been invited to join Test Group',
			timestamp: new Date().toISOString(),
			read: false,
			data: {
				group: {
					_id: 'test-group-id',
					name: 'Test Group'
				},
				invitedBy: 'Test User'
			}
		});
		playNotificationSound();
	}

	function sendGroupJoinedNotification() {
		addNotification({
			id: `test_join_${Date.now()}`,
			type: 'group:joined',
			title: 'Group Update',
			message: 'Test User joined the group',
			timestamp: new Date().toISOString(),
			read: false,
			data: {
				user: {
					_id: 'test-user-id',
					username: 'Test User'
				}
			}
		});
		playNotificationSound();
	}

	function sendTodoAddedNotification() {
		addNotification({
			id: `test_todo_${Date.now()}`,
			type: 'todo:added',
			title: 'Todo Update',
			message: 'Test User added a new todo: Test Todo',
			timestamp: new Date().toISOString(),
			read: false,
			data: {
				todo: {
					_id: 'test-todo-id',
					title: 'Test Todo'
				},
				performedBy: {
					userId: 'test-user-id',
					username: 'Test User'
				}
			}
		});
		playNotificationSound();
	}

	// Real socket API-based functions - these will trigger the socket server to send events
	async function triggerRealTodoCreate() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'todo:create',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Todo creation notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Connection failed'}`;
			console.error('Error triggering real todo create:', error);
		}
	}

	async function triggerRealTodoUpdate() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'todo:update',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Todo update notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Connection failed'}`;
			console.error('Error triggering real todo update:', error);
		}
	}

	async function triggerRealGroupInvite() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'group:invite',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Group invitation notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Connection failed'}`;
			console.error('Error triggering real group invite:', error);
		}
	}

	// New notification tests for the required notification types
	async function triggerTodoCompleted() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';
			// Use the API endpoint to trigger the server event
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'todo:completed',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Todo completed notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Failed to trigger event'}`;
			console.error('Error triggering todo completed:', error);
		}
	}

	async function triggerUserRoleChanged() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';

			// Use the API endpoint to trigger the server event
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'group:user_role_changed',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Role change notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Failed to trigger event'}`;
			console.error('Error triggering role change:', error);
		}
	}

	async function triggerUserRemoved() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending request...';

			// Use the API endpoint to trigger the server event
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'group:user_removed',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: User removed notification sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Failed to trigger event'}`;
			console.error('Error triggering user removed:', error);
		}
	}

	// Direct Group Invitation - This method uses a direct socket connection
	// instead of going through the regular group controller
	async function triggerDirectGroupInvite() {
		if (!userId) {
			apiStatus = 'Error: No user ID';
			return;
		}

		try {
			apiStatus = 'Sending direct invitation request...';

			// Use the API endpoint to trigger direct invitation
			const response = await fetch('/api/test-socket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: 'direct:group_invite',
					userId,
					groupId: groupId || undefined
				})
			});

			const data = await response.json();
			apiStatus = data.success
				? 'Success: Direct group invitation sent'
				: `Error: ${data.message || 'Unknown error'}`;
		} catch (error) {
			apiStatus = `Error: ${error instanceof Error ? error.message : 'Failed to send direct invitation'}`;
			console.error('Error sending direct invitation:', error);
		}
	}
</script>

<svelte:head>
	<title>Test Notifications</title>
</svelte:head>

<div class="container mx-auto max-w-2xl p-6">
	<h1 class="mb-6 text-2xl font-bold">Test Real-Time Notifications</h1>

	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
		<h2 class="mb-2 text-lg font-semibold">Connection Status</h2>
		<div class="flex items-center gap-2">
			<div class={`h-3 w-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
			<span>{socketConnected ? 'Connected to Socket.IO' : 'Not Connected to Socket.IO'}</span>
		</div>
		{#if userId}
			<p class="mt-1 text-sm text-gray-600">User ID: {userId}</p>
		{/if}
		{#if groupId}
			<p class="mt-1 text-sm text-gray-600">Group ID: {groupId}</p>
		{/if}
		{#if apiStatus}
			<p
				class="mt-2 text-sm"
				class:text-green-600={apiStatus.startsWith('Success')}
				class:text-red-600={apiStatus.startsWith('Error')}
			>
				{apiStatus}
			</p>
		{/if}
	</div>

	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-semibold">🔴 Direct Group Invitation Test</h2>
		<p class="mb-4 text-sm text-gray-600">
			This uses a direct communication method to bypass any middleware and ensure the notification
			reaches the user directly. Try this if regular invitations aren't working.
		</p>

		<button
			class="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
			on:click={triggerDirectGroupInvite}
			disabled={!socketConnected || !userId}
		>
			Send Direct Group Invitation
		</button>
	</div>

	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-semibold">Test Required Notification Types</h2>
		<p class="mb-6 text-sm text-gray-600">
			These are the specific notification types needed for the app:
		</p>

		<div class="grid gap-4 md:grid-cols-2">
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				on:click={triggerRealGroupInvite}
				disabled={!socketConnected || !userId}
			>
				1. Group Invitation
			</button>
			<button
				class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
				on:click={triggerTodoCompleted}
				disabled={!socketConnected || !userId}
			>
				2. Todo Completed
			</button>
			<button
				class="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
				on:click={triggerUserRoleChanged}
				disabled={!socketConnected || !userId}
			>
				3a. User Role Changed
			</button>
			<button
				class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
				on:click={triggerUserRemoved}
				disabled={!socketConnected || !userId}
			>
				3b. User Removed
			</button>
		</div>
	</div>

	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-semibold">Send Real Socket Notifications</h2>
		<p class="mb-6 text-sm text-gray-600">
			These buttons trigger real Socket.IO events through the standalone socket server. Socket.IO
			must be running on port 3001.
		</p>

		<div class="grid gap-4 md:grid-cols-2">
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				on:click={triggerRealGroupInvite}
				disabled={!socketConnected || !userId}
			>
				Real Group Invitation
			</button>
			<button
				class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
				on:click={triggerRealTodoCreate}
				disabled={!socketConnected || !userId}
			>
				Real Todo Created
			</button>
			<button
				class="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
				on:click={triggerRealTodoUpdate}
				disabled={!socketConnected || !userId}
			>
				Real Todo Updated
			</button>
		</div>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-semibold">Send Client-side Notifications</h2>
		<p class="mb-6 text-sm text-gray-600">
			These buttons send test notifications directly from the client. These are client-side only and
			will not affect other users.
		</p>

		<div class="grid gap-4 md:grid-cols-2">
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click={sendGroupInviteNotification}
			>
				Test Group Invitation
			</button>
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click={sendGroupJoinedNotification}
			>
				Test User Joined Group
			</button>
			<button
				class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				on:click={sendTodoAddedNotification}
			>
				Test Todo Added
			</button>
		</div>
	</div>
</div>
