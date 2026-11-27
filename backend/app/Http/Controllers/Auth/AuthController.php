<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    // Login
    public function login(Request $request){
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Load 'permission' relation (1-to-1 or belongsTo)
        $user = UserSystem::with('permission')->where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid username or password'], 401);
        }

        // Generate new token
        $token = $user->createToken('auth_token')->plainTextToken;

        //Convert JSON field "actions" to object (auto decode)
        if ($user->permission && is_string($user->permission->actions)) {
            $user->permission->actions = json_decode($user->permission->actions, true);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Get Authenticated User
    public function user(Request $request){
        $user = $request->user()->load('permission');

        //Decode actions JSON
        if ($user->permission && is_string($user->permission->actions)) {
            $user->permission->actions = json_decode($user->permission->actions, true);
        }

        return response()->json($user, 200);
    }

    // Logout
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    // Refresh Token
    public function refresh(Request $request){
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->permission && is_string($user->permission->actions)) {
            $user->permission->actions = json_decode($user->permission->actions, true);
        }

        return response()->json([
            'message' => 'Token refreshed successfully',
            'token' => $token,
            'user' => $user->load('permission'),
        ], 200);
    }
}
