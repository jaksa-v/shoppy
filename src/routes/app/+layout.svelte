<script lang="ts">
	import ClerkWrapper from '$lib/wrappers/ClerkWrapper.svelte';
	import ConvexWrapper from '$lib/wrappers/ConvexWrapper.svelte';
	import InstallBanner from '$lib/components/InstallBanner.svelte';

	const { children } = $props();
</script>

<ClerkWrapper>
	<ConvexWrapper>
		{@render children()}
		<InstallBanner />
	</ConvexWrapper>
</ClerkWrapper>
