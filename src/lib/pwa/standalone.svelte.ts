/**
 * Standalone mode detector.
 *
 * Isolated utility that tracks whether the app is running in PWA standalone
 * mode (launched from the home screen) versus inside a browser tab. Layout
 * code can import this to adapt chrome and spacing without duplicating the
 * platform detection logic.
 */
export function createStandaloneDetector() {
	let standalone = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;

		const mq = window.matchMedia('(display-mode: standalone)');

		const update = () => {
			standalone = mq.matches || (navigator as { standalone?: boolean }).standalone === true;
		};

		update();

		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	return {
		get isStandalone() {
			return standalone;
		}
	};
}
