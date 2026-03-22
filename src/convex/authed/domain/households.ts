import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';

export type AuthedQueryCtx = QueryCtx & {
	identity: { subject: string };
};

export type AuthedMutationCtx = MutationCtx & {
	identity: { subject: string };
};

export type AuthedCtx = AuthedQueryCtx | AuthedMutationCtx;

export const DEFAULT_CATEGORIES: { name: string; slug: string; color: string; order: number }[] = [
	{ name: 'Meat', slug: 'meat', color: '#e57373', order: 0 },
	{ name: 'Dairy', slug: 'dairy', color: '#64b5f6', order: 1 },
	{ name: 'Vegetables', slug: 'vegetables', color: '#81c784', order: 2 },
	{ name: 'Fruits', slug: 'fruits', color: '#d66a4f', order: 3 },
	{ name: 'Hygiene', slug: 'hygiene', color: '#ba68c8', order: 4 }
];

export function requireIdentity(ctx: AuthedCtx) {
	return ctx.identity.subject;
}

export async function getMembershipByUserId(ctx: AuthedCtx, userId: string) {
	return await ctx.db
		.query('householdMembers')
		.withIndex('by_userId', (query) => query.eq('userId', userId))
		.first();
}

export async function requireHouseholdMembership(ctx: AuthedCtx, householdId: Id<'households'>) {
	const userId = requireIdentity(ctx);

	const membership = await ctx.db
		.query('householdMembers')
		.withIndex('by_userId', (query) => query.eq('userId', userId))
		.filter((query) => query.eq(query.field('householdId'), householdId))
		.first();

	if (!membership) {
		throw new Error('Forbidden');
	}

	return membership;
}

export async function getUserPrimaryHousehold(ctx: AuthedCtx, userId: string) {
	const membership = await getMembershipByUserId(ctx, userId);

	if (!membership) {
		return null;
	}

	return await ctx.db.get(membership.householdId);
}

export async function getActiveHouseholdList(ctx: AuthedCtx, householdId: Id<'households'>) {
	return await ctx.db
		.query('groceryLists')
		.withIndex('by_householdId', (query) => query.eq('householdId', householdId))
		.filter((query) => query.eq(query.field('isActive'), true))
		.first();
}

export async function createHouseholdWithDefaults(ctx: AuthedMutationCtx, userId: string) {
	const householdId = await ctx.db.insert('households', {
		name: 'My Household',
		ownerId: userId
	});

	await ctx.db.insert('householdMembers', {
		householdId,
		userId,
		role: 'owner'
	});

	for (const category of DEFAULT_CATEGORIES) {
		await ctx.db.insert('categories', {
			householdId,
			...category,
			isSystem: false
		});
	}

	await ctx.db.insert('categories', {
		householdId,
		name: 'Uncategorized',
		slug: 'uncategorized',
		color: '#9e9e9e',
		order: 99,
		isSystem: true
	});

	await ctx.db.insert('groceryLists', {
		householdId,
		name: 'Shopping List',
		isActive: true
	});

	return householdId;
}

export async function getOwnedHouseholdMemberships(ctx: AuthedCtx, userId: string) {
	const memberships = await ctx.db
		.query('householdMembers')
		.withIndex('by_userId', (query) => query.eq('userId', userId))
		.collect();

	const ownedMemberships: Array<Doc<'householdMembers'>> = [];

	for (const membership of memberships) {
		const household = await ctx.db.get(membership.householdId);
		if (household?.ownerId === userId) {
			ownedMemberships.push(membership);
		}
	}

	return ownedMemberships;
}

export async function isSoloHousehold(ctx: AuthedCtx, householdId: Id<'households'>) {
	const members = await ctx.db
		.query('householdMembers')
		.withIndex('by_householdId', (query) => query.eq('householdId', householdId))
		.collect();

	return members.length === 1;
}
