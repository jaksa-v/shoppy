<?php

namespace App\Models;

use Database\Factories\ShoppingListItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShoppingListItem extends Model
{
    /** @use HasFactory<ShoppingListItemFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'shopping_list_id',
        'category_id',
        'name',
        'quantity',
        'notes',
        'is_bought',
        'bought_at',
        'added_by_user_id',
        'bought_by_user_id',
        'position',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_bought' => 'boolean',
            'bought_at' => 'datetime',
        ];
    }

    public function shoppingList(): BelongsTo
    {
        return $this->belongsTo(ShoppingList::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by_user_id');
    }

    public function boughtBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bought_by_user_id');
    }
}
