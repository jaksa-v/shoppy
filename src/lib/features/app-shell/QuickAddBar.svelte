<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	type Props = {
		value: string;
		pending: boolean;
		canSubmit: boolean;
		autofocus: boolean;
		onValueChange: (value: string) => void;
		onSubmit: (event: Event) => void | Promise<void>;
	};

	const { value, pending, canSubmit, autofocus, onValueChange, onSubmit }: Props = $props();

	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (!autofocus || !inputRef) {
			return;
		}

		const element = inputRef;
		setTimeout(() => {
			element.focus();
		}, 100);
	});
</script>

<form onsubmit={onSubmit} class="flex gap-2">
	<Input
		{value}
		bind:ref={inputRef}
		placeholder="Add an item…"
		class="h-11 flex-1 rounded-full px-4"
		disabled={pending}
		autocomplete="off"
		oninput={(event) => onValueChange(event.currentTarget.value)}
	/>
	<Button type="submit" disabled={!canSubmit} class="h-11 rounded-full px-5">Add</Button>
</form>
