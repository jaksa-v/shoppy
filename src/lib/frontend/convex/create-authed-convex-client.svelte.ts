import { useConvexClient } from 'convex-svelte';

export function createAuthedConvexClient() {
	return useConvexClient();
}
