<script lang="ts">
	import type { Doc } from '../../../convex/_generated/dataModel';
	import GroceryItemRow from './GroceryItemRow.svelte';
	import type { GroceryItem } from './create-shopping-list-model.svelte.js';

	type Group = {
		category: Doc<'categories'> | null;
		items: GroceryItem[];
	};

	type Props = {
		groups: Group[];
		onToggleBought: (id: GroceryItem['_id']) => void | Promise<void>;
		onEdit: (item: GroceryItem) => void;
		onDelete: (id: GroceryItem['_id']) => void | Promise<void>;
	};

	const { groups, onToggleBought, onEdit, onDelete }: Props = $props();
</script>

<div class="space-y-6">
	{#each groups as group (group.category?._id ?? '__none__')}
		<section>
			<div class="mb-2 flex items-center gap-2">
				{#if group.category}
					<span class="h-2.5 w-2.5 rounded-full" style={`background-color: ${group.category.color}`}
					></span>
				{/if}
				<h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					{group.category?.name ?? 'Uncategorized'}
				</h2>
			</div>
			<ul class="space-y-1.5">
				{#each group.items as item (item._id)}
					<GroceryItemRow {item} {onToggleBought} {onEdit} {onDelete} />
				{/each}
			</ul>
		</section>
	{/each}
</div>
