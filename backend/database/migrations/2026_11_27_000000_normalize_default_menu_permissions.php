<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $permission = DB::table('permissions')->where('name', 'full access')->first();
        if ($permission && json_decode($permission->actions, true) === ['create', 'read', 'update', 'delete']) {
            DB::table('permissions')->where('id', $permission->id)->update([
                'actions' => json_encode(array_fill(1, 10, ['View', 'Create', 'Edit', 'Delete'])),
            ]);
        }
    }

    public function down(): void
    {
        // Preserve permission changes made after the data repair.
    }
};
