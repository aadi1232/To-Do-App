/**
 * Svelte action that dispatches an event when a click occurs outside the element
 * @param {HTMLElement} node - The element to detect clicks outside of
 * @param {Object} params - Action parameters
 * @param {boolean} params.enabled - Whether the action is enabled
 * @param {Function} params.callback - Callback to run when an outside click is detected
 * @returns {Object} Svelte action object
 */
export function clickOutside(node, params = { enabled: true, callback: () => {} }) {
	const { enabled, callback } = params;

	function handleClick(event) {
		if (!enabled) return;
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			callback();
		}
	}

	document.addEventListener('click', handleClick, true);

	return {
		update(newParams) {
			const { enabled: newEnabled, callback: newCallback } = newParams;
			if (enabled !== newEnabled || callback !== newCallback) {
				params.enabled = newEnabled;
				params.callback = newCallback;
			}
		},
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
