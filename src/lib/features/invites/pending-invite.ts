import {
	clearPendingInviteCode,
	persistPendingInviteCode,
	readPendingInviteCode
} from '../../auth/auth-flow';

const TERMINAL_INVITE_ERRORS = new Set([
	'Invite not found',
	'Invite already used',
	'Invite expired',
	'Already a member of this household',
	'You already own this household'
]);

export function isTerminalPendingInviteError(error: unknown) {
	return error instanceof Error && TERMINAL_INVITE_ERRORS.has(error.message);
}

export function pendingInviteStore() {
	return {
		clear: clearPendingInviteCode,
		persist: persistPendingInviteCode,
		read: readPendingInviteCode
	};
}
