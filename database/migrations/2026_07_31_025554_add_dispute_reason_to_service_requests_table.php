<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            // RF-09/RF-13 CA-05: motivo que el cliente da al abrir una disputa
            // en lugar de confirmar la entrega. Distinto de rejection_reason
            // (que es del proveedor al rechazar la solicitud en RF-11).
            $table->string('dispute_reason', 500)->nullable()->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn('dispute_reason');
        });
    }
};
