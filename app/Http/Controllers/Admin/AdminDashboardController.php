<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\Rating;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $metrics = [
            'total_users'     => User::where('role', '!=', 'admin')->count(),
            'active_users'    => User::where('status', 'active')->where('role', '!=', 'admin')->count(),
            'inactive_users'  => User::where('status', 'inactive')->where('role', '!=', 'admin')->count(),
            'total_services'  => Service::count(),
            'active_services' => Service::where('status', 'active')->count(),
        ];

        $users = User::where('role', '!=', 'admin')
            ->select('id', 'name', 'email', 'career', 'status', 'created_at')
            ->latest()
            ->get();

        // RF-12 CA-02: Listado de todos los servicios para el admin
        $services = Service::with('user:id,name')
            ->select('id', 'user_id', 'title', 'category', 'price', 'status', 'created_at')
            ->latest()
            ->get();

        $logs = AdminLog::with('admin:id,name')
            ->latest()
            ->take(20)
            ->get();

        // RF-19 CA-02/CA-03: reseñas ocultas (3+ reportes) que esperan
        // decisión del admin
        $reportedRatings = Rating::where('is_hidden', true)
            ->with(['client:id,name', 'service:id,title', 'reports.reporter:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics'          => $metrics,
            'users'            => $users,
            'services'         => $services,
            'logs'             => $logs,
            'reportedRatings'  => $reportedRatings,
        ]);
    }

    public function toggleUserStatus(Request $request, User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', 'No puedes modificar el estado de un administrador.');
        }

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        AdminLog::create([
            'admin_id'    => Auth::id(),
            'action'      => $newStatus === 'inactive' ? 'suspend_user' : 'activate_user',
            'target_type' => 'user',
            'target_id'   => $user->id,
            'description' => "Usuario '{$user->name}' cambió a estado: {$newStatus}.",
        ]);

        $label = $newStatus === 'active' ? 'activado' : 'suspendido';
        return back()->with('success', "Usuario {$label} correctamente.");
    }

    public function deleteUser(User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', 'No puedes eliminar a un administrador.');
        }

        $userName = $user->name;
        $userId   = $user->id;
        $user->delete();

        AdminLog::create([
            'admin_id'    => Auth::id(),
            'action'      => 'delete_user',
            'target_type' => 'user',
            'target_id'   => $userId,
            'description' => "Usuario '{$userName}' eliminado permanentemente.",
        ]);

        return back()->with('success', "Usuario '{$userName}' eliminado correctamente.");
    }

    public function toggleServiceStatus(Service $service)
    {
        // Admin suspende con 'suspended', reactiva a 'active'
        // 'inactive' lo reservamos solo para cuando el proveedor pausa su propio servicio
        $newStatus = $service->status === 'active' ? 'suspended' : 'active';
        $service->update(['status' => $newStatus]);
 
        AdminLog::create([
            'admin_id'    => Auth::id(),
            'action'      => $newStatus === 'suspended' ? 'suspend_service' : 'activate_service',
            'target_type' => 'service',
            'target_id'   => $service->id,
            'description' => "Servicio '{$service->title}' cambió a estado: {$newStatus}.",
        ]);
 
        $label = $newStatus === 'active' ? 'activado' : 'suspendido';
        return back()->with('success', "Servicio {$label} correctamente.");
    }
    // ═══════════════════════════════════════════════════════════════
    // RF-19 CA-03: Admin restaura una reseña reportada (la considera válida)
    // ═══════════════════════════════════════════════════════════════
    public function restoreRating(Rating $rating)
    {
        $rating->is_hidden = false;
        $rating->save();

        $rating->reports()->update(['status' => 'resolved']);

        AdminLog::create([
            'admin_id'    => Auth::id(),
            'action'      => 'restore_rating',
            'target_type' => 'rating',
            'target_id'   => $rating->id,
            'description' => "Reseña #{$rating->id} restaurada tras revisión de reportes.",
        ]);

        return back()->with('success', 'Reseña restaurada.');
    }

    // ═══════════════════════════════════════════════════════════════
    // RF-19 CA-03: Admin elimina una reseña reportada (la considera inválida)
    // ═══════════════════════════════════════════════════════════════
    public function deleteReportedRating(Rating $rating)
    {
        $ratingId = $rating->id;
        $rating->reports()->update(['status' => 'resolved']);
        $rating->delete();

        AdminLog::create([
            'admin_id'    => Auth::id(),
            'action'      => 'delete_rating',
            'target_type' => 'rating',
            'target_id'   => $ratingId,
            'description' => "Reseña #{$ratingId} eliminada tras revisión de reportes.",
        ]);

        return back()->with('success', 'Reseña eliminada.');
    }
}