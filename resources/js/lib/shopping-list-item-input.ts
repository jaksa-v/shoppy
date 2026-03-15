type ParsedShoppingListItemInput = {
    name: string;
    quantity: string | null;
    notes: string | null;
};

export function parseShoppingListItemInput(
    input: string,
): ParsedShoppingListItemInput {
    let itemName = input.trim();
    let quantity: string | null = null;
    let notes: string | null = null;

    const notesMatch = itemName.match(/\s+#(.+)$/);

    if (notesMatch) {
        notes = notesMatch[1].trim();
        itemName = itemName.replace(notesMatch[0], '').trim();
    }

    const quantityMatch = itemName.match(/\s+(\d+\.?\d*[xX]?)\s*$/);

    if (quantityMatch) {
        quantity = quantityMatch[1];
        itemName = itemName.replace(quantityMatch[0], '').trim();
    }

    return { name: itemName, quantity, notes };
}

export function formatShoppingListItemInput({
    name,
    quantity,
    notes,
}: ParsedShoppingListItemInput): string {
    const parts = [name.trim()];

    if (quantity) {
        parts.push(quantity.trim());
    }

    if (notes) {
        parts.push(`#${notes.trim()}`);
    }

    return parts.filter(Boolean).join(' ');
}
