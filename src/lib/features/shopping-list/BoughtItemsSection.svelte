<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import GroceryItemRow from './GroceryItemRow.svelte';
	import type { GroceryItem } from './create-shopping-list-model.svelte.js';

	type Props = {
		items: GroceryItem[];
		clearPending: boolean;
		onClear: () => void;
		onToggleBought: (id: GroceryItem['_id']) => void | Promise<void>;
		onDelete: (id: GroceryItem['_id']) => void | Promise<void>;
	};

	const { items, clearPending, onClear, onToggleBought, onDelete }: Props = $props();
</script>

<div class="mt-8">
	<div class="mb-3 flex items-center justify-between">
		<h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
			Checked ({items.length})
		</h2>
		<Button
			variant="ghost"
			size="sm"
			class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
			onclick={onClear}
			disabled={clearPending}
		>
			Clear all
		</Button>
	</div>
	<ul class="space-y-1.5">
		{#each items as item (item._id)}
			<GroceryItemRow {item} completed {onToggleBought} {onDelete} />
		{/each}
	</ul>
</div>
