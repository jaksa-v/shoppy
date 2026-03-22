import { useQuery } from 'convex-svelte';
import { createStandaloneDetector } from '$lib/pwa/standalone.svelte.js';
import { useClerkContext } from '$lib/frontend/auth/clerk-context.svelte.js';
import { createAuthedConvexClient } from '$lib/frontend/convex/create-authed-convex-client.svelte.js';
import { api } from '../../../convex/_generated/api';
import { createCategoryManager } from '$lib/features/categories/create-category-manager.svelte.js';
import { createHouseholdSession } from '$lib/features/household/create-household-session.svelte.js';
import { createMembersDialog } from '$lib/features/household/create-members-dialog.svelte.js';
import { createShoppingListModel } from '$lib/features/shopping-list/create-shopping-list-model.svelte.js';
import { createClearBoughtDialog } from '$lib/features/shopping-list/create-clear-bought-dialog.svelte.js';
import { createEditItemDialog } from '$lib/features/shopping-list/create-edit-item-dialog.svelte.js';

export function createAppPageModel() {
	const clerkContext = useClerkContext();
	const client = createAuthedConvexClient();
	const shell = createStandaloneDetector();

	const householdSession = createHouseholdSession({
		client,
		getUserId: () => clerkContext.clerk.user?.id
	});

	const shoppingList = createShoppingListModel({
		client,
		getHouseholdId: () => householdSession.householdId
	});

	const activeInvitesQuery = useQuery(api.authed.invites.listForHousehold, () =>
		householdSession.householdId ? {} : 'skip'
	);
	const membersQuery = useQuery(api.authed.invites.listMembers, () =>
		householdSession.householdId ? {} : 'skip'
	);

	const editItemDialog = createEditItemDialog({ client });
	const clearBoughtDialog = createClearBoughtDialog({
		clearBought: async () => {
			await shoppingList.clearBought();
		}
	});
	const membersDialog = createMembersDialog({
		client,
		getActiveInvite: () => (activeInvitesQuery.data ?? [])[0] ?? null
	});
	const categoryManager = createCategoryManager({
		client,
		getHouseholdId: () => householdSession.householdId,
		getManageableCategories: () => shoppingList.manageableCategories
	});

	return {
		auth: clerkContext,
		shell,
		householdSession,
		shoppingList,
		editItemDialog,
		clearBoughtDialog,
		membersDialog,
		categoryManager,
		membersQuery,
		activeInvitesQuery
	};
}

export type AppPageModel = ReturnType<typeof createAppPageModel>;
