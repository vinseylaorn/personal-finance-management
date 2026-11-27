import { useUserStore } from '~/store/user'
import { ref, onMounted } from 'vue'
import type { Permission } from '~/types/permission'

const API_PERMISSION_URL = process.client
  ? 'http://localhost:8000/api/permissions'
  : '/api/permissions'

export function useRolePermission() {
  const permissions = ref<Permission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const user = useUserStore() 

  const getToken = () => (process.client ? localStorage.getItem('token') || '' : '')
  const getAuthHeaders = () => {
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  // 🔹 Fetch all permissions
  const fetchPermissions = async () => {
    try {
      loading.value = true
      const res = await $fetch<Permission[]>(API_PERMISSION_URL, { headers: getAuthHeaders() })
      permissions.value = res
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to fetch permissions'
    } finally {
      loading.value = false
    }
  }

  // 🔹 CRUD functions
  const createPermission = async (payload: Partial<Permission>) => {
    const res = await $fetch<Permission>(API_PERMISSION_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    })
    permissions.value.push(res)
    return res
  }

  const updatePermission = async (id: number, payload: Partial<Permission>) => {
    const res = await $fetch<Permission>(`${API_PERMISSION_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: payload,
    })
    const index = permissions.value.findIndex(p => p.id === id)
    if (index !== -1) permissions.value[index] = res
    return res
  }

  const deletePermission = async (id: number) => {
    await $fetch(`${API_PERMISSION_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    permissions.value = permissions.value.filter(p => p.id !== id)
  }

  /**
   * Check if the current user can perform an action on a menu
   * @param menuId - the menu identifier
   * @param action - the action string ('Create', 'Update', 'Delete', etc.)
   */// your user store
  function can(menuId: number, action: 'view' | 'create' | 'edit' | 'delete') {
  const permissions = user.user?.permission?.actions?.[menuId] || []
  return permissions.map(p => p.toLowerCase()).includes(action)
}


  onMounted(fetchPermissions)

  return {
    permissions,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    loading,
    error,
    can,
  }
}
