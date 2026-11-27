<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UserSystem extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'username',
        'email',
        'password',
        'created_by',
        'permission_id',
    ];

    protected $hidden = ['password'];

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    public function creator()
    {
        return $this->belongsTo(UserSystem::class, 'created_by');
    }
}
