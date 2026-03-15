import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { store as storeItem } from '@/actions/App/Http/Controllers/ShoppingListItemController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseShoppingListItemInput } from '@/lib/shopping-list-item-input';

type QuickAddInputProps = {
    householdId: number;
    shoppingListId: number;
    disabled?: boolean;
};

export function QuickAddInput({
    householdId,
    shoppingListId,
    disabled,
}: QuickAddInputProps) {
    const [name, setName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || isAdding) {
            return;
        }

        const {
            name: itemName,
            quantity,
            notes,
        } = parseShoppingListItemInput(name);

        if (!itemName) {
            return;
        }

        setIsAdding(true);

        router.post(
            storeItem.url({
                household: householdId,
                shoppingList: shoppingListId,
            }),
            { name: itemName, quantity, notes },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsAdding(false);
                    setName('');
                },
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="group fixed inset-x-0 bottom-0 z-30 bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:static md:z-auto md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:backdrop-blur-none"
        >
            <div className="mx-auto w-full max-w-3xl">
                <div className="group rounded-[1.35rem] border border-border/70 bg-card/95 p-1.5 shadow-lg ring-1 shadow-black/5 ring-black/3 transition-all duration-200 focus-within:border-primary/35 focus-within:ring-primary/10 md:rounded-2xl md:shadow-sm">
                    <Label htmlFor="quick-add-item" className="sr-only">
                        Add new item
                    </Label>
                    <div className="relative">
                        <Input
                            id="quick-add-item"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add item..."
                            disabled={disabled || isAdding}
                            className="h-12 rounded-[1.1rem] border-0 bg-transparent pr-14 pl-4 text-base shadow-none ring-0 placeholder:text-muted-foreground/80 focus-visible:border-0 focus-visible:ring-0 md:h-11"
                            aria-describedby="quick-add-hint"
                            autoComplete="off"
                            enterKeyHint="done"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={disabled || isAdding || !name.trim()}
                            className="absolute top-1/2 right-1 h-10 w-10 -translate-y-1/2 rounded-[0.95rem] shadow-sm transition-all duration-200 active:scale-[0.97] disabled:scale-100"
                            aria-label="Add item to shopping list"
                        >
                            <Plus className="size-4.5" />
                        </Button>
                    </div>
                </div>
                <p
                    id="quick-add-hint"
                    className="px-2 pt-2 text-xs text-muted-foreground transition-opacity duration-200 group-focus-within:opacity-100 md:opacity-0"
                >
                    Tip: use "2x" for quantity and "#note" for notes
                </p>
            </div>
        </form>
    );
}
