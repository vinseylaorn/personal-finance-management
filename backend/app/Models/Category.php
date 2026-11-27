<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model {
    use HasFactory;
    // Define fillable fields
    protected $fillable = ['name', 'type', 'created_by'];
    // Relationships
    public function incomes(){
        return $this->hasMany(Income::class);
    }
    // Relationships
    public function expenses(){
        return $this->hasMany(Expense::class);
    }
}
