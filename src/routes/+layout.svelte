<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(console.error);
		}
	});
</script>

<svelte:head>
	<title>Shoppy</title>
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
