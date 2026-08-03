<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Notifications\NewServiceRequestNotification;
use App\Notifications\RequestAcceptedNotification;
use App\Notifications\RequestRejectedNotification;
use App\Notifications\ServiceCompletedNotification;

class ServiceRequestController extends Controller
{
    // ═══════════════════════════════════════════════════════════════
    // RF-10: Solicitud de servicio por el cliente — ACTIVO
    // El cliente envía una solicitud formal a un proveedor. Crea un
    // registro en service_requests con status=pending.
    //
    // CA-01: Solo usuarios autenticados pueden solicitar (middleware auth
    //        en la ruta, ver routes/web.php).
    // CA-02: No se puede solicitar el propio servicio.
    // CA-03: Mensaje opcional de hasta 500 caracteres.
    // CA-04: Notificación al proveedor — pendiente (RF-20, Fase 2).
    // CA-05: Un cliente no puede tener dos solicitudes ACTIVAS
    //        (pending/accepted/in_progress) para el mismo servicio.
    // CA-06: Estado inicial siempre "pending".
    // ═══════════════════════════════════════════════════════════════
    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'message'    => 'nullable|string|max:500',
        ], [
            'service_id.required' => 'El servicio es obligatorio.',
            'service_id.exists'   => 'El servicio no existe.',
            'message.max'         => 'El mensaje no puede superar los 500 caracteres.',
        ]);

        $service = Service::findOrFail($request->service_id);

        // CA-02: no se puede solicitar el propio servicio
        if ($service->user_id === Auth::id()) {
            return redirect()->back()->withErrors(['service_request' => 'No puedes solicitar tu propio servicio.']);
        }

        // CA-05: no puede tener dos solicitudes activas para el mismo servicio
        $activeExists = ServiceRequest::where('service_id', $service->id)
            ->where('client_id', Auth::id())
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->exists();

        if ($activeExists) {
            return redirect()->back()->withErrors(['service_request' => 'Ya tienes una solicitud activa para este servicio.']);
        }

        $serviceRequest = ServiceRequest::create([
            'service_id'  => $service->id,
            'client_id'   => Auth::id(),
            'provider_id' => $service->user_id,
            'status'      => 'pending', // CA-06
            'message'     => $request->message,
        ]);

        // TODO RF-20 (Fase 2): notificar al proveedor de la nueva solicitud.

        $service->user->notify(new NewServiceRequestNotification($serviceRequest));

        return redirect()->back()->with('success', 'Solicitud enviada correctamente.');
    }

    // ═══════════════════════════════════════════════════════════════
    // RF-11: Gestión de solicitudes por el proveedor — ACTIVO (CA-01 a CA-04)
    // El proveedor acepta o rechaza solicitudes recibidas en estado pending.
    //
    // CA-01: Panel de solicitudes en el Dashboard del proveedor (ver Dashboard.jsx).
    // CA-02: Aceptar/rechazar solo aplica a solicitudes en estado "pending".
    // CA-03: Al rechazar, motivo opcional (rejection_reason).
    // CA-04: Notificación al cliente — pendiente (RF-20, Fase 2).
    //
    // CA-05 (auto-cancelación a las 48h sin respuesta) — PENDIENTE.
    // Requiere un Laravel Job + Schedule que revise periódicamente
    // solicitudes "pending" con más de 48h de antigüedad y las pase a
    // "cancelled" automáticamente. Se implementará como pieza aparte,
    // no como parte de este método (accept/reject son acciones manuales
    // del proveedor; CA-05 es una acción automática del sistema).
    // ═══════════════════════════════════════════════════════════════
    public function accept(string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        // Solo el proveedor dueño de la solicitud puede gestionarla
        if ($serviceRequest->provider_id !== Auth::id()) {
            abort(403, 'No tienes permiso para gestionar esta solicitud.');
        }

        // CA-02: solo se puede aceptar una solicitud pendiente
        if ($serviceRequest->status !== 'pending') {
            return redirect()->back()->withErrors(['service_request' => 'Esta solicitud ya no está pendiente.']);
        }

        // TODO RF-20 (Fase 2): notificar al cliente de la aceptación.

        $serviceRequest->status = 'accepted';
        $serviceRequest->save();

        $serviceRequest->client->notify(new RequestAcceptedNotification($serviceRequest));

        return redirect()->back()->with('success', 'Solicitud aceptada.');
    }

    public function reject(Request $request, string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        if ($serviceRequest->provider_id !== Auth::id()) {
            abort(403, 'No tienes permiso para gestionar esta solicitud.');
        }

        if ($serviceRequest->status !== 'pending') {
            return redirect()->back()->withErrors(['service_request' => 'Esta solicitud ya no está pendiente.']);
        }

        $request->validate([
            'rejection_reason' => 'nullable|string|max:255',
        ]);

        $serviceRequest->status = 'rejected';
        $serviceRequest->rejection_reason = $request->rejection_reason;
        $serviceRequest->save();

        $serviceRequest->client->notify(new RequestRejectedNotification($serviceRequest));

        return redirect()->back()->with('success', 'Solicitud rechazada.');
    }

    // ═══════════════════════════════════════════════════════════════
    // RF-09 / RF-13: Confirmación de entrega por el cliente — ACTIVO
    // Único método funcional por ahora. El CLIENTE (no el proveedor)
    // confirma que el servicio fue entregado satisfactoriamente.
    //
    // CA-01: Solo el cliente que contrató puede marcar como completado.
    // CA-02: El estado completed se asigna vía la solicitud aceptada
    //        (debe venir de accepted o in_progress, no de pending).
    // CA-03: Habilita el formulario de valoración para el cliente
    //        (se habilita implícitamente: el frontend/RatingController
    //        valida status=completed antes de permitir valorar — RF-17).
    // CA-04: El proveedor recibe notificación (pendiente: RF-20, Fase 2,
    //        no implementado en este método todavía).
    // RF-13 CA-03: El servicio (tabla services) NO cambia de estado,
    //        sigue "active" para que otros clientes puedan solicitarlo.
    // ═══════════════════════════════════════════════════════════════
    public function complete(string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        // CA-01: solo el cliente que contrató esta solicitud puede confirmarla
        if ($serviceRequest->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para confirmar esta solicitud.');
        }

        // CA-02: solo se puede completar una solicitud que ya fue aceptada
        // o que está en progreso (no una que sigue pending/rejected/etc)
        if (!in_array($serviceRequest->status, ['accepted', 'in_progress'])) {
            abort(422, 'Esta solicitud no puede marcarse como completada en su estado actual.');
        }

        $serviceRequest->status = 'completed';
        $serviceRequest->completed_at = now();
        $serviceRequest->save();

        $serviceRequest->provider->notify(new ServiceCompletedNotification($serviceRequest));

        return redirect()->back()->with('success', 'Servicio confirmado como completado.');
    }

    // ═══════════════════════════════════════════════════════════════
    // RF-09 / RF-13 CA-05: Abrir disputa en lugar de confirmar — ACTIVO
    // El cliente, en vez de confirmar la entrega, puede reportar que
    // NO está satisfecho. Cambia el estado a "disputed".
    //
    // Alcance de este método: dejar constancia de la disputa con su
    // motivo. La resolución de la disputa (mediación, reembolso, etc.)
    // no está definida en el SRS v3.0 y queda pendiente como un
    // requisito futuro (probablemente ligado a un panel de admin).
    // ═══════════════════════════════════════════════════════════════
    public function dispute(Request $request, string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        // Solo el cliente que contrató puede abrir la disputa
        if ($serviceRequest->client_id !== Auth::id()) {
            abort(403, 'No tienes permiso para reportar esta solicitud.');
        }

        // Misma condición que complete(): solo si viene de accepted/in_progress
        if (!in_array($serviceRequest->status, ['accepted', 'in_progress'])) {
            return redirect()->back()->withErrors(['service_request' => 'Esta solicitud no puede reportarse en su estado actual.']);
        }

        $request->validate([
            'dispute_reason' => 'required|string|max:500',
        ], [
            'dispute_reason.required' => 'Debes indicar el motivo de la disputa.',
            'dispute_reason.max'      => 'El motivo no puede superar los 500 caracteres.',
        ]);

        $serviceRequest->status = 'disputed';
        $serviceRequest->dispute_reason = $request->dispute_reason;
        $serviceRequest->save();

        // TODO: notificar al proveedor y/o admin de la disputa abierta
        // (pendiente definir en un RF futuro de resolución de disputas).

        return redirect()->back()->with('success', 'Disputa abierta. El equipo de Winkü la revisará.');
    }

    // ═══════════════════════════════════════════════════════════════
    // RF-12: Seguimiento del estado de la solicitud — PENDIENTE
    // Listado de solicitudes para cliente y proveedor. CA-01 a CA-05.
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // RF-12: Seguimiento del estado de la solicitud — ACTIVO (CA-01, CA-03, CA-04)
    // Historial de solicitudes ENVIADAS por el cliente autenticado, con
    // filtro opcional por estado.
    //
    // CA-01: Cliente ve sus solicitudes enviadas con estado actual.
    // CA-02: Cubierto en el panel "Solicitudes Recibidas" del proveedor
    //        (Dashboard.jsx, implementado en RF-11).
    // CA-03: Incluye fecha (created_at) y descripción del servicio.
    // CA-04: Filtro por estado vía query param ?status=.
    // CA-05: Exportable a PDF — PENDIENTE (marcado como "futuro" en el SRS,
    //        no se implementa en este método).
    // ═══════════════════════════════════════════════════════════════
    public function index(Request $request)
    {
        $query = ServiceRequest::with(['service', 'provider', 'rating'])
            ->where('client_id', Auth::id());

        // CA-04: filtro por estado, solo si viene un valor válido
        $validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled', 'disputed'];
        if ($request->filled('status') && in_array($request->status, $validStatuses)) {
            $query->where('status', $request->status);
        }

        $myRequests = $query->latest()->get();

        return Inertia::render('MyRequests', [
            'myRequests' => $myRequests,
            'filters'    => [
                'status' => $request->input('status', ''),
            ],
        ]);
    }
}