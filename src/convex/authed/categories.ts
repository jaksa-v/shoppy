import { v } from 'convex/values';
import {
	getHouseholdCategories,
	getNextUserCategoryOrder,
	requireEditableCategory,
	toCategorySlug
} from './domain/categories';
import { requireHouseholdMembership } from './domain/households';
import { authedMutation, authedQuery } from './helpers';

export const list = authedQuery({
	args: { householdId: v.id('households') },
	handler: async (ctx, args) => {
		return await getHouseholdCategories(ctx, args.householdId);
	}
});

export const create = authedMutation({
	args: {
		householdId: v.id('households'),
		name: v.string(),
		color: v.string()
	},
	handler: async (ctx, args) => {
		await requireHouseholdMembership(ctx, args.householdId);
		const existing = await getHouseholdCategories(ctx, args.householdId);

		return await ctx.db.insert('categories', {
			householdId: args.householdId,
			name: args.name.trim(),
			slug: toCategorySlug(args.name.trim()),
			color: args.color,
			order: getNextUserCategoryOrder(existing),
			isSystem: false
		});
	}
});

export const rename = authedMutation({
	args: {
		id: v.id('categories'),
		name: v.string()
	},
	handler: async (ctx, args) => {
		const category = await requireEditableCategory(ctx, args.id);

		const trimmed = args.name.trim();
		await ctx.db.patch(category._id, { name: trimmed, slug: toCategorySlug(trimmed) });
	}
});

export const updateColor = authedMutation({
	args: {
		id: v.id('categories'),
		color: v.string()
	},
	handler: async (ctx, args) => {
		const category = await requireEditableCategory(ctx, args.id);
		await ctx.db.patch(category._id, { color: args.color });
	}
});

export const reorder = authedMutation({
	args: {
		householdId: v.id('households'),
		orderedIds: v.array(v.id('categories'))
	},
	handler: async (ctx, args) => {
		await requireHouseholdMembership(ctx, args.householdId);

		await Promise.all(args.orderedIds.map((id, index) => ctx.db.patch(id, { order: index })));
	}
});

export const remove = authedMutation({
	args: { id: v.id('categories') },
	handler: async (ctx, args) => {
		const category = await requireEditableCategory(ctx, args.id);

		// Move all items in this category to uncategorized (categoryId = undefined)
		const lists = await ctx.db
			.query('groceryLists')
			.withIndex('by_householdId', (q) => q.eq('householdId', category.householdId))
			.collect();

		for (const list of lists) {
			const items = await ctx.db
				.query('groceryItems')
				.withIndex('by_listId', (q) => q.eq('listId', list._id))
				.filter((q) => q.eq(q.field('categoryId'), args.id))
				.collect();

			await Promise.all(items.map((item) => ctx.db.patch(item._id, { categoryId: undefined })));
		}

		await ctx.db.delete(args.id);
	}
});
