<template>
   <!-- Main container for the admin layout with a sidebar and header -->
   <div class="min-h-screen text-gray-800 bg-gray-100 relative ">
      <!-- Sidebar component -->
      <DashboardSideBar ref="sidebarRef" />

      <!-- Main content area that adjusts based on sidebar state -->
      <div :class="[
         'flex flex-col flex-1 transition-all duration-300 ease-in-out',
         isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60',
      ]">
         <!-- Header component with a title and sidebar toggle functionality -->
         <DashboardHeader :title="title" @toggle-sidebar="toggleSidebarFromHeader" />
         <!-- Slot for rendering the main content -->
         <main class="flex-1 p-3 ">
            <slot />
         </main>
      </div>
   </div>
</template>

<script setup lang="ts">
import DashboardSideBar from "~/components/layouts/PageSlideBar.vue";
import DashboardHeader from "~/components/layouts/PageHeader.vue";

const sidebarRef = ref<InstanceType<typeof DashboardSideBar> | null>(null); // Reference to the sidebar component
const isSidebarCollapsed = computed(
   () => sidebarRef.value?.isCollapsed ?? false // Computed property to check if the sidebar is collapsed
);
const toggleSidebarFromHeader = () => {
   sidebarRef.value?.toggleSidebar?.(); // Function to toggle the sidebar state from the header
};
const title = useDashboardTitle(); // Custom composable for managing the dashboard title
</script>
