import { AUTH_COMPLETION_INSTALL_PROMPT_KEY } from './auth-flow';

export function createInstallPromptAfterAuthGate(isAuthenticated: () => boolean) {
	let ready = $state(false);

	$effect(() => {
		if (typeof sessionStorage === 'undefined') return;

		if (!isAuthenticated()) {
			ready = false;
			return;
		}

		if (sessionStorage.getItem(AUTH_COMPLETION_INSTALL_PROMPT_KEY) !== 'true') {
			ready = false;
			return;
		}

		ready = true;
		sessionStorage.removeItem(AUTH_COMPLETION_INSTALL_PROMPT_KEY);
	});

	return {
		get ready() {
			return ready;
		}
	};
}
