<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id('question_id'); // Primary key
            $table->unsignedBigInteger('item_id'); // Foreign key to items
            $table->json('question_category'); // JSON array for multiple categories
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('item_id')->references('item_id')->on('items')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
}