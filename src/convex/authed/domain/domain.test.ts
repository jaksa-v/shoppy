import { describe, expect, test } from 'bun:test';
import type { Id, TableNames } from '../../_generated/dataModel';
import { getNextUserCategoryOrder, toCategorySlug } from './categories';
import { getInviteStatus } from './invites';

const id = <TableName extends TableNames>(value: string) => value as Id<TableName>;

describe('convex domain helpers', () => {
	test('computes invite status boundaries', () => {
		expect(getInviteStatus(null)).toBe('missing');
		expect(
			getInviteStatus({
				_id: id<'invites'>('invite'),
				_creationTime: 0,
				householdId: id<'households'>('household'),
				code: 'ABC',
				createdBy: 'user',
				expiresAt: Date.now() - 1,
				usedBy: undefined,
				usedAt: undefined
			})
		).toBe('expired');
		expect(
			getInviteStatus({
				_id: id<'invites'>('invite'),
				_creationTime: 0,
				householdId: id<'households'>('household'),
				code: 'ABC',
				createdBy: 'user',
				expiresAt: Date.now() + 1000,
				usedBy: 'user-2',
				usedAt: Date.now()
			})
		).toBe('used');
	});

	test('computes next user category order and slugs', () => {
		expect(
			getNextUserCategoryOrder([
				{
					_id: id<'categories'>('1'),
					_creationTime: 0,
					householdId: id<'households'>('household'),
					name: 'Meat',
					slug: 'meat',
					color: '#fff',
					order: 0,
					isSystem: false
				},
				{
					_id: id<'categories'>('2'),
					_creationTime: 0,
					householdId: id<'households'>('household'),
					name: 'Uncategorized',
					slug: 'uncategorized',
					color: '#999',
					order: 99,
					isSystem: true
				}
			])
		).toBe(1);
		expect(toCategorySlug('Fresh Herbs & Greens')).toBe('fresh-herbs--greens');
	});
});
