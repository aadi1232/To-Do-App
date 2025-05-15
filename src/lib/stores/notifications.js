import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { playNotificationSound } from './socket';

/**
 * @typedef {Object} Notification
 * @property {string} _id - Notification ID
 * @property {string} type - Notification type
 * @property {string} message - Notification message
 * @property {boolean} read - Whether the notification has been read
 * @property {string} timestamp - Timestamp of when notification was created
 * @property {Object} [data] - Additional data
 */

// Store for notification data
/** @type {import('svelte/store').Writable<Notification[]>} */
export const notifications = writable([]);
export const unreadCount = writable(0);
export const loadingNotifications = writable(false);
/** @type {import('svelte/store').Writable<string | null>} */
export const notificationsError = writable(null);

/**
 * Fetch notifications from the server
 * @returns {Promise<void>}
 */
export async function fetchNotifications() {
	if (!browser) return;

	try {
		loadingNotifications.set(true);
		notificationsError.set(null);

		const response = await fetch('/api/notifications', {
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch notifications: ${response.statusText}`);
		}

		/** @type {Notification[]} */
		const data = await response.json();
		notifications.set(data);

		// Update unread count
		updateUnreadCount();
	} catch (error) {
		console.error('Error fetching notifications:', error);
		notificationsError.set(error instanceof Error ? error.message : String(error));
	} finally {
		loadingNotifications.set(false);
	}
}

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @returns {Promise<boolean>} Success status
 */
export async function markAsRead(notificationId) {
	if (!browser) return false;

	try {
		const response = await fetch(`/api/notifications/${notificationId}/read`, {
			method: 'PUT',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Failed to mark notification as read: ${response.statusText}`);
		}

		// Update local state
		notifications.update((currentNotifications) => {
			return currentNotifications.map((notification) => {
				if (notification._id === notificationId) {
					return { ...notification, read: true };
				}
				return notification;
			});
		});

		// Update unread count
		updateUnreadCount();

		return true;
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return false;
	}
}

/**
 * Mark all notifications as read
 * @returns {Promise<boolean>} Success status
 */
export async function markAllAsRead() {
	if (!browser) return false;

	try {
		const response = await fetch('/api/notifications/read-all', {
			method: 'PUT',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
		}

		// Update local state
		notifications.update((currentNotifications) => {
			return currentNotifications.map((notification) => {
				return { ...notification, read: true };
			});
		});

		// Update unread count
		unreadCount.set(0);

		return true;
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
		return false;
	}
}

/**
 * Add a new notification to the store
 * @param {Notification} notification - The notification to add
 */
export function addNotification(notification) {
	notifications.update((currentNotifications) => {
		// Check if this is a duplicate (by ID)
		const exists = currentNotifications.some((n) => n._id === notification._id);
		if (exists) return currentNotifications;

		// Add to beginning of array
		return [notification, ...currentNotifications];
	});

	// Update unread count
	updateUnreadCount();

	// Play notification sound
	playNotificationSound();
}

/**
 * Update the unread count
 */
function updateUnreadCount() {
	notifications.update((currentNotifications) => {
		const count = currentNotifications.filter((n) => !n.read).length;
		unreadCount.set(count);
		return currentNotifications;
	});
}

// Initialize notifications when in browser
if (browser) {
	fetchNotifications().catch((error) => {
		console.error('Failed to initialize notifications:', error);
	});
}
