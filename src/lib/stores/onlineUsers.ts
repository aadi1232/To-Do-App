import { writable } from 'svelte/store';

// Store for keeping track of online users
export const onlineUsers = writable<Set<string>>(new Set());

/**
 * Update the online users list with an array of user IDs
 * @param userIds - Array of user IDs who are online
 */
export function updateOnlineUsers(userIds: string[]): void {
	if (Array.isArray(userIds)) {
		onlineUsers.set(new Set(userIds));
	}
}

/**
 * Add a single user to the online users set
 * @param userId - ID of the user to mark as online
 */
export function addOnlineUser(userId: string): void {
	onlineUsers.update((users) => {
		users.add(userId);
		return users;
	});
}

/**
 * Remove a single user from the online users set
 * @param userId - ID of the user to mark as offline
 */
export function removeOnlineUser(userId: string): void {
	onlineUsers.update((users) => {
		users.delete(userId);
		return users;
	});
}

/**
 * Check if a specific user is online
 * @param userId - ID of the user to check
 * @returns Whether the user is online
 */
export function isUserOnline(userId: string): boolean {
	let result = false;

	// Get the current value from the store without subscribing
	onlineUsers.update((users) => {
		result = users.has(userId);
		return users;
	});

	return result;
}
