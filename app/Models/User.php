<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function households(): BelongsToMany
    {
        return $this->belongsToMany(Household::class)
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function createdHouseholds(): HasMany
    {
        return $this->hasMany(Household::class, 'created_by_user_id');
    }

    public function createdShoppingLists(): HasMany
    {
        return $this->hasMany(ShoppingList::class, 'created_by_user_id');
    }

    public function addedShoppingListItems(): HasMany
    {
        return $this->hasMany(ShoppingListItem::class, 'added_by_user_id');
    }

    public function boughtShoppingListItems(): HasMany
    {
        return $this->hasMany(ShoppingListItem::class, 'bought_by_user_id');
    }

    public function belongsToHousehold(Household $household): bool
    {
        if ($this->relationLoaded('households')) {
            return $this->households->contains($household);
        }

        return $this->households()->whereKey($household)->exists();
    }

    public function ownsHousehold(Household $household): bool
    {
        return $this->households()
            ->wherePivot('role', Household::ROLE_OWNER)
            ->whereKey($household)
            ->exists();
    }
}
