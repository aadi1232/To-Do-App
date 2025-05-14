import { writable } from 'svelte/store';

// Create a store to track tooltip visibility that can be imported elsewhere
export const showShortcutsTooltip = writable(false);
