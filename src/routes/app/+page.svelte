<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';
	import { onMount } from 'svelte';

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	let householdId = $state<Id<'households'> | null>(null);
	let bootstrapping = $state(false);

	onMount(async () => {
		if (!clerkContext.clerk.user) return;
		bootstrapping = true;
		try {
			const household = await client.mutation(api.authed.households.getOrCreate, {});
			if (household) householdId = household._id;
		} finally {
			bootstrapping = false;
		}
	});

	const activeListQuery = useQuery(api.authed.groceryLists.getActive, () =>
		householdId ? { householdId } : 'skip'
	);

	const itemsQuery = useQuery(api.authed.groceryItems.list, () => {
		const listId = activeListQuery.data?._id;
		return listId ? { listId } : 'skip';
	});
</script>

{#if !clerkContext.clerk.user}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div
			{@attach (el) => {
				clerkContext.clerk.mountSignIn(el, {});
			}}
		></div>
	</div>
{:else}
	<div class="min-h-screen bg-background">
		<header class="border-b bg-card">
			<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
				<h1 class="text-lg font-semibold tracking-tight">Shoppy</h1>
				<div
					{@attach (el) => {
						clerkContext.clerk.mountUserButton(el);
					}}
				></div>
			</div>
		</header>

		<main class="mx-auto max-w-3xl px-6 py-8">
			{#if bootstrapping || (householdId && !activeListQuery.data && activeListQuery.data !== null)}
				<div class="flex items-center justify-center py-20">
					<div class="flex items-center gap-2 text-muted-foreground">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						<span class="text-sm">Loading your list</span>
					</div>
				</div>
			{:else if !householdId}
				<div class="flex items-center justify-center py-20">
					<div class="flex items-center gap-2 text-muted-foreground">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						<span class="text-sm">Setting up your household</span>
					</div>
				</div>
			{:else if !itemsQuery.data || itemsQuery.data.length === 0}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<div class="mb-4 text-5xl">🛒</div>
					<h2 class="mb-1 text-base font-semibold">Your list is empty</h2>
					<p class="text-sm text-muted-foreground">Add items to start your shopping list.</p>
				</div>
			{:else}
				<ul class="space-y-2">
					{#each itemsQuery.data as item (item._id)}
						<li class="rounded-md border bg-card px-4 py-3 text-sm">
							{item.name}
						</li>
					{/each}
				</ul>
			{/if}
		</main>
	</div>
{/if}
