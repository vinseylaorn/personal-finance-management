<template>
  <!-- Header -->
  <header
    class="sticky top-0 z-40 bg-white border-b border-gray-300  px-6 py-3 flex items-center justify-between w-full">
    <!-- Left: Sidebar toggle (mobile) -->
    <button class="md:hidden text-blue-800 p-2" @click="$emit('toggle-sidebar')" aria-label="Toggle sidebar">
      <Icon icon="mdi:menu" width="28" height="28" />
    </button>
    <!-- Center: Title -->
    <h1 class="text-3xl font-bold text-blue-900 text-center flex-1 ml-50">
      {{ title }}
    </h1>
    <!-- Right: Fullscreen + Profile -->
    <div class="flex items-center gap-4 ml-auto">
      <!-- Fullscreen Toggle -->
      <button
        class="flex items-center justify-center w-10 h-10 rounded-full text-blue-900 bg-blue-50 hover:bg-blue-100 transition shadow-sm"
        @click="toggleFullscreen">
        <Icon :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" width="30" height="30" />
      </button>
      <!-- Profile -->
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 transition shadow-sm"
        @click="showProfile = true">
        <!-- Username -->
        <span class="text-sm font-semibold">
          {{ userStore.user?.username || 'Supperadmin' }}
        </span>
        <!-- Icon -->
        <Icon icon="mdi:account-circle" width="30" height="30" />
      </button>
    </div>
  </header>

  <!-- Profile Popup -->
  <div v-if="showProfile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-xl shadow-xl w-120 animate-fade-in overflow-hidden">

      <!-- Modern User Profile Card -->
      <div class="mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

        <!-- Top section with blue background -->
        <div class="bg-blue-800 relative h-24">
          <!-- Centered Avatar -->
          <div class="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Icon icon="mdi:account-circle" class="w-20 h-20 text-blue-500" />
            </div>
          </div>
        </div>

        <!-- User Details -->
        <div class="pt-16 pb-6 px-6 text-center space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ userStore.user?.username || '-' }}
          </h2>
          <p class="text-gray-600">
            {{ userStore.user?.email || '-' }}
          </p>
          <p class="text-gray-500 text-sm">
            ID: {{ userStore.user?.id || '-' }}
          </p>

          <!-- Buttons -->
          <div class="flex justify-center gap-3 mt-4">
            <button @click="showProfile = false"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition">
              Cancel
            </button>
            <button @click="logout" class="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '~/store/user'

const title = useDashboardTitle()
defineEmits(['toggle-sidebar'])

const userStore = useUserStore()
const showProfile = ref(false)
const isFullscreen = ref(false)

onMounted(() => {
  userStore.loadUser()
})

// Toggle fullscreen
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const logout = () => {
  userStore.clearUser()
  navigateTo('/login')
}
</script>
