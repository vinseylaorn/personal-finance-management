import { ref } from 'vue'
import type { Category } from '~/types/category'

export function useCategory() {
  const apiBase = useRuntimeConfig().public.apiBase
  const API_URL = `${apiBase}/api/categories`
  const categories = ref<Category[]>([])

  // --- Helper: Get auth headers safely ---
  const getAuthHeaders = (): HeadersInit => {
    if (process.client) {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      return headers
    }
    return {}
  }

  // --- Fetch all categories ---
  async function fetchCategories() {
    try {
      const res = await $fetch<{ data: any[] }>(API_URL, { headers: getAuthHeaders() })
      const data = res.data ?? []

      categories.value = data.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        createdBy: c.createdBy ?? c.created_by ?? 'Unknown',
        createdAt: c.createdAt ?? c.created_at ?? '',
        isActive: c.isActive ?? c.is_active ?? true,
      }))

      if (process.client)
        localStorage.setItem('categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      if (process.client) {
        const saved = localStorage.getItem('categories')
        if (saved) categories.value = JSON.parse(saved)
      }
    }
  }

  // --- Add new category ---
  async function addCategory(category: Omit<Category, 'id' | 'createdBy' | 'createdAt'>) {
    try {
      const user = process.client ? JSON.parse(localStorage.getItem('user') || '{}') : null
      const username = user?.username || 'Admin'

      const res = await $fetch<Category>(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          name: category.name,
          type: category.type,
          created_by: username,
        },
      })

      // Laravel response includes createdAt & createdBy
      categories.value.unshift({
        id: res.id,
        name: res.name,
        type: res.type,
        createdBy: res.createdBy,
        createdAt: res.createdAt,
        isActive: res.isActive ?? true,
      })

      if (process.client)
        localStorage.setItem('categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('❌ Error adding category:', error)
    }
  }

  // --- Update category ---
  async function updateCategory(category: Category) {
    try {
      const res = await $fetch<Category>(`${API_URL}/${category.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: {
          name: category.name,
          type: category.type,
          created_by: category.createdBy ?? 'Admin',
        },
      })

      const index = categories.value.findIndex(c => c.id === category.id)
      if (index !== -1)
        categories.value[index] = {
          ...res,
          createdBy: res.createdBy ?? category.createdBy,
          createdAt: res.createdAt ?? category.createdAt,
          isActive: res.isActive ?? true,
        }

      if (process.client)
        localStorage.setItem('categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('❌ Error updating category:', error)
    }
  }

  // --- Delete category ---
  async function deleteCategory(id: number) {
    try {
      await $fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      categories.value = categories.value.filter(c => c.id !== id)

      if (process.client)
        localStorage.setItem('categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('❌ Error deleting category:', error)
    }
  }

  return {
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
