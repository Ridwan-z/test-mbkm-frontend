<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('venue');
            $table->datetime('start_datetime');
            $table->datetime('end_datetime');
            $table->enum('status', ['draft', 'published', 'cancelled'])->default('draft');
            $table->string('image_url')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('max_participants')->nullable();
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['status', 'start_datetime']);
            $table->index(['organizer_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
};
