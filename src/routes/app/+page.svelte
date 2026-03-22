<script lang="ts">
	import EmptyListState from '$lib/features/app-shell/EmptyListState.svelte';
	import AppHeader from '$lib/features/app-shell/AppHeader.svelte';
	import ListLoadingState from '$lib/features/app-shell/ListLoadingState.svelte';
	import QuickAddBar from '$lib/features/app-shell/QuickAddBar.svelte';
	import CategoryManagerDialog from '$lib/features/categories/CategoryManagerDialog.svelte';
	import MembersDialog from '$lib/features/household/MembersDialog.svelte';
	import ClearBoughtDialog from '$lib/features/shopping-list/ClearBoughtDialog.svelte';
	import EditItemDialog from '$lib/features/shopping-list/EditItemDialog.svelte';
	import BoughtItemsSection from '$lib/features/shopping-list/BoughtItemsSection.svelte';
	import GroupedItemList from '$lib/features/shopping-list/GroupedItemList.svelte';
	import { createAppPageModel } from '$lib/features/app-shell/create-app-page-model.svelte.js';
	import ClerkSignInMount from '$lib/frontend/auth/ClerkSignInMount.svelte';

	const model = createAppPageModel();

	const memberCount = $derived((model.membersQuery.data ?? []).length);
	const activeInvite = $derived((model.activeInvitesQuery.data ?? [])[0] ?? null);
</script>

{#if !model.auth.clerk.user}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<ClerkSignInMount />
	</div>
{:else}
	<div class="min-h-dvh bg-background">
		{#if model.shell.isStandalone}
			<div
				class="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-sm"
				style="padding-top: env(safe-area-inset-top)"
			>
				<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-2 sm:px-6">
					<AppHeader
						{memberCount}
						showHouseholdActions={!!model.householdSession.householdId}
						onOpenMembers={model.membersDialog.show}
						onOpenCategories={model.categoryManager.show}
					/>
				</div>
			</div>
		{:else}
			<header class="border-b bg-card">
				<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
					<AppHeader
						{memberCount}
						showHouseholdActions={!!model.householdSession.householdId}
						onOpenMembers={model.membersDialog.show}
						onOpenCategories={model.categoryManager.show}
					/>
				</div>
			</header>
			{#if model.householdSession.householdId && model.shoppingList.activeListQuery.data}
				<div class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
					<div class="mx-auto max-w-3xl px-4 py-3 sm:px-6">
						<QuickAddBar
							value={model.shoppingList.quickAddName}
							pending={model.shoppingList.quickAddPending}
							canSubmit={!model.shoppingList.quickAddPending &&
								!!model.shoppingList.quickAddName.trim()}
							autofocus={model.shoppingList.shouldAutofocusQuickAdd}
							onValueChange={(value) => (model.shoppingList.quickAddName = value)}
							onSubmit={model.shoppingList.addItem}
						/>
					</div>
				</div>
			{/if}
		{/if}

		{#if model.shell.isStandalone && model.householdSession.householdId && model.shoppingList.activeListQuery.data}
			<div
				class="fixed right-0 bottom-0 left-0 z-20 border-t bg-card/95 backdrop-blur-sm"
				style="padding-bottom: env(safe-area-inset-bottom)"
			>
				<div class="mx-auto max-w-3xl px-4 py-3">
					<QuickAddBar
						value={model.shoppingList.quickAddName}
						pending={model.shoppingList.quickAddPending}
						canSubmit={!model.shoppingList.quickAddPending &&
							!!model.shoppingList.quickAddName.trim()}
						autofocus={model.shoppingList.shouldAutofocusQuickAdd}
						onValueChange={(value) => (model.shoppingList.quickAddName = value)}
						onSubmit={model.shoppingList.addItem}
					/>
				</div>
			</div>
		{/if}

		<main
			class="mx-auto max-w-3xl px-4 py-6 sm:px-6"
			style={`padding-bottom: calc(${model.shell.isStandalone ? '5rem' : '1.5rem'} + env(safe-area-inset-bottom))`}
		>
			{#if model.householdSession.bootstrapping || model.shoppingList.isLoading || !model.householdSession.householdId}
				<ListLoadingState bootstrapping={model.householdSession.bootstrapping} />
			{:else if model.shoppingList.isEmpty}
				<EmptyListState />
			{:else}
				{#if model.shoppingList.activeItems.length > 0}
					<GroupedItemList
						groups={model.shoppingList.groupedActiveItems}
						onToggleBought={model.shoppingList.toggleBought}
						onEdit={model.editItemDialog.openForItem}
						onDelete={model.shoppingList.deleteItem}
					/>
				{/if}

				{#if model.shoppingList.boughtItems.length > 0}
					<BoughtItemsSection
						items={model.shoppingList.boughtItems}
						clearPending={model.clearBoughtDialog.pending}
						onClear={model.clearBoughtDialog.show}
						onToggleBought={model.shoppingList.toggleBought}
						onDelete={model.shoppingList.deleteItem}
					/>
				{/if}
			{/if}
		</main>
	</div>

	<ClearBoughtDialog
		model={model.clearBoughtDialog}
		count={model.shoppingList.boughtItems.length}
	/>
	<MembersDialog
		model={model.membersDialog}
		members={model.membersQuery.data ?? []}
		{activeInvite}
		currentUserId={model.auth.clerk.user?.id}
	/>
	<EditItemDialog model={model.editItemDialog} categories={model.shoppingList.sortedCategories} />
	<CategoryManagerDialog
		model={model.categoryManager}
		categories={model.shoppingList.manageableCategories}
	/>
{/if}
