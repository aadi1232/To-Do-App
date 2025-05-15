<script>
	import { unreadCount } from '$lib/stores/socket';
</script>

{#if $unreadCount > 0}
	<span
		class="absolute -top-1 -right-1 flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
	>
		{$unreadCount > 9 ? '9+' : $unreadCount}
	</span>
{/if}
