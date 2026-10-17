<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketStatusRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\TicketStatus;
use Inertia\Inertia;

class TicketStatusController extends Controller
{
    public function index()
    {
        return Inertia::render('Administrative/TicketStatus/Index', [
            'statuses' => TicketStatus::orderBy('id')->get(),
        ]);
    }

    public function store(StoreTicketStatusRequest $request)
    {
        TicketStatus::create($request->validated());

        return redirect()
            ->route('administrative.ticket-status.index')
            ->with('success', 'Ticket status created successfully.');
    }

    public function update(UpdateTicketStatusRequest $request, TicketStatus $ticketStatus)
    {
        $ticketStatus->update($request->validated());

        return redirect()
            ->route('administrative.ticket-status.index')
            ->with('success', 'Ticket status updated successfully.');
    }

    public function destroy(TicketStatus $ticketStatus)
    {
        $ticketStatus->delete();

        return redirect()
            ->route('administrative.ticket-status.index')
            ->with('success', 'Ticket status deleted successfully.');
    }
}
