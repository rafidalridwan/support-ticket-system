<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->cascadeOnDelete();
            $table->foreignId('message_id')
                ->nullable()
                ->constrained('ticket_messages')
                ->cascadeOnDelete();
            $table->foreignId('uploaded_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('path', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->timestamp('created_at')->useCurrent();
            $table->softDeletes();

            $table->index('ticket_id');
            $table->index('message_id');
            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_attachments');
    }
};
