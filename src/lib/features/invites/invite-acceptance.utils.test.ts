import { describe, expect, test } from 'bun:test';
import { deriveInviteValidity } from './invite-acceptance.utils';

describe('invite acceptance validity', () => {
	test('derives invite validity states', () => {
		expect(
			deriveInviteValidity({
				hasInvite: false,
				isExpired: false,
				isUsed: false,
				done: false
			})
		).toBe('missing');

		expect(
			deriveInviteValidity({
				hasInvite: true,
				isExpired: true,
				isUsed: false,
				done: false
			})
		).toBe('expired');

		expect(
			deriveInviteValidity({
				hasInvite: true,
				isExpired: false,
				isUsed: true,
				done: false
			})
		).toBe('used');

		expect(
			deriveInviteValidity({
				hasInvite: true,
				isExpired: false,
				isUsed: false,
				done: false
			})
		).toBe('valid');
	});
});
