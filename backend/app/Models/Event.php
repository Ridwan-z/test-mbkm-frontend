<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'venue',
        'start_datetime',
        'end_datetime',
        'status',
        'image_url',
        'price',
        'max_participants',
        'organizer_id'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'price' => 'decimal:2',
    ];

    // Relationships
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopePublished(Builder $query)
    {
        return $query->where('status', 'published');
    }

    public function scopeSearch(Builder $query, $search)
    {
        return $query->where('title', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
    }

    public function scopeByOrganizer(Builder $query, $organizerId)
    {
        return $query->where('organizer_id', $organizerId);
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2);
    }

    public function getAvailableSlotsAttribute()
    {
        if (!$this->max_participants) return null;

        $booked = $this->orders()->where('status', 'paid')->sum('quantity');
        return max(0, $this->max_participants - $booked);
    }
}
