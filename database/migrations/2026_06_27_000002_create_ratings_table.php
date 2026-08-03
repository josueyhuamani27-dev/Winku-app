<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            // CA-01: Puntuación de 1 a 5
            $table->unsignedTinyInteger('rating');
            // CA-02: Comentario opcional máx 500 caracteres
            $table->string('comment', 500)->nullable();
            // Relaciones
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // CA-04: Un cliente solo puede valorar una vez por servicio
            $table->unique(['service_id', 'client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
