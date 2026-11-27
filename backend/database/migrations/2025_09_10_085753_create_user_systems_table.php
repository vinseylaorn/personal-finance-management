<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('user_systems', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('permission_id')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('user_systems')->onDelete('set null');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('set null');
        });
    }

    public function down() {
        Schema::dropIfExists('user_systems');
    }
};
