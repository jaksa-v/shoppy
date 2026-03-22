import type { Doc, Id } from '../../_generated/dataModel';
import { requireHouseholdMembership, type AuthedCtx } from './households';

export function toCategorySlug(name: string) {
	return name
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

export async function getHouseholdCategories(ctx: AuthedCtx, householdId: Id<'households'>) {
	await requireHouseholdMembership(ctx, householdId);

	return await ctx.db
		.query('categories')
		.withIndex('by_householdId', (query) => query.eq('householdId', householdId))
		.collect();
}

export async function requireEditableCategory(ctx: AuthedCtx, categoryId: Id<'categories'>) {
	const category = await ctx.db.get(categoryId);

	if (!category) {
		throw new Error('Not found');
	}

	if (category.isSystem) {
		throw new Error('Cannot modify system category');
	}

	await requireHouseholdMembership(ctx, category.householdId);

	return category;
}

export function getNextUserCategoryOrder(categories: Doc<'categories'>[]) {
	return (
		categories
			.filter((category) => !category.isSystem)
			.reduce((maxOrder, category) => Math.max(maxOrder, category.order), -1) + 1
	);
}
