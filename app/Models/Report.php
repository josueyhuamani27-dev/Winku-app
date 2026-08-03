<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'rating_id',
        'reporter_id',
        'reason',
        'details',
        'status',
    ];

    public function rating()
    {
        return $this->belongsTo(Rating::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}