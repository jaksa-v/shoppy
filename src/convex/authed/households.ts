import {
	createHouseholdWithDefaults,
	getUserPrimaryHousehold,
	requireIdentity
} from './domain/households';
import { authedMutation } from './helpers';

export const getOrCreate = authedMutation({
	args: {},
	handler: async (ctx) => {
		const userId = requireIdentity(ctx);
		const household = await getUserPrimaryHousehold(ctx, userId);

		if (household) {
			return household;
		}

		const householdId = await createHouseholdWithDefaults(ctx, userId);
		return await ctx.db.get(householdId);
	}
});
