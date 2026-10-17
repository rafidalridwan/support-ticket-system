<?php

namespace Database\Seeders;

use App\Models\TicketStatus;
use Illuminate\Database\Seeder;

class TicketStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'Open', 'value' => 'open', 'is_close' => false],
            ['name' => 'In Progress', 'value' => 'in_progress', 'is_close' => false],
            ['name' => 'Waiting for Customer', 'value' => 'waiting_for_customer', 'is_close' => false],
            ['name' => 'Resolved', 'value' => 'resolved', 'is_close' => true],
            ['name' => 'Closed', 'value' => 'closed', 'is_close' => true],
        ];

        foreach ($statuses as $status) {
            TicketStatus::updateOrCreate(
                ['value' => $status['value']],
                $status
            );
        }
    }
}
