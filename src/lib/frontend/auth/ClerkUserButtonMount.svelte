<script lang="ts">
	import { useClerkContext } from './clerk-context.svelte.js';

	const clerkContext = useClerkContext();
</script>

<div
	{@attach (el) => {
		clerkContext.clerk.mountUserButton(el);
	}}
></div>
