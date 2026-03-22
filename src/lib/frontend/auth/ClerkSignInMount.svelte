<script lang="ts">
	import { AUTH_COMPLETION_INSTALL_PROMPT_KEY } from '$lib/auth/auth-flow.js';
	import { useClerkContext } from './clerk-context.svelte.js';

	type Props = {
		forceRedirectUrl?: string;
	};

	const { forceRedirectUrl }: Props = $props();

	const clerkContext = useClerkContext();
</script>

<div
	{@attach (el) => {
		sessionStorage.setItem(AUTH_COMPLETION_INSTALL_PROMPT_KEY, 'true');
		clerkContext.clerk.mountSignIn(el, {
			forceRedirectUrl
		});
	}}
></div>
