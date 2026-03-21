<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert/index.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { AlertCircleIcon } from '@hugeicons/core-free-icons';

	const { error }: { error: unknown } = $props();

	const parsedError = $derived.by((): App.Error => {
		if (isHttpError(error)) {
			return error.body;
		}

		console.error(error);

		return {
			message: 'Unknown error',
			kind: 'UnknownError',
			timestamp: Date.now()
		};
	});
</script>

<Alert variant="destructive">
	<HugeiconsIcon icon={AlertCircleIcon} class="size-4" />
	<AlertTitle>{parsedError.message}</AlertTitle>
	<AlertDescription>
		<span class="font-medium">{parsedError.kind}</span>
		<span class="text-muted-foreground">• {new Date(parsedError.timestamp).toLocaleString()}</span>
		{#if parsedError.traceId}
			<p class="mt-1 text-xs">send to support if you see this: {parsedError.traceId}</p>
		{/if}
	</AlertDescription>
</Alert>
