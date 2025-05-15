import { io } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// Define notification type
/**
 * @typedef {Object} Notification
 * @property {string} id - Unique identifier
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {Object} data - Additional data
 * @property {string} timestamp - Timestamp
 * @property {boolean} read - Whether notification is read
 */

// Store for notifications
export const notifications = writable(/** @type {Notification[]} */ ([]));

// Store for connection status
export const connected = writable(false);

// Store for unread notifications count
export const unreadCount = writable(0);

// Socket.io instance
/** @type {import('socket.io-client').Socket | null} */
let socket = null;

/**
 * Initialize the Socket.IO connection
 * @param {string} userId - The ID of the current user
 * @param {string[]} groupIds - Array of group IDs the user belongs to
 */
export function initializeSocket(userId, groupIds = []) {
	if (!browser) return;
	if (!userId) {
		console.warn('Cannot initialize socket without a user ID');
		return;
	}

	// Disconnect existing socket if any
	if (socket && socket.connected) {
		socket.disconnect();
	}

	console.log('Initializing socket connection for user:', userId);

	// Connect to the standalone Socket.IO server (running on port 3001)
	const socketServerUrl =
		browser &&
		(process.env.NODE_ENV === 'production'
			? window.location.origin // In production, use same domain
			: 'http://localhost:3001'); // In development, use dedicated port

	// Create a dummy socket for development if server is not running
	const useDummySocket = false; // Set to true to test without a real socket server

	if (useDummySocket) {
		// Create a dummy socket implementation for development
		console.log('[SOCKET DISABLED] Using dummy socket for development');
		// Set connected state
		connected.set(true);
		return;
	}

	socket = io(socketServerUrl, {
		withCredentials: true,
		autoConnect: true,
		reconnectionAttempts: 3, // Only try reconnecting 3 times
		reconnectionDelay: 1000,
		timeout: 5000, // Lower timeout for faster feedback
		// Sending auth data - send userId directly
		auth: {
			userId
		}
	});

	// Handle connection events
	socket.on('connect', () => {
		console.log('Socket connected successfully');
		connected.set(true);

		// Join user's group rooms
		if (groupIds.length > 0 && socket) {
			console.log('Joining group rooms:', groupIds);
			socket.emit('join:groups', { groupIds });
		}
	});

	socket.on('disconnect', () => {
		console.log('Socket disconnected');
		connected.set(false);
	});

	socket.on('connect_error', (err) => {
		console.error('Socket connection error:', err.message);
		// Log more detailed information about the error
		console.error('Socket connection error details:', {
			message: err.message,
			// Type-safe way to log additional properties
			data: JSON.stringify(err, Object.getOwnPropertyNames(err)),
			stack: err.stack
		});
		connected.set(false);

		// Fallback: if we can't connect after a few attempts, stop trying
		if (socket) {
			// We can't directly access private properties, so use a simple counter
			console.warn('Socket connection failed, will retry a few times');
			// socket.close() will be called automatically after max reconnection attempts
		}
	});

	// Handle notification events
	setupNotificationListeners();
}

/**
 * Set up event listeners for notifications
 */
function setupNotificationListeners() {
	if (!socket) return;

	// Test notification - used to verify notification system works
	socket.on('notification:test', (data) => {
		console.log('Received test notification:', data);
		// Don't show this to user, just log it for debugging
	});

	// Group invitation notifications
	socket.on('group:invited', (data) => {
		console.log('Received group invitation notification:', data);
		addNotification({
			id: `inv_${Date.now()}`,
			type: 'group:invited',
			title: 'Group Invitation',
			message: data.message,
			data: data,
			timestamp: data.timestamp || new Date().toISOString(),
			read: false
		});
		playNotificationSound();
	});

	// Group role changed notifications
	socket.on('group:role_changed', (data) => {
		console.log('Received role change notification:', data);
		addNotification({
			id: `role_${Date.now()}`,
			type: 'group:role_changed',
			title: 'Role Changed',
			message: data.message,
			data: data,
			timestamp: data.timestamp || new Date().toISOString(),
			read: false
		});
		playNotificationSound();
	});

	// Group removed notifications
	socket.on('group:removed', (data) => {
		console.log('Received group removal notification:', data);
		addNotification({
			id: `rem_${Date.now()}`,
			type: 'group:removed',
			title: 'Removed from Group',
			message: data.message,
			data: data,
			timestamp: data.timestamp || new Date().toISOString(),
			read: false
		});
		playNotificationSound();
	});

	// Group joined notifications
	socket.on('group:joined', (data) => {
		addNotification({
			id: `join_${Date.now()}`,
			type: 'group:joined',
			title: 'Group Update',
			message: data.message,
			data: data,
			timestamp: data.timestamp || new Date().toISOString(),
			read: false
		});
		playNotificationSound();
	});

	// Todo notifications
	['todo:added', 'todo:updated', 'todo:deleted', 'todo:completed'].forEach((eventType) => {
		if (socket) {
			socket.on(eventType, (data) => {
				console.log(`Received ${eventType} notification:`, data);

				// Create and dispatch a custom event to the window
				if (typeof window !== 'undefined') {
					// Add detailed logging
					console.log(`Dispatching ${eventType} event to window with data:`, data);

					try {
						// Add group ID to the event name for more specific targeting
						const groupSpecificEventType = `${eventType}-group-${data.groupId}`;
						console.log(`Also dispatching group-specific event: ${groupSpecificEventType}`);

						// Create a custom event with the todo data
						const todoEvent = new CustomEvent(eventType, {
							detail: data,
							bubbles: true,
							cancelable: true
						});

						// Create a group-specific event too
						const groupTodoEvent = new CustomEvent(groupSpecificEventType, {
							detail: data,
							bubbles: true,
							cancelable: true
						});

						// Dispatch both events
						window.dispatchEvent(todoEvent);
						window.dispatchEvent(groupTodoEvent);

						// Force any Svelte components to update by triggering a resize event
						// This is a hack but can help flush UI updates
						setTimeout(() => {
							window.dispatchEvent(new Event('resize'));
						}, 100);
					} catch (eventError) {
						console.error(`Error dispatching ${eventType} event:`, eventError);
					}
				}

				// Create a user-friendly notification message based on event type
				let message = '';
				const userName = data.userName || 'Someone';
				const groupName = data.groupName || 'a group';

				switch (eventType) {
					case 'todo:added':
						message = `${userName} added a new todo in ${groupName}: "${data.title || 'New todo'}"`;
						break;
					case 'todo:updated':
						message = `${userName} updated a todo in ${groupName}: "${data.title || 'A todo'}"`;
						break;
					case 'todo:deleted':
						message = `${userName} deleted a todo in ${groupName}: "${data.title || 'A todo'}"`;
						break;
					case 'todo:completed':
						message = `${userName} ${data.completed ? 'completed' : 'uncompleted'} a todo in ${groupName}: "${data.title || 'A todo'}"`;
						break;
					default:
						message = `Todo update in ${groupName}`;
				}

				addNotification({
					id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
					type: eventType,
					title: 'Todo Update',
					message: message,
					data: data,
					timestamp: data.timestamp || new Date().toISOString(),
					read: false
				});

				playNotificationSound();
			});
		}
	});
}

/**
 * Add a notification to the store
 * @param {Notification} notification - The notification to add
 */
export function addNotification(notification) {
	notifications.update((currentNotifications) => {
		// Add to the beginning of the array
		const updated = [notification, ...currentNotifications];
		// Limit to 50 most recent notifications
		const limited = updated.slice(0, 50);
		return limited;
	});

	// Update unread count
	updateUnreadCount();
}

/**
 * Mark a notification as read
 * @param {string} id - The ID of the notification to mark as read
 */
export function markAsRead(id) {
	notifications.update((currentNotifications) => {
		return currentNotifications.map((notification) => {
			if (notification.id === id) {
				return { ...notification, read: true };
			}
			return notification;
		});
	});

	// Update unread count
	updateUnreadCount();
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
	notifications.update((currentNotifications) => {
		return currentNotifications.map((notification) => {
			return { ...notification, read: true };
		});
	});

	// Update unread count
	unreadCount.set(0);
}

/**
 * Update the unread count
 */
function updateUnreadCount() {
	const currentNotifications = get(notifications);
	const count = currentNotifications.filter((n) => !n.read).length;
	unreadCount.set(count);
}

/**
 * Play the notification sound
 */
export function playNotificationSound() {
	if (!browser) return;

	try {
		const audio = new Audio('/notification.mp3');
		audio.volume = 0.5;
		audio.play().catch((err) => {
			console.warn('Could not play notification sound:', err.message);
		});
	} catch (err) {
		console.warn('Error playing notification sound:', err);
	}
}

/**
 * Join a group room
 * @param {string} groupId - The ID of the group to join
 */
export function joinGroup(groupId) {
	if (!socket || !socket.connected) return;
	socket.emit('join:groups', { groupIds: [groupId] });
}

/**
 * Clean up the socket connection
 */
export function cleanup() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
	connected.set(false);
}

/**
 * Send a direct group invitation to a user
 * @param {string} targetUserId - The ID of the user to invite
 * @param {string} groupId - The ID of the group
 * @param {string} groupName - The name of the group
 * @param {string} inviterName - The name of the user sending the invitation
 */
export function sendDirectGroupInvitation(targetUserId, groupId, groupName, inviterName) {
	if (!socket || !socket.connected) {
		console.warn('Cannot send invitation - socket not connected');
		return false;
	}

	socket.emit('direct:group_invite', {
		targetUserId,
		groupId,
		groupName,
		inviterName
	});

	return true;
}
