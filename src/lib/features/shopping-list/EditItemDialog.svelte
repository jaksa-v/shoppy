<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import type { EditItemDialogModel } from './create-edit-item-dialog.svelte.js';

	type Props = {
		model: EditItemDialogModel;
		categories: Doc<'categories'>[];
	};

	const { model, categories }: Props = $props();
</script>

<Dialog.Root bind:open={model.open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit item</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-4 py-2">
			<div class="space-y-1.5">
				<Label for="edit-name">Name</Label>
				<Input id="edit-name" bind:value={model.name} placeholder="Item name" />
			</div>
			<div class="space-y-1.5">
				<Label for="edit-quantity">Quantity</Label>
				<Input id="edit-quantity" bind:value={model.quantity} placeholder="e.g. 2, 500g, 1 pack" />
			</div>
			<div class="space-y-1.5">
				<Label for="edit-category">Category</Label>
				<Select.Root
					value={model.categoryId ?? ''}
					onValueChange={(value) => {
						model.categoryId =
							value === '' ? undefined : categories.find((category) => category._id === value)?._id;
					}}
				>
					<Select.Trigger id="edit-category">
						{#if model.categoryId}
							{categories.find((category) => category._id === model.categoryId)?.name ??
								'Uncategorized'}
						{:else}
							Uncategorized
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="">Uncategorized</Select.Item>
						{#each categories.filter((category) => category.name.toLowerCase() !== 'uncategorized') as category (category._id)}
							<Select.Item value={category._id}>{category.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="edit-notes">Notes</Label>
				<Textarea
					id="edit-notes"
					bind:value={model.notes}
					placeholder="Brand preference, special instructions…"
					rows={2}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={model.close}>Cancel</Button>
			<Button onclick={model.save} disabled={!model.canSave}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
