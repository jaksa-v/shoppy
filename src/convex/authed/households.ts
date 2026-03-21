import { authedMutation } from './helpers';

const DEFAULT_CATEGORIES: { name: string; slug: string; color: string; order: number }[] = [
	{ name: 'Meat', slug: 'meat', color: '#e57373', order: 0 },
	{ name: 'Dairy', slug: 'dairy', color: '#64b5f6', order: 1 },
	{ name: 'Vegetables', slug: 'vegetables', color: '#81c784', order: 2 },
	{ name: 'Fruits', slug: 'fruits', color: '#d66a4f', order: 3 },
	{ name: 'Hygiene', slug: 'hygiene', color: '#ba68c8', order: 4 }
];

export const getOrCreate = authedMutation({
	args: {},
	handler: async (ctx) => {
		const userId = ctx.identity.subject;

		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.first();

		if (membership) {
			return await ctx.db.get(membership.householdId);
		}

		const householdId = await ctx.db.insert('households', {
			name: 'My Household',
			ownerId: userId
		});

		await ctx.db.insert('householdMembers', { householdId, userId, role: 'owner' });

		for (const cat of DEFAULT_CATEGORIES) {
			await ctx.db.insert('categories', { householdId, ...cat, isSystem: false });
		}
		await ctx.db.insert('categories', {
			householdId,
			name: 'Uncategorized',
			slug: 'uncategorized',
			color: '#9e9e9e',
			order: 99,
			isSystem: true
		});

		await ctx.db.insert('groceryLists', { householdId, name: 'Shopping List', isActive: true });

		return await ctx.db.get(householdId);
	}
});
