<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import ShortcutsTooltip from '$lib/components/ShortcutsTooltip.svelte';

	let { children } = $props();
</script>

<div class="app">
	<Header />
	<main>
		{@render children()}
	</main>
	<KeyboardShortcuts />
	<ShortcutsTooltip />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding: 1rem;
	}
</style>
