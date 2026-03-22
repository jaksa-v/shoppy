import { onMount } from 'svelte';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
	isTerminalPendingInviteError,
	pendingInviteStore
} from '$lib/features/invites/pending-invite';

type CreateHouseholdSessionOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
	getUserId: () => string | null | undefined;
};

export function createHouseholdSession(options: CreateHouseholdSessionOptions) {
	const pendingInvite = pendingInviteStore();

	let householdId = $state<Id<'households'> | null>(null);
	let bootstrapping = $state(false);
	let bootstrapError = $state<string | null>(null);

	onMount(async () => {
		if (!options.getUserId()) {
			return;
		}

		bootstrapping = true;
		bootstrapError = null;

		try {
			const pendingInviteCode = pendingInvite.read();
			if (pendingInviteCode) {
				try {
					await options.client.mutation(api.authed.invites.accept, {
						code: pendingInviteCode
					});
					pendingInvite.clear();
				} catch (error) {
					if (isTerminalPendingInviteError(error)) {
						pendingInvite.clear();
					}
				}
			}

			const household = await options.client.mutation(api.authed.households.getOrCreate, {});
			householdId = household?._id ?? null;
		} catch (error) {
			bootstrapError = error instanceof Error ? error.message : 'Failed to bootstrap household';
		} finally {
			bootstrapping = false;
		}
	});

	return {
		get householdId() {
			return householdId;
		},
		get bootstrapping() {
			return bootstrapping;
		},
		get bootstrapError() {
			return bootstrapError;
		},
		get isReady() {
			return !bootstrapping && !!householdId && !bootstrapError;
		}
	};
}

export type HouseholdSessionModel = ReturnType<typeof createHouseholdSession>;
