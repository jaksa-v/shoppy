<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children,
		...restProps
	}: Omit<SelectPrimitive.ItemProps, 'children'> & { children?: Snippet } = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	data-slot="select-item"
	{value}
	{label}
	class={cn(
		'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-3 pl-8 text-sm outline-none',
		'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet child({ selected })}
		<!-- checkmark column — always takes the same space -->
		<span class="absolute left-2 flex h-4 w-4 items-center justify-center">
			{#if selected}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{/if}
		</span>
		{@render children?.()}
	{/snippet}
</SelectPrimitive.Item>
