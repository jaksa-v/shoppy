<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { createInstallPromptCoordinator } from '$lib/pwa/install-prompt.svelte.js';
	import { createInstallPromptAfterAuthGate } from '$lib/auth/install-prompt-after-auth.svelte.js';
	import IphoneInstallSheet from './IphoneInstallSheet.svelte';

	const clerkContext = getClerkContext();
	const coordinator = createInstallPromptCoordinator();
	const authGate = createInstallPromptAfterAuthGate(() => !!clerkContext.currentSession);

	let showIOSSheet = $state(false);

	function handleInstallClick() {
		if (coordinator.isIOS) {
			showIOSSheet = true;
		} else if (coordinator.canNativePrompt) {
			coordinator.promptInstall();
		}
	}
</script>

{#if authGate.ready && coordinator.eligible}
	<div
		class="fixed right-0 bottom-0 left-0 z-30 border-t bg-card/95 backdrop-blur-sm"
		style="padding-bottom: env(safe-area-inset-bottom)"
		role="complementary"
		aria-label="Install Shoppy"
	>
		<div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
			<!-- App icon -->
			<img
				src="/icons/apple-touch-icon.png"
				alt=""
				class="h-10 w-10 shrink-0 rounded-xl"
				aria-hidden="true"
			/>

			<!-- Copy -->
			<div class="min-w-0 flex-1">
				<p class="text-sm leading-tight font-medium">Add Shoppy to your Home Screen</p>
				<p class="mt-0.5 text-xs leading-tight text-muted-foreground">
					{#if coordinator.isIOS}
						Open in Safari · Tap Share → Add to Home Screen
					{:else}
						Install for a faster, app-like experience
					{/if}
				</p>
			</div>

			<!-- Actions -->
			<div class="flex shrink-0 items-center gap-1.5">
				<button
					onclick={handleInstallClick}
					class="flex h-9 items-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
				>
					{coordinator.isIOS ? 'How?' : 'Install'}
				</button>
				<button
					onclick={() => coordinator.dismiss()}
					class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
					aria-label="Dismiss install prompt"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- iPhone step-by-step guidance sheet -->
<IphoneInstallSheet bind:open={showIOSSheet} ondismiss={() => coordinator.dismiss()} />
