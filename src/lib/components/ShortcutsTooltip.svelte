<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { showShortcutsTooltip } from '$lib/stores/shortcuts';

	let isMac = false;

	onMount(() => {
		// Detect if the user is on macOS
		isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

		// Show the tooltip briefly on first load
		showShortcutsTooltip.set(true);
		setTimeout(() => {
			showShortcutsTooltip.set(false);
		}, 5000);
	});

	const modKey = isMac ? '⌘' : 'Ctrl';
</script>

{#if $showShortcutsTooltip}
	<div class="shortcuts-tooltip" transition:fade>
		<div class="tooltip-content">
			<h3>Keyboard Shortcuts</h3>
			<ul>
				<li><kbd>{modKey} + G</kbd> - Create Group</li>
				<li><kbd>{modKey} + M</kbd> - Personal Todos</li>
				<li><kbd>{modKey} + Z</kbd> - Profile Page</li>
			</ul>
			<button
				on:click={() => showShortcutsTooltip.set(false)}
				class="close-btn"
				aria-label="Close shortcuts">×</button
			>
		</div>
	</div>
{/if}

<style>
	.shortcuts-tooltip {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 100;
		animation: fade-in 0.3s ease;
	}

	.tooltip-content {
		background: #2a2a2a;
		color: white;
		padding: 15px 20px;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-width: 300px;
	}

	h3 {
		margin: 0 0 10px 0;
		font-size: 14px;
		font-weight: 600;
	}

	ul {
		margin: 0;
		padding: 0 0 0 20px;
		font-size: 13px;
	}

	li {
		margin-bottom: 6px;
	}

	kbd {
		background: #444;
		padding: 2px 5px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 12px;
	}

	.close-btn {
		position: absolute;
		top: 5px;
		right: 8px;
		background: none;
		border: none;
		color: #aaa;
		font-size: 18px;
		cursor: pointer;
	}

	.close-btn:hover {
		color: white;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
