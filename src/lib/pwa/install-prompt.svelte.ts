const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function createInstallPromptCoordinator() {
	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let dismissed = $state(false);
	let installed = $state(false);

	const isStandalone = $derived(
		typeof window !== 'undefined' &&
			(window.matchMedia('(display-mode: standalone)').matches ||
				(navigator as { standalone?: boolean }).standalone === true)
	);

	const isIOS = $derived(
		typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
	);

	const canNativePrompt = $derived(deferredPrompt !== null);

	const eligible = $derived(
		!isStandalone && !dismissed && !installed && (canNativePrompt || isIOS)
	);

	$effect(() => {
		if (typeof window === 'undefined') return;

		dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
		};

		const handleAppInstalled = () => {
			installed = true;
			deferredPrompt = null;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	});

	async function promptInstall() {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		if (choice.outcome === 'accepted') {
			installed = true;
		}
		deferredPrompt = null;
	}

	function dismiss() {
		dismissed = true;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(DISMISSED_KEY, 'true');
		}
	}

	return {
		get eligible() {
			return eligible;
		},
		get isIOS() {
			return isIOS;
		},
		get canNativePrompt() {
			return canNativePrompt;
		},
		promptInstall,
		dismiss
	};
}
