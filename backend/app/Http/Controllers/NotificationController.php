<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Carbon\Carbon;

class NotificationController extends Controller {
    // Create Notification
    public static function createNotification($title, $message, $type, $createdBy){
        $now = Carbon::now('Asia/Phnom_Penh'); //timezone in cambodia
        Notification::create([
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'created_by' => $createdBy,
            'created_at' => $now,
            'is_read' => false,
        ]);
    }

    // Get All Notifications
    public function index(){
        $notifications = Notification::orderBy('id', 'desc')->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'createdBy' => $n->created_by,
                'createdAt' => Carbon::parse($n->created_at)
                    ->timezone('Asia/Phnom_Penh')
                    ->format('d F Y h:i A'),
                'isRead' => (bool) $n->is_read,
            ];
        });

        return response()->json(['data' => $notifications]);
    }

    //Mark notification as read
    public function markAsRead($id){
        $notification = Notification::find($id);
        if (! $notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }
}
