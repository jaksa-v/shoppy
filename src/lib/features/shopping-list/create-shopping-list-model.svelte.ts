import { useQuery } from 'convex-svelte';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { getManageableCategories } from '$lib/features/categories/category-manager.utils';
import { groupActiveItemsByCategory, partitionItems, sortCategories } from './shopping-list.utils';

type CreateShoppingListModelOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
	getHouseholdId: () => Id<'households'> | null;
};

export function createShoppingListModel(options: CreateShoppingListModelOptions) {
	let quickAddName = $state('');
	let quickAddPending = $state(false);
	let hasEverHadItems = $state(false);

	const activeListQuery = useQuery(api.authed.groceryLists.getActive, () => {
		const householdId = options.getHouseholdId();
		return householdId ? { householdId } : 'skip';
	});

	const itemsQuery = useQuery(api.authed.groceryItems.list, () => {
		const listId = activeListQuery.data?._id;
		return listId ? { listId } : 'skip';
	});

	const categoriesQuery = useQuery(api.authed.categories.list, () => {
		const householdId = options.getHouseholdId();
		return householdId ? { householdId } : 'skip';
	});

	const sortedCategories = $derived(sortCategories(categoriesQuery.data ?? []));
	const partitionedItems = $derived(partitionItems(itemsQuery.data ?? []));
	const activeItems = $derived(partitionedItems.activeItems);
	const boughtItems = $derived(partitionedItems.boughtItems);
	const groupedActiveItems = $derived(
		groupActiveItemsByCategory({
			activeItems,
			sortedCategories
		})
	);
	const manageableCategories = $derived(getManageableCategories(categoriesQuery.data ?? []));

	const isLoading = $derived(
		!!options.getHouseholdId() &&
			(activeListQuery.isLoading || itemsQuery.isLoading || categoriesQuery.isLoading)
	);
	const isEmpty = $derived(!isLoading && (itemsQuery.data ?? []).length === 0);
	const shouldAutofocusQuickAdd = $derived(isEmpty && !hasEverHadItems);

	$effect(() => {
		if ((itemsQuery.data ?? []).length > 0) {
			hasEverHadItems = true;
		}
	});

	async function addItem(event?: Event) {
		event?.preventDefault();

		const listId = activeListQuery.data?._id;
		const householdId = options.getHouseholdId();
		const name = quickAddName.trim();

		if (!listId || !householdId || !name) {
			return;
		}

		quickAddPending = true;

		try {
			await options.client.mutation(api.authed.groceryItems.create, {
				listId,
				householdId,
				name
			});
			quickAddName = '';
		} finally {
			quickAddPending = false;
		}
	}

	async function toggleBought(id: Id<'groceryItems'>) {
		await options.client.mutation(api.authed.groceryItems.toggleBought, { id });
	}

	async function deleteItem(id: Id<'groceryItems'>) {
		await options.client.mutation(api.authed.groceryItems.remove, { id });
	}

	async function clearBought() {
		const listId = activeListQuery.data?._id;
		if (!listId) {
			return;
		}

		await options.client.mutation(api.authed.groceryItems.clearBought, { listId });
	}

	return {
		activeListQuery,
		itemsQuery,
		categoriesQuery,
		get quickAddName() {
			return quickAddName;
		},
		set quickAddName(value: string) {
			quickAddName = value;
		},
		get quickAddPending() {
			return quickAddPending;
		},
		get sortedCategories() {
			return sortedCategories;
		},
		get manageableCategories() {
			return manageableCategories;
		},
		get activeItems() {
			return activeItems;
		},
		get boughtItems() {
			return boughtItems;
		},
		get groupedActiveItems() {
			return groupedActiveItems;
		},
		get isLoading() {
			return isLoading;
		},
		get isEmpty() {
			return isEmpty;
		},
		get shouldAutofocusQuickAdd() {
			return shouldAutofocusQuickAdd;
		},
		async addItem(event?: Event) {
			await addItem(event);
		},
		async toggleBought(id: Id<'groceryItems'>) {
			await toggleBought(id);
		},
		async deleteItem(id: Id<'groceryItems'>) {
			await deleteItem(id);
		},
		async clearBought() {
			await clearBought();
		}
	};
}

export type ShoppingListModel = ReturnType<typeof createShoppingListModel>;
export type GroceryItem = Doc<'groceryItems'>;
