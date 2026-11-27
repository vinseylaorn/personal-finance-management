import { ref, type Ref } from 'vue'
import { useAuth } from './useAuth'

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  action_by: string
  action_at: string
  is_read: boolean
}

export const useNotification = () => {
  const apiBase = useRuntimeConfig().public.apiBase
  const notifications: Ref<Notification[]> = ref([])
  const loading = ref(false)
  const auth = useAuth()

  // ✅ Fetch Notifications
  const fetchNotifications = async () => {
    if (!auth.token.value) return
    loading.value = true
    try {
      const res = await $fetch<{ data: any[] }>(`${apiBase}/api/notifications`, {
        headers: { Authorization: `Bearer ${auth.token.value}` },
      })
      notifications.value = res.data.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        action_by: n.createdBy,
        action_at: n.createdAt,
        is_read: n.isRead,
      }))
    } catch (err) {
      console.error('❌ Failed to load notifications:', err)
    } finally {
      loading.value = false
    }
  }

  // ✅ Mark as Read
  const markAsRead = async (id: number) => {
    if (!auth.token.value) return
    try {
      await $fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token.value}` },
      })
      notifications.value = notifications.value.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      )
    } catch (err) {
      console.error('❌ Failed to mark as read:', err)
    }
  }

  return { notifications, loading, fetchNotifications, markAsRead }
}
