<template>
  <div class="min-h-screen bg-gray-100 text-gray-800" @keydown.esc="menuOpen = false">
    <button v-if="menuOpen" aria-label="Close navigation" class="fixed inset-0 z-40 bg-black/40 md:hidden"
      @click="menuOpen = false" />
    <DashboardSideBar :class="menuOpen ? 'translate-x-0' : '-translate-x-full'" />
    <div class="min-w-0 md:ml-60">
      <DashboardHeader @toggle-sidebar="menuOpen = !menuOpen" />
      <main class="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><slot /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardSideBar from '~/components/layouts/PageSlideBar.vue'
import DashboardHeader from '~/components/layouts/PageHeader.vue'

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
