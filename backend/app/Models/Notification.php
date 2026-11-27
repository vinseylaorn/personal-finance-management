<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'action_type',
        'action_by',
        'action_at',
        'is_read',
    ];
}
