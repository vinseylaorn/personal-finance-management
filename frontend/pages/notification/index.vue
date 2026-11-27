<template>
   <div>
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Notifications...
      </div>
      <div v-else-if="!notifications.length" class="rounded-2xl border border-gray-300 py-14 text-center text-gray-700">
         <Icon icon="mdi:bell-outline" class="mx-auto mb-3 h-7 w-7" />
         <p class="font-medium">No notifications yet</p>
      </div>
      <!-- Notification Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         <div v-for="notification in notifications" :key="notification.id"
            class="rounded-2xl border border-gray-300 p-6 shadow-lg transition hover:shadow-xl">
            <!-- Title -->
            <p class="font-semibold text-xl mb-2 text-black">{{ notification.title }}</p>
            <!-- Message WITHOUT Created At / Updated At, with colored Created/Updated/Deleted By -->
            <p class="text-sm whitespace-pre-line mb-4">
               <span v-for="(line, index) in formatMessage(notification)" :key="index"
                  :class="getActionTextClass(line, notification)">
                  {{ line }}<br />
               </span>
            </p>
            <!-- Inline Mark as Read / Timestamp -->
            <div class="flex justify-between items-center mt-2 text-xs">
               <button v-if="!notification.is_read"
                  class="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
                  @click="markAsRead(notification.id)">
                  Mark as Read
               </button>
               <span v-else class="text-gray-800 rounded bg-blue-200 text-sm font-semibold px-4 py-1">
                  Read
               </span>
               <p class="text-gray-700">{{ notification.action_at }}</p>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useNotification } from '~/composables/useNotification'
import { useDashboardTitle } from '~/composables/useDashboardTitle'
definePageMeta({ layout: 'admin' })
const title = useDashboardTitle()
title.value = 'Notifications'

const { notifications, loading, fetchNotifications, markAsRead } = useNotification()
onMounted(() => {
   fetchNotifications()
})
// Format message: remove Created At / Updated At / Deleted At
const formatMessage = (notification: any) => {
   if (!notification.message) return []
   return notification.message
      .split('\n')
      .filter((line: string) => !line.match(/Created At|Updated At|Deleted At/))
}
// Return Tailwind class object for Created/Updated/Deleted By
const getActionTextClass = (line: string, notification: any) => {
   if (!line.match(/Created By|Updated By|Deleted By/)) return { 'text-black': true }

   switch (notification.action_type?.toLowerCase()) {
      case 'add':
         return { 'text-blue-700': true, 'font-semibold': true }
      case 'update':
         return { 'text-green-700': true, 'font-semibold': true }
      case 'delete':
         return { 'text-red-700': true, 'font-semibold': true }
      default:
         return { 'text-black': true }
   }
}
</script>
