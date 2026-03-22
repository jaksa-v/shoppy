import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

type CreateEditItemDialogOptions = {
	client: {
		mutation: typeof import('convex/browser').ConvexClient.prototype.mutation;
	};
};

export function createEditItemDialog(options: CreateEditItemDialogOptions) {
	let open = $state(false);
	let pending = $state(false);
	let id = $state<Id<'groceryItems'> | null>(null);
	let name = $state('');
	let quantity = $state('');
	let notes = $state('');
	let categoryId = $state<Id<'categories'> | undefined>(undefined);

	function openForItem(item: Doc<'groceryItems'>) {
		id = item._id;
		name = item.name;
		quantity = item.quantity ?? '';
		notes = item.notes ?? '';
		categoryId = item.categoryId;
		open = true;
	}

	function close() {
		open = false;
	}

	function cancel() {
		open = false;
	}

	async function save() {
		if (!id || !name.trim()) {
			return;
		}

		pending = true;

		try {
			await options.client.mutation(api.authed.groceryItems.update, {
				id,
				name: name.trim(),
				quantity: quantity.trim() || undefined,
				notes: notes.trim() || undefined,
				categoryId
			});
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
		get name() {
			return name;
		},
		set name(value: string) {
			name = value;
		},
		get quantity() {
			return quantity;
		},
		set quantity(value: string) {
			quantity = value;
		},
		get notes() {
			return notes;
		},
		set notes(value: string) {
			notes = value;
		},
		get categoryId() {
			return categoryId;
		},
		set categoryId(value: Id<'categories'> | undefined) {
			categoryId = value;
		},
		get canSave() {
			return name.trim().length > 0 && !pending;
		},
		openForItem(item: Doc<'groceryItems'>) {
			openForItem(item);
		},
		close,
		cancel,
		async save() {
			await save();
		}
	};
}

export type EditItemDialogModel = ReturnType<typeof createEditItemDialog>;
