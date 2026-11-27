<template>
  <aside class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-gray-700 text-white shadow-xl transition-transform md:translate-x-0">
    <!-- Logo -->
    <div class="h-16 shrink-0 px-6 flex items-center border-b border-white/15">
      <h1 class="text-3xl font-extrabold uppercase tracking-widest bg-clip-text text-transparent
               bg-gradient-to-r from-blue-400 via-purple-200 to-pink-400 drop-shadow-lg">
        FINANCE
      </h1>
    </div>
    <!-- Navigation -->
    <nav class="min-h-0 flex-1 overflow-y-auto py-4">
      <ul class="flex flex-col">
        <li v-for="item in filteredMenus" :key="item.label">
          <NuxtLink :to="item.to"
            class="flex items-center justify-between px-4 py-2.5 mx-3 my-0.5 rounded-xl hover:bg-white/10 focus-visible:outline-blue-400 transition-colors duration-300"
            exact-active-class="bg-blue-800 text-white font-semibold ring-1 ring-inset ring-blue-400/50">
            <div class="flex items-center gap-3">
              <Icon :icon="item.icon" class="w-6 h-6" />
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <div class="p-4 border-t border-white/15">
      <button @click="showLogoutModal = true"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors duration-300">
        <Icon icon="mdi:logout" class="w-5 h-5" />
        Log Out
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <Teleport to="body">
      <ConfirmModal v-model="showLogoutModal" message="Are you sure you want to log out?" @confirm="logout"
        />
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import ConfirmModal from '~/components/common/PopupAlert.vue'
import { useUserStore } from '~/store/user'
import { mainMenus } from '~/composables/slidebarMenus'

const userStore = useUserStore()
const router = useRouter()
const showLogoutModal = ref(false)
// Logout
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  userStore.clearUser()
  router.push('/login')
}

const filteredMenus = computed(() => {
  const actions = userStore.user?.permission?.actions
  return mainMenus.filter(menu => actions?.[menu.id]?.includes('View'))
})
</script>
