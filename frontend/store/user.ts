import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  email?: string
  permission?: {
    id: number
    name: string
    actions?: Record<string, string[]> // menu_label -> array of allowed actions
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    setUser(user: User) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    loadUser() {
      const saved = localStorage.getItem('user')
      if (saved) this.user = JSON.parse(saved)
    },
    clearUser() {
      this.user = null
      localStorage.removeItem('user')
    },
  },
  
})
