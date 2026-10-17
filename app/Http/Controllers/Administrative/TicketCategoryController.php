<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketCategoryRequest;
use App\Http\Requests\UpdateTicketCategoryRequest;
use App\Models\TicketCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(100, max(10, $request->integer('per_page', 25)));

        return Inertia::render('Administrative/TicketCategory/Index', [
            'categories' => TicketCategory::orderBy('name')->paginate($perPage)->withQueryString(),
        ]);
    }

    public function store(StoreTicketCategoryRequest $request)
    {
        TicketCategory::create($request->validated());

        return redirect()
            ->route('administrative.ticket-category.index')
            ->with('success', 'Ticket category created successfully.');
    }

    public function update(UpdateTicketCategoryRequest $request, TicketCategory $ticketCategory)
    {
        $ticketCategory->update($request->validated());

        return redirect()
            ->route('administrative.ticket-category.index')
            ->with('success', 'Ticket category updated successfully.');
    }

    public function destroy(TicketCategory $ticketCategory)
    {
        $ticketCategory->delete();

        return redirect()
            ->route('administrative.ticket-category.index')
            ->with('success', 'Ticket category deleted successfully.');
    }
}
