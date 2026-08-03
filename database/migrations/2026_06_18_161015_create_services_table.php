<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('services', function (Blueprint $table) {
        $table->id();
        // Conectamos el servicio con el usuario que lo creó
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Datos del servicio/producto
        $table->string('title');
        $table->string('category');
        $table->text('description');
        $table->decimal('price', 8, 2); // Permite precios como S/. 45.50
        $table->string('status')->default('active'); // active o inactive
        
        $table->timestamps(); // Crea 'created_at' y 'updated_at' automáticamente
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
