<template>
  <aside class="fixed top-0 left-0 text-white h-full w-60 bg-gray-700 text-[#0c2340] flex flex-col overflow-y-auto">
    <!-- Logo -->
    <div class="py-4.5 flex items-center justify-center border-b border-gray-300">
      <h1 class="text-3xl font-extrabold uppercase tracking-widest bg-clip-text text-transparent
               bg-gradient-to-r from-blue-400 via-purple-200 to-pink-400 drop-shadow-lg">
        FINANCE
      </h1>
    </div>
    <!-- Navigation -->
    <nav class="flex-1 mt-4">
      <ul class="flex flex-col">
        <li v-for="item in filteredMenus" :key="item.label">
          <NuxtLink :to="item.to"
            class="flex items-center justify-between px-6 py-3 mx-4 my-1 rounded-lg transition-colors duration-300"
            exact-active-class="bg-blue-800 text-white font-semibold border-l-5 border-blue-400">
            <div class="flex items-center gap-3">
              <Icon :icon="item.icon" class="w-6 h-6" />
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <div class="p-6 border-t border-gray-300">
      <button @click="showLogoutModal = true"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors duration-300">
        <Icon icon="mdi:logout" class="w-5 h-5" />
        Log Out
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <Teleport to="body">
      <ConfirmModal v-model="showLogoutModal" message="Are you sure you want to log out?" @confirm="logout"
        @cancel="cancelLogout" />
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, defineExpose } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import ConfirmModal from '~/components/common/PopupAlert.vue'
import { useUserStore } from '~/store/user'
import type { UserSystem } from '~/types/users/user'

const userStore = useUserStore()
const router = useRouter()
const showLogoutModal = ref(false)
const isCollapsed = ref(false)

// User data
const user = ref<UserSystem | null>(null)

// Main menus
const mainMenus = [
  { id: 1, to: '/dashboard', label: 'Dashboard', icon: 'mdi:home-outline' },
  { id: 2, to: '/income', label: 'Income', icon: 'mdi:currency-usd' },
  { id: 3, to: '/expense', label: 'Expense', icon: 'mdi:cash-minus' },
  { id: 4, to: '/category', label: 'Category', icon: 'mdi:shape-outline' },
  { id: 5, to: '/transactions', label: 'Transactions', icon: 'mdi:clipboard-list' },
  { id: 6, to: '/report', label: 'Report', icon: 'mdi:file-chart-outline' },
  { id: 7, to: '/userssystem', label: 'User System', icon: 'mdi:account-cog-outline' },
  { id: 8, to: '/permission', label: 'Permission', icon: 'mdi:shield-account-outline' },
  { id: 9, to: '/user-app', label: 'User APP', icon: 'mdi:account-circle-outline' },
  { id: 10, to: '/notification', label: 'Notification', icon: 'mdi:bell-outline' },
]

// Sidebar toggle
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

// Logout
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  userStore.clearUser()
  router.push('/login')
}

function cancelLogout() {
  console.log('Logout canceled')
}

// Filter menus based on permission
const filteredMenus = computed(() => {
  const user = userStore.user
  if (!user?.permission?.actions) return mainMenus

  const allowedIds = Object.entries(user.permission.actions)
    .filter(([menuId, actions]) => actions.includes('View'))
    .map(([menuId]) => Number(menuId))

  return mainMenus.filter(menu => allowedIds.includes(menu.id))
})

// Expose to parent
defineExpose({
  isCollapsed,
  toggleSidebar,
  mainMenus,
  filteredMenus,
})
</script>
