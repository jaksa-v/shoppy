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

export const list = authedQuery({
	args: { listId: v.id('groceryLists') },
	handler: async (ctx, args) => {
		const list = await ctx.db.get(args.listId);
		if (!list) throw new Error('Not found');

		await assertHouseholdMember(ctx, list.householdId);

		return await ctx.db
			.query('groceryItems')
			.withIndex('by_listId', (q) => q.eq('listId', args.listId))
			.collect();
	}
});

export const create = authedMutation({
	args: {
		listId: v.id('groceryLists'),
		householdId: v.id('households'),
		name: v.string(),
		categoryId: v.optional(v.id('categories')),
		quantity: v.optional(v.string()),
		notes: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		await assertHouseholdMember(ctx, args.householdId);

		return await ctx.db.insert('groceryItems', {
			listId: args.listId,
			householdId: args.householdId,
			name: args.name,
			categoryId: args.categoryId,
			quantity: args.quantity,
			notes: args.notes,
			completed: false
		});
	}
});

export const update = authedMutation({
	args: {
		id: v.id('groceryItems'),
		name: v.optional(v.string()),
		categoryId: v.optional(v.id('categories')),
		quantity: v.optional(v.string()),
		notes: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (!item) throw new Error('Not found');

		await assertHouseholdMember(ctx, item.householdId);

		const { id, ...patch } = args;
		await ctx.db.patch(id, patch);
	}
});

export const remove = authedMutation({
	args: { id: v.id('groceryItems') },
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (!item) throw new Error('Not found');

		await assertHouseholdMember(ctx, item.householdId);

		await ctx.db.delete(args.id);
	}
});

export const toggleBought = authedMutation({
	args: { id: v.id('groceryItems') },
	handler: async (ctx, args) => {
		const item = await ctx.db.get(args.id);
		if (!item) throw new Error('Not found');

		await assertHouseholdMember(ctx, item.householdId);

		await ctx.db.patch(args.id, { completed: !item.completed });
	}
});
