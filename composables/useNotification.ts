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
  const notifications: Ref<Notification[]> = ref([])
  const loading = ref(false)
  const auth = useAuth()

  const API_BASE = 'http://127.0.0.1:8000'

  // ✅ Fetch Notifications
  const fetchNotifications = async () => {
    if (!auth.token.value) return
    loading.value = true
    try {
      const res = await $fetch<{ data: any[] }>(`${API_BASE}/api/notifications`, {
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
      await $fetch(`${API_BASE}/api/notifications/${id}/read`, {
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
