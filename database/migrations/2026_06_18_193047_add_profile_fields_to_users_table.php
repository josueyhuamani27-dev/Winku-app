<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable(); // Aquí guardaremos la ruta de la foto
            $table->text('description')->nullable();
            $table->string('career')->nullable();
            $table->string('semester')->nullable();
            $table->string('skills')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'description', 'career', 'semester', 'skills']);
        });
    }
};