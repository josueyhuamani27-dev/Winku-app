<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'email'       => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'career'      => ['nullable', 'string', 'max:255'],
            'semester'    => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'skills'      => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            
            // 'sometimes' = solo valida avatar si viene en la request
            // 'nullable'  = acepta que venga vacío o nulo sin error
            // 'image'     = solo aplica si efectivamente viene un archivo
            'avatar'      => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'El nombre es obligatorio.',
            'email.required'  => 'El correo electrónico es obligatorio.',
            'email.unique'    => 'Este correo ya está registrado en otra cuenta.',
            'avatar.image'    => 'El archivo debe ser una imagen.',
            'avatar.mimes'    => 'Solo se permiten imágenes JPG, PNG o WebP.',
            'avatar.max'      => 'La imagen no debe superar los 2 MB.',
            'phone.max'       => 'El teléfono no puede superar los 20 caracteres.',
        ];
    }
}