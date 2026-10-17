<?php

namespace App\Http\Controllers\Administrative;

use App\Enums\SlaPolicyPriority;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSlaPolicyRequest;
use App\Http\Requests\UpdateSlaPolicyRequest;
use App\Models\SlaPolicy;
use Inertia\Inertia;

class SlaPolicyController extends Controller
{
    public function index()
    {
        $policies = SlaPolicy::query()
            ->orderBy('priority')
            ->get()
            ->map(fn (SlaPolicy $policy) => [
                'id' => $policy->id,
                'name' => $policy->name,
                'priority' => $policy->priority->value,
                'priority_label' => $policy->priority->label(),
                'resolution_minutes' => $policy->resolution_minutes,
                'warning_threshold_percent' => $policy->warning_threshold_percent,
                'is_active' => $policy->is_active,
            ]);

        $priorities = SlaPolicyPriority::options();

        return Inertia::render('Administrative/SlaPolicy/Index', [
            'policies' => $policies,
            'priorities' => $priorities,
        ]);
    }

    public function store(StoreSlaPolicyRequest $request)
    {
        SlaPolicy::create($request->validated());

        return redirect()
            ->route('administrative.sla-policy.index')
            ->with('success', 'SLA policy created successfully.');
    }

    public function update(UpdateSlaPolicyRequest $request, SlaPolicy $slaPolicy)
    {
        $slaPolicy->update($request->validated());

        return redirect()
            ->route('administrative.sla-policy.index')
            ->with('success', 'SLA policy updated successfully.');
    }

    public function destroy(SlaPolicy $slaPolicy)
    {
        $slaPolicy->delete();

        return redirect()
            ->route('administrative.sla-policy.index')
            ->with('success', 'SLA policy deleted successfully.');
    }
}
