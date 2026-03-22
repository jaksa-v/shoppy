<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		sideOffset = 4,
		...restProps
	}: SelectPrimitive.ContentProps & { sideOffset?: number } = $props();
</script>

<SelectPrimitive.Portal>
	<SelectPrimitive.Content
		bind:ref
		data-slot="select-content"
		{sideOffset}
		class={cn(
			'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background shadow-md',
			'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
			'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
			'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
			className
		)}
		{...restProps}
	>
		<SelectPrimitive.Viewport class="p-1">
			{@render children?.()}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPrimitive.Portal>
