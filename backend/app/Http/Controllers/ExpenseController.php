<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExpenseController extends Controller{
    // Get All Expenses
    public function index(){
        return response()->json(Expense::with('category')->get(), 200);
    }
    // Create Expense   
    public function store(Request $request){
        $validated = $request->validate([
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'created_by' => 'required|string',
        ]);

        $expense = Expense::create($validated);
        $username = $validated['created_by'] ?? 'superadmin';

        //Create Notification (Add)
        NotificationController::createNotification(
            'Expense Added',
            "Expense '{$expense->description}' Added Successfully.\nCreated By: {$username}\nCreated At: ".Carbon::now()->format('d F Y h:i A'),
            'Add',
            $username
        );

        return response()->json($expense, 201);
    }
    // Get Single Expense
    public function show($id){
        return Expense::with('category')->findOrFail($id);
    }
    // Update Expense
    public function update(Request $request, $id){
        $expense = Expense::findOrFail($id);
        $oldDescription = $expense->description;
        $username = $request->input('updated_by') ?? 'superadmin';

        $expense->update($request->all());

        //Create Notification (Update)
        NotificationController::createNotification(
            'Expense Updated',
            "Expense '{$oldDescription}' Updated to '{$expense->description}' Successfully.\nUpdated By: {$username}\nUpdated At: ".Carbon::now()->format('d F Y h:i A'),
            'Update',
            $username
        );

        return response()->json($expense, 200);
    }
    // Delete Expense
    public function destroy($id){
        $expense = Expense::findOrFail($id);
        $username = auth()->user()->username ?? 'superadmin';
        $desc = $expense->description;

        $expense->delete();

        //Create Notification (Delete)
        NotificationController::createNotification(
            'Expense Deleted',
            "Expense '{$desc}' Deleted.\nDeleted By: {$username}\nDeleted At: ".Carbon::now()->format('d F Y h:i A'),
            'Delete',
            $username
        );

        return response()->json(['message' => 'Expense deleted successfully'], 200);
    }
}
