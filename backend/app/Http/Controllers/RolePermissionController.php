<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;

class RolePermissionController extends Controller {
    // List all permissions
    public function index(){
        try {
            return Permission::with('creator')->get();
        } catch (\Exception $e) {
            \Log::error('Failed to fetch permissions: '.$e->getMessage());

            return response()->json(['message' => 'Failed to fetch permissions'], 500);
        }
    }

    // Create a new permission
    public function store(Request $request){
        $request->validate([
            'name' => 'required|unique:permissions,name',
            'description' => 'nullable|string',
            'actions' => 'nullable|array',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'description' => $request->description,
            'actions' => $request->actions ?? [],
            'create_by' => auth()->id(),
        ]);

        return response()->json($permission->load('creator'), 201);
    }

    // Show one permission
    public function show($id){
        return Permission::with('creator')->findOrFail($id);
    }

    // Update permission
    public function update(Request $request, $id){
        $permission = Permission::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:permissions,name,'.$id,
            'description' => 'nullable|string',
            'actions' => 'nullable|array',
        ]);

        $permission->update([
            'name' => $request->name,
            'description' => $request->description,
            'actions' => $request->actions ?? [],
        ]);

        return response()->json($permission->fresh(), 200);
    }

    // Delete permission
    public function destroy($id){
        $permission = Permission::findOrFail($id);
        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully'], 200);
    }
}
