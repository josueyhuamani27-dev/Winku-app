<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Vista raíz que es cargada en la primera visita a la página.
     */
    protected $rootView = 'app';

    /**
     * Determina la versión actual de los assets.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define los datos compartidos con TODOS los componentes React via Inertia.
     *
     * ─── RAÍZ DEL BUG #2 ───────────────────────────────────────────────────
     * El Breeze por defecto solo comparte name, email, email_verified_at.
     * Los campos nuevos (career, semester, description, skills, avatar) no
     * estaban aquí, por eso el Dashboard los mostraba vacíos aunque estuvieran
     * guardados en la base de datos.
     * ────────────────────────────────────────────────────────────────────────
     */
    public function share(Request $request): array
{
    return [
        ...parent::share($request),
        // RF-20 CA-02: notificaciones compartidas globalmente para el badge
        // del Navbar en TODAS las páginas (últimas 10 + conteo de no leídas)
        'notifications' => $request->user() ? [
            'items'       => $request->user()->notifications()->latest()->take(10)->get(),
            'unreadCount' => $request->user()->unreadNotifications()->count(),
        ] : ['items' => [], 'unreadCount' => 0],
        'auth' => [
            'user' => $request->user() ? [
                'id'                => $request->user()->id,
                'name'              => $request->user()->name,
                'email'             => $request->user()->email,
                'email_verified_at' => $request->user()->email_verified_at,
                'career'            => $request->user()->career,
                'semester'          => $request->user()->semester,
                'description'       => $request->user()->description,
                'skills'            => $request->user()->skills,
                'avatar'            => $request->user()->avatar,
                'phone'             => $request->user()->phone,
            ] : null,
        ],
    ];
}
}