<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="sm" {...props} aria-label="Toggle theme">
				<HugeiconsIcon
					icon={Sun03Icon}
					class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<HugeiconsIcon
					icon={Moon02Icon}
					class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setMode('light')}>
			<HugeiconsIcon icon={Sun03Icon} class="mr-2 size-4" />
			Light
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')}>
			<HugeiconsIcon icon={Moon02Icon} class="mr-2 size-4" />
			Dark
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('system')}>
			<HugeiconsIcon icon={ComputerIcon} class="mr-2 size-4" />
			System
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
