import { getClerkContext } from '$lib/stores/clerk.svelte';

export function useClerkContext() {
	return getClerkContext();
}
