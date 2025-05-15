import { writable } from 'svelte/store';

// A simple toast notification system

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique identifier
 * @property {string} message - Toast message
 * @property {'success'|'error'|'info'|'warning'} type - Toast type
 * @property {number} duration - Duration in ms before auto-dismissal
 */

// Create a writable store with an empty array of toasts
export const toasts = writable(/** @type {Toast[]} */ []);

/**
 * Add a toast notification
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'|'warning'} [type='info'] - The type of toast
 * @param {number} [duration=3000] - Duration in ms before auto-dismissal
 */
export function addToast(message, type = 'info', duration = 3000) {
	const id = Math.random().toString(36).substring(2, 10);

	// Add the toast to the store
	toasts.update((all) => [{ id, message, type, duration }, ...all]);

	// Auto-remove after duration
	setTimeout(() => {
		removeToast(id);
	}, duration);

	return id;
}

/**
 * Remove a toast by ID
 * @param {string} id - The ID of the toast to remove
 */
export function removeToast(id) {
	toasts.update((all) => all.filter((toast) => toast.id !== id));
}
