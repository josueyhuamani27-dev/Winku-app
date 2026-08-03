<x-mail::message>
# ¡Bienvenido a Winkü{{ '!' }}

Hola **{{ $user->name ?? '' }}**,

Gracias por registrarte con tu correo institucional de la UNSCH. Para activar tu cuenta y empezar a conectar con talento de Ayacucho, confirma tu correo electrónico:

<x-mail::button :url="$actionUrl" color="success">
Verificar mi correo
</x-mail::button>

Si no creaste esta cuenta, puedes ignorar este mensaje.

— El equipo de **Winkü**
</x-mail::message>