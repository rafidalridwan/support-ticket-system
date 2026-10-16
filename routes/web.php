<?php

use App\Http\Controllers\Administrative\AuthController;
use App\Http\Controllers\Administrative\HomeController;
use App\Http\Controllers\Administrative\PermissionController;
use App\Http\Controllers\Administrative\RoleController;
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
});
