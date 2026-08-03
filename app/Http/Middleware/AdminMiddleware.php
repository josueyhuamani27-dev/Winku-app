<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // CA-01: Verificamos si el usuario está logueado y si su rol es 'admin'
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request);
        }

        // Si no es admin, lo mandamos al dashboard con un mensaje de prohibido
        return redirect()->route('dashboard')->with('error', 'No tienes permisos de administrador para ingresar aquí.');
    }
}