import { ref, onMounted } from 'vue'
import { useUserStore, type User } from '~/store/user'

export const useAuth = () => {
  const userStore = useUserStore()
  const token = ref('')

  // Only access localStorage on client
  onMounted(() => {
    token.value = localStorage.getItem('token') || ''
  })

  const login = async (data: { username: string; password: string }) => {
    const res = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Invalid credentials')
    }

    const loginData: { token: string; user: User } = await res.json()
    
    // Only set localStorage on client
    if (process.client) {
      localStorage.setItem('token', loginData.token)
    }
    token.value = loginData.token

    if (loginData.user.permission) {
      const actions = loginData.user.permission.actions
      loginData.user.permission.actions = Array.isArray(actions)
        ? { all: actions }
        : actions || {}
    }

    userStore.setUser(loginData.user)
    return loginData
  }

  const fetchUser = async () => {
    if (!token.value) throw new Error('No token found')

    const user = await $fetch<User>('http://localhost:8000/api/user', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (user.permission) {
      const actions = user.permission.actions
      user.permission.actions = Array.isArray(actions)
        ? { all: actions }
        : actions || {}
    }

    userStore.setUser(user)
    return user
  }

  const logout = async () => {
    if (!token.value) return

    await $fetch('http://localhost:8000/api/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (process.client) {
      localStorage.removeItem('token')
    }
    token.value = ''
    userStore.clearUser()
  }

  const isLoggedIn = () => !!token.value && !!userStore.user

  return { login, fetchUser, logout, isLoggedIn, token }
}
