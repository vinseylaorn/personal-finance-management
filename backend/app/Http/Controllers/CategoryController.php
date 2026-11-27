<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller {
    //Get All Categories
    public function index(){
        $categories = Category::orderBy('id', 'desc')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
                'createdBy' => $category->created_by,
                'createdAt' => Carbon::parse($category->created_at)->format('d F Y h:i A'),
                'isActive' => $category->is_active ?? true,
            ];
        });

        return response()->json(['data' => $categories]);
    }

    // Create Category
    public function store(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);

        $username = Auth::user()->username ?? 'superadmin';
        $now = Carbon::now();

        $category = Category::create([
            'name' => $request->name,
            'type' => $request->type,
            'created_by' => $username, 
            'created_at' => $now,        
            'is_active' => true,
        ]);

        //Notification for Add
        NotificationController::createNotification(
            'Category Added',
            "Category '{$category->name}' added successfully.\nCreated By: {$username}\nCreated At: ".$now->format('d F Y h:i A'),
            'Add',
            $username
        );

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'type' => $category->type,
            'createdBy' => $category->created_by,
            'createdAt' => $now->format('d F Y h:i A'),
            'isActive' => $category->is_active,
        ], 201);
    }

    //Show Single Category
    public function show($id){
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'type' => $category->type,
            'createdBy' => $category->created_by,
            'createdAt' => Carbon::parse($category->created_at)->format('d F Y h:i A'),
            'isActive' => $category->is_active ?? true,
        ]);
    }

    // Update Category
    public function update(Request $request, $id){
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);

        $oldName = $category->name;
        $username = Auth::user()->username ?? 'superadmin';
        $now = Carbon::now();

        $category->update([
            'name' => $request->name,
            'type' => $request->type,
        ]);

        //Notification for Update
        NotificationController::createNotification(
            'Category Updated',
            "Category '{$oldName}' updated to '{$request->name}'.\nUpdated By: {$username}\nUpdated At: ".$now->format('d F Y h:i A'),
            'Update',
            $username
        );

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'type' => $category->type,
            'createdBy' => $category->created_by,
            'createdAt' => Carbon::parse($category->created_at)->format('d F Y h:i A'),
            'isActive' => $category->is_active ?? true,
        ]);
    }

    // DELETE Category
    public function destroy($id){
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $categoryName = $category->name;
        $username = Auth::user()->username ?? 'superadmin';
        $now = Carbon::now();

        $category->delete();

        //Notification for Delete
        NotificationController::createNotification(
            'Category Deleted',
            "Category '{$categoryName}' deleted.\nDeleted By: {$username}\nDeleted At: ".$now->format('d F Y h:i A'),
            'Delete',
            $username
        );

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
