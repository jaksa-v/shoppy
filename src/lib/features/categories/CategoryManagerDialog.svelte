<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import type { CategoryManagerModel } from './create-category-manager.svelte.js';

	type Props = {
		model: CategoryManagerModel;
		categories: Doc<'categories'>[];
	};

	const { model, categories }: Props = $props();
</script>

<Dialog.Root bind:open={model.open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Categories</Dialog.Title>
			<Dialog.Description>Customize how your grocery list is organized.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-1 py-1">
			{#each categories as category, index (category._id)}
				{#if model.editingCategoryId === category._id}
					<div class="space-y-2 rounded-md border bg-muted/30 p-3">
						<Input bind:value={model.editingCategoryName} placeholder="Category name" autofocus />
						<div class="flex flex-wrap gap-1.5">
							{#each model.presetColors as color (color)}
								<button
									type="button"
									onclick={() => (model.editingCategoryColor = color)}
									class="flex min-h-[36px] min-w-[36px] items-center justify-center sm:min-h-0 sm:min-w-0"
									aria-label={`Select color ${color}`}
								>
									<span
										class={`h-6 w-6 rounded-full border-2 transition-all ${
											model.editingCategoryColor === color
												? 'scale-110 border-foreground'
												: 'border-transparent'
										}`}
										style={`background-color: ${color}`}
									></span>
								</button>
							{/each}
						</div>
						<div class="flex gap-2">
							<Button
								size="sm"
								onclick={model.saveCategory}
								disabled={!model.canSaveCategory}
								class="flex-1"
							>
								{model.editingCategoryPending ? 'Saving…' : 'Save'}
							</Button>
							<Button size="sm" variant="outline" onclick={model.cancelEdit}>Cancel</Button>
						</div>
					</div>
				{:else}
					<div class="overflow-hidden rounded-md border bg-card">
						<div class="flex items-center gap-2 px-3 py-2">
							<span
								class="h-3 w-3 shrink-0 rounded-full"
								style={`background-color: ${category.color}`}
							></span>
							<span class="flex-1 truncate text-sm">{category.name}</span>

							<div class="hidden items-center sm:flex">
								<button
									onclick={() => model.moveCategory(category._id, 'up')}
									disabled={index === 0}
									class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
									aria-label="Move up"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="18 15 12 9 6 15" />
									</svg>
								</button>
								<button
									onclick={() => model.moveCategory(category._id, 'down')}
									disabled={index === categories.length - 1}
									class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
									aria-label="Move down"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</button>
								<button
									onclick={() => model.openEditCategory(category)}
									class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
									aria-label="Edit category"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="13"
										height="13"
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
									onclick={() => model.deleteCategory(category._id)}
									disabled={model.deletingCategoryId === category._id}
									class="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
									aria-label="Delete category"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="13"
										height="13"
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

							<button
								onclick={() =>
									(model.expandedCategoryId =
										model.expandedCategoryId === category._id ? null : category._id)}
								class="flex h-10 w-10 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
								aria-label={model.expandedCategoryId === category._id
									? 'Hide actions'
									: 'Show actions'}
								aria-expanded={model.expandedCategoryId === category._id}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<circle cx="12" cy="5" r="1" />
									<circle cx="12" cy="12" r="1" />
									<circle cx="12" cy="19" r="1" />
								</svg>
							</button>
						</div>

						{#if model.expandedCategoryId === category._id}
							<div class="flex items-center justify-around border-t px-2 py-1 sm:hidden">
								<button
									onclick={() => model.moveCategory(category._id, 'up')}
									disabled={index === 0}
									class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
									aria-label="Move up"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="18 15 12 9 6 15" />
									</svg>
								</button>
								<button
									onclick={() => model.moveCategory(category._id, 'down')}
									disabled={index === categories.length - 1}
									class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
									aria-label="Move down"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</button>
								<div class="h-6 w-px bg-border"></div>
								<button
									onclick={() => model.openEditCategory(category)}
									class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
									aria-label="Edit category"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
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
									onclick={() => model.deleteCategory(category._id)}
									disabled={model.deletingCategoryId === category._id}
									class="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
									aria-label="Delete category"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
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
					</div>
				{/if}
			{/each}

			{#if categories.length === 0}
				<p class="py-4 text-center text-sm text-muted-foreground">No custom categories yet.</p>
			{/if}
		</div>

		<div class="space-y-2 border-t pt-4">
			<p class="text-sm font-medium">Add category</p>
			<form onsubmit={model.addCategory} class="flex gap-2">
				<Input
					bind:value={model.newCategoryName}
					placeholder="Category name"
					class="flex-1"
					disabled={model.newCategoryPending}
					autocomplete="off"
				/>
				<Button type="submit" size="sm" disabled={!model.canAddCategory}>
					{model.newCategoryPending ? 'Adding…' : 'Add'}
				</Button>
			</form>
			<div class="flex flex-wrap gap-1.5">
				{#each model.presetColors as color (color)}
					<button
						type="button"
						onclick={() => (model.newCategoryColor = color)}
						class="flex min-h-[36px] min-w-[36px] items-center justify-center sm:min-h-0 sm:min-w-0"
						aria-label={`Select color ${color}`}
					>
						<span
							class={`h-6 w-6 rounded-full border-2 transition-all ${
								model.newCategoryColor === color
									? 'scale-110 border-foreground'
									: 'border-transparent'
							}`}
							style={`background-color: ${color}`}
						></span>
					</button>
				{/each}
			</div>
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span class="h-3 w-3 rounded-full" style={`background-color: ${model.newCategoryColor}`}
				></span>
				<span>Selected color</span>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={model.close}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
