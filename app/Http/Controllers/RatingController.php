<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\NewRatingNotification;

class RatingController extends Controller
{
    // ═══════════════════════════════════════════════════════════════
    // RF-17: Guardar valoración post-servicio — CORREGIDO
    // Ahora se valida contra el service_request (la contratación
    // específica), no contra el service (que nunca cambia de estado
    // según RF-13 CA-03).
    //
    // CA-01: Puntuación 1 a 5.
    // CA-02: Comentario opcional máx 500 caracteres.
    // CA-03: Solo disponible si la SOLICITUD está completed.
    // CA-04: Solo el cliente que contrató (dueño del service_request).
    // CA-05: No modificable — unique en service_request_id.
    // CA-06: Visible en el perfil público del proveedor — pendiente (RF-24).
    // ═══════════════════════════════════════════════════════════════
    public function store(Request $request, string $serviceRequestId)
    {
        $serviceRequest = ServiceRequest::findOrFail($serviceRequestId);

        // CA-04: solo el cliente dueño de esta solicitud puede valorarla
        if ($serviceRequest->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para valorar esta solicitud.');
        }

        // CA-03: solo si la solicitud ya fue confirmada como completada
        if ($serviceRequest->status !== 'completed') {
            return back()->with('error', 'Solo puedes valorar servicios ya completados.');
        }

        // CA-05: no se puede valorar dos veces la misma solicitud
        $existing = Rating::where('service_request_id', $serviceRequest->id)->first();
        if ($existing) {
            return back()->with('error', 'Ya has valorado esta solicitud.');
        }

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ], [
            'rating.required' => 'La puntuación es obligatoria.',
            'rating.min'      => 'La puntuación mínima es 1 estrella.',
            'rating.max'      => 'La puntuación máxima es 5 estrellas.',
            'comment.max'     => 'El comentario no puede superar los 500 caracteres.',
        ]);

        $rating = Rating::create([
            'rating'             => $request->rating,
            'comment'            => $request->comment,
            'service_id'         => $serviceRequest->service_id,
            'client_id'          => Auth::id(),
            'service_request_id' => $serviceRequest->id,
        ]);

        $serviceRequest->provider->notify(new NewRatingNotification($rating));

        return back()->with('success', '¡Gracias por tu valoración!');
    }
}