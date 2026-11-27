<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'usersystem',
    ],
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'usersystem',
        ],
        'api' => [
            'driver' => 'sanctum', // This is required for token auth
            'provider' => 'usersystem',
        ],
    ],
    'providers' => [
        'usersystem' => [
            'driver' => 'eloquent',
            'model' => App\Models\UserSystem::class,
        ],
    ],
    'passwords' => [
        'usersystem' => [
            'provider' => 'usersystem',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    'password_timeout' => 10800,
];