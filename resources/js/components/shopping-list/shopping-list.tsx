import { usePoll } from '@inertiajs/react';
import { LayoutGroup, motion } from 'framer-motion';
import { ShoppingBag, ListTodo } from 'lucide-react';
import type { ShoppingListItem } from '@/types/shopping-list';
import { QuickAddInput } from './quick-add-input';
import { ShoppingListItemRow } from './shopping-list-item-row';

type ShoppingListProps = {
    items: ShoppingListItem[];
    householdId: number;
    shoppingListId: number;
};

export function ShoppingList({
    items,
    householdId,
    shoppingListId,
}: ShoppingListProps) {
    usePoll(2000, { only: ['selectedShoppingList'] });

    const pendingItems = items.filter((item) => !item.is_bought);
    const boughtItems = items.filter((item) => item.is_bought);
    const orderedItems = [...pendingItems, ...boughtItems];

    return (
        <LayoutGroup>
            <div className="flex flex-col gap-6 pb-28 md:pb-0">
                {pendingItems.length === 0 && boughtItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <ShoppingBag className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold">
                            No items yet
                        </h3>
                        <p className="max-w-xs text-muted-foreground">
                            Start adding items to your shopping list. Use the
                            input above to quickly add what you need.
                        </p>
                    </div>
                )}

                {orderedItems.length > 0 && (
                    <motion.section layout>
                        <motion.ul
                            layout
                            className="flex flex-col gap-2"
                            role="list"
                        >
                            {pendingItems.length > 0 && (
                                <li className="flex items-center gap-2 px-1 pt-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                    <ListTodo className="size-3.5" />
                                    <span>To Buy</span>
                                    <span>({pendingItems.length})</span>
                                </li>
                            )}

                            {orderedItems.map((item, index) => {
                                const isFirstBoughtItem =
                                    item.is_bought &&
                                    index === pendingItems.length &&
                                    boughtItems.length > 0;

                                return (
                                    <motion.li
                                        key={item.id}
                                        layout
                                        className="flex flex-col gap-2"
                                    >
                                        {isFirstBoughtItem && (
                                            <div className="flex items-center gap-2 px-1 pt-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                                <ShoppingBag className="size-3.5" />
                                                <span>Bought</span>
                                                <span>
                                                    ({boughtItems.length})
                                                </span>
                                            </div>
                                        )}

                                        <ShoppingListItemRow
                                            item={item}
                                            householdId={householdId}
                                            shoppingListId={shoppingListId}
                                        />
                                    </motion.li>
                                );
                            })}
                        </motion.ul>
                    </motion.section>
                )}

                <QuickAddInput
                    householdId={householdId}
                    shoppingListId={shoppingListId}
                />
            </div>
        </LayoutGroup>
    );
}
