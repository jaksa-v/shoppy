import { v } from 'convex/values';
import { getActiveHouseholdList, requireHouseholdMembership } from './domain/households';
import { authedQuery } from './helpers';

export const getActive = authedQuery({
	args: { householdId: v.id('households') },
	handler: async (ctx, args) => {
		await requireHouseholdMembership(ctx, args.householdId);
		return await getActiveHouseholdList(ctx, args.householdId);
	}
});
