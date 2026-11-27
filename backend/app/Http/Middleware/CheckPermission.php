<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission {
    public function handle(Request $request, Closure $next, string $menuId, string $action): Response {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // safely get user actions
        $actions = optional($user->permission)->actions ?? [];

        if (! isset($actions[$menuId]) || ! in_array($action, $actions[$menuId])) {
            return response()->json([
                'message' => 'Unauthorized: Missing "'.$action.'" permission for menu '.$menuId,
            ], 403);
        }

        return $next($request);
    }
}
