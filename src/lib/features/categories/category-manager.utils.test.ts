import { describe, expect, test } from 'bun:test';
import {
	canMoveCategory,
	canSaveCategoryName,
	getManageableCategories,
	getReorderedCategoryIds
} from './category-manager.utils';

describe('category manager helpers', () => {
	test('filters and sorts manageable categories', () => {
		const categories = getManageableCategories([
			{ _id: 'system', name: 'Uncategorized', order: 99, isSystem: true },
			{ _id: '2', name: 'Dairy', order: 1, isSystem: false },
			{ _id: '1', name: 'Meat', order: 0, isSystem: false }
		]);

		expect(categories.map((category) => category._id)).toEqual(['1', '2']);
	});

	test('computes move eligibility and reordering', () => {
		const categories = [
			{ _id: '1', name: 'Meat', order: 0, isSystem: false },
			{ _id: '2', name: 'Dairy', order: 1, isSystem: false }
		];

		expect(canMoveCategory(categories, '1', 'up')).toBe(false);
		expect(canMoveCategory(categories, '1', 'down')).toBe(true);
		expect(getReorderedCategoryIds(categories, '1', 'down')).toEqual(['2', '1']);
	});

	test('blocks invalid saves', () => {
		expect(canSaveCategoryName('')).toBe(false);
		expect(canSaveCategoryName('   ')).toBe(false);
		expect(canSaveCategoryName('Produce')).toBe(true);
	});
});
