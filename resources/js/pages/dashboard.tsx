import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { ShoppingList } from '@/components/shopping-list';
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
} from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type {
    Household,
    ShoppingList as ShoppingListType,
} from '@/types/shopping-list';

type DashboardProps = {
    selectedHousehold: Household | null;
    selectedShoppingList: ShoppingListType | null;
};

export default function DashboardPage({
    selectedHousehold,
    selectedShoppingList,
}: DashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Shopping List',
            href: dashboard(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shopping List" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {selectedHousehold && selectedHousehold.members.length > 0 && (
                    <header className="flex items-center justify-end">
                        <div className="flex items-center gap-2">
                            <Users
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <AvatarGroup>
                                {selectedHousehold.members
                                    .slice(0, 5)
                                    .map((member) => (
                                        <Avatar
                                            key={member.id}
                                            size="sm"
                                            title={member.name}
                                        >
                                            <AvatarFallback>
                                                {member.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                {selectedHousehold.members.length > 5 && (
                                    <AvatarGroupCount>
                                        +{selectedHousehold.members.length - 5}
                                    </AvatarGroupCount>
                                )}
                            </AvatarGroup>
                        </div>
                    </header>
                )}

                {!selectedHousehold && (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="max-w-md text-center">
                            <div className="mx-auto mb-4 w-fit rounded-full bg-muted p-4">
                                <Users className="size-8 text-muted-foreground" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">
                                No Household Yet
                            </h2>
                            <p className="text-muted-foreground">
                                Create a household to start managing your
                                shopping lists together with family or
                                housemates.
                            </p>
                        </div>
                    </div>
                )}

                {selectedHousehold && selectedShoppingList && (
                    <main className="flex-1">
                        <ShoppingList
                            items={selectedShoppingList.items}
                            householdId={selectedHousehold.id}
                            shoppingListId={selectedShoppingList.id}
                        />
                    </main>
                )}

                {selectedHousehold &&
                    !selectedShoppingList &&
                    selectedHousehold.shopping_lists.length === 0 && (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="max-w-md text-center">
                                <div className="mx-auto mb-4 w-fit rounded-full bg-muted p-4">
                                    <Users className="size-8 text-muted-foreground" />
                                </div>
                                <h2 className="mb-2 text-xl font-semibold">
                                    No Shopping Lists
                                </h2>
                                <p className="text-muted-foreground">
                                    Create a shopping list to start adding
                                    items.
                                </p>
                            </div>
                        </div>
                    )}
            </div>
        </AppLayout>
    );
}
