<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

// ═══════════════════════════════════════════════════════════════════
// RF-21 CA-01/CA-04: Correo de bienvenida/verificación con identidad
// de Winkü y el nombre real del usuario. Extiende la clase base de
// Laravel para reutilizar toda la lógica de firma de URL y expiración
// (CA-05: hereda ShouldQueue de la clase base, se envía por cola).
// ═══════════════════════════════════════════════════════════════════
class VerifyEmailNotification extends BaseVerifyEmail
{
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Bienvenido a Winkü — Verifica tu correo')
            ->greeting("¡Hola, {$notifiable->name}!")
            ->line('Gracias por registrarte en Winkü con tu correo institucional de la UNSCH.')
            ->line('Para activar tu cuenta y empezar a conectar con talento de Ayacucho, verifica tu correo electrónico.')
            ->action('Verificar mi correo', $verificationUrl)
            ->line('Si no creaste esta cuenta, puedes ignorar este mensaje.')
            ->salutation('— El equipo de Winkü');
    }
}