import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { PRESET_CATEGORY_COLORS } from './category-colors';
import { canSaveCategoryName, getReorderedCategoryIds } from './category-manager.utils';

type CreateCategoryManagerOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
	getHouseholdId: () => Id<'households'> | null;
	getManageableCategories: () => Doc<'categories'>[];
};

export function createCategoryManager(options: CreateCategoryManagerOptions) {
	let open = $state(false);
	let newCategoryName = $state('');
	let newCategoryColor = $state<string>(PRESET_CATEGORY_COLORS[3]);
	let newCategoryPending = $state(false);
	let editingCategoryId = $state<Id<'categories'> | null>(null);
	let editingCategoryName = $state('');
	let editingCategoryColor = $state('');
	let editingCategoryPending = $state(false);
	let deletingCategoryId = $state<Id<'categories'> | null>(null);
	let expandedCategoryId = $state<Id<'categories'> | null>(null);

	function resetTransientState() {
		editingCategoryId = null;
		expandedCategoryId = null;
		newCategoryName = '';
		newCategoryColor = PRESET_CATEGORY_COLORS[3];
	}

	function close() {
		open = false;
		resetTransientState();
	}

	function cancelEdit() {
		editingCategoryId = null;
		editingCategoryName = '';
		editingCategoryColor = '';
	}

	function openEditCategory(category: Doc<'categories'>) {
		expandedCategoryId = null;
		editingCategoryId = category._id;
		editingCategoryName = category.name;
		editingCategoryColor = category.color;
	}

	async function addCategory(event?: Event) {
		event?.preventDefault();

		const householdId = options.getHouseholdId();
		const name = newCategoryName.trim();

		if (!householdId || !name) {
			return;
		}

		newCategoryPending = true;

		try {
			await options.client.mutation(api.authed.categories.create, {
				householdId,
				name,
				color: newCategoryColor
			});
			newCategoryName = '';
			newCategoryColor = PRESET_CATEGORY_COLORS[3];
		} finally {
			newCategoryPending = false;
		}
	}

	async function saveCategory() {
		if (!editingCategoryId || !canSaveCategoryName(editingCategoryName)) {
			return;
		}

		editingCategoryPending = true;

		try {
			await options.client.mutation(api.authed.categories.rename, {
				id: editingCategoryId,
				name: editingCategoryName.trim()
			});
			await options.client.mutation(api.authed.categories.updateColor, {
				id: editingCategoryId,
				color: editingCategoryColor
			});
			editingCategoryId = null;
		} finally {
			editingCategoryPending = false;
		}
	}

	async function deleteCategory(id: Id<'categories'>) {
		deletingCategoryId = id;

		try {
			await options.client.mutation(api.authed.categories.remove, { id });
		} finally {
			deletingCategoryId = null;
		}
	}

	async function moveCategory(id: Id<'categories'>, direction: 'up' | 'down') {
		const householdId = options.getHouseholdId();
		const orderedIds: Id<'categories'>[] = getReorderedCategoryIds(
			options.getManageableCategories(),
			id,
			direction
		);

		if (!householdId) {
			return;
		}

		await options.client.mutation(api.authed.categories.reorder, {
			householdId,
			orderedIds
		});
	}

	return {
		get open() {
			return open;
		},
		set open(value: boolean) {
			open = value;
			if (!value) {
				resetTransientState();
			}
		},
		get presetColors() {
			return PRESET_CATEGORY_COLORS;
		},
		get newCategoryName() {
			return newCategoryName;
		},
		set newCategoryName(value: string) {
			newCategoryName = value;
		},
		get newCategoryColor() {
			return newCategoryColor;
		},
		set newCategoryColor(value: string) {
			newCategoryColor = value;
		},
		get newCategoryPending() {
			return newCategoryPending;
		},
		get editingCategoryId() {
			return editingCategoryId;
		},
		get editingCategoryName() {
			return editingCategoryName;
		},
		set editingCategoryName(value: string) {
			editingCategoryName = value;
		},
		get editingCategoryColor() {
			return editingCategoryColor;
		},
		set editingCategoryColor(value: string) {
			editingCategoryColor = value;
		},
		get editingCategoryPending() {
			return editingCategoryPending;
		},
		get deletingCategoryId() {
			return deletingCategoryId;
		},
		get expandedCategoryId() {
			return expandedCategoryId;
		},
		set expandedCategoryId(value: Id<'categories'> | null) {
			expandedCategoryId = value;
		},
		get canAddCategory() {
			return canSaveCategoryName(newCategoryName) && !newCategoryPending;
		},
		get canSaveCategory() {
			return canSaveCategoryName(editingCategoryName) && !editingCategoryPending;
		},
		show() {
			open = true;
		},
		close,
		cancelEdit,
		openEditCategory,
		async addCategory(event?: Event) {
			await addCategory(event);
		},
		async saveCategory() {
			await saveCategory();
		},
		async deleteCategory(id: Id<'categories'>) {
			await deleteCategory(id);
		},
		async moveCategory(id: Id<'categories'>, direction: 'up' | 'down') {
			await moveCategory(id, direction);
		}
	};
}

export type CategoryManagerModel = ReturnType<typeof createCategoryManager>;
