import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { useQuery } from 'convex-svelte';
import { onMount } from 'svelte';
import { api } from '../../../convex/_generated/api';
import { deriveInviteValidity } from './invite-acceptance.utils';
import { pendingInviteStore } from './pending-invite';

type CreateInviteAcceptanceModelOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
	getCode: () => string;
};

export function createInviteAcceptanceModel(options: CreateInviteAcceptanceModelOptions) {
	const pendingInvite = pendingInviteStore();

	let accepting = $state(false);
	let error = $state('');
	let done = $state(false);

	const inviteQuery = useQuery(api.authed.invites.getByCode, () => {
		const code = options.getCode();
		return code ? { code } : 'skip';
	});

	onMount(() => {
		const code = options.getCode();
		if (code) {
			pendingInvite.persist(code);
		}
	});

	const invite = $derived(inviteQuery.data?.invite);
	const household = $derived(inviteQuery.data?.household);
	const isExpired = $derived(invite ? invite.expiresAt < Date.now() : false);
	const isUsed = $derived(invite ? !!invite.usedBy : false);
	const validity = $derived(
		deriveInviteValidity({
			hasInvite: !!inviteQuery.data?.invite,
			isExpired,
			isUsed,
			done
		})
	);

	$effect(() => {
		if (
			inviteQuery.data !== undefined &&
			(validity === 'missing' ||
				validity === 'used' ||
				validity === 'expired' ||
				validity === 'accepted')
		) {
			pendingInvite.clear();
		}
	});

	async function accept() {
		const code = options.getCode();
		if (!code) {
			return;
		}

		accepting = true;
		error = '';

		try {
			await options.client.mutation(api.authed.invites.accept, { code });
			pendingInvite.clear();
			done = true;
			await new Promise((resolve) => setTimeout(resolve, 1500));
			await goto(resolve('/app'));
		} catch (caughtError) {
			error = caughtError instanceof Error ? caughtError.message : 'Something went wrong';
		} finally {
			accepting = false;
		}
	}

	return {
		inviteQuery,
		get invite() {
			return invite;
		},
		get household() {
			return household;
		},
		get accepting() {
			return accepting;
		},
		get error() {
			return error;
		},
		get done() {
			return done;
		},
		get isExpired() {
			return isExpired;
		},
		get isUsed() {
			return isUsed;
		},
		get isValid() {
			return validity === 'valid';
		},
		get validity() {
			return validity;
		},
		async accept() {
			await accept();
		}
	};
}

export type InviteAcceptanceModel = ReturnType<typeof createInviteAcceptanceModel>;
