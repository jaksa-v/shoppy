import { v } from 'convex/values';
import {
	acceptInviteMembership,
	generateInviteCode,
	getActiveInviteForCreator,
	getInviteByCode,
	listValidInvitesForHousehold,
	INVITE_TTL_MS
} from './domain/invites';
import { getMembershipByUserId, requireIdentity } from './domain/households';
import { authedMutation, authedQuery } from './helpers';

export const create = authedMutation({
	args: {},
	handler: async (ctx) => {
		const userId = requireIdentity(ctx);
		const membership = await getMembershipByUserId(ctx, userId);

		if (!membership) throw new Error('No household found');

		const validInvite = await getActiveInviteForCreator(ctx, membership.householdId, userId);
		if (validInvite) return validInvite;

		const code = generateInviteCode();
		const inviteId = await ctx.db.insert('invites', {
			householdId: membership.householdId,
			code,
			createdBy: userId,
			expiresAt: Date.now() + INVITE_TTL_MS
		});

		return await ctx.db.get(inviteId);
	}
});

export const listForHousehold = authedQuery({
	args: {},
	handler: async (ctx) => {
		const membership = await getMembershipByUserId(ctx, requireIdentity(ctx));

		if (!membership) return [];

		return await listValidInvitesForHousehold(ctx, membership.householdId);
	}
});

export const getByCode = authedQuery({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		const invite = await getInviteByCode(ctx, args.code);

		if (!invite) return null;

		const household = await ctx.db.get(invite.householdId);
		return { invite, household };
	}
});

export const accept = authedMutation({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await acceptInviteMembership(ctx, args.code);
	}
});

export const revoke = authedMutation({
	args: { inviteId: v.id('invites') },
	handler: async (ctx, args) => {
		const userId = requireIdentity(ctx);

		const invite = await ctx.db.get(args.inviteId);
		if (!invite) throw new Error('Invite not found');
		if (invite.createdBy !== userId) throw new Error('Forbidden');

		await ctx.db.delete(args.inviteId);
	}
});

export const listMembers = authedQuery({
	args: {},
	handler: async (ctx) => {
		const membership = await getMembershipByUserId(ctx, requireIdentity(ctx));

		if (!membership) return [];

		return await ctx.db
			.query('householdMembers')
			.withIndex('by_householdId', (q) => q.eq('householdId', membership.householdId))
			.collect();
	}
});
