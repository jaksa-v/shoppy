import { v } from 'convex/values';
import { authedMutation, authedQuery } from './helpers';

function generateCode(): string {
	return Math.random().toString(36).slice(2, 10).toUpperCase();
}

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const create = authedMutation({
	args: {},
	handler: async (ctx) => {
		const userId = ctx.identity.subject;

		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.first();

		if (!membership) throw new Error('No household found');

		// Return existing valid invite if one exists
		const existingInvites = await ctx.db
			.query('invites')
			.withIndex('by_householdId', (q) => q.eq('householdId', membership.householdId))
			.collect();

		const now = Date.now();
		const validInvite = existingInvites.find(
			(inv) => inv.createdBy === userId && !inv.usedBy && inv.expiresAt > now
		);
		if (validInvite) return validInvite;

		const code = generateCode();
		const inviteId = await ctx.db.insert('invites', {
			householdId: membership.householdId,
			code,
			createdBy: userId,
			expiresAt: now + INVITE_TTL_MS
		});

		return await ctx.db.get(inviteId);
	}
});

export const listForHousehold = authedQuery({
	args: {},
	handler: async (ctx) => {
		const userId = ctx.identity.subject;

		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.first();

		if (!membership) return [];

		const now = Date.now();
		const invites = await ctx.db
			.query('invites')
			.withIndex('by_householdId', (q) => q.eq('householdId', membership.householdId))
			.collect();

		return invites.filter((inv) => !inv.usedBy && inv.expiresAt > now);
	}
});

export const getByCode = authedQuery({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		const invite = await ctx.db
			.query('invites')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (!invite) return null;

		const household = await ctx.db.get(invite.householdId);
		return { invite, household };
	}
});

export const accept = authedMutation({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		const userId = ctx.identity.subject;

		const invite = await ctx.db
			.query('invites')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (!invite) throw new Error('Invite not found');
		if (invite.usedBy) throw new Error('Invite already used');
		if (invite.expiresAt < Date.now()) throw new Error('Invite expired');

		const targetHousehold = await ctx.db.get(invite.householdId);
		if (!targetHousehold) throw new Error('Household not found');
		if (targetHousehold.ownerId === userId) throw new Error('You already own this household');

		// Check if already a member
		const existingMembership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('householdId'), invite.householdId))
			.first();

		if (existingMembership) throw new Error('Already a member of this household');

		// Remove user from any solo households they own (cleanup)
		const userMemberships = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.collect();

		for (const m of userMemberships) {
			const household = await ctx.db.get(m.householdId);
			if (!household || household.ownerId !== userId) continue;

			const allMembers = await ctx.db
				.query('householdMembers')
				.withIndex('by_householdId', (q) => q.eq('householdId', m.householdId))
				.collect();

			if (allMembers.length === 1) {
				// Solo household — remove membership so getOrCreate returns the new one
				await ctx.db.delete(m._id);
			}
		}

		// Join the invited household
		await ctx.db.insert('householdMembers', {
			householdId: invite.householdId,
			userId,
			role: 'member'
		});

		// Mark invite as used
		await ctx.db.patch(invite._id, { usedBy: userId, usedAt: Date.now() });

		return invite.householdId;
	}
});

export const revoke = authedMutation({
	args: { inviteId: v.id('invites') },
	handler: async (ctx, args) => {
		const userId = ctx.identity.subject;

		const invite = await ctx.db.get(args.inviteId);
		if (!invite) throw new Error('Invite not found');
		if (invite.createdBy !== userId) throw new Error('Forbidden');

		await ctx.db.delete(args.inviteId);
	}
});

export const listMembers = authedQuery({
	args: {},
	handler: async (ctx) => {
		const userId = ctx.identity.subject;

		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.first();

		if (!membership) return [];

		return await ctx.db
			.query('householdMembers')
			.withIndex('by_householdId', (q) => q.eq('householdId', membership.householdId))
			.collect();
	}
});
