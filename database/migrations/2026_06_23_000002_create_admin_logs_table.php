<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CA-04: Tabla de log de acciones del administrador
        Schema::create('admin_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('action');        // Ej: 'suspend_user', 'delete_service'
            $table->string('target_type');   // Ej: 'user', 'service'
            $table->unsignedBigInteger('target_id'); // ID del recurso afectado
            $table->text('description')->nullable(); // Detalle legible
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }
};