<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Notifications\Notification;

class NewServiceRequestNotification extends Notification
{
    public function __construct(public ServiceRequest $serviceRequest) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'message'            => "Recibiste una nueva solicitud para \"{$this->serviceRequest->service->title}\".",
            'service_request_id' => $this->serviceRequest->id,
        ];
    }
}