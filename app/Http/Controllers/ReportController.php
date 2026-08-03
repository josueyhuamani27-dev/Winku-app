<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    // ═══════════════════════════════════════════════════════════════
    // RF-19: Reporte de valoración inapropiada — ACTIVO (CA-01, CA-02)
    //
    // CA-01: Formulario de reporte con categoría de motivo.
    // CA-02: La reseña se oculta automáticamente al llegar a 3 reportes.
    // CA-03: Admin decide restaurar o eliminar — ver AdminDashboardController
    //        (restoreRating / deleteReportedRating). El plazo de 48h para
    //        decidir NO se aplica automáticamente (no hay Job/Schedule que
    //        lo fuerce); es un objetivo operativo, igual que CA-05 de RF-11.
    // ═══════════════════════════════════════════════════════════════
    public function store(Request $request, string $ratingId)
    {
        $rating = Rating::findOrFail($ratingId);

        $validReasons = ['Spam', 'Contenido ofensivo', 'Información falsa', 'Otro'];

        $request->validate([
            'reason'  => 'required|string|in:' . implode(',', $validReasons),
            'details' => $request->reason === 'Otro' ? 'required|string|max:255' : 'nullable|string|max:255',
        ], [
            'reason.required' => 'Selecciona un motivo.',
            'reason.in'       => 'El motivo seleccionado no es válido.',
            'details.required' => 'Describe brevemente el motivo.',
            'details.max'      => 'La descripción no puede superar los 255 caracteres.',
        ]);

        // No permitir reportar dos veces la misma reseña
        $existing = Report::where('rating_id', $rating->id)
            ->where('reporter_id', Auth::id())
            ->first();

        if ($existing) {
            return back()->with('error', 'Ya has reportado esta reseña.');
        }

        Report::create([
            'rating_id'   => $rating->id,
            'reporter_id' => Auth::id(),
            'reason'      => $request->reason,
            'details'     => $request->details,
        ]);

        // CA-02: ocultar automáticamente al llegar a 3 reportes
        $reportCount = Report::where('rating_id', $rating->id)->count();
        if ($reportCount >= 3 && !$rating->is_hidden) {
            $rating->is_hidden = true;
            $rating->save();
        }

        return back()->with('success', 'Reporte enviado. Gracias por ayudar a mantener Winkü confiable.');
    }
}