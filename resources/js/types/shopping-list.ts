export type Category = {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
};

export type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export type ItemUser = {
    id: number;
    name: string;
};

export type ShoppingListItem = {
    id: number;
    name: string;
    quantity: string | null;
    notes: string | null;
    is_bought: boolean;
    position: number;
    bought_at: string | null;
    category: Category | null;
    added_by: ItemUser | null;
    bought_by: ItemUser | null;
};

export type ShoppingList = {
    id: number;
    name: string;
    status: string;
    items: ShoppingListItem[];
    archived_at: string | null;
};

export type Household = {
    id: number;
    name: string;
    members: Member[];
    categories: Category[];
    shopping_lists: ShoppingList[];
};

export type HouseholdSimple = {
    id: number;
    name: string;
};
