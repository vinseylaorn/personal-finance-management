// ~/composables/user/useUserSystem.ts
import { ref, onMounted } from 'vue'
import type { UserSystem } from '~/types/users/user'
import type { Permission } from '~/types/permission'

const API_URL = 'http://127.0.0.1:8000/api/usersystem'
const API_USER_URL = 'http://127.0.0.1:8000/api/user'

export function useUserSystem() {
  const users = ref<UserSystem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loggedInUserId = ref<number | null>(null)

  // ✅ Token helper
  const getToken = (): string => (process.client ? localStorage.getItem('token') || '' : '')
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  // ✅ Fetch current logged-in user
  const fetchCurrentUser = async () => {
    try {
      const token = getToken()
      if (!token) throw new Error('No token found')
      const user = await $fetch<{ id: number }>(API_USER_URL, { headers: getAuthHeaders() })
      loggedInUserId.value = user.id
    } catch (err) {
      console.error('Cannot fetch current user', err)
      loggedInUserId.value = null
    }
  }

  // ✅ Fetch all users (include permission info)
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<any[]>(API_URL, { headers: getAuthHeaders() })

      users.value = res.map(u => ({
        id: Number(u.id),
        firstName: u.first_name,
        lastName: u.last_name,
        username: u.username,
        email: u.email,
        createdBy: u.created_by ? Number(u.created_by) : null,
        createdAt: u.created_at,
        // ✅ Include permission info safely
        permission: u.permission
          ? ({
              id: Number(u.permission.id),
              name: u.permission.name,
              description: u.permission.description,
              created_at: u.permission.created_at,
              actions: typeof u.permission.actions === 'object' ? u.permission.actions : {},
            } as Permission)
          : null,
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  // ✅ Add new user (with permission)
  const addUser = async (user: {
    firstName: string
    lastName: string
    username: string
    email: string
    pass: string
    permissionId?: number
    createdBy?: number
  }) => {
    const payload = {
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      email: user.email,
      password: user.pass,
      created_by: (user.createdBy ?? loggedInUserId.value ?? 1).toString(),
      permission_id: user.permissionId ?? null,
    }

    try {
      const res = await $fetch<any>(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload,
      })

      users.value.unshift({
        id: Number(res.id),
        firstName: res.first_name,
        lastName: res.last_name,
        username: res.username,
        email: res.email,
        createdBy: res.created_by ? Number(res.created_by) : null,
        createdAt: res.created_at,
        permission: res.permission
          ? ({
              id: Number(res.permission.id),
              name: res.permission.name,
              description: res.permission.description,
              actions: res.permission.actions ?? {},
            } as Permission)
          : null,
      })
    } catch (err: any) {
      console.error('Add user failed:', err)
      if (err?.data?.errors) console.error('Validation errors:', err.data.errors)
      throw err
    }
  }

  // ✅ Update existing user (with permission)
  const updateUser = async (user: {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    pass?: string
    permissionId?: number
    createdBy?: number
  }) => {
    const payload: any = {
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      email: user.email,
    }
    if (user.pass) payload.password = user.pass
    if (user.createdBy !== undefined) payload.created_by = user.createdBy
    if (user.permissionId !== undefined) payload.permission_id = user.permissionId

    try {
      const res = await $fetch<any>(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: payload,
      })

      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index] = {
          id: Number(res.id),
          firstName: res.first_name,
          lastName: res.last_name,
          username: res.username,
          email: res.email,
          createdBy: res.created_by ? Number(res.created_by) : null,
          createdAt: res.created_at,
          permission: res.permission
            ? ({
                id: Number(res.permission.id),
                name: res.permission.name,
                description: res.permission.description,
                actions: res.permission.actions ?? {},
              } as Permission)
            : null,
        }
      }
    } catch (err: any) {
      console.error('Update user failed:', err)
      throw err
    }
  }

  // ✅ Delete user
  const deleteUser = async (id: number) => {
    try {
      await $fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      users.value = users.value.filter(u => u.id !== id)
    } catch (err: any) {
      console.error('Delete user failed:', err)
      throw err
    }
  }

  onMounted(() => {
    fetchCurrentUser()
    fetchUsers()
  })

  return {
    users,
    loading,
    error,
    loggedInUserId,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    getToken,
    getAuthHeaders,
    fetchCurrentUser,
  }
}
