import { describe, expect, test } from 'bun:test';
import { groupActiveItemsByCategory, partitionItems, sortCategories } from './shopping-list.utils';

describe('shopping list derivation helpers', () => {
	test('groups active items by sorted category order', () => {
		const sortedCategories = sortCategories([
			{ _id: 'veg', name: 'Vegetables', order: 2 },
			{ _id: 'dairy', name: 'Dairy', order: 1 }
		]);

		const groups = groupActiveItemsByCategory({
			sortedCategories,
			activeItems: [
				{ _id: '1', name: 'Milk', categoryId: 'dairy', completed: false },
				{ _id: '2', name: 'Tomatoes', categoryId: 'veg', completed: false }
			]
		});

		expect(groups.map((group) => group.category?.name ?? 'Uncategorized')).toEqual([
			'Dairy',
			'Vegetables'
		]);
	});

	test('places uncategorized items last', () => {
		const groups = groupActiveItemsByCategory({
			sortedCategories: [{ _id: 'dairy', name: 'Dairy', order: 0 }],
			activeItems: [
				{ _id: '1', name: 'Bread', completed: false },
				{ _id: '2', name: 'Milk', categoryId: 'dairy', completed: false }
			]
		});

		expect(groups[1]?.category).toBeNull();
		expect(groups[1]?.items.map((item) => item.name)).toEqual(['Bread']);
	});

	test('partitions active and bought items correctly', () => {
		const items = [
			{ _id: '1', name: 'Milk', completed: false },
			{ _id: '2', name: 'Bread', completed: true }
		];

		expect(partitionItems(items)).toEqual({
			activeItems: [{ _id: '1', name: 'Milk', completed: false }],
			boughtItems: [{ _id: '2', name: 'Bread', completed: true }]
		});
	});
});
