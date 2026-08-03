<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Notifications\Notification;

class RequestAcceptedNotification extends Notification
{
    public function __construct(public ServiceRequest $serviceRequest) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'message'            => "Tu solicitud para \"{$this->serviceRequest->service->title}\" fue aceptada.",
            'service_request_id' => $this->serviceRequest->id,
        ];
    }
}