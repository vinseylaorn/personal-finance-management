<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'actions', 'create_by'];

    protected $casts = [
        'actions' => 'array', // ensures actions JSON is cast to array
    ];

    public function creator()
    {
        return $this->belongsTo(UserSystem::class, 'create_by');
    }
}
