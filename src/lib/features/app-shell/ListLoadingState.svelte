<script lang="ts">
	type Props = {
		bootstrapping: boolean;
	};

	const { bootstrapping }: Props = $props();
</script>

<div class="flex items-center justify-center py-20">
	<div class="flex items-center gap-2 text-muted-foreground">
		<div
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
		></div>
		<span class="text-sm"
			>{bootstrapping ? 'Setting up your household…' : 'Loading your list…'}</span
		>
	</div>
</div>
