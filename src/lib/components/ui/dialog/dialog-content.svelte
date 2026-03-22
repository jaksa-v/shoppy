<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import DialogPortal from './dialog-portal.svelte';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<DialogPortal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'fixed z-50 grid w-full gap-6 overflow-y-auto bg-background text-sm ring-1 ring-foreground/10 outline-none',
			// Mobile: bottom sheet — anchored to bottom, rounded top corners, slide-up animation
			'right-0 bottom-0 left-0 max-h-[90svh] rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] duration-300',
			'data-open:animate-in data-open:slide-in-from-bottom',
			'data-closed:animate-out data-closed:slide-out-to-bottom',
			// Desktop: centered modal — override mobile positioning and animations
			'sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
			'sm:max-w-md sm:rounded-xl sm:pb-6 sm:duration-100',
			'sm:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)]',
			'sm:data-open:fade-in-0 sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95',
			'sm:data-closed:fade-out-0 sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95',
			className
		)}
		{...restProps}
	>
		<!-- Drag handle: visible on mobile only, sits inside the top padding area -->
		<div
			class="absolute top-3 left-1/2 h-1.5 w-12 flex-shrink-0 -translate-x-1/2 rounded-full bg-foreground/20 sm:hidden"
			aria-hidden="true"
		></div>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button variant="ghost" class="absolute top-4 right-4" size="icon-sm" {...props}>
						<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
						<span class="sr-only">Close</span>
					</Button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
