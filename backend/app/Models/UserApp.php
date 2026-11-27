<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class UserApp extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'users_app';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'gender',
        'role',
        'image',
        'created_by',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Get the user who created this App User
     */
    public function creator()
    {
        return $this->belongsTo(UserApp::class, 'created_by');
    }
}
