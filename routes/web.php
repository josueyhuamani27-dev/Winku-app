<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ServiceController;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

// ── Página de inicio pública ──────────────────────────────────────────────────
Route::get('/', function (Request $request) {
    // RF-17 CA-06 (parcial): comentarios con su autor, para el modal de la tarjeta.
    $query = Service::with(['ratings' => function ($q) {
            $q->where('is_hidden', false)->with('client');
        }, 'user'])
        ->withAvg(['ratings' => function ($q) { $q->where('is_hidden', false); }], 'rating')
        ->withCount(['ratings' => function ($q) { $q->where('is_hidden', false); }])
        ->where('status', 'active');

    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%');
        });
    }

    if ($request->filled('category')) {
        $query->where('category', $request->input('category'));
    }

    $services = $query->latest()->get();
    // RF-18 CA-01/CA-02: reputación del proveedor (persona), agregando TODAS
    // sus valoraciones de TODOS sus servicios — no solo el servicio actual
    $providerIds = $services->pluck('user_id')->unique();
    $providerStats = App\Models\Rating::whereIn(
            'service_id',
            App\Models\Service::whereIn('user_id', $providerIds)->pluck('id')
        )
        ->join('services', 'services.id', '=', 'ratings.service_id')
        ->selectRaw('services.user_id, AVG(ratings.rating) as avg_rating, COUNT(*) as ratings_count')
        ->groupBy('services.user_id')
        ->get()
        ->keyBy('user_id');

    $services->each(function ($service) use ($providerStats) {
        $stats = $providerStats->get($service->user_id);
        $service->provider_ratings_avg   = $stats->avg_rating ?? null;
        $service->provider_ratings_count = $stats->ratings_count ?? 0;
    });

    return Inertia::render('Welcome', [
        'services' => $services,
        'filters'  => [
            'search'   => $request->input('search', ''),
            'category' => $request->input('category', ''),
        ],
    ]);
})->name('home');

// ── Dashboard privado ─────────────────────────────────────────────────────────
Route::get('/dashboard', function () {
    $misServicios = Service::where('user_id', Auth::id())->latest()->get();

    // RF-11 CA-01: solicitudes recibidas como proveedor, con datos del
    // servicio y del cliente para mostrarlas en el panel
    $receivedRequests = App\Models\ServiceRequest::with(['service', 'client'])
        ->where('provider_id', Auth::id())
        ->latest()
        ->get();

    return Inertia::render('Dashboard', [
        'services'         => $misServicios,
        'receivedRequests' => $receivedRequests,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// ── Servicios ─────────────────────────────────────────────────────────────────
Route::post('/services', [ServiceController::class, 'store'])
    ->middleware(['auth'])
    ->name('services.store');

Route::put('/services/{id}', [ServiceController::class, 'update'])
    ->middleware(['auth'])
    ->name('services.update');

Route::delete('/services/{id}', [ServiceController::class, 'destroy'])
    ->middleware(['auth'])
    ->name('services.destroy');

Route::patch('/services/{id}/toggle-status', [ServiceController::class, 'toggleStatus'])
    ->middleware(['auth'])
    ->name('services.toggle-status');

// RF-16: Marcar servicio como completado (solo el proveedor)
Route::patch('/services/{id}/complete', [ServiceController::class, 'markComplete'])
    ->middleware(['auth'])
    ->name('services.complete');

// ── Solicitudes de servicio (service_requests) — Fase 1 SRS v3.0 ─────────────
// RF-09 / RF-13: Confirmación de entrega por el cliente (ÚNICO método activo)
Route::patch('/service-requests/{id}/complete', [App\Http\Controllers\ServiceRequestController::class, 'complete'])
    ->middleware(['auth'])
    ->name('service-requests.complete');

// RF-09 / RF-13 CA-05: Abrir disputa en lugar de confirmar
Route::patch('/service-requests/{id}/dispute', [App\Http\Controllers\ServiceRequestController::class, 'dispute'])
    ->middleware(['auth'])
    ->name('service-requests.dispute');

// RF-10: Solicitud de servicio por el cliente — ACTIVO
Route::post('/service-requests', [App\Http\Controllers\ServiceRequestController::class, 'store'])
    ->middleware(['auth'])
    ->name('service-requests.store');

// RF-11: Gestión de solicitudes por el proveedor — ACTIVO
Route::patch('/service-requests/{id}/accept', [App\Http\Controllers\ServiceRequestController::class, 'accept'])
    ->middleware(['auth'])
    ->name('service-requests.accept');

Route::patch('/service-requests/{id}/reject', [App\Http\Controllers\ServiceRequestController::class, 'reject'])
    ->middleware(['auth'])
    ->name('service-requests.reject');

// RF-12: Seguimiento del estado de la solicitud — ACTIVO
Route::get('/my-requests', [App\Http\Controllers\ServiceRequestController::class, 'index'])
    ->middleware(['auth'])
    ->name('service-requests.index');

// RF-16: Guardar valoración
Route::post('/services/{id}/rating', [App\Http\Controllers\RatingController::class, 'store'])
    ->middleware(['auth'])
    ->name('services.rating.store');

// RF-17: Guardar valoración — vinculada al service_request, no al service
Route::post('/service-requests/{id}/rating', [App\Http\Controllers\RatingController::class, 'store'])
    ->middleware(['auth'])
    ->name('service-requests.rating.store');

// RF-19: Reportar una reseña
Route::post('/ratings/{id}/report', [App\Http\Controllers\ReportController::class, 'store'])
    ->middleware(['auth'])
    ->name('ratings.report');

// ── Perfil de usuario ─────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::post('/profile', [ProfileController::class, 'update'])
        ->name('profile.update.post');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

// ── Perfil público de usuario ─────────────────────────────────────────────────
Route::get('/user/{id}', [ProfileController::class, 'show'])
    ->name('profile.show');
    
// RF-20 CA-03: marcar notificación como leída
    Route::patch('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

// ── Panel de administración ───────────────────────────────────────────────────
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::patch('/admin/users/{user}/toggle-status', [App\Http\Controllers\Admin\AdminDashboardController::class, 'toggleUserStatus'])
        ->name('admin.users.toggle-status');

    Route::delete('/admin/users/{user}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'deleteUser'])
        ->name('admin.users.delete');

    Route::patch('/admin/services/{service}/toggle-status', [App\Http\Controllers\Admin\AdminDashboardController::class, 'toggleServiceStatus'])
        ->name('admin.services.toggle-status');

    // RF-19 CA-03: decisión del admin sobre reseñas reportadas
    Route::patch('/admin/ratings/{rating}/restore', [App\Http\Controllers\Admin\AdminDashboardController::class, 'restoreRating'])
        ->name('admin.ratings.restore');

    Route::delete('/admin/ratings/{rating}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'deleteReportedRating'])
        ->name('admin.ratings.delete');
});

require __DIR__ . '/auth.php';