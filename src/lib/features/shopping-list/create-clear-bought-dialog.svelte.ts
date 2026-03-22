type CreateClearBoughtDialogOptions = {
	clearBought: () => Promise<void>;
};

export function createClearBoughtDialog(options: CreateClearBoughtDialogOptions) {
	let open = $state(false);
	let pending = $state(false);

	function close() {
		open = false;
	}

	async function confirm() {
		pending = true;

		try {
			await options.clearBought();
			open = false;
		} finally {
			pending = false;
		}
	}

	return {
		get open() {
			return open;
		},
		set open(value: boolean) {
			open = value;
		},
		get pending() {
			return pending;
		},
		show() {
			open = true;
		},
		close,
		async confirm() {
			await confirm();
		}
	};
}

export type ClearBoughtDialogModel = ReturnType<typeof createClearBoughtDialog>;
