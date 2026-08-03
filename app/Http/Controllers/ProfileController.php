<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Mostrar el formulario de edición de perfil.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
        ]);
    }

    /**
     * Actualizar el perfil del usuario.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Rellenar SOLO los campos de texto — avatar se maneja por separado
        // porque fill($request->validated()) incluiría avatar como string
        // y rompería el guardado del archivo
        $user->name        = $request->input('name');
        $user->email       = $request->input('email');
        $user->career      = $request->input('career');
        $user->semester    = $request->input('semester');
        $user->description = $request->input('description');
        $user->skills      = $request->input('skills');
        $user->phone = $request->input('phone');

        // Si el email cambió, resetear verificación
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Manejo de avatar — separado del fill para evitar conflictos
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            // Borrar avatar anterior si existe
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            // Guardar nueva imagen
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        // Guardar todos los cambios en la base de datos
        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Eliminar la cuenta del usuario.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * RF-24: Mostrar perfil público de un proveedor.
     *
     * CA-01: nombre, avatar, carrera, semestre, descripción, habilidades — YA
     *        existía, se mantiene igual.
     * CA-02: servicios activos del proveedor — NUEVO.
     * CA-03: puntuación promedio + total de servicios completados — NUEVO.
     * CA-04: últimas 5 reseñas recibidas — NUEVO.
     * CA-05: teléfono, para el botón de WhatsApp — NUEVO (faltaba enviarlo).
     */
    public function show(string $id): Response
    {
        $profileUser = \App\Models\User::findOrFail($id);

        // CA-02: servicios activos publicados por este proveedor
        $activeServices = \App\Models\Service::where('user_id', $profileUser->id)
            ->where('status', 'active')
            ->latest()
            ->get(['id', 'title', 'category', 'price']);

        // CA-03: total de servicios completados (contando cada service_request
        // completada, no el service en sí, porque este último no cambia de
        // estado según RF-13 CA-03) + promedio de todas sus valoraciones
        $completedCount = \App\Models\ServiceRequest::where('provider_id', $profileUser->id)
            ->where('status', 'completed')
            ->count();

        $ratingStats = \App\Models\Rating::whereHas('service', function ($q) use ($profileUser) {
                $q->where('user_id', $profileUser->id);
            })
            ->where('is_hidden', false)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as ratings_count')
            ->first();

        // CA-04: últimas 5 reseñas recibidas, con el nombre del cliente y el
        // servicio al que corresponden
        $recentRatings = \App\Models\Rating::whereHas('service', function ($q) use ($profileUser) {
                $q->where('user_id', $profileUser->id);
            })
            ->where('is_hidden', false)
            ->with(['client:id,name', 'service:id,title'])
            ->latest()
            ->take(5)
            ->get(['id', 'rating', 'comment', 'client_id', 'service_id', 'created_at']);

        return Inertia::render('Profile/PublicProfile', [
            'student' => [
                'id'          => $profileUser->id,
                'name'        => $profileUser->name,
                'avatar'      => $profileUser->avatar,
                'career'      => $profileUser->career      ?? 'No especificada',
                'semester'    => $profileUser->semester    ?? 'No especificado',
                'description' => $profileUser->description ?? 'Sin descripción aún.',
                'skills'      => $profileUser->skills      ?? '',
                'phone'       => $profileUser->phone       ?? null, // CA-05
            ],
            'activeServices'   => $activeServices,
            'completedCount'   => $completedCount,
            'ratingsAvg'       => $ratingStats->avg_rating ? round($ratingStats->avg_rating, 1) : null,
            'ratingsCount'     => $ratingStats->ratings_count ?? 0,
            'recentRatings'    => $recentRatings,
        ]);
    }
}