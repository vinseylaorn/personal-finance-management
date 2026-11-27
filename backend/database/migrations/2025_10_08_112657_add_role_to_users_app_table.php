<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('app_user');
        });

    }

    public function down(): void {
        Schema::table('users_app', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
