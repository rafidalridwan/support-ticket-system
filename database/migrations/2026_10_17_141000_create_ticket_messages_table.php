<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('type', 20);
            $table->text('body');
            $table->enum('reply_type', ['reply', 'internal_note'])->default('reply');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['ticket_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
