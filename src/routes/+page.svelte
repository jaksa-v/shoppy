<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-6">
	<div class="max-w-md space-y-6 text-center">
		<h1 class="text-4xl font-bold tracking-tight text-foreground">Welcome to SvelteKit</h1>
		<p class="text-muted-foreground">
			Visit <a href="https://svelte.dev/docs/kit" class="font-medium text-primary hover:underline"
				>svelte.dev/docs/kit</a
			> to read the documentation
		</p>
		<Button href="/app" size="lg">Get Started</Button>
	</div>
</div>
