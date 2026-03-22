<script lang="ts">
	import { createInstallPromptCoordinator } from '$lib/pwa/install-prompt.svelte.js';

	const coordinator = createInstallPromptCoordinator();

	let showIOSSheet = $state(false);

	function handleInstallClick() {
		if (coordinator.canNativePrompt) {
			coordinator.promptInstall();
		} else if (coordinator.isIOS) {
			showIOSSheet = true;
		}
	}

	function handleDismiss() {
		showIOSSheet = false;
		coordinator.dismiss();
	}
</script>

{#if coordinator.eligible}
	<div
		class="fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:right-auto sm:left-4 sm:max-w-sm"
		role="banner"
	>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium">Install Shoppy</p>
			<p class="mt-0.5 text-xs text-muted-foreground">Add to your home screen for quick access</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				onclick={handleInstallClick}
				class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
			>
				Install
			</button>
			<button
				onclick={handleDismiss}
				aria-label="Dismiss install prompt"
				class="flex size-7 items-center justify-center rounded-md text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
			>
				&times;
			</button>
		</div>
	</div>
{/if}

{#if showIOSSheet && coordinator.isIOS}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) showIOSSheet = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') showIOSSheet = false;
		}}
	>
		<div class="w-full max-w-md rounded-t-2xl bg-card p-6 pb-10 text-card-foreground shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-base font-semibold">Install Shoppy</h2>
				<button
					onclick={() => (showIOSSheet = false)}
					aria-label="Close"
					class="flex size-7 items-center justify-center rounded-md text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
				>
					&times;
				</button>
			</div>
			<ol class="space-y-3 text-sm">
				<li class="flex items-center gap-3">
					<span class="shrink-0 text-xl">📤</span>
					<span>
						Tap the <strong>Share</strong> button in the browser toolbar at the bottom of the screen.
					</span>
				</li>
				<li class="flex items-center gap-3">
					<span class="shrink-0 text-xl">➕</span>
					<span>
						Scroll down and tap <strong>Add to Home Screen</strong>.
					</span>
				</li>
				<li class="flex items-center gap-3">
					<span class="shrink-0 text-xl">✅</span>
					<span>Tap <strong>Add</strong> to confirm.</span>
				</li>
			</ol>
			<button
				onclick={handleDismiss}
				class="mt-6 w-full rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
			>
				Don't show again
			</button>
		</div>
	</div>
{/if}
