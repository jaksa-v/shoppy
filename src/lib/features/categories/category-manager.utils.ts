type CategoryLike<IdValue extends string = string> = {
	_id: IdValue;
	name: string;
	order: number;
	isSystem: boolean;
};

export function getManageableCategories<
	IdValue extends string,
	Category extends CategoryLike<IdValue>
>(categories: Category[]) {
	return [...categories].filter((category) => !category.isSystem).sort((a, b) => a.order - b.order);
}

export function canMoveCategory<IdValue extends string, Category extends CategoryLike<IdValue>>(
	categories: Category[],
	categoryId: Category['_id'],
	direction: 'up' | 'down'
) {
	const index = categories.findIndex((category) => category._id === categoryId);

	if (index === -1) {
		return false;
	}

	return direction === 'up' ? index > 0 : index < categories.length - 1;
}

export function getReorderedCategoryIds<
	IdValue extends string,
	Category extends CategoryLike<IdValue>
>(categories: Category[], categoryId: Category['_id'], direction: 'up' | 'down') {
	const index = categories.findIndex((category) => category._id === categoryId);

	if (index === -1) {
		return categories.map((category) => category._id);
	}

	const swapIndex = direction === 'up' ? index - 1 : index + 1;
	if (swapIndex < 0 || swapIndex >= categories.length) {
		return categories.map((category) => category._id);
	}

	const reordered = categories.map((category) => category._id);
	[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

	return reordered;
}

export function canSaveCategoryName(name: string) {
	return name.trim().length > 0;
}
