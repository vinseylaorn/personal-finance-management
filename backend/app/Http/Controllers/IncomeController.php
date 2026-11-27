<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Carbon\Carbon;
use Illuminate\Http\Request;

class IncomeController extends Controller{
    // Get All Incomes
    public function index(){
        return response()->json(Income::with('category')->get(), 200);
    }
    // Create Income
    public function store(Request $request){
        $validated = $request->validate([
            'source' => 'required|string',
            'amount' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'created_by' => 'required|string',
        ]);
        $income = Income::create($validated);
        $username = $validated['created_by'] ?? 'superadmin';
        //Create Notification (Add)
        NotificationController::createNotification(
            'Income Added',
            "Income '{$income->source}' Added Successfully.\nCreated By: {$username}\nCreated At: ".Carbon::now()->format('d F Y h:i A'),
            'Add',
            $username
        );
        return response()->json($income, 201);
    }
    // Get Single Income
    public function show($id){
        return Income::with('category')->findOrFail($id);
    }
    // Update Income
    public function update(Request $request, $id){
        $income = Income::findOrFail($id);
        $oldSource = $income->source;
        $username = $request->input('updated_by') ?? 'superadmin';

        $income->update($request->all());

        //Create Notification (Update)
        NotificationController::createNotification(
            'Income Updated',
            "Income '{$oldSource}' Updated to '{$income->source}' Successfully.\nUpdated By: {$username}\nUpdated At: ".Carbon::now()->format('d F Y h:i A'),
            'Update',
            $username
        );

        return response()->json($income, 200);
    }
    // Delete Income
    public function destroy($id){
        $income = Income::findOrFail($id);
        $username = auth()->user()->username ?? 'superadmin';
        $source = $income->source;

        $income->delete();

        //Create Notification (Delete)
        NotificationController::createNotification(
            'Income Deleted',
            "Income '{$source}' Deleted.\nDeleted By: {$username}\nDeleted At: ".Carbon::now()->format('d F Y h:i A'),
            'Delete',
            $username
        );

        return response()->json(['message' => 'Income deleted successfully'], 200);
    }
}
