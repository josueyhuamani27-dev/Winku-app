<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');

            // pending -> accepted -> in_progress -> completed
            // alternos: rejected, cancelled, disputed
            $table->string('status')->default('pending');

            $table->string('message', 500)->nullable();       // RF-10 CA-03
            $table->string('rejection_reason')->nullable();    // RF-11 CA-03
            $table->timestamp('completed_at')->nullable();     // RF-09/RF-13

            $table->timestamps();

            // RF-10 CA-05: un cliente no puede tener dos solicitudes activas
            // para el mismo servicio. Se controla a nivel de aplicación (en el
            // controller, cuando implementemos RF-10) porque "activa" excluye
            // solo algunos estados (pending/accepted/in_progress) y un único
            // índice de BD no puede expresar esa condición parcial en SQLite.
            $table->index(['service_id', 'client_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};