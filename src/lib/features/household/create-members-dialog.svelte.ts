import { page } from '$app/state';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

type CreateMembersDialogOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
	getActiveInvite: () => Doc<'invites'> | null;
};

export function createMembersDialog(options: CreateMembersDialogOptions) {
	let open = $state(false);
	let inviteLink = $state('');
	let invitePending = $state(false);
	let inviteCopied = $state(false);

	function resetTransientState() {
		inviteLink = '';
		inviteCopied = false;
	}

	function getInviteLink(code: string) {
		return `${page.url.origin}/app/invite/${code}`;
	}

	function close() {
		open = false;
		resetTransientState();
	}

	async function createInvite() {
		invitePending = true;
		inviteLink = '';

		try {
			const invite = await options.client.mutation(api.authed.invites.create, {});

			if (invite) {
				inviteLink = getInviteLink(invite.code);
			}
		} finally {
			invitePending = false;
		}
	}

	async function copyInvite(link: string) {
		await navigator.clipboard.writeText(link);
		inviteCopied = true;
		setTimeout(() => {
			inviteCopied = false;
		}, 2000);
	}

	async function revokeInvite(inviteId: Id<'invites'>) {
		await options.client.mutation(api.authed.invites.revoke, {
			inviteId
		});
		resetTransientState();
	}

	return {
		get open() {
			return open;
		},
		set open(value: boolean) {
			open = value;
			if (!value) {
				resetTransientState();
			}
		},
		get inviteLink() {
			return inviteLink;
		},
		get invitePending() {
			return invitePending;
		},
		get inviteCopied() {
			return inviteCopied;
		},
		get activeInviteLink() {
			const existingInvite = options.getActiveInvite();
			return existingInvite ? getInviteLink(existingInvite.code) : '';
		},
		show() {
			open = true;
		},
		close,
		async createInvite() {
			await createInvite();
		},
		async copyInvite(link: string) {
			await copyInvite(link);
		},
		async revokeInvite(inviteId: Id<'invites'>) {
			await revokeInvite(inviteId);
		}
	};
}

export type MembersDialogModel = ReturnType<typeof createMembersDialog>;
