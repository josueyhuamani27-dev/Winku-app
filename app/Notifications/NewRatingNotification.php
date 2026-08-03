<?php

namespace App\Notifications;

use App\Models\Rating;
use Illuminate\Notifications\Notification;

class NewRatingNotification extends Notification
{
    public function __construct(public Rating $rating) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'message'    => "Recibiste una valoración de {$this->rating->rating}★ en \"{$this->rating->service->title}\".",
            'rating_id'  => $this->rating->id,
        ];
    }
}