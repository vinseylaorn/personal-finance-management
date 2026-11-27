<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserAppController;
use App\Http\Controllers\UsersystemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Login (public)
Route::post('/login', [AuthController::class, 'login']);
// Protected routes (requires sanctum token)
Route::middleware('auth:sanctum')->group(function () {

    // Current authenticated user
    Route::get('/user', [AuthController::class, 'user']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Permissions CRUD
    Route::apiResource('permissions', RolePermissionController::class);

    // System Users CRUD
    Route::apiResource('usersystem', UsersystemController::class);

    // Categories CRUD
    Route::apiResource('categories', CategoryController::class);

    // Incomes CRUD
    Route::apiResource('incomes', IncomeController::class);

    // Expenses CRUD
    Route::apiResource('expenses', ExpenseController::class);

    // Notifications CRUD
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Optional: quick current user route
    Route::get('/current-user', function (Request $request) {
        return $request->user();
    });
});

// App User Routes
Route::prefix('app')->group(function () {
    // Register & login (public)
    Route::post('register', [UserAppController::class, 'register']);
    Route::post('login', [UserAppController::class, 'login']);
    // Protected routes (User APP)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [UserAppController::class, 'profile']);
        Route::post('logout', [UserAppController::class, 'logout']);
        Route::get('users', [UserAppController::class, 'getAllUsers']);
        Route::put('users/{id}', [UserAppController::class, 'update']);
        Route::delete('/users/{id}', [UserAppController::class, 'destroy']);
    });
});
