<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { InviteAcceptanceModel } from './create-invite-acceptance-model.svelte.js';

	type Props = {
		model: InviteAcceptanceModel;
	};

	const { model }: Props = $props();
</script>

<div class="w-full max-w-sm space-y-6 text-center">
	<div class="text-4xl">🛒</div>
	<h1 class="text-2xl font-bold tracking-tight">Join Shoppy</h1>

	{#if model.inviteQuery.data === undefined}
		<div class="flex items-center justify-center gap-2 text-muted-foreground">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			></div>
			<span class="text-sm">Loading invite…</span>
		</div>
	{:else if model.done}
		<div class="space-y-3">
			<div class="text-5xl">🎉</div>
			<p class="font-semibold">You've joined the household!</p>
			<p class="text-sm text-muted-foreground">Redirecting you to the app…</p>
		</div>
	{:else if model.validity === 'missing'}
		<div class="space-y-3">
			<p class="font-semibold text-destructive">Invite not found</p>
			<p class="text-sm text-muted-foreground">This invite link is invalid or has been removed.</p>
			<Button variant="outline" onclick={() => goto(resolve('/app'))}>Go to app</Button>
		</div>
	{:else if model.validity === 'used'}
		<div class="space-y-3">
			<p class="font-semibold text-destructive">Invite already used</p>
			<p class="text-sm text-muted-foreground">
				This invite has already been accepted by someone else.
			</p>
			<Button variant="outline" onclick={() => goto(resolve('/app'))}>Go to app</Button>
		</div>
	{:else if model.validity === 'expired'}
		<div class="space-y-3">
			<p class="font-semibold text-destructive">Invite expired</p>
			<p class="text-sm text-muted-foreground">
				This invite link has expired. Ask your partner to generate a new one.
			</p>
			<Button variant="outline" onclick={() => goto(resolve('/app'))}>Go to app</Button>
		</div>
	{:else}
		<div class="space-y-4">
			<div class="space-y-1 rounded-lg border bg-card p-4 text-left">
				<p class="text-sm text-muted-foreground">You've been invited to join</p>
				<p class="font-semibold">{model.household?.name ?? 'a household'}</p>
			</div>
			<p class="text-sm text-muted-foreground">
				You'll share the same grocery list and both have full access to manage items.
			</p>

			{#if model.error}
				<p class="text-sm text-destructive">{model.error}</p>
			{/if}

			<Button onclick={model.accept} disabled={model.accepting} class="w-full">
				{model.accepting ? 'Joining…' : 'Accept & join household'}
			</Button>
			<Button variant="ghost" size="sm" onclick={() => goto(resolve('/app'))} class="w-full"
				>Cancel</Button
			>
		</div>
	{/if}
</div>
