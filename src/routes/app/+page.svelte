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
	import * as Select from '$lib/components/ui/select/index.js';
	import { page } from '$app/state';

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	let householdId = $state<Id<'households'> | null>(null);
	let bootstrapping = $state(false);

	// Quick-add state
	let quickAddName = $state('');
	let quickAddPending = $state(false);

	// Auto-focus state
	let quickAddInputRef = $state<HTMLInputElement | null>(null);
	let hasEverHadItems = $state(false);

	// Pull-to-refresh state
	let pullStartY = $state(0);
	let pullDistance = $state(0);
	let isRefreshing = $state(false);
	let isPulling = $state(false);
	const PULL_THRESHOLD = 64;
	const PULL_MAX = 96;

	// Clear bought state
	let clearPending = $state(false);
	let clearConfirmOpen = $state(false);

	// Edit dialog state
	let editOpen = $state(false);
	let editId = $state<Id<'groceryItems'> | null>(null);
	let editName = $state('');
	let editQuantity = $state('');
	let editNotes = $state('');
	let editCategoryId = $state<Id<'categories'> | undefined>(undefined);
	let editPending = $state(false);

	// Categories dialog state
	let categoriesOpen = $state(false);
	let newCategoryName = $state('');
	let newCategoryColor = $state('#64b5f6');
	let newCategoryPending = $state(false);
	let editingCategoryId = $state<Id<'categories'> | null>(null);
	let editingCategoryName = $state('');
	let editingCategoryColor = $state('');
	let editingCategoryPending = $state(false);
	let deletingCategoryId = $state<Id<'categories'> | null>(null);
	let expandedCategoryId = $state<Id<'categories'> | null>(null);

	const PRESET_COLORS = [
		'#e57373',
		'#f06292',
		'#ba68c8',
		'#64b5f6',
		'#4fc3f7',
		'#4db6ac',
		'#81c784',
		'#aed581',
		'#ffd54f',
		'#ffb74d',
		'#d66a4f',
		'#a1887f',
		'#90a4ae',
		'#9e9e9e'
	];

	// Members / invite dialog state
	let membersOpen = $state(false);
	let inviteLink = $state('');
	let invitePending = $state(false);
	let inviteCopied = $state(false);

	onMount(() => {
		// Bootstrap household
		(async () => {
			if (!clerkContext.clerk.user) return;
			bootstrapping = true;
			try {
				const household = await client.mutation(api.authed.households.getOrCreate, {});
				if (household) householdId = household._id;
			} finally {
				bootstrapping = false;
			}
		})();

		// Pull-to-refresh touch handlers (mobile only)
		function onTouchStart(e: TouchEvent) {
			if (window.scrollY === 0 && !isRefreshing && e.touches.length === 1) {
				pullStartY = e.touches[0].clientY;
				isPulling = true;
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (!isPulling || isRefreshing) return;
			const delta = e.touches[0].clientY - pullStartY;
			if (delta > 0 && window.scrollY === 0) {
				pullDistance = Math.min(delta * 0.5, PULL_MAX);
				if (pullDistance > 8) e.preventDefault();
			} else {
				pullDistance = 0;
				isPulling = false;
			}
		}

		function onTouchEnd() {
			if (!isPulling) return;
			const captured = pullDistance;
			isPulling = false;
			pullDistance = 0;
			if (captured >= PULL_THRESHOLD) {
				isRefreshing = true;
				setTimeout(() => {
					isRefreshing = false;
				}, 1000);
			}
		}

		document.addEventListener('touchstart', onTouchStart, { passive: true });
		document.addEventListener('touchmove', onTouchMove, { passive: false });
		document.addEventListener('touchend', onTouchEnd, { passive: true });

		return () => {
			document.removeEventListener('touchstart', onTouchStart);
			document.removeEventListener('touchmove', onTouchMove);
			document.removeEventListener('touchend', onTouchEnd);
		};
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

	const membersQuery = useQuery(api.authed.invites.listMembers, () => (householdId ? {} : 'skip'));

	const activeInvitesQuery = useQuery(api.authed.invites.listForHousehold, () =>
		householdId ? {} : 'skip'
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

	async function handleClearBought() {
		if (!activeListQuery.data) return;
		clearPending = true;
		try {
			await client.mutation(api.authed.groceryItems.clearBought, {
				listId: activeListQuery.data._id
			});
			clearConfirmOpen = false;
		} finally {
			clearPending = false;
		}
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

	// User-created (non-system) categories sorted by order
	const manageableCategories = $derived(
		[...(categoriesQuery.data ?? [])].filter((c) => !c.isSystem).sort((a, b) => a.order - b.order)
	);

	async function handleAddCategory(e: Event) {
		e.preventDefault();
		const name = newCategoryName.trim();
		if (!name || !householdId) return;
		newCategoryPending = true;
		try {
			await client.mutation(api.authed.categories.create, {
				householdId,
				name,
				color: newCategoryColor
			});
			newCategoryName = '';
			newCategoryColor = '#64b5f6';
		} finally {
			newCategoryPending = false;
		}
	}

	function openEditCategory(cat: (typeof manageableCategories)[0]) {
		expandedCategoryId = null;
		editingCategoryId = cat._id;
		editingCategoryName = cat.name;
		editingCategoryColor = cat.color;
	}

	async function handleSaveCategory() {
		if (!editingCategoryId || !editingCategoryName.trim()) return;
		editingCategoryPending = true;
		try {
			await client.mutation(api.authed.categories.rename, {
				id: editingCategoryId,
				name: editingCategoryName.trim()
			});
			await client.mutation(api.authed.categories.updateColor, {
				id: editingCategoryId,
				color: editingCategoryColor
			});
			editingCategoryId = null;
		} finally {
			editingCategoryPending = false;
		}
	}

	async function handleDeleteCategory(id: Id<'categories'>) {
		deletingCategoryId = id;
		try {
			await client.mutation(api.authed.categories.remove, { id });
		} finally {
			deletingCategoryId = null;
		}
	}

	async function handleMoveCategory(id: Id<'categories'>, direction: 'up' | 'down') {
		if (!householdId) return;
		const cats = manageableCategories;
		const idx = cats.findIndex((c) => c._id === id);
		if (idx === -1) return;
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= cats.length) return;

		const newOrder = cats.map((c) => c._id);
		[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

		await client.mutation(api.authed.categories.reorder, {
			householdId,
			orderedIds: newOrder
		});
	}

	async function handleCreateInvite() {
		invitePending = true;
		inviteLink = '';
		try {
			const invite = await client.mutation(api.authed.invites.create, {});
			if (invite) {
				const origin = page.url.origin;
				inviteLink = `${origin}/app/invite/${invite.code}`;
			}
		} finally {
			invitePending = false;
		}
	}

	async function handleCopyInvite() {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		inviteCopied = true;
		setTimeout(() => (inviteCopied = false), 2000);
	}

	async function handleRevokeInvite(inviteId: Id<'invites'>) {
		await client.mutation(api.authed.invites.revoke, { inviteId });
		inviteLink = '';
	}

	const isLoading = $derived(
		bootstrapping || (!!householdId && !activeListQuery.data && activeListQuery.data !== null)
	);
	const isEmpty = $derived(!isLoading && (itemsQuery.data ?? []).length === 0);

	// Track whether items have ever been loaded so we don't re-focus after clearing
	$effect(() => {
		if ((itemsQuery.data ?? []).length > 0) {
			hasEverHadItems = true;
		}
	});

	// Auto-focus the quick-add input on initial empty state only
	$effect(() => {
		if (isEmpty && !hasEverHadItems && quickAddInputRef) {
			const el = quickAddInputRef;
			setTimeout(() => el.focus(), 100);
		}
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
			<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
				<h1 class="text-lg font-semibold tracking-tight">🛒 Shoppy</h1>
				<div class="flex items-center gap-3">
					{#if householdId}
						<Button
							variant="ghost"
							size="sm"
							class="gap-1.5 text-muted-foreground"
							onclick={() => (membersOpen = true)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							{(membersQuery.data ?? []).length}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="text-muted-foreground"
							onclick={() => (categoriesOpen = true)}
							aria-label="Manage categories"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
								/>
								<line x1="7" y1="7" x2="7.01" y2="7" />
							</svg>
						</Button>
					{/if}
					<div
						{@attach (el) => {
							clerkContext.clerk.mountUserButton(el);
						}}
					></div>
				</div>
			</div>
		</header>

		<!-- Pull-to-refresh indicator (mobile only) -->
		{#if pullDistance > 0 || isRefreshing}
			<div
				class="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center sm:hidden"
				style="padding-top: calc(4.5rem + env(safe-area-inset-top, 0px)); transform: translateY({isRefreshing
					? 0
					: pullDistance - PULL_MAX}px)"
			>
				<div
					class="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted-foreground shadow-md transition-opacity"
					style="opacity: {isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1)}"
				>
					<div
						class="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
						class:animate-spin={isRefreshing}
						style="transform: rotate({isRefreshing
							? 0
							: Math.min((pullDistance / PULL_THRESHOLD) * 180, 180)}deg)"
					></div>
					<span
						>{isRefreshing
							? 'Refreshing\u2026'
							: pullDistance >= PULL_THRESHOLD
								? 'Release to refresh'
								: 'Pull to refresh'}</span
					>
				</div>
			</div>
		{/if}

		<!-- Quick-add bar -->
		{#if householdId && activeListQuery.data}
			<div
				class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur"
				style="padding-top: env(safe-area-inset-top)"
			>
				<div class="mx-auto max-w-3xl px-4 py-3 sm:px-6">
					<form onsubmit={handleQuickAdd} class="flex gap-2">
						<Input
							bind:value={quickAddName}
							bind:ref={quickAddInputRef}
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

		<main
			class="mx-auto max-w-3xl px-4 py-6 sm:px-6"
			style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom))"
		>
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
											class="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
										>
											<!-- Checkbox -->
											<button
												onclick={() => handleToggleBought(item._id)}
												class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center sm:mt-0.5 sm:min-h-0 sm:min-w-0"
												aria-label="Mark as bought"
											>
												<span
													class="h-5 w-5 rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary"
												></span>
											</button>

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
												class="flex shrink-0 gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
											>
												<button
													onclick={() => openEdit(item)}
													class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground sm:min-h-0 sm:min-w-0 sm:p-1"
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
													class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:min-h-0 sm:min-w-0 sm:p-1"
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
						<div class="mb-3 flex items-center justify-between">
							<h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
								Checked ({boughtItems.length})
							</h2>
							<Button
								variant="ghost"
								size="sm"
								class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
								onclick={() => (clearConfirmOpen = true)}
								disabled={clearPending}
							>
								Clear all
							</Button>
						</div>
						<ul class="space-y-1.5">
							{#each boughtItems as item (item._id)}
								<li
									class="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 opacity-60 transition-all hover:opacity-100"
								>
									<!-- Checkbox (checked) -->
									<button
										onclick={() => handleToggleBought(item._id)}
										class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center sm:mt-0.5 sm:min-h-0 sm:min-w-0"
										aria-label="Mark as not bought"
									>
										<span
											class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
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
										</span>
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
										class="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:min-h-0 sm:min-w-0 sm:p-1 sm:opacity-0 sm:group-hover:opacity-100"
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

	<!-- Clear bought confirmation dialog -->
	<Dialog.Root bind:open={clearConfirmOpen}>
		<Dialog.Content class="sm:max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Clear checked items?</Dialog.Title>
				<Dialog.Description>
					This will permanently remove all {boughtItems.length} checked item{boughtItems.length ===
					1
						? ''
						: 's'} from the list. Active items will not be affected.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (clearConfirmOpen = false)} disabled={clearPending}
					>Cancel</Button
				>
				<Button variant="destructive" onclick={handleClearBought} disabled={clearPending}>
					{clearPending ? 'Clearing…' : 'Clear all'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Members & invite dialog -->
	<Dialog.Root
		bind:open={membersOpen}
		onOpenChange={(open) => {
			if (!open) inviteLink = '';
		}}
	>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Household members</Dialog.Title>
				<Dialog.Description>Manage who has access to your shared grocery list.</Dialog.Description>
			</Dialog.Header>

			<!-- Members list -->
			<div class="space-y-2 py-1">
				{#each membersQuery.data ?? [] as member (member._id)}
					<div class="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
							>
								{member.role === 'owner' ? '★' : '•'}
							</div>
							<span class="text-sm">
								{member.userId === clerkContext.clerk.user?.id ? 'You' : 'Partner'}
							</span>
						</div>
						<span class="text-xs text-muted-foreground capitalize">{member.role}</span>
					</div>
				{/each}
			</div>

			<!-- Invite section (only show if sole member or no partner yet) -->
			{#if (membersQuery.data ?? []).length < 2}
				<div class="mt-2 space-y-3 border-t pt-4">
					<p class="text-sm text-muted-foreground">
						Invite your partner to join this household and share the grocery list.
					</p>

					{#if !inviteLink && (activeInvitesQuery.data ?? []).length === 0}
						<Button onclick={handleCreateInvite} disabled={invitePending} class="w-full">
							{invitePending ? 'Generating…' : 'Generate invite link'}
						</Button>
					{:else}
						{@const existingInvite = (activeInvitesQuery.data ?? [])[0]}
						{#if !inviteLink && existingInvite}
							{@const origin = page.url.origin}
							{@const link = `${origin}/app/invite/${existingInvite.code}`}
							<div class="flex gap-2">
								<Input value={link} readonly class="flex-1 font-mono text-xs" />
								<Button
									variant="outline"
									size="sm"
									onclick={async () => {
										await navigator.clipboard.writeText(link);
										inviteCopied = true;
										setTimeout(() => (inviteCopied = false), 2000);
									}}
								>
									{inviteCopied ? 'Copied!' : 'Copy'}
								</Button>
							</div>
							<Button
								variant="ghost"
								size="sm"
								class="w-full text-muted-foreground"
								onclick={() => handleRevokeInvite(existingInvite._id)}
							>
								Revoke invite
							</Button>
						{:else if inviteLink}
							<div class="flex gap-2">
								<Input value={inviteLink} readonly class="flex-1 font-mono text-xs" />
								<Button variant="outline" size="sm" onclick={handleCopyInvite}>
									{inviteCopied ? 'Copied!' : 'Copy'}
								</Button>
							</div>
						{/if}
					{/if}
				</div>
			{/if}

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (membersOpen = false)}>Close</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

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
					<Select.Root
						value={editCategoryId ?? ''}
						onValueChange={(v) => {
							editCategoryId = v === '' ? undefined : (v as Id<'categories'>);
						}}
					>
						<Select.Trigger id="edit-category">
							{#if editCategoryId}
								{sortedCategories.find((c) => c._id === editCategoryId)?.name ?? 'Uncategorized'}
							{:else}
								Uncategorized
							{/if}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">Uncategorized</Select.Item>
							{#each sortedCategories.filter((c) => c.name.toLowerCase() !== 'uncategorized') as cat (cat._id)}
								<Select.Item value={cat._id}>{cat.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
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

	<!-- Categories management dialog -->
	<Dialog.Root
		bind:open={categoriesOpen}
		onOpenChange={(open) => {
			if (!open) {
				editingCategoryId = null;
				expandedCategoryId = null;
				newCategoryName = '';
				newCategoryColor = '#64b5f6';
			}
		}}
	>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Categories</Dialog.Title>
				<Dialog.Description>Customize how your grocery list is organized.</Dialog.Description>
			</Dialog.Header>

			<!-- Category list -->
			<div class="space-y-1 py-1">
				{#each manageableCategories as cat, i (cat._id)}
					{#if editingCategoryId === cat._id}
						<!-- Inline edit row -->
						<div class="space-y-2 rounded-md border bg-muted/30 p-3">
							<Input bind:value={editingCategoryName} placeholder="Category name" autofocus />
							<div class="flex flex-wrap gap-1.5">
								{#each PRESET_COLORS as color (color)}
									<button
										type="button"
										onclick={() => (editingCategoryColor = color)}
										class="flex min-h-[36px] min-w-[36px] items-center justify-center sm:min-h-0 sm:min-w-0"
										aria-label="Select color {color}"
									>
										<span
											class="h-6 w-6 rounded-full border-2 transition-all {editingCategoryColor ===
											color
												? 'scale-110 border-foreground'
												: 'border-transparent'}"
											style="background-color: {color}"
										></span>
									</button>
								{/each}
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									onclick={handleSaveCategory}
									disabled={editingCategoryPending || !editingCategoryName.trim()}
									class="flex-1"
								>
									{editingCategoryPending ? 'Saving…' : 'Save'}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onclick={() => (editingCategoryId = null)}
									disabled={editingCategoryPending}
								>
									Cancel
								</Button>
							</div>
						</div>
					{:else}
						<!-- Display row: tap-to-expand on mobile, compact on desktop -->
						<div class="overflow-hidden rounded-md border bg-card">
							<!-- Main row -->
							<div class="flex items-center gap-2 px-3 py-2">
								<span class="h-3 w-3 shrink-0 rounded-full" style="background-color: {cat.color}"
								></span>
								<span class="flex-1 truncate text-sm">{cat.name}</span>

								<!-- Desktop: all action buttons inline (hidden on mobile) -->
								<div class="hidden items-center sm:flex">
									<button
										onclick={() => handleMoveCategory(cat._id, 'up')}
										disabled={i === 0}
										class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										aria-label="Move up"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><polyline points="18 15 12 9 6 15" /></svg
										>
									</button>
									<button
										onclick={() => handleMoveCategory(cat._id, 'down')}
										disabled={i === manageableCategories.length - 1}
										class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										aria-label="Move down"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg
										>
									</button>
									<button
										onclick={() => openEditCategory(cat)}
										class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
										aria-label="Edit category"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path
												d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
											/></svg
										>
									</button>
									<button
										onclick={() => handleDeleteCategory(cat._id)}
										disabled={deletingCategoryId === cat._id}
										class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
										aria-label="Delete category"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><polyline points="3 6 5 6 21 6" /><path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
											/><path d="M10 11v6" /><path d="M14 11v6" /><path
												d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
											/></svg
										>
									</button>
								</div>

								<!-- Mobile: toggle button to expand actions (hidden on desktop) -->
								<button
									onclick={() =>
										(expandedCategoryId = expandedCategoryId === cat._id ? null : cat._id)}
									class="flex h-10 w-10 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
									aria-label={expandedCategoryId === cat._id ? 'Hide actions' : 'Show actions'}
									aria-expanded={expandedCategoryId === cat._id}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle
											cx="12"
											cy="19"
											r="1"
										/>
									</svg>
								</button>
							</div>

							<!-- Mobile expanded actions panel (hidden on desktop) -->
							{#if expandedCategoryId === cat._id}
								<div class="flex items-center justify-around border-t px-2 py-1 sm:hidden">
									<!-- Move up -->
									<button
										onclick={() => handleMoveCategory(cat._id, 'up')}
										disabled={i === 0}
										class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										aria-label="Move up"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><polyline points="18 15 12 9 6 15" /></svg
										>
									</button>
									<!-- Move down -->
									<button
										onclick={() => handleMoveCategory(cat._id, 'down')}
										disabled={i === manageableCategories.length - 1}
										class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										aria-label="Move down"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg
										>
									</button>
									<!-- Divider -->
									<div class="h-6 w-px bg-border"></div>
									<!-- Edit -->
									<button
										onclick={() => openEditCategory(cat)}
										class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
										aria-label="Edit category"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path
												d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
											/></svg
										>
									</button>
									<!-- Delete -->
									<button
										onclick={() => handleDeleteCategory(cat._id)}
										disabled={deletingCategoryId === cat._id}
										class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
										aria-label="Delete category"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><polyline points="3 6 5 6 21 6" /><path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
											/><path d="M10 11v6" /><path d="M14 11v6" /><path
												d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
											/></svg
										>
									</button>
								</div>
							{/if}
						</div>
					{/if}
				{/each}

				{#if manageableCategories.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">No custom categories yet.</p>
				{/if}
			</div>

			<!-- Add new category -->
			<div class="space-y-2 border-t pt-4">
				<p class="text-sm font-medium">Add category</p>
				<form onsubmit={handleAddCategory} class="flex gap-2">
					<Input
						bind:value={newCategoryName}
						placeholder="Category name"
						class="flex-1"
						disabled={newCategoryPending}
						autocomplete="off"
					/>
					<Button type="submit" size="sm" disabled={newCategoryPending || !newCategoryName.trim()}>
						{newCategoryPending ? 'Adding…' : 'Add'}
					</Button>
				</form>
				<div class="flex flex-wrap gap-1.5">
					{#each PRESET_COLORS as color (color)}
						<button
							type="button"
							onclick={() => (newCategoryColor = color)}
							class="flex min-h-[36px] min-w-[36px] items-center justify-center sm:min-h-0 sm:min-w-0"
							aria-label="Select color {color}"
						>
							<span
								class="h-6 w-6 rounded-full border-2 transition-all {newCategoryColor === color
									? 'scale-110 border-foreground'
									: 'border-transparent'}"
								style="background-color: {color}"
							></span>
						</button>
					{/each}
				</div>
				<div class="flex items-center gap-2 text-xs text-muted-foreground">
					<span class="h-3 w-3 rounded-full" style="background-color: {newCategoryColor}"></span>
					<span>Selected color</span>
				</div>
			</div>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (categoriesOpen = false)}>Close</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
