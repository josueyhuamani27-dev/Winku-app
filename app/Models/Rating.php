<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'rating',
        'comment',
        'service_id',
        'client_id',
        'service_request_id',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
    ];

    // Relación: valoración pertenece a un servicio
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Relación: valoración pertenece a un cliente
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Relación: valoración pertenece a la solicitud/contratación específica
    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}