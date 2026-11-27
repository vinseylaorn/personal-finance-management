<template>
   <div>
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading App Users...
      </div>
      <div v-else>
         <div class="filter-toolbar flex flex-wrap items-end gap-4 mb-3">
            <BaseInput id="start" v-model="startDate" type="date" label="Start Date" />
            <BaseInput id="end" v-model="endDate" type="date" label="End Date" />
            <BaseInput id="fillter" v-model="searchQuery" placeholder="Search users..." label="Filter Data" />
            <button @click="applyFilters"
               class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <div class="ml-auto">
               <button class="base-button gap-2 p-1 bg-green-600 text-white hover:bg-green-700" @click="exportCSV">
                  Export CSV
               </button>
            </div>
         </div>
         <BaseTable :headers="headers" :data="displayedUsers">
            <template #table-rows="{ items }">
               <tr v-for="user in items" :key="user.id"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <td class="base-table-row-cell">{{ user.id }}</td>
                  <td class="base-table-row-cell">
                     <img :src="user.profile" alt="Profile" class="w-8 h-8 rounded-full object-cover" />
                  </td>
                  <td class="base-table-row-cell">{{ user.first_name }}</td>
                  <td class="base-table-row-cell">{{ user.last_name }}</td>
                  <td class="base-table-row-cell">{{ user.gender }}</td>
                  <td class="base-table-row-cell">{{ user.email }}</td>
                  <td class="base-table-row-cell">{{ user.phone_number || '-' }}</td>
                  <td class="base-table-row-cell">{{ user.creator_name }}<br />
                     <span class="text-xs text-gray-500">{{ user.created_at }}</span>
                  </td>
               </tr>
            </template>
         </BaseTable>
         <div v-if="!displayedUsers.length && !loading" class="text-center py-10 text-gray-400">
            No users found.
         </div>
      </div>
   </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useUserAppData } from "~/composables/user/useUserAppData";
import BaseInput from "~/components/common/BaseInput.vue";
import BaseTable from "~/components/common/BaseTable.vue";
import { Icon } from "@iconify/vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";

definePageMeta({ layout: "admin" });
const title = useDashboardTitle();
title.value = "App Users Management";
const headers = [
   { key: "id", label: "No" },
   { key: "profile", label: "Profile" },
   { key: "first_name", label: "First Name" },
   { key: "last_name", label: "Last Name" },
   { key: "gender", label: "Gender" },
   { key: "email", label: "Email" },
   { key: "phone_number", label: "Phone" },
   { key: "creator_name", label: "Created By" },
];
const { users, fetchUsers, loading } = useUserAppData();
const searchQuery = ref("");
const activeSearchQuery = ref("");
const startDate = ref("");
const endDate = ref("");
// Format created_at as YYYY-MM-DD
const displayedUsers = computed(() => {
   return users.value
      .slice()
      .sort((a, b) => a.id - b.id)
      .filter((user) => {
         const query = activeSearchQuery.value.toLowerCase();
         const matchesSearch =
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.phone_number || "").toLowerCase().includes(query);

         const userDate = new Date(user.created_at);
         const matchesStart = startDate.value ? userDate >= new Date(startDate.value) : true;
         const matchesEnd = endDate.value ? userDate <= new Date(endDate.value) : true;

         return matchesSearch && matchesStart && matchesEnd;
      })
      .map(user => ({
         ...user,
         created_at: user.created_at ? new Date(user.created_at).toISOString().split("T")[0] : "-"
      }));
});
function applyFilters() {
   activeSearchQuery.value = searchQuery.value;
}
function exportCSV() {
   const rows = [
      headers.map((h) => h.label),
      ...displayedUsers.value.map((u) => [
         u.id,
         u.profile || "",
         u.first_name + " " + u.last_name,
         u.gender,
         u.email,
         u.phone_number || "",
         u.creator_name || "",
         u.created_at,
      ]),
   ];

   const csvContent = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.setAttribute("download", "app_users.csv");
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}

onMounted(() => fetchUsers());
</script>
<style scoped>
.base-table-row-cell {
   padding: 0.5rem 0.75rem;
}
</style>
