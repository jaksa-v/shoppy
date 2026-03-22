<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(console.error);
		}
	});
</script>

<ModeWatcher defaultMode="system" themeColors={{ light: '#ffffff', dark: '#0b1220' }} />

<svelte:head>
	<title>Shoppy</title>
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
