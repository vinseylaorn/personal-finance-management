<?php

namespace App\Http\Controllers;

use App\Models\UserSystem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersystemController extends Controller {
    // Get all UserSystems
    public function index(){
        return UserSystem::with(['permission', 'creator'])->get();
    }
    // Create UserSystem
    public function store(Request $request){
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'username' => 'required|string|unique:user_systems,username',
            'email' => 'required|email|unique:user_systems,email',
            'password' => 'required|string|min:6',
            'permission_id' => 'nullable|exists:permissions,id',
        ]);

        $creator = auth()->user()->username ?? 'Admin';

        $user = UserSystem::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'permission_id' => $request->permission_id,
            'created_by' => auth()->id(),
        ]);

        // Create Notification (Add)
        NotificationController::createNotification(
            'UserSystem Added',
            "User '{$user->first_name} {$user->last_name}' Added Successfully.\nCreated By: {$creator}\nCreated At: ".Carbon::now()->format('d F Y h:i A'),
            'Add',
            $creator
        );

        return response()->json($user->load('permission'), 201);
    }
    // Show one UserSystem
    public function show($id){
        return UserSystem::with('permission')->findOrFail($id);
    }
    // Update UserSystem
    public function update(Request $request, $id){
        $user = UserSystem::findOrFail($id);
        $oldName = $user->first_name.' '.$user->last_name;
        $username = auth()->user()->username ?? 'Admin';

        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'username' => 'required|string|unique:user_systems,username,'.$id,
            'email' => 'required|email|unique:user_systems,email,'.$id,
            'password' => 'nullable|string|min:6',
            'permission_id' => 'nullable|exists:permissions,id',
        ]);

        $data = $request->only(['first_name', 'last_name', 'username', 'email', 'permission_id']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // Create Notification (Update)
        NotificationController::createNotification(
            'UserSystem Updated',
            "User '{$oldName}' Updated to '{$user->first_name} {$user->last_name}' Successfully.\nUpdated By: {$username}\nUpdated At: ".Carbon::now()->format('d F Y h:i A'),
            'Update',
            $username
        );

        return response()->json($user->fresh()->load('permission'));
    }
    // Delete UserSystem
    public function destroy($id){
        $user = UserSystem::findOrFail($id);
        $username = auth()->user()->username ?? 'Admin';
        $fullName = $user->first_name.' '.$user->last_name;

        $user->delete();

        //Create Notification (Delete)
        NotificationController::createNotification(
            'UserSystem Deleted',
            "User '{$fullName}' Deleted.\nDeleted By: {$username}\nDeleted At: ".Carbon::now()->format('d F Y h:i A'),
            'Delete',
            $username
        );

        return response()->json(['message' => 'User deleted successfully']);
    }
}
