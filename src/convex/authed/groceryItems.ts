import { v } from 'convex/values';
import { authedQuery } from './helpers';

export const list = authedQuery({
	args: { listId: v.id('groceryLists') },
	handler: async (ctx, args) => {
		const list = await ctx.db.get(args.listId);
		if (!list) throw new Error('Not found');

		const userId = ctx.identity.subject;
		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('householdId'), list.householdId))
			.first();
		if (!membership) throw new Error('Forbidden');

		return await ctx.db
			.query('groceryItems')
			.withIndex('by_listId', (q) => q.eq('listId', args.listId))
			.collect();
	}
});
