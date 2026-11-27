<?php

namespace App\Http\Controllers;

use App\Models\UserApp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserAppController extends Controller {
    // Register User App
    public function register(Request $request){
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users_app',
            'password' => 'required|string|min:6|confirmed',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|in:Male,Female',
            'image' => 'nullable',
            'created_by' => 'nullable|integer', // allow any integer
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('user_images', 'public');
        } elseif ($request->filled('image')) {
            $imagePath = $request->image;
        }

        $user = UserApp::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'role' => 'app_user',
            'image' => $imagePath,
            'created_by' => $request->created_by ?? null,
        ]);

        $token = $user->createToken('android-app-token')->plainTextToken;

        return response()->json([
            'message' => 'Register successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // Login User App
    public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = UserApp::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('android-app-token')->plainTextToken;
        $user->load('creator');

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }
    // Profile User App
    public function profile(Request $request){
        $request->user()->load('creator');
        return response()->json($request->user());
    }

    // Logout User App
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Get all Users App
    public function getAllUsers(){
        $users = UserApp::with('creator')->orderBy('id', 'desc')->get();
        return response()->json($users);
    }

    // Update User App
    public function update(Request $request, $id){
        $user = UserApp::findOrFail($id);
        $user->update($request->all());
        return response()->json($user);
    }

    // Delete User App
    public function destroy($id) {
        $user = UserApp::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

}
