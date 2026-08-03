<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'role', 'password', 'avatar', 'description', 'career', 'semester', 'skills', 'status', 'phone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // Relación: un usuario tiene muchos servicios
    public function services()
    {
        return $this->hasMany(Service::class);
    }

    // RF-18: todas las valoraciones recibidas por este usuario como proveedor,
    // agregando las de TODOS sus servicios (a través de la tabla services)
    public function receivedRatings()
    {
        return \App\Models\Rating::whereHas('service', function ($q) {
            $q->where('user_id', $this->id);
        });
    }

    // RF-21: sobreescribe el correo de verificación por defecto de Laravel
    // para usar nuestra plantilla personalizada con el nombre e identidad
    // de Winkü
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification());
    }
}