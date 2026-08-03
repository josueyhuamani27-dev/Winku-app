<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rating_id')->constrained()->onDelete('cascade');
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            // CA-01: categoría del motivo
            $table->string('reason'); // Spam | Contenido ofensivo | Información falsa | Otro
            $table->string('details', 255)->nullable(); // obligatorio solo si reason = "Otro"
            $table->string('status')->default('pending'); // pending | resolved
            $table->timestamps();

            // Un mismo usuario no puede reportar la misma reseña dos veces
            $table->unique(['rating_id', 'reporter_id']);
        });

        // CA-02: columna para ocultar la reseña cuando llega a 3+ reportes
        Schema::table('ratings', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('comment');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn('is_hidden');
        });
        Schema::dropIfExists('reports');
    }
};