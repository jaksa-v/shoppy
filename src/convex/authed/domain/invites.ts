import type { Doc, Id } from '../../_generated/dataModel';
import {
	getMembershipByUserId,
	getOwnedHouseholdMemberships,
	isSoloHousehold,
	requireIdentity,
	type AuthedCtx,
	type AuthedMutationCtx
} from './households';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateInviteCode() {
	return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function getInviteByCode(ctx: AuthedCtx, code: string) {
	return await ctx.db
		.query('invites')
		.withIndex('by_code', (query) => query.eq('code', code))
		.first();
}

export function getInviteStatus(invite: Doc<'invites'> | null, now = Date.now()) {
	if (!invite) {
		return 'missing';
	}

	if (invite.usedBy) {
		return 'used';
	}

	if (invite.expiresAt < now) {
		return 'expired';
	}

	return 'valid';
}

export async function getActiveInviteForCreator(
	ctx: AuthedCtx,
	householdId: Id<'households'>,
	userId: string
) {
	const invites = await ctx.db
		.query('invites')
		.withIndex('by_householdId', (query) => query.eq('householdId', householdId))
		.collect();

	const now = Date.now();

	return (
		invites.find(
			(invite) => invite.createdBy === userId && getInviteStatus(invite, now) === 'valid'
		) ?? null
	);
}

export async function listValidInvitesForHousehold(ctx: AuthedCtx, householdId: Id<'households'>) {
	const invites = await ctx.db
		.query('invites')
		.withIndex('by_householdId', (query) => query.eq('householdId', householdId))
		.collect();

	const now = Date.now();

	return invites.filter((invite) => getInviteStatus(invite, now) === 'valid');
}

export async function cleanupSoloOwnedHouseholds(ctx: AuthedMutationCtx, userId: string) {
	const ownedMemberships = await getOwnedHouseholdMemberships(ctx, userId);

	for (const membership of ownedMemberships) {
		if (await isSoloHousehold(ctx, membership.householdId)) {
			await ctx.db.delete(membership._id);
		}
	}
}

export async function acceptInviteMembership(ctx: AuthedMutationCtx, code: string) {
	const userId = requireIdentity(ctx);
	const invite = await getInviteByCode(ctx, code);
	const status = getInviteStatus(invite);

	if (status === 'missing') {
		throw new Error('Invite not found');
	}

	if (status === 'used') {
		throw new Error('Invite already used');
	}

	if (status === 'expired') {
		throw new Error('Invite expired');
	}

	if (!invite) {
		throw new Error('Invite not found');
	}

	const targetHousehold = await ctx.db.get(invite.householdId);

	if (!targetHousehold) {
		throw new Error('Household not found');
	}

	if (targetHousehold.ownerId === userId) {
		throw new Error('You already own this household');
	}

	const existingMembership = await getMembershipByUserId(ctx, userId);
	if (existingMembership?.householdId === invite.householdId) {
		throw new Error('Already a member of this household');
	}

	await cleanupSoloOwnedHouseholds(ctx, userId);

	await ctx.db.insert('householdMembers', {
		householdId: invite.householdId,
		userId,
		role: 'member'
	});

	await ctx.db.patch(invite._id, {
		usedBy: userId,
		usedAt: Date.now()
	});

	return invite.householdId;
}
