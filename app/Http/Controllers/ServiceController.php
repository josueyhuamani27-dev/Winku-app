<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
    /**
     * RF-05: Crear un nuevo servicio.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string|in:Tecnología,Diseño,Tutoría,Social,Eventos,Otros',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:5',
        ], [
            'title.required'       => 'El título es obligatorio.',
            'title.max'            => 'El título no puede superar los 255 caracteres.',
            'category.required'    => 'Selecciona una categoría.',
            'category.in'          => 'La categoría seleccionada no es válida.',
            'description.required' => 'La descripción es obligatoria.',
            'price.required'       => 'El precio es obligatorio.',
            'price.numeric'        => 'El precio debe ser un número.',
            'price.min'            => 'El precio mínimo es S/. 5.00.',
        ]);

        $service              = new Service();
        $service->user_id     = Auth::id();
        $service->title       = $request->title;
        $service->category    = $request->category;
        $service->description = $request->description;
        $service->price       = $request->price;
        $service->status      = 'active'; // CA-01 RF-12: siempre inicia activo
        $service->save();

        return redirect()->back();
    }

    /**
     * RF-08: Editar un servicio existente.
     */
    public function update(Request $request, string $id)
    {
        $service = Service::findOrFail($id);

        if ($service->user_id !== Auth::id()) {
            abort(403, 'No tienes permiso para editar este servicio.');
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string|in:Tecnología,Diseño,Tutoría,Social,Eventos,Otros',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:5',
        ], [
            'title.required'       => 'El título es obligatorio.',
            'title.max'            => 'El título no puede superar los 255 caracteres.',
            'category.required'    => 'Selecciona una categoría.',
            'category.in'          => 'La categoría seleccionada no es válida.',
            'description.required' => 'La descripción es obligatoria.',
            'price.required'       => 'El precio es obligatorio.',
            'price.numeric'        => 'El precio debe ser un número.',
            'price.min'            => 'El precio mínimo es S/. 5.00.',
        ]);

        $service->title       = $request->title;
        $service->category    = $request->category;
        $service->description = $request->description;
        $service->price       = $request->price;
        $service->save();

        return redirect()->back();
    }

    /**
     * RF-12 CA-03: El proveedor pausa o activa su propio servicio.
     */
    public function toggleStatus(string $id)
    {
        $service = Service::findOrFail($id);
 
        if ($service->user_id !== Auth::id()) {
            abort(403, 'No tienes permiso para cambiar el estado de este servicio.');
        }
 
        // Si el admin lo suspendió, el proveedor no puede reactivarlo
        if ($service->status === 'suspended') {
            return back()->with('error', 'Este servicio fue suspendido por el administrador. Contacta al admin para reactivarlo.');
        }
 
        $service->status = $service->status === 'active' ? 'inactive' : 'active';
        $service->save();
 
        return redirect()->back();
    }
    
     /**
     * RF-16 CA-03: El proveedor marca su servicio como completado.
     */
    public function markComplete(string $id)
    {
        $service = Service::findOrFail($id);
 
        if ($service->user_id !== Auth::id()) {
            abort(403, 'No tienes permiso para modificar este servicio.');
        }
 
        $service->status = 'completed';
        $service->save();
 
        return redirect()->back()->with('success', 'Servicio marcado como completado.');
    }

    /**
     * RF-07: Eliminar un servicio.
     */
    public function destroy(string $id)
    {
        $service = Service::findOrFail($id);

        if ($service->user_id !== Auth::id()) {
            abort(403, 'No tienes permiso para eliminar este servicio.');
        }

        $service->delete();

        return redirect()->back();
    }
}