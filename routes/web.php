<?php

use App\Http\Controllers\Administrative\AuthController;
use App\Http\Controllers\Administrative\BusinessHourDayController;
use App\Http\Controllers\Administrative\HomeController;
use App\Http\Controllers\Administrative\PermissionController;
use App\Http\Controllers\Administrative\RoleController;
use App\Http\Controllers\Administrative\SlaPolicyController;
use App\Http\Controllers\Administrative\TicketCategoryController;
use App\Http\Controllers\Administrative\TicketStatusController;
use App\Http\Controllers\Administrative\TicketController;
use App\Http\Controllers\Administrative\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/administrative/dashboard');

Route::get('login', [AuthController::class, 'create'])->name('login');
Route::post('login', [AuthController::class, 'store']);

Route::middleware('auth')->prefix('administrative')->name('administrative.')->group(function () {
    Route::get('/dashboard', [HomeController::class, 'index'])->name('dashboard');
    Route::get('logout', [AuthController::class, 'destroy'])->name('logout');

    Route::resource('/permission', PermissionController::class)->except(['show', 'create', 'edit']);
    Route::resource('/role', RoleController::class)->except(['show', 'create', 'edit']);

    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::post('/{user}', [UserController::class, 'update'])->name('update');
        Route::post('/{user}/status', [UserController::class, 'updateStatus'])->name('status');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sla-policy')->name('sla-policy.')->group(function () {
        Route::get('/', [SlaPolicyController::class, 'index'])->name('index');
        Route::post('/', [SlaPolicyController::class, 'store'])->name('store');
        Route::put('/{slaPolicy}', [SlaPolicyController::class, 'update'])->name('update');
        Route::delete('/{slaPolicy}', [SlaPolicyController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('ticket-status')->name('ticket-status.')->group(function () {
        Route::get('/', [TicketStatusController::class, 'index'])->name('index');
        Route::post('/', [TicketStatusController::class, 'store'])->name('store');
        Route::put('/{ticketStatus}', [TicketStatusController::class, 'update'])->name('update');
        Route::delete('/{ticketStatus}', [TicketStatusController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('ticket-category')->name('ticket-category.')->group(function () {
        Route::get('/', [TicketCategoryController::class, 'index'])->name('index');
        Route::post('/', [TicketCategoryController::class, 'store'])->name('store');
        Route::put('/{ticketCategory}', [TicketCategoryController::class, 'update'])->name('update');
        Route::delete('/{ticketCategory}', [TicketCategoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('ticket')->name('ticket.')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('index');
        Route::post('/', [TicketController::class, 'store'])->name('store');
    });

    Route::prefix('business-hour')->name('business-hour.')->group(function () {
        Route::get('/', [BusinessHourDayController::class, 'edit'])->name('edit');
        Route::put('/', [BusinessHourDayController::class, 'update'])->name('update');
    });
});
