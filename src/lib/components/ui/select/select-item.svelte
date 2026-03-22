<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: itemLabel,
		...restProps
	}: Omit<SelectPrimitive.ItemProps, 'children'> & { children?: Snippet } = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	data-slot="select-item"
	{value}
	{label}
	class={cn(
		'flex w-full cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm outline-none',
		'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet children()}
		{@render itemLabel?.()}
	{/snippet}
</SelectPrimitive.Item>
