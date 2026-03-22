<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';

	type Props = {
		value?: string;
		open?: boolean;
		onValueChange?: (value: string) => void;
		onOpenChange?: (open: boolean) => void;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		children?: import('svelte').Snippet;
	};

	let { value = $bindable(undefined), open = $bindable(false), children, ...restProps }: Props =
		$props();
</script>

<SelectPrimitive.Root type="single" bind:value bind:open {...restProps}>
	{@render children?.()}
</SelectPrimitive.Root>
