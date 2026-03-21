import { v } from 'convex/values';
import { authedQuery } from './helpers';

export const getActive = authedQuery({
	args: { householdId: v.id('households') },
	handler: async (ctx, args) => {
		const userId = ctx.identity.subject;
		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('householdId'), args.householdId))
			.first();
		if (!membership) throw new Error('Forbidden');

		return await ctx.db
			.query('groceryLists')
			.withIndex('by_householdId', (q) => q.eq('householdId', args.householdId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.first();
	}
});
