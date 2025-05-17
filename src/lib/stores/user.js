import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} username - Username
 * @property {string} [email] - User email
 * @property {string} [profileImage] - URL to profile image
 */

// Initialize the user store
export const user = writable(null);

// Loading state
export const userLoading = writable(true);

/**
 * Fetch the current user from the API and update the store
 * @returns {Promise<User|null>} The user object or null if not logged in
 */
export async function fetchCurrentUser() {
	try {
		userLoading.set(true);

		// Only run in browser environment
		if (!browser) {
			userLoading.set(false);
			return null;
		}

		const response = await fetch('/api/auth/me');

		if (response.ok) {
			const userData = await response.json();
			user.set(userData);
			return userData;
		} else {
			user.set(null);
			return null;
		}
	} catch (error) {
		console.error('Error fetching current user:', error);
		user.set(null);
		return null;
	} finally {
		userLoading.set(false);
	}
}

/**
 * Log the user out
 * @returns {Promise<boolean>} Whether logout was successful
 */
export async function logoutUser() {
	try {
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});

		if (response.ok) {
			user.set(null);
			return true;
		}
		return false;
	} catch (error) {
		console.error('Error logging out:', error);
		return false;
	}
}

/**
 * Update the user store with new user data
 * @param {User} userData - The user data to set
 */
export function setUser(userData) {
	user.set(userData);
}
