<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Administrative/Dashboard');
    }
}
