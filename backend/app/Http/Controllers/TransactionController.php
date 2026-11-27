<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller {
    // Get All Transactions
    public function index(){
        return Transaction::all();
    }
    // Create Transaction
    public function store(Request $request){
        $data = $request->validate([
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $transaction = Transaction::create($data);

        return response()->json($transaction, 201);
    }
    // Get Single Transaction
    public function update(Request $request, $id){
        $transaction = Transaction::findOrFail($id);
        $transaction->update($request->all());

        return response()->json(['message' => 'Updated successfully']);
    }
    // Delete Transaction
    public function destroy($id){
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
