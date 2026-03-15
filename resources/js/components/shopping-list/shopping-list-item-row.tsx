import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
    update as updateItem,
    destroy as destroyItem,
} from '@/actions/App/Http/Controllers/ShoppingListItemController';
import { update as updateStatus } from '@/actions/App/Http/Controllers/ShoppingListItemStatusController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    formatShoppingListItemInput,
    parseShoppingListItemInput,
} from '@/lib/shopping-list-item-input';
import type { ShoppingListItem as ShoppingListItemType } from '@/types/shopping-list';

type ShoppingListItemRowProps = {
    item: ShoppingListItemType;
    householdId: number;
    shoppingListId: number;
};

export function ShoppingListItemRow({
    item,
    householdId,
    shoppingListId,
}: ShoppingListItemRowProps) {
    const initialEditValue = formatShoppingListItemInput({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(initialEditValue);
    const [optimisticBought, setOptimisticBought] = useState<boolean | null>(
        null,
    );
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const displayBought = optimisticBought ?? item.is_bought;

    useEffect(() => {
        if (isEditing && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditing]);

    const handleToggleBought = () => {
        const newStatus = !displayBought;
        setIsConfirmingDelete(false);
        setOptimisticBought(newStatus);

        router.put(
            updateStatus.url({
                household: householdId,
                shoppingList: shoppingListId,
                shoppingListItem: item.id,
            }),
            { is_bought: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setOptimisticBought(null),
            },
        );
    };

    const handleDelete = () => {
        setIsConfirmingDelete(true);
    };

    const handleConfirmDelete = () => {
        router.delete(
            destroyItem.url({
                household: householdId,
                shoppingList: shoppingListId,
                shoppingListItem: item.id,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleCancelDelete = () => {
        setIsConfirmingDelete(false);
    };

    const handleSaveEdit = () => {
        const { name, quantity, notes } = parseShoppingListItemInput(editValue);

        if (!name) {
            return;
        }

        router.put(
            updateItem.url({
                household: householdId,
                shoppingList: shoppingListId,
                shoppingListItem: item.id,
            }),
            {
                name,
                quantity,
                notes,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsEditing(false);
                },
            },
        );
    };

    const handleCancelEdit = () => {
        setEditValue(initialEditValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancelEdit();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
        }
    };

    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex h-12 items-center gap-1 rounded-lg border bg-card px-3"
            >
                <div className="min-w-0 flex-1">
                    <label htmlFor={`edit-item-${item.id}`} className="sr-only">
                        Edit item
                    </label>
                    <Input
                        ref={nameInputRef}
                        id={`edit-item-${item.id}`}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Item 2x #note"
                        className="h-auto border-0 bg-transparent p-0 text-[0.95rem] leading-none font-medium shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0 dark:!bg-transparent"
                        aria-describedby={`edit-item-hint-${item.id}`}
                        aria-label="Edit item"
                    />
                </div>
                <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    aria-label="Cancel editing"
                    className="pointer-coarse:size-7"
                >
                    <X className="size-3.5" />
                </Button>
                <Button
                    size="xs"
                    onClick={handleSaveEdit}
                    aria-label="Save changes"
                    className="pointer-coarse:h-7"
                >
                    <Check className="size-3.5" />
                    Save
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            layoutId={`shopping-list-item-${item.id}`}
            transition={{
                layout: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                },
                opacity: { duration: 0.2 },
                y: { duration: 0.2 },
            }}
            className={`group relative flex h-12 items-center gap-3 rounded-lg border bg-card px-3 transition-colors duration-200 motion-reduce:transition-none ${displayBought ? 'opacity-60' : ''} ${isConfirmingDelete ? 'border-destructive/30 bg-destructive/5' : 'hover:border-border/80 hover:shadow-sm'}`}
        >
            <Checkbox
                checked={displayBought}
                onCheckedChange={handleToggleBought}
                className="shrink-0 transition-transform duration-150 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
                aria-label={`Mark ${item.name} as ${displayBought ? 'not bought' : 'bought'}`}
            />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                        className={`relative text-[0.95rem] font-medium transition-colors duration-200 ${displayBought ? 'text-muted-foreground' : ''}`}
                    >
                        {item.name}
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: displayBought ? 1 : 0 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.4, 0, 0.2, 1],
                                delay: displayBought ? 0 : 0,
                            }}
                            className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-muted-foreground motion-reduce:hidden"
                            style={{ marginTop: '-1px' }}
                        />
                    </span>
                    {item.quantity && (
                        <Badge
                            variant="secondary"
                            className={`text-xs transition-all duration-200 ${displayBought ? 'border-transparent bg-transparent px-0 text-muted-foreground shadow-none' : ''}`}
                        >
                            {item.quantity}
                        </Badge>
                    )}
                    {item.notes && (
                        <span
                            className={`text-xs transition-colors duration-200 ${displayBought ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}
                        >
                            {item.notes}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity duration-150 motion-reduce:opacity-100 motion-reduce:transition-none pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                {isConfirmingDelete ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                    >
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleCancelDelete}
                            aria-label={`Cancel deleting ${item.name}`}
                            className="transition-transform duration-150 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 pointer-coarse:size-8"
                        >
                            <X className="size-3" />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleConfirmDelete}
                            aria-label={`Confirm deleting ${item.name}`}
                            className="text-destructive transition-transform duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 pointer-coarse:size-8"
                        >
                            <Check className="size-3" />
                        </Button>
                    </motion.div>
                ) : (
                    <>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => {
                                setIsEditing(true);
                            }}
                            aria-label={`Edit ${item.name}`}
                            className="transition-transform duration-150 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 pointer-coarse:size-8"
                        >
                            <Pencil className="size-3" />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleDelete}
                            aria-label={`Delete ${item.name}`}
                            className="transition-transform duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 pointer-coarse:size-8"
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
