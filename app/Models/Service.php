<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    use HasFactory;

    // Habilitamos los campos para que se puedan guardar de forma masiva de forma segura
    protected $fillable = [
        'user_id',
        'title',
        'category',
        'description',
        'price',
        'status'
    ];

    /**
     * Relación: Un servicio pertenece a un Usuario (Creador).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }
}