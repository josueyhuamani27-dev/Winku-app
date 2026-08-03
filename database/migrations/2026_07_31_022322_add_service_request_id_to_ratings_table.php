<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            // Vincula la valoración a la CONTRATACIÓN específica (service_request),
            // no solo al servicio en general. Esto permite que un mismo cliente
            // contrate el mismo servicio varias veces en el futuro y valore cada
            // contratación por separado.
            $table->foreignId('service_request_id')
                ->nullable() // nullable temporalmente por si hay filas viejas sin este dato
                ->after('id')
                ->constrained()
                ->onDelete('cascade');

            // RF-17 CA-05: reemplaza el unique viejo (service_id + client_id, que
            // bloqueaba valorar el mismo servicio dos veces PARA SIEMPRE) por uno
            // basado en la solicitud: cada contratación completada se valora una vez.
            $table->dropUnique(['service_id', 'client_id']);
            $table->unique('service_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropUnique(['service_request_id']);
            $table->dropForeign(['service_request_id']);
            $table->dropColumn('service_request_id');
            $table->unique(['service_id', 'client_id']);
        });
    }
};