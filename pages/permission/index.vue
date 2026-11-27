<template>
   <div class="ml-5 mr-5">
      <!-- Toast Notification -->
      <FormAlert :visible="toast.visible" :type="toast.type" title="" :message="toast.message"
         @update:visible="toast.visible = $event" />
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Permissions...
      </div>
      <!-- Filters + Table -->
      <div v-else>
         <div class="flex flex-wrap items-end gap-4 mb-3">
            <BaseInput id="searchQuery" v-model="searchQuery" placeholder="Search permissions..." label="Filter Data" />
            <button @click="onSearchClick"
               class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <div class="ml-auto flex gap-4">
               <button v-if="can(PERMISSION_MENU_ID, 'create')"
                  class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
                  @click="openAddDialog">
                  <AddIcon class="w-5 h-5" /> New Permission
               </button>
            </div>
         </div>
         <!-- Permissions Table -->
         <BaseTable :headers="headers" :data="filteredPermissions">
            <template #table-rows="{ items }">
               <tr v-for="(perm, index) in items" :key="perm?.id || index"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <td class="base-table-row-cell">{{ index + 1 }}</td>
                  <td class="base-table-row-cell">{{ perm?.name || '-' }}</td>
                  <td class="base-table-row-cell">{{ perm?.description || '-' }}</td>
                  <td class="base-table-row-cell">{{ perm?.created_at || '-' }}</td>
                  <td class="base-table-row-cell flex items-center space-x-2">
                     <!-- View -->
                     <button class="text-gray-800 hover:text-blue-700" @click.prevent="openViewDialog(perm)">
                        <ViewIcon />
                     </button>
                     <!-- Edit -->
                     <button v-if="can(PERMISSION_MENU_ID, 'edit')" class="text-blue-900 hover:text-blue-500"
                        @click.prevent="openEditDialog(perm)">
                        <EditIcon />
                     </button>
                     <!-- Delete -->
                     <button v-if="can(PERMISSION_MENU_ID, 'delete')"
                        class="text-red-700 hover:text-red-500 cursor-pointer"
                        @click.prevent="confirmDeletePermission(perm?.id)">
                        <DeleteIcon />
                     </button>
                  </td>
               </tr>
            </template>
         </BaseTable>
         <div v-if="!filteredPermissions.length"
            class="flex flex-col items-center justify-center h-[400px] text-center p-10">
            <h3 class="text-xl font-semibold text-slate-800">No Permissions Found</h3>
            <p class="text-slate-500 mt-1">Try adjusting your filters or create a new permission.</p>
         </div>
      </div>
      <!-- Add/Edit/View Dialog -->
      <Dialog v-model:visible="showDialog" :title="dialogTitle">
         <form @submit.prevent="savePermission" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="permName" v-model="formData.name" label="Permission Name" placeholder="Enter name"
                  required :readonly="isViewMode" />
               <BaseInput id="permDesc" v-model="formData.description" label="Description"
                  placeholder="Enter description" :readonly="isViewMode" />
            </div>
            <!-- Select All -->
            <div class="border-b pb-2 mb-2 border-gray-200 flex items-center">
               <input type="checkbox" id="selectAll" v-model="selectAll" @change="toggleSelectAll"
                  class="rounded border-gray-400 text-green-600 focus:ring-green-500 mr-2"
                  :disabled="isViewMode || isViewOnlyModule" />
               <label for="selectAll" class="font-medium text-gray-700">Full Access</label>
            </div>
            <div>
               <div v-for="menu in availableMenus" :key="menu.id"
                  class="border-b p-2 border-gray-200 mb-2 flex flex-col">
                  <span class="font-medium">{{ menu.label }}</span>
                  <div class="flex gap-4 mt-1">
                     <label v-for="action in actions" :key="action" class="flex items-center gap-1">
                        <input type="checkbox" :value="action" v-model="selectedMenuPermissions[menu.id]"
                           class="rounded border-gray-400 text-green-600 focus:ring-green-500"
                           :disabled="isViewMode || isViewOnlyModule" />
                        {{ action }}
                     </label>
                  </div>
               </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
               <button type="button" @click="closeDialog"
                  class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Cancel</button>
               <button v-if="!isViewMode && !isViewOnlyModule" type="submit"
                  class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>
      <!-- Delete Confirmation -->
      <PopupAlert v-model="showDeleteModal" message="Do you really want to delete this permission?"
         @confirm="handleConfirmDelete" />
   </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseTable from '~/components/common/BaseTable.vue'
import FormAlert from '~/components/common/FormAlert.vue'
import Dialog from '~/components/common/Dialog.vue'
import PopupAlert from '~/components/common/PopupAlert.vue'
import AddIcon from '~/components/icons/AddIcon.vue'
import SearchIcon from '~/components/icons/SearchIcon.vue'
import ViewIcon from '~/components/icons/ViewIcon.vue'
import EditIcon from '~/components/icons/EditIcon.vue'
import DeleteIcon from '~/components/icons/DeleteIcon.vue'
import { Icon } from '@iconify/vue'
import { useRolePermission } from '~/composables/user/useRolePermission'
definePageMeta({ layout: 'admin' })
const title = useDashboardTitle()
title.value = 'Permission Management'
const PERMISSION_MENU_ID = 4
const { can, permissions: apiPermissions, fetchPermissions, createPermission, updatePermission, deletePermission: apiDeletePermission } = useRolePermission()
const loading = ref(true)
const searchQuery = ref('')
const activeSearchQuery = ref('')
const selectedRoleFilter = ref('')
const showDialog = ref(false)
const showDeleteModal = ref(false)
const dialogTitle = ref('Add Permission')
const formData = ref({ id: null, name: '', description: '', actions: {} })
const actions = ['View', 'Create', 'Edit', 'Delete']
const selectedMenuPermissions = reactive<Record<number, string[]>>({})
const selectAll = ref(false)
const permissionToDeleteId = ref<number | null>(null)
// Toast
const toast = reactive({ visible: false, message: '', type: 'success' as 'success' | 'error' })
const permissions = ref<any[]>([])
const filteredPermissions = computed(() => {
   return permissions.value
      .filter(p => !activeSearchQuery.value || p.name.toLowerCase().includes(activeSearchQuery.value.toLowerCase()))
      .filter(p => !selectedRoleFilter.value || p.role === selectedRoleFilter.value)
})
const isViewMode = computed(() => dialogTitle.value === 'View Permission')
const isViewOnlyModule = computed(() => formData.value.name === 'Dashboard Report Transaction')
const availableMenus = computed(() => [
   { id: 1, label: 'Dashboard' },
   { id: 2, label: 'Income' },
   { id: 3, label: 'Expense' },
   { id: 4, label: 'Categories' },
   { id: 5, label: 'Transactions' },
   { id: 6, label: 'Reports' },
   { id: 7, label: 'User System' },
   { id: 8, label: 'Permissions' },
   { id: 9, label: 'User App' },
   { id: 10, label: 'Notifications' },
])
const headers = [
   { key: 'no', label: 'No' },
   { key: 'name', label: 'Permission Name' },
   { key: 'description', label: 'Description' },
   { key: 'created_at', label: 'Created At' },
   { key: 'actions', label: 'Action' },
]
async function loadPermissions() {
   loading.value = true
   await fetchPermissions()
   permissions.value = apiPermissions.value.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || 'No description',
      created_at: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '-', // YYYY-MM-DD
      actions: p.actions || {}
   }))
   loading.value = false
}
function onSearchClick() {
   activeSearchQuery.value = searchQuery.value
}
function openAddDialog() {
   if (!can(PERMISSION_MENU_ID, 'create')) return
   dialogTitle.value = 'Add Permission'
   formData.value = { id: null, name: '', description: '', actions: {} }
   availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = [])
   selectAll.value = false
   showDialog.value = true
}
function openEditDialog(permission: any) {
   if (!can(PERMISSION_MENU_ID, 'edit')) return
   dialogTitle.value = 'Edit Permission'
   formData.value = { ...permission }
   availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = permission.actions?.[menu.id] || [])
   selectAll.value = availableMenus.value.every(menu => actions.every(action => selectedMenuPermissions[menu.id]?.includes(action)))
   showDialog.value = true
}
function openViewDialog(permission: any) {
   dialogTitle.value = 'View Permission'
   formData.value = { ...permission }
   availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = permission.actions?.[menu.id] || [])
   showDialog.value = true
}
function closeDialog() {
   showDialog.value = false
   formData.value = { id: null, name: '', description: '', actions: {} }
   availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = [])
   selectAll.value = false
}
function showToast(message: string, type: 'success' | 'error' = 'success') {
   toast.message = message
   toast.type = type
   toast.visible = true
   setTimeout(() => (toast.visible = false), 3000)
}
async function savePermission() {
   try {
      const actionsPayload: Record<number, string[]> = {}
      Object.keys(selectedMenuPermissions).forEach(key => actionsPayload[Number(key)] = selectedMenuPermissions[Number(key)])
      if (formData.value.id) {
         await updatePermission(formData.value.id, { name: formData.value.name, description: formData.value.description, actions: actionsPayload })
         showToast('Permission updated successfully')
      } else {
         await createPermission({ name: formData.value.name, description: formData.value.description, actions: actionsPayload })
         showToast('Permission created successfully')
      }
      closeDialog()
      await loadPermissions()
   } catch {
      showToast('Failed to save permission', 'error')
   }
}
function toggleSelectAll() {
   if (selectAll.value) availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = [...actions])
   else availableMenus.value.forEach(menu => selectedMenuPermissions[menu.id] = [])
}
function confirmDeletePermission(id?: number) {
   if (!id || !can(PERMISSION_MENU_ID, 'delete')) return
   permissionToDeleteId.value = id
   showDeleteModal.value = true
}
async function handleConfirmDelete() {
   if (permissionToDeleteId.value !== null) {
      try {
         await apiDeletePermission(permissionToDeleteId.value)
         showToast('Permission deleted successfully')
         await loadPermissions()
      } catch {
         showToast('Failed to delete permission', 'error')
      }
   }
   permissionToDeleteId.value = null
}
onMounted(async () => {
   await loadPermissions()
})
</script>
