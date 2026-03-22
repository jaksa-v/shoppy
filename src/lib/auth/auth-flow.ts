export const AUTH_COMPLETION_INSTALL_PROMPT_KEY = 'auth-completion-install-prompt';
export const PENDING_INVITE_CODE_KEY = 'pending-invite-code';

export function persistPendingInviteCode(code: string) {
	if (typeof window === 'undefined') return;

	sessionStorage.setItem(PENDING_INVITE_CODE_KEY, code);
}

export function readPendingInviteCode() {
	if (typeof window === 'undefined') return null;

	return sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
}

export function clearPendingInviteCode() {
	if (typeof window === 'undefined') return;

	sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
}
