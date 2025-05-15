    <script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { notifications, connected, initializeSocket, cleanup } from '$lib/stores/socket';
	import { io } from 'socket.io-client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { Socket } from 'socket.io-client';

	// Define proper types
	interface LogMessage {
		timestamp: string;
		message: string;
		type: 'info' | 'success' | 'warning' | 'error';
	}

	interface SocketEvent {
		timestamp: string;
		event: string;
		data: string;
	}

	let userId = '';
	let targetUserId = '';
	let groupId = '';
	let groupName = 'Test Group';
	let socketConnected = false;
	let logMessages: LogMessage[] = [];
	let events: SocketEvent[] = [];
	let eventFilter = '';
	let directSocket: Socket | null = null;
	let socketUrl = 'http://localhost:3001';

	// Subscribe to the socket connected state
	const unsubscribe = connected.subscribe((value) => {
		socketConnected = value;
	});

	function addLogMessage(message: any, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		logMessages = [
			{
				timestamp,
				message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message),
				type
			},
			...logMessages
		];
	}

	function addEvent(event: string, data: any) {
		const timestamp = new Date().toLocaleTimeString();
		events = [
			{
				timestamp,
				event,
				data: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)
			},
			...events
		];
	}

	function connectDirectly() {
		if (!userId) {
			addLogMessage('Please enter a user ID', 'error');
			return;
		}

		try {
			// Disconnect existing socket if any
			if (directSocket) {
				directSocket.disconnect();
				directSocket = null;
				addLogMessage('Disconnected previous socket', 'warning');
			}

			addLogMessage(`Connecting to socket server at ${socketUrl}...`, 'info');

			// Create direct socket connection
			directSocket = io(socketUrl, {
				withCredentials: true,
				autoConnect: true,
				auth: { userId }
			});

			// Set up event listeners
			directSocket.on('connect', () => {
				addLogMessage(`Direct socket connected with ID: ${directSocket?.id}`, 'success');

				// Join user's room
				directSocket?.emit('join:groups', { groupIds: groupId ? [groupId] : [] });
			});

			directSocket.on('disconnect', () => {
				addLogMessage('Direct socket disconnected', 'warning');
			});

			directSocket.on('connect_error', (err) => {
				addLogMessage(`Direct socket connection error: ${err.message}`, 'error');
				console.error('Socket connection error details:', err);
			});

			// Listen for all events
			directSocket.onAny((event, ...args) => {
				addEvent(event, args[0]);
				addLogMessage(`Received event: ${event}`, 'info');
				console.log(`[Socket Debug] Event ${event}:`, args);
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			addLogMessage(`Error connecting to socket: ${errorMessage}`, 'error');
		}
	}

	function disconnectDirectly() {
		if (directSocket) {
			directSocket.disconnect();
			directSocket = null;
			addLogMessage('Disconnected direct socket', 'warning');
		}
	}

	function testDirectInvite() {
		if (!directSocket || !directSocket.connected) {
			addLogMessage('Socket not connected', 'error');
			return;
		}

		if (!targetUserId || !groupId) {
			addLogMessage('Target user ID and group ID are required', 'error');
			return;
		}

		directSocket.emit('direct:group_invite', {
			targetUserId,
			groupId,
			groupName,
			inviterName: `User ${userId}`,
			groupDescription: 'This is a test group invitation'
		});

		addLogMessage(`Sent direct invite to user ${targetUserId} for group ${groupId}`, 'success');
	}

	function testCreateTodo() {
		if (!directSocket || !directSocket.connected) {
			addLogMessage('Socket not connected', 'error');
			return;
		}

		if (!groupId) {
			addLogMessage('Group ID is required', 'error');
			return;
		}

		directSocket.emit('todo:created', {
			todo: {
				_id: `test_${Date.now()}`,
				title: `Test Todo Created at ${new Date().toLocaleTimeString()}`,
				description: 'This is a test todo',
				priority: 'high'
			},
			groupId,
			groupName,
			username: `User ${userId}`
		});

		addLogMessage(`Sent todo:created event to group ${groupId}`, 'success');
	}

	function testRoleChange() {
		if (!directSocket || !directSocket.connected) {
			addLogMessage('Socket not connected', 'error');
			return;
		}

		if (!targetUserId || !groupId) {
			addLogMessage('Target user ID and group ID are required', 'error');
			return;
		}

		directSocket.emit('group:user_role_changed', {
			userId: targetUserId,
			groupId,
			groupName,
			newRole: 'co-lead',
			adminName: `User ${userId}`
		});

		addLogMessage(`Sent role change event for user ${targetUserId} in group ${groupId}`, 'success');
	}

	function fetchUserData() {
		// Try to get user ID from local storage first
		if (browser) {
			try {
				// Check localStorage for user info
				const storedUser = localStorage.getItem('user');
				if (storedUser) {
					const userObj = JSON.parse(storedUser);
					if (userObj && userObj._id) {
						userId = userObj._id;
						addLogMessage(`User ID loaded from storage: ${userId}`, 'info');

						// Auto-connect if we got the user ID
						setTimeout(() => {
							if (userId && !directSocket) {
								connectDirectly();
							}
						}, 500);
						return;
					}
				}
			} catch (err) {
				console.error('Error reading user from localStorage:', err);
			}

			// Fallback to URL parameter
			const urlParams = new URLSearchParams(window.location.search);
			const paramUserId = urlParams.get('userId');

			if (paramUserId) {
				userId = paramUserId;
				addLogMessage(`User ID set from URL parameter: ${userId}`, 'info');
			} else {
				addLogMessage('No user ID found in storage or URL. Please enter it manually.', 'warning');
			}
		}
	}

	onMount(() => {
		if (browser) {
			fetchUserData();
			addLogMessage('Socket Debug Page Loaded', 'info');
		}
	});

	onDestroy(() => {
		unsubscribe();
		if (directSocket) {
			directSocket.disconnect();
		}
	});
</script>

<svelte:head>
	<title>Socket.IO Debug</title>
</svelte:head>

<div class="socket-debug-container">
	<h1>Socket.IO Debug</h1>

	<div class="debug-controls">
		<div class="input-group">
			<label for="userId">Your User ID:</label>
			<input id="userId" bind:value={userId} placeholder="Enter your user ID" />
		</div>

		<div class="input-group">
			<label for="targetUserId">Target User ID:</label>
			<input
				id="targetUserId"
				bind:value={targetUserId}
				placeholder="Enter target user ID for notifications"
			/>
		</div>

		<div class="input-group">
			<label for="groupId">Group ID:</label>
			<input id="groupId" bind:value={groupId} placeholder="Enter group ID" />
		</div>

		<div class="input-group">
			<label for="groupName">Group Name:</label>
			<input id="groupName" bind:value={groupName} placeholder="Enter group name" />
		</div>

		<div class="button-group">
			<button on:click={connectDirectly} class="primary" disabled={!userId}>
				Connect Socket
			</button>
			<button on:click={disconnectDirectly} class="warning"> Disconnect </button>
		</div>

		<div class="status-indicator">
			Socket Status:
			<span class={directSocket && directSocket.connected ? 'connected' : 'disconnected'}>
				{directSocket && directSocket.connected ? 'Connected' : 'Disconnected'}
			</span>
		</div>
	</div>

	<div class="test-actions">
		<h2>Test Socket Events</h2>
		<div class="button-group">
			<button on:click={testDirectInvite} disabled={!directSocket || !directSocket.connected}>
				Test Group Invite
			</button>
			<button on:click={testCreateTodo} disabled={!directSocket || !directSocket.connected}>
				Test Create Todo
			</button>
			<button on:click={testRoleChange} disabled={!directSocket || !directSocket.connected}>
				Test Role Change
			</button>
		</div>
	</div>

	<div class="debug-panels">
		<div class="debug-panel">
			<h2>Socket Events</h2>
			<input placeholder="Filter events" bind:value={eventFilter} class="filter-input" />
			<div class="event-list">
				{#each events.filter((e) => !eventFilter || e.event.includes(eventFilter)) as event}
					<div class="event-item">
						<div class="event-header">
							<span class="event-time">{event.timestamp}</span>
							<span class="event-name">{event.event}</span>
						</div>
						<pre class="event-data">{event.data}</pre>
					</div>
				{/each}
			</div>
		</div>

		<div class="debug-panel">
			<h2>Log Messages</h2>
			<div class="log-list">
				{#each logMessages as log}
					<div class="log-item {log.type}">
						<span class="log-time">{log.timestamp}</span>
						<span class="log-message">{log.message}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.socket-debug-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	h1,
	h2 {
		margin-bottom: 20px;
	}

	.debug-controls {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 15px;
		margin-bottom: 20px;
		padding: 15px;
		background-color: #f5f5f5;
		border-radius: 8px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
	}

	.input-group label {
		margin-bottom: 5px;
		font-weight: bold;
	}

	input {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.button-group {
		display: flex;
		gap: 10px;
		margin-top: 15px;
	}

	button {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background-color: #4a5568;
		color: white;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button.primary {
		background-color: #4299e1;
	}

	button.warning {
		background-color: #ed8936;
	}

	.status-indicator {
		margin-top: 15px;
		font-weight: bold;
	}

	.status-indicator .connected {
		color: #48bb78;
	}

	.status-indicator .disconnected {
		color: #f56565;
	}

	.test-actions {
		margin-bottom: 20px;
		padding: 15px;
		background-color: #f5f5f5;
		border-radius: 8px;
	}

	.debug-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.debug-panel {
		background-color: #f5f5f5;
		border-radius: 8px;
		padding: 15px;
		max-height: 600px;
		overflow-y: auto;
	}

	.filter-input {
		width: 100%;
		margin-bottom: 10px;
	}

	.event-list,
	.log-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.event-item,
	.log-item {
		background-color: white;
		padding: 10px;
		border-radius: 4px;
		border-left: 4px solid #4299e1;
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 5px;
	}

	.event-name {
		font-weight: bold;
	}

	.event-data,
	.log-message {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.log-item {
		display: flex;
		flex-direction: column;
	}

	.log-item.info {
		border-left-color: #4299e1;
	}

	.log-item.success {
		border-left-color: #48bb78;
	}

	.log-item.warning {
		border-left-color: #ed8936;
	}

	.log-item.error {
		border-left-color: #f56565;
	}

	.log-time,
	.event-time {
		font-size: 0.8rem;
		color: #718096;
	}
</style>
