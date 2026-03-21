<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	let householdId = $state<Id<'households'> | null>(null);
	let bootstrapping = $state(false);

	// Quick-add state
	let quickAddName = $state('');
	let quickAddPending = $state(false);

	// Edit dialog state
	let editOpen = $state(false);
	let editId = $state<Id<'groceryItems'> | null>(null);
	let editName = $state('');
	let editQuantity = $state('');
	let editNotes = $state('');
	let editCategoryId = $state<Id<'categories'> | undefined>(undefined);
	let editPending = $state(false);

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

	const categoriesQuery = useQuery(api.authed.categories.list, () =>
		householdId ? { householdId } : 'skip'
	);

	// Sort categories by order
	const sortedCategories = $derived(
		[...(categoriesQuery.data ?? [])].sort((a, b) => a.order - b.order)
	);

	// Split items into active and bought
	const activeItems = $derived((itemsQuery.data ?? []).filter((i) => !i.completed));
	const boughtItems = $derived((itemsQuery.data ?? []).filter((i) => i.completed));

	// Group active items by category
	const groupedActiveItems = $derived(() => {
		const groups: { category: (typeof sortedCategories)[0] | null; items: typeof activeItems }[] =
			[];
		const itemsByCategory = new SvelteMap<string, typeof activeItems>();

		for (const item of activeItems) {
			const key = item.categoryId ?? '__none__';
			if (!itemsByCategory.has(key)) itemsByCategory.set(key, []);
			itemsByCategory.get(key)!.push(item);
		}

		for (const cat of sortedCategories) {
			const catItems = itemsByCategory.get(cat._id) ?? [];
			if (catItems.length > 0) {
				groups.push({ category: cat, items: catItems });
			}
		}

		const uncategorized = itemsByCategory.get('__none__') ?? [];
		if (uncategorized.length > 0) {
			groups.push({ category: null, items: uncategorized });
		}

		return groups;
	});

	async function handleQuickAdd(e: Event) {
		e.preventDefault();
		const name = quickAddName.trim();
		if (!name || !activeListQuery.data || !householdId) return;

		quickAddPending = true;
		try {
			await client.mutation(api.authed.groceryItems.create, {
				listId: activeListQuery.data._id,
				householdId,
				name
			});
			quickAddName = '';
		} finally {
			quickAddPending = false;
		}
	}

	async function handleToggleBought(id: Id<'groceryItems'>) {
		await client.mutation(api.authed.groceryItems.toggleBought, { id });
	}

	async function handleDelete(id: Id<'groceryItems'>) {
		await client.mutation(api.authed.groceryItems.remove, { id });
	}

	function openEdit(item: NonNullable<typeof itemsQuery.data>[0]) {
		editId = item._id;
		editName = item.name;
		editQuantity = item.quantity ?? '';
		editNotes = item.notes ?? '';
		editCategoryId = item.categoryId;
		editOpen = true;
	}

	async function handleEditSave() {
		if (!editId || !editName.trim()) return;
		editPending = true;
		try {
			await client.mutation(api.authed.groceryItems.update, {
				id: editId,
				name: editName.trim(),
				quantity: editQuantity.trim() || undefined,
				notes: editNotes.trim() || undefined,
				categoryId: editCategoryId
			});
			editOpen = false;
		} finally {
			editPending = false;
		}
	}

	const isLoading = $derived(
		bootstrapping || (!!householdId && !activeListQuery.data && activeListQuery.data !== null)
	);
	const isEmpty = $derived(!isLoading && (itemsQuery.data ?? []).length === 0);
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
			<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
				<h1 class="text-lg font-semibold tracking-tight">🛒 Shoppy</h1>
				<div
					{@attach (el) => {
						clerkContext.clerk.mountUserButton(el);
					}}
				></div>
			</div>
		</header>

		<!-- Quick-add bar -->
		{#if householdId && activeListQuery.data}
			<div class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
				<div class="mx-auto max-w-3xl px-4 py-3 sm:px-6">
					<form onsubmit={handleQuickAdd} class="flex gap-2">
						<Input
							bind:value={quickAddName}
							placeholder="Add an item…"
							class="flex-1"
							disabled={quickAddPending}
							autocomplete="off"
						/>
						<Button type="submit" disabled={quickAddPending || !quickAddName.trim()}>Add</Button>
					</form>
				</div>
			</div>
		{/if}

		<main class="mx-auto max-w-3xl px-4 py-6 sm:px-6">
			{#if isLoading || !householdId}
				<div class="flex items-center justify-center py-20">
					<div class="flex items-center gap-2 text-muted-foreground">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						<span class="text-sm"
							>{bootstrapping ? 'Setting up your household…' : 'Loading your list…'}</span
						>
					</div>
				</div>
			{:else if isEmpty}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<div class="mb-4 text-5xl">🛒</div>
					<h2 class="mb-1 text-base font-semibold">Your list is empty</h2>
					<p class="text-sm text-muted-foreground">Use the bar above to add your first item.</p>
				</div>
			{:else}
				<!-- Active items grouped by category -->
				{#if activeItems.length > 0}
					<div class="space-y-6">
						{#each groupedActiveItems() as group (group.category?._id ?? '__none__')}
							<section>
								<div class="mb-2 flex items-center gap-2">
									{#if group.category}
										<span
											class="h-2.5 w-2.5 rounded-full"
											style="background-color: {group.category.color}"
										></span>
										<h2
											class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
										>
											{group.category.name}
										</h2>
									{:else}
										<h2
											class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
										>
											Uncategorized
										</h2>
									{/if}
								</div>
								<ul class="space-y-1.5">
									{#each group.items as item (item._id)}
										<li
											class="group flex items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
										>
											<!-- Checkbox -->
											<button
												onclick={() => handleToggleBought(item._id)}
												class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary"
												aria-label="Mark as bought"
											></button>

											<!-- Content -->
											<div class="min-w-0 flex-1">
												<span class="text-sm leading-snug font-medium">{item.name}</span>
												{#if item.quantity || item.notes}
													<div class="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
														{#if item.quantity}
															<span>{item.quantity}</span>
														{/if}
														{#if item.notes}
															<span class="italic">{item.notes}</span>
														{/if}
													</div>
												{/if}
											</div>

											<!-- Actions -->
											<div
												class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
											>
												<button
													onclick={() => openEdit(item)}
													class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
													aria-label="Edit item"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
														<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
													</svg>
												</button>
												<button
													onclick={() => handleDelete(item._id)}
													class="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
													aria-label="Delete item"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<polyline points="3 6 5 6 21 6" />
														<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
														<path d="M10 11v6" />
														<path d="M14 11v6" />
														<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
													</svg>
												</button>
											</div>
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				{/if}

				<!-- Bought items section -->
				{#if boughtItems.length > 0}
					<div class="mt-8">
						<h2 class="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
							Checked ({boughtItems.length})
						</h2>
						<ul class="space-y-1.5">
							{#each boughtItems as item (item._id)}
								<li
									class="group flex items-start gap-3 rounded-lg border bg-card px-4 py-3 opacity-60 transition-all hover:opacity-100"
								>
									<!-- Checkbox (checked) -->
									<button
										onclick={() => handleToggleBought(item._id)}
										class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
										aria-label="Mark as not bought"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									</button>

									<!-- Content -->
									<div class="min-w-0 flex-1">
										<span class="text-sm leading-snug font-medium line-through">{item.name}</span>
										{#if item.quantity || item.notes}
											<div class="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
												{#if item.quantity}
													<span>{item.quantity}</span>
												{/if}
												{#if item.notes}
													<span class="italic">{item.notes}</span>
												{/if}
											</div>
										{/if}
									</div>

									<!-- Delete -->
									<button
										onclick={() => handleDelete(item._id)}
										class="flex shrink-0 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
										aria-label="Delete item"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
											<path d="M10 11v6" />
											<path d="M14 11v6" />
											<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
										</svg>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
		</main>
	</div>

	<!-- Edit dialog -->
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Edit item</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4 py-2">
				<div class="space-y-1.5">
					<Label for="edit-name">Name</Label>
					<Input id="edit-name" bind:value={editName} placeholder="Item name" />
				</div>
				<div class="space-y-1.5">
					<Label for="edit-quantity">Quantity</Label>
					<Input id="edit-quantity" bind:value={editQuantity} placeholder="e.g. 2, 500g, 1 pack" />
				</div>
				<div class="space-y-1.5">
					<Label for="edit-category">Category</Label>
					<select
						id="edit-category"
						bind:value={editCategoryId}
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
					>
						<option value={undefined}>Uncategorized</option>
						{#each sortedCategories as cat (cat._id)}
							<option value={cat._id}>{cat.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1.5">
					<Label for="edit-notes">Notes</Label>
					<Textarea
						id="edit-notes"
						bind:value={editNotes}
						placeholder="Brand preference, special instructions…"
						rows={2}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (editOpen = false)}>Cancel</Button>
				<Button onclick={handleEditSave} disabled={editPending || !editName.trim()}>Save</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
