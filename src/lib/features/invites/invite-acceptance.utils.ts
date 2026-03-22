export type InviteStatus = {
	hasInvite: boolean;
	isExpired: boolean;
	isUsed: boolean;
	done: boolean;
};

export function deriveInviteValidity(status: InviteStatus) {
	if (!status.hasInvite) {
		return 'missing';
	}

	if (status.done) {
		return 'accepted';
	}

	if (status.isUsed) {
		return 'used';
	}

	if (status.isExpired) {
		return 'expired';
	}

	return 'valid';
}
