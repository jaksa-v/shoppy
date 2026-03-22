<script lang="ts">
	import { page } from '$app/state';
	import { createInviteAcceptanceModel } from '$lib/features/invites/create-invite-acceptance-model.svelte.js';
	import InviteAcceptanceCard from '$lib/features/invites/InviteAcceptanceCard.svelte';
	import ClerkSignInMount from '$lib/frontend/auth/ClerkSignInMount.svelte';
	import { useClerkContext } from '$lib/frontend/auth/clerk-context.svelte.js';
	import { createAuthedConvexClient } from '$lib/frontend/convex/create-authed-convex-client.svelte.js';

	const clerkContext = useClerkContext();
	const client = createAuthedConvexClient();
	const model = createInviteAcceptanceModel({
		client,
		getCode: () => page.params.code ?? ''
	});
</script>

{#if !clerkContext.clerk.user}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div class="w-full max-w-sm space-y-6 px-4 text-center">
			<div class="space-y-2">
				<div class="text-4xl">🛒</div>
				<h1 class="text-2xl font-bold">Join Shoppy</h1>
				<p class="text-sm text-muted-foreground">
					You've been invited to share a grocery list. Sign in to accept.
				</p>
			</div>
			<ClerkSignInMount forceRedirectUrl={page.url.pathname} />
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-background px-4">
		<InviteAcceptanceCard {model} />
	</div>
{/if}
