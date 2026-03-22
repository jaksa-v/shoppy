import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import { v } from 'convex/values';
import type { DataModel } from '../_generated/dataModel';
import { authedMutation, authedQuery } from './helpers';

async function assertHouseholdMember(
	ctx: (GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>) & {
		identity: { subject: string };
	},
	householdId: string
) {
	const userId = ctx.identity.subject;
	const membership = await ctx.db
		.query('householdMembers')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.filter((q) => q.eq(q.field('householdId'), householdId))
		.first();
	if (!membership) throw new Error('Forbidden');
	return membership;
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

export const list = authedQuery({
	args: { householdId: v.id('households') },
	handler: async (ctx, args) => {
		await assertHouseholdMember(ctx, args.householdId);

		return await ctx.db
			.query('categories')
			.withIndex('by_householdId', (q) => q.eq('householdId', args.householdId))
			.collect();
	}
});

export const create = authedMutation({
	args: {
		householdId: v.id('households'),
		name: v.string(),
		color: v.string()
	},
	handler: async (ctx, args) => {
		await assertHouseholdMember(ctx, args.householdId);

		const existing = await ctx.db
			.query('categories')
			.withIndex('by_householdId', (q) => q.eq('householdId', args.householdId))
			.collect();

		// Insert before the system "Uncategorized" category (order 99)
		const maxUserOrder = existing
			.filter((c) => !c.isSystem)
			.reduce((max, c) => Math.max(max, c.order), -1);

		return await ctx.db.insert('categories', {
			householdId: args.householdId,
			name: args.name.trim(),
			slug: toSlug(args.name.trim()),
			color: args.color,
			order: maxUserOrder + 1,
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
		const category = await ctx.db.get(args.id);
		if (!category) throw new Error('Not found');
		if (category.isSystem) throw new Error('Cannot rename system category');

		await assertHouseholdMember(ctx, category.householdId);

		const trimmed = args.name.trim();
		await ctx.db.patch(args.id, { name: trimmed, slug: toSlug(trimmed) });
	}
});

export const updateColor = authedMutation({
	args: {
		id: v.id('categories'),
		color: v.string()
	},
	handler: async (ctx, args) => {
		const category = await ctx.db.get(args.id);
		if (!category) throw new Error('Not found');
		if (category.isSystem) throw new Error('Cannot update system category');

		await assertHouseholdMember(ctx, category.householdId);

		await ctx.db.patch(args.id, { color: args.color });
	}
});

export const reorder = authedMutation({
	args: {
		householdId: v.id('households'),
		orderedIds: v.array(v.id('categories'))
	},
	handler: async (ctx, args) => {
		await assertHouseholdMember(ctx, args.householdId);

		await Promise.all(args.orderedIds.map((id, index) => ctx.db.patch(id, { order: index })));
	}
});

export const remove = authedMutation({
	args: { id: v.id('categories') },
	handler: async (ctx, args) => {
		const category = await ctx.db.get(args.id);
		if (!category) throw new Error('Not found');
		if (category.isSystem) throw new Error('Cannot delete system category');

		await assertHouseholdMember(ctx, category.householdId);

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
