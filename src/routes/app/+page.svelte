<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { PencilEdit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';

	const clerkContext = getClerkContext();
	const client = useConvexClient();

	const conferencesQuery = useQuery(api.authed.conferences.list, {});

	let dialogOpen = $state(false);
	let editingId = $state<Id<'conferences'> | null>(null);

	let name = $state('');
	let location = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let description = $state('');

	function resetForm() {
		name = '';
		location = '';
		startDate = '';
		endDate = '';
		description = '';
		editingId = null;
		dialogOpen = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const start = new Date(startDate).getTime();
		const end = new Date(endDate).getTime();

		if (editingId) {
			await client.mutation(api.authed.conferences.update, {
				id: editingId,
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		} else {
			await client.mutation(api.authed.conferences.create, {
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		}
		resetForm();
	}

	function startEdit(conf: NonNullable<typeof conferencesQuery.data>[number]) {
		editingId = conf._id;
		name = conf.name;
		location = conf.location;
		startDate = new Date(conf.startDate).toISOString().split('T')[0];
		endDate = new Date(conf.endDate).toISOString().split('T')[0];
		description = conf.description ?? '';
		dialogOpen = true;
	}

	async function handleDelete(id: Id<'conferences'>) {
		await client.mutation(api.authed.conferences.remove, { id });
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function conferenceStatus(start: number, end: number): 'upcoming' | 'active' | 'past' {
		const now = Date.now();
		if (now < start) return 'upcoming';
		if (now > end) return 'past';
		return 'active';
	}

	function getStatusVariant(
		status: 'upcoming' | 'active' | 'past'
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'active':
				return 'default';
			case 'upcoming':
				return 'secondary';
			case 'past':
				return 'outline';
		}
	}
</script>

{#if !clerkContext.clerk.user}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div
			{@attach (el) => {
				clerkContext.clerk.mountSignIn(el, {});
			}}
		></div>
	</div>
{:else}
	<div class="min-h-screen bg-background">
		<header class="border-b bg-card">
			<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
				<h1 class="text-lg font-semibold tracking-tight">Conferences</h1>
				<div class="flex items-center gap-3">
					<Button variant="ghost" href="/app/references">References</Button>
					<Dialog.Root bind:open={dialogOpen}>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button
									onclick={() => {
										resetForm();
									}}
									{...props}
								>
									{dialogOpen ? 'Cancel' : '+ New'}
								</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>{editingId ? 'Edit Conference' : 'New Conference'}</Dialog.Title>
							</Dialog.Header>
							<form onsubmit={handleSubmit} class="space-y-4">
								<div class="space-y-2">
									<Label for="name">Name</Label>
									<Input id="name" bind:value={name} placeholder="React Conf 2026" required />
								</div>
								<div class="space-y-2">
									<Label for="location">Location</Label>
									<Input
										id="location"
										bind:value={location}
										placeholder="San Francisco, CA"
										required
									/>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label for="startDate">Start Date</Label>
										<Input id="startDate" type="date" bind:value={startDate} required />
									</div>
									<div class="space-y-2">
										<Label for="endDate">End Date</Label>
										<Input id="endDate" type="date" bind:value={endDate} required />
									</div>
								</div>
								<div class="space-y-2">
									<Label for="description"
										>Description <span class="text-muted-foreground">(optional)</span></Label
									>
									<Textarea
										id="description"
										bind:value={description}
										placeholder="Brief description..."
										rows={2}
									/>
								</div>
								<Dialog.Footer>
									<Button type="button" variant="ghost" onclick={resetForm}>Cancel</Button>
									<Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
					<div
						{@attach (el) => {
							clerkContext.clerk.mountUserButton(el);
						}}
					></div>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-3xl px-6 py-8">
			{#if !conferencesQuery.data}
				<div class="flex items-center justify-center py-20">
					<div class="flex items-center gap-2 text-muted-foreground">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						<span class="text-sm">Loading conferences</span>
					</div>
				</div>
			{:else if conferencesQuery.data.length === 0}
				<Card.Root class="py-20 text-center">
					<Card.Content>
						<p class="text-muted-foreground">No conferences yet.</p>
						<Button
							variant="link"
							onclick={() => {
								resetForm();
								dialogOpen = true;
							}}
							class="mt-2"
						>
							Add your first one
						</Button>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="space-y-4">
					{#each conferencesQuery.data as conf (conf._id)}
						{@const status = conferenceStatus(conf.startDate, conf.endDate)}
						<Card.Root class="group transition-shadow hover:shadow-sm">
							<Card.Content class="pt-6">
								<div class="flex items-start justify-between gap-4">
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<h3 class="truncate text-sm font-semibold">{conf.name}</h3>
											<Badge variant={getStatusVariant(status)}>{status}</Badge>
										</div>
										<p class="mt-1 text-sm text-muted-foreground">
											{conf.location} · {formatDate(conf.startDate)} – {formatDate(conf.endDate)}
										</p>
										{#if conf.description}
											<p class="mt-1.5 text-sm text-muted-foreground">{conf.description}</p>
										{/if}
									</div>
									<div
										class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Button
											variant="ghost"
											size="icon-sm"
											onclick={() => startEdit(conf)}
											aria-label="Edit {conf.name}"
										>
											<HugeiconsIcon icon={PencilEdit01Icon} class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onclick={() => handleDelete(conf._id)}
											class="hover:bg-destructive/10 hover:text-destructive"
											aria-label="Delete {conf.name}"
										>
											<HugeiconsIcon icon={Delete01Icon} class="size-4" />
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</main>
	</div>
{/if}
