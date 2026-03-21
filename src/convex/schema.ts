import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	households: defineTable({
		name: v.string(),
		ownerId: v.string()
	}),
	householdMembers: defineTable({
		householdId: v.id('households'),
		userId: v.string(),
		role: v.union(v.literal('owner'), v.literal('member'))
	})
		.index('by_userId', ['userId'])
		.index('by_householdId', ['householdId']),
	categories: defineTable({
		householdId: v.id('households'),
		name: v.string(),
		slug: v.string(),
		color: v.string(),
		order: v.number(),
		isSystem: v.boolean()
	}).index('by_householdId', ['householdId']),
	groceryLists: defineTable({
		householdId: v.id('households'),
		name: v.string(),
		isActive: v.boolean()
	}).index('by_householdId', ['householdId']),
	groceryItems: defineTable({
		listId: v.id('groceryLists'),
		householdId: v.id('households'),
		name: v.string(),
		categoryId: v.optional(v.id('categories')),
		quantity: v.optional(v.string()),
		notes: v.optional(v.string()),
		completed: v.boolean()
	}).index('by_listId', ['listId']),
	invites: defineTable({
		householdId: v.id('households'),
		code: v.string(),
		createdBy: v.string(),
		expiresAt: v.number(),
		usedBy: v.optional(v.string()),
		usedAt: v.optional(v.number())
	})
		.index('by_code', ['code'])
		.index('by_householdId', ['householdId'])
});
