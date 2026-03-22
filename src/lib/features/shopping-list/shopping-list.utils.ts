type CategoryLike = {
	_id: string;
	name: string;
	order: number;
};

type GroceryItemLike = {
	_id: string;
	name: string;
	categoryId?: string;
	completed: boolean;
};

export type GroupedItems<Category extends CategoryLike, Item extends GroceryItemLike> = Array<{
	category: Category | null;
	items: Item[];
}>;

export function sortCategories<Category extends CategoryLike>(categories: Category[]) {
	return [...categories].sort((a, b) => a.order - b.order);
}

export function partitionItems<Item extends GroceryItemLike>(items: Item[]) {
	return {
		activeItems: items.filter((item) => !item.completed),
		boughtItems: items.filter((item) => item.completed)
	};
}

export function groupActiveItemsByCategory<
	Category extends CategoryLike,
	Item extends GroceryItemLike
>(params: { activeItems: Item[]; sortedCategories: Category[] }) {
	const groups: GroupedItems<Category, Item> = [];
	const itemsByCategory = new Map<string, Item[]>();

	for (const item of params.activeItems) {
		const key = item.categoryId ?? '__none__';
		const existing = itemsByCategory.get(key);

		if (existing) {
			existing.push(item);
			continue;
		}

		itemsByCategory.set(key, [item]);
	}

	for (const category of params.sortedCategories) {
		const categoryItems = itemsByCategory.get(category._id) ?? [];
		if (categoryItems.length > 0) {
			groups.push({
				category,
				items: categoryItems
			});
		}
	}

	const uncategorizedItems = itemsByCategory.get('__none__') ?? [];
	if (uncategorizedItems.length > 0) {
		groups.push({
			category: null,
			items: uncategorizedItems
		});
	}

	return groups;
}
