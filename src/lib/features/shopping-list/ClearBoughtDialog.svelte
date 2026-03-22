<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { ClearBoughtDialogModel } from './create-clear-bought-dialog.svelte.js';

	type Props = {
		model: ClearBoughtDialogModel;
		count: number;
	};

	const { model, count }: Props = $props();
</script>

<Dialog.Root bind:open={model.open}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Clear checked items?</Dialog.Title>
			<Dialog.Description>
				This will permanently remove all {count} checked item{count === 1 ? '' : 's'} from the list. Active
				items will not be affected.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={model.close} disabled={model.pending}>Cancel</Button>
			<Button variant="destructive" onclick={model.confirm} disabled={model.pending}>
				{model.pending ? 'Clearing…' : 'Clear all'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
