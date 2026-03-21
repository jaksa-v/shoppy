<script lang="ts">
	import { setClerkContext } from '$lib/stores/clerk.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	const { children } = $props();

	const clerkContext = setClerkContext();
</script>

{#if clerkContext.isClerkLoaded}
	{@render children()}
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<LoadingSpinner size="lg" />
	</div>
{/if}
