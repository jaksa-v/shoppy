<script lang="ts">
	let {
		open = $bindable(false),
		ondismiss
	}: {
		open: boolean;
		ondismiss?: () => void;
	} = $props();

	function close() {
		open = false;
	}

	function handleDontShowAgain() {
		open = false;
		ondismiss?.();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={close}
		aria-label="Close install sheet"
	></button>

	<!-- Bottom sheet -->
	<div
		class="fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl bg-background ring-1 ring-foreground/10"
		style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom))"
		role="dialog"
		aria-modal="true"
		aria-labelledby="iphone-install-title"
	>
		<!-- Drag handle -->
		<div class="flex justify-center pt-3 pb-1" aria-hidden="true">
			<div class="h-1.5 w-12 rounded-full bg-foreground/20"></div>
		</div>

		<div class="px-6 pt-2 pb-4">
			<!-- Header -->
			<div class="mb-5 flex items-start justify-between">
				<div>
					<h2 id="iphone-install-title" class="text-base font-semibold">
						Add Shoppy to your Home Screen
					</h2>
					<p class="mt-0.5 text-sm text-muted-foreground">Follow these steps in Safari.</p>
				</div>
				<button
					onclick={close}
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
					aria-label="Close"
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

			<!-- Steps -->
			<ol class="space-y-4" aria-label="Installation steps">
				<!-- Step 1 -->
				<li class="flex items-start gap-3">
					<span
						class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						aria-hidden="true"
					>
						1
					</span>
					<p class="pt-0.5 text-sm leading-snug">
						Tap the
						<span class="inline-flex items-baseline gap-1 font-semibold">
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
								class="inline-block translate-y-px"
								aria-hidden="true"
							>
								<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
								<polyline points="16 6 12 2 8 6" />
								<line x1="12" y1="2" x2="12" y2="15" />
							</svg>
							Share
						</span>
						button in the Safari toolbar at the bottom of your screen.
					</p>
				</li>

				<!-- Step 2 -->
				<li class="flex items-start gap-3">
					<span
						class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						aria-hidden="true"
					>
						2
					</span>
					<p class="pt-0.5 text-sm leading-snug">
						Scroll down and tap <strong class="font-semibold">"Add to Home Screen"</strong>.
					</p>
				</li>

				<!-- Step 3 -->
				<li class="flex items-start gap-3">
					<span
						class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						aria-hidden="true"
					>
						3
					</span>
					<p class="pt-0.5 text-sm leading-snug">
						Tap <strong class="font-semibold">"Add"</strong> in the top-right corner to confirm.
					</p>
				</li>
			</ol>

			<!-- Actions -->
			<div class="mt-6 flex flex-col gap-2">
				<button
					onclick={close}
					class="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
				>
					Got it
				</button>
				<button
					onclick={handleDontShowAgain}
					class="flex h-10 w-full items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted"
				>
					Don't show again
				</button>
			</div>
		</div>
	</div>
{/if}
