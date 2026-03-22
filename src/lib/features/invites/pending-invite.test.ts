import { describe, expect, test } from 'bun:test';
import { isTerminalPendingInviteError } from './pending-invite';

describe('pending invite terminal errors', () => {
	test('marks terminal invite failures for cleanup', () => {
		expect(isTerminalPendingInviteError(new Error('Invite expired'))).toBe(true);
		expect(isTerminalPendingInviteError(new Error('Already a member of this household'))).toBe(
			true
		);
	});

	test('keeps transient failures for retry', () => {
		expect(isTerminalPendingInviteError(new Error('Network timeout'))).toBe(false);
		expect(isTerminalPendingInviteError('Invite expired')).toBe(false);
	});
});
