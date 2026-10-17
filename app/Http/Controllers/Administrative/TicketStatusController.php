<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketStatusRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\TicketStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketStatusController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(100, max(10, $request->integer('per_page', 25)));

        return Inertia::render('Administrative/TicketStatus/Index', [
            'statuses' => TicketStatus::orderBy('id')->paginate($perPage)->withQueryString(),
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
