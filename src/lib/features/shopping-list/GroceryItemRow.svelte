<script lang="ts">
	import type { GroceryItem } from './create-shopping-list-model.svelte.js';

	type Props = {
		item: GroceryItem;
		completed?: boolean;
		onToggleBought: (id: GroceryItem['_id']) => void | Promise<void>;
		onEdit?: (item: GroceryItem) => void;
		onDelete: (id: GroceryItem['_id']) => void | Promise<void>;
	};

	const { item, completed = false, onToggleBought, onEdit, onDelete }: Props = $props();
</script>

<li
	class={`group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors ${
		completed ? 'opacity-60 transition-all hover:opacity-100' : 'hover:bg-muted/40'
	}`}
>
	<button
		onclick={() => onToggleBought(item._id)}
		class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center sm:mt-0.5 sm:min-h-0 sm:min-w-0"
		aria-label={completed ? 'Mark as not bought' : 'Mark as bought'}
	>
		{#if completed}
			<span
				class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</span>
		{:else}
			<span
				class="h-5 w-5 rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary"
			></span>
		{/if}
	</button>

	<div class="min-w-0 flex-1">
		<span class={`text-sm leading-snug font-medium ${completed ? 'line-through' : ''}`}
			>{item.name}</span
		>
		{#if item.quantity || item.notes}
			<div class="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
				{#if item.quantity}
					<span>{item.quantity}</span>
				{/if}
				{#if item.notes}
					<span class="italic">{item.notes}</span>
				{/if}
			</div>
		{/if}
	</div>

	{#if completed}
		<button
			onclick={() => onDelete(item._id)}
			class="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:min-h-0 sm:min-w-0 sm:p-1 sm:opacity-0 sm:group-hover:opacity-100"
			aria-label="Delete item"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
				<path d="M10 11v6" />
				<path d="M14 11v6" />
				<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
			</svg>
		</button>
	{:else}
		<div class="flex shrink-0 gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
			<button
				onclick={() => onEdit?.(item)}
				class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground sm:min-h-0 sm:min-w-0 sm:p-1"
				aria-label="Edit item"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
				</svg>
			</button>
			<button
				onclick={() => onDelete(item._id)}
				class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:min-h-0 sm:min-w-0 sm:p-1"
				aria-label="Delete item"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="3 6 5 6 21 6" />
					<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
					<path d="M10 11v6" />
					<path d="M14 11v6" />
					<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
				</svg>
			</button>
		</div>
	{/if}
</li>
