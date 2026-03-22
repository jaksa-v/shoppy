<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import ClerkUserButtonMount from '$lib/frontend/auth/ClerkUserButtonMount.svelte';

	type Props = {
		memberCount: number;
		showHouseholdActions: boolean;
		onOpenMembers: () => void;
		onOpenCategories: () => void;
	};

	const { memberCount, showHouseholdActions, onOpenMembers, onOpenCategories }: Props = $props();
</script>

<h1 class="text-base font-semibold tracking-tight">🛒 Shoppy</h1>
<div class="flex items-center gap-2">
	{#if showHouseholdActions}
		<Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground" onclick={onOpenMembers}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
			{memberCount}
		</Button>
		<Button
			variant="ghost"
			size="sm"
			class="text-muted-foreground"
			onclick={onOpenCategories}
			aria-label="Manage categories"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
				<line x1="7" y1="7" x2="7.01" y2="7" />
			</svg>
		</Button>
	{/if}
	<ClerkUserButtonMount />
</div>
