<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		AUTH_COMPLETION_INSTALL_PROMPT_KEY,
		clearPendingInviteCode,
		persistPendingInviteCode
	} from '$lib/auth/auth-flow.js';

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	const code = $derived(page.params.code);

	const inviteQuery = useQuery(api.authed.invites.getByCode, () => (code ? { code } : 'skip'));

	let accepting = $state(false);
	let error = $state('');
	let done = $state(false);

	onMount(() => {
		if (code) {
			persistPendingInviteCode(code);
		}
	});

	async function handleAccept() {
		if (!code) return;
		accepting = true;
		error = '';
		try {
			await client.mutation(api.authed.invites.accept, { code });
			clearPendingInviteCode();
			done = true;
			// Redirect to app after a short delay
			await new Promise((r) => setTimeout(r, 1500));
			await goto('/app');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			accepting = false;
		}
	}

	const invite = $derived(inviteQuery.data?.invite);
	const household = $derived(inviteQuery.data?.household);
	const isExpired = $derived(invite ? invite.expiresAt < Date.now() : false);
	const isUsed = $derived(invite ? !!invite.usedBy : false);
	const isValid = $derived(!!invite && !isExpired && !isUsed);

	$effect(() => {
		if (inviteQuery.data !== undefined && (!inviteQuery.data || isUsed || isExpired || done)) {
			clearPendingInviteCode();
		}
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
			<div
				{@attach (el) => {
					sessionStorage.setItem(AUTH_COMPLETION_INSTALL_PROMPT_KEY, 'true');
					clerkContext.clerk.mountSignIn(el, {
						forceRedirectUrl: page.url.pathname
					});
				}}
			></div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-background px-4">
		<div class="w-full max-w-sm space-y-6 text-center">
			<div class="text-4xl">🛒</div>
			<h1 class="text-2xl font-bold tracking-tight">Join Shoppy</h1>

			{#if inviteQuery.data === undefined}
				<!-- Loading -->
				<div class="flex items-center justify-center gap-2 text-muted-foreground">
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></div>
					<span class="text-sm">Loading invite…</span>
				</div>
			{:else if done}
				<div class="space-y-3">
					<div class="text-5xl">🎉</div>
					<p class="font-semibold">You've joined the household!</p>
					<p class="text-sm text-muted-foreground">Redirecting you to the app…</p>
				</div>
			{:else if !invite || inviteQuery.data === null}
				<div class="space-y-3">
					<p class="font-semibold text-destructive">Invite not found</p>
					<p class="text-sm text-muted-foreground">
						This invite link is invalid or has been removed.
					</p>
					<Button
						variant="outline"
						onclick={async () => {
							await goto('/app');
						}}>Go to app</Button
					>
				</div>
			{:else if isUsed}
				<div class="space-y-3">
					<p class="font-semibold text-destructive">Invite already used</p>
					<p class="text-sm text-muted-foreground">
						This invite has already been accepted by someone else.
					</p>
					<Button
						variant="outline"
						onclick={async () => {
							await goto('/app');
						}}>Go to app</Button
					>
				</div>
			{:else if isExpired}
				<div class="space-y-3">
					<p class="font-semibold text-destructive">Invite expired</p>
					<p class="text-sm text-muted-foreground">
						This invite link has expired. Ask your partner to generate a new one.
					</p>
					<Button
						variant="outline"
						onclick={async () => {
							await goto('/app');
						}}>Go to app</Button
					>
				</div>
			{:else if isValid}
				<div class="space-y-4">
					<div class="space-y-1 rounded-lg border bg-card p-4 text-left">
						<p class="text-sm text-muted-foreground">You've been invited to join</p>
						<p class="font-semibold">{household?.name ?? 'a household'}</p>
					</div>
					<p class="text-sm text-muted-foreground">
						You'll share the same grocery list and both have full access to manage items.
					</p>

					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}

					<Button onclick={handleAccept} disabled={accepting} class="w-full">
						{accepting ? 'Joining…' : 'Accept & join household'}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onclick={async () => {
							await goto('/app');
						}}
						class="w-full"
					>
						Cancel
					</Button>
				</div>
			{/if}
		</div>
	</div>
{/if}
