<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->string('subject');
            $table->text('description');
            $table->string('unique_key', 6)->nullable();
            $table->foreignId('created_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();

            $table->foreignId('category_id')
                ->constrained('ticket_categories')
                ->restrictOnDelete();
            $table->unsignedTinyInteger('priority');
            $table->foreignId('status_id')
                ->constrained('ticket_statuses')
                ->restrictOnDelete();

            $table->foreignId('sla_policy_id')
                ->nullable()
                ->constrained('sla_policies')
                ->nullOnDelete();
            $table->timestamp('sla_started_at')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('sla_warning_at')->nullable();
            $table->timestamp('sla_warning_sent_at')->nullable();
            $table->unsignedInteger('sla_minutes')->nullable();
            $table->timestamp('sla_breached_at')->nullable();

            $table->boolean('is_escalated')->default(false);
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['assigned_to', 'status_id']);
            $table->index(['created_by', 'created_at']);
            $table->index(['status_id', 'sla_due_at']);
            $table->index(['status_id', 'sla_warning_at']);
            $table->index(['status_id', 'priority']);
            $table->index(['category_id', 'status_id']);
            $table->index(['status_id', 'assigned_to', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
