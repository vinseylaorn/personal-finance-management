<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->json('actions')->nullable();
            $table->unsignedBigInteger('create_by')->nullable();
            $table->timestamps();

            $table->foreign('create_by')->references('id')->on('user_systems')->onDelete('set null');
        });
    }

    public function down(){
        Schema::dropIfExists('permissions');
    }
};
