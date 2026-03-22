<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import type { MembersDialogModel } from './create-members-dialog.svelte.js';

	type Props = {
		model: MembersDialogModel;
		members: Doc<'householdMembers'>[];
		activeInvite: Doc<'invites'> | null;
		currentUserId?: string;
	};

	const { model, members, activeInvite, currentUserId }: Props = $props();
</script>

<Dialog.Root bind:open={model.open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Household members</Dialog.Title>
			<Dialog.Description>Manage who has access to your shared grocery list.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2 py-1">
			{#each members as member (member._id)}
				<div class="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
					<div class="flex items-center gap-2">
						<div
							class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						>
							{member.role === 'owner' ? '★' : '•'}
						</div>
						<span class="text-sm">{member.userId === currentUserId ? 'You' : 'Partner'}</span>
					</div>
					<span class="text-xs text-muted-foreground capitalize">{member.role}</span>
				</div>
			{/each}
		</div>

		{#if members.length < 2}
			<div class="mt-2 space-y-3 border-t pt-4">
				<p class="text-sm text-muted-foreground">
					Invite your partner to join this household and share the grocery list.
				</p>

				{#if !model.inviteLink && !activeInvite}
					<Button onclick={model.createInvite} disabled={model.invitePending} class="w-full">
						{model.invitePending ? 'Generating…' : 'Generate invite link'}
					</Button>
				{:else}
					{@const link = model.inviteLink || model.activeInviteLink}
					<div class="flex gap-2">
						<Input value={link} readonly class="flex-1 font-mono text-xs" />
						<Button variant="outline" size="sm" onclick={() => model.copyInvite(link)}>
							{model.inviteCopied ? 'Copied!' : 'Copy'}
						</Button>
					</div>
					{#if activeInvite && !model.inviteLink}
						<Button
							variant="ghost"
							size="sm"
							class="w-full text-muted-foreground"
							onclick={() => model.revokeInvite(activeInvite._id)}
						>
							Revoke invite
						</Button>
					{/if}
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={model.close}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
