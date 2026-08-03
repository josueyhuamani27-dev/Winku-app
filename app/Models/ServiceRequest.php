<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = [
        'service_id',
        'client_id',
        'provider_id',
        'status',
        'message',
        'rejection_reason',
        'dispute_reason',
        'completed_at',
    ];

    public function rating()
    {
        return $this->hasOne(Rating::class);
    }
    
    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}