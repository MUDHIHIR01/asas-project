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
        Schema::create('users', function (Blueprint $table) {
            $table->increments('user_id');
            $table->string('name');
            $table->integer('role_id')->default(2); // Changed to integer with default 2
            $table->string('status')->nullable();
            $table->string('nida')->nullable();
            $table->string('address')->nullable();
            $table->string('sex')->nullable();
            $table->string('date_of_birth')->nullable();
            $table->string('contact')->nullable();
            $table->string('auto_number')->nullable();
            $table->string('item_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
