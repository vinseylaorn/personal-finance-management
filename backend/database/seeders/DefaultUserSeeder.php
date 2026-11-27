<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\UserSystem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUserSeeder extends Seeder
{
    public function run(): void
    {
        $permission = Permission::updateOrCreate(
            ['name' => 'full access'],
            [
                'description' => 'User has all permissions',
                'actions' => array_fill(1, 10, ['View', 'Create', 'Edit', 'Delete']),
            ]
        );

        UserSystem::updateOrCreate(
            ['username' => 'supperadmin'],
            [
                'first_name' => 'Supper',
                'last_name' => 'Admin',
                'email' => 'supperadmin@gmail.com',
                'password' => Hash::make('supperadmin@123'),
                'created_by' => '1',
                'permission_id' => $permission->id,
            ]
        );
    }
}
