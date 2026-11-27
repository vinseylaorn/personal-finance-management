<template>
   <div class="ml-5 mr-5">
      <!-- Toast Notification -->
      <FormAlert :visible="toast.visible" :type="toast.type" title="" :message="toast.message"
         @update:visible="toast.visible = $event" />
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Users...
      </div>
      <div v-else>
         <!-- Filter Controls -->
         <div class="flex flex-wrap items-end gap-4 mb-3">
            <BaseInput id="searchQuery" v-model="searchQuery" placeholder="Search..." label="Filter " class="w-60" />
            <button @click="onSearchClick"
               class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <BaseSelect id="PermissionFilter" v-model="selectedPermissionFilter" :options="permissionOptions"
               label="Filter by Permission" />
            <div class="ml-auto flex gap-4">
               <button v-if="can(USER_MENU_ID, 'create')"
                  class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
                  @click="openAddUserDialog">
                  <AddIcon class="w-5 h-5" /> New User
               </button>
            </div>
         </div>
         <!-- User Table -->
         <BaseTable :headers="headers" :data="filteredData">
            <template #table-rows="{ items }">
               <tr v-for="(user, index) in items" :key="user.id"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <!-- Show row number instead of database id -->
                  <td class="base-table-row-cell">{{ index + 1 }}</td>
                  <td class="base-table-row-cell">{{ user.firstName }}</td>
                  <td class="base-table-row-cell">{{ user.lastName }}</td>
                  <td class="base-table-row-cell">{{ user.username }}</td>
                  <td class="base-table-row-cell">{{ user.email }}</td>
                  <td class="base-table-row-cell">{{ getCreatedByLabel(user) }}<br />
                     <span class="text-xs text-gray-500">{{ formatDate(user.createdAt) }}</span>
                  </td>
                  <td class="base-table-row-cell">{{ user.permission?.name || '-' }}</td>
                  <td class="base-table-row-cell flex items-center space-x-2">
                     <button v-if="can(USER_MENU_ID, 'view')" class="text-gray-800 hover:text-blue-700"
                        @click.prevent="openViewUserDialog(user)">
                        <ViewIcon />
                     </button>
                     <button v-if="user.id !== 1 && can(USER_MENU_ID, 'edit')" class="text-blue-900 hover:text-blue-500"
                        @click.prevent="openEditUserDialog(user)">
                        <EditIcon />
                     </button>
                     <button v-if="user.id !== 1 && can(USER_MENU_ID, 'delete')"
                        class="text-red-700 cursor-pointer hover:text-red-500"
                        @click.prevent="confirmDeleteUser(user.id)">
                        <DeleteIcon />
                     </button>
                  </td>
               </tr>
            </template>
         </BaseTable>
         <div v-if="!filteredData.length" class="flex flex-col items-center justify-center h-[400px] text-center p-10">
            <h3 class="text-xl font-semibold text-slate-800">No Users Found</h3>
            <p class="text-slate-500 mt-1">Try adjusting your filters or create a new user.</p>
         </div>
      </div>
      <!-- Add/Edit/View Dialogs -->
      <Dialog v-model:visible="showAddDialog" title="Add New User">
         <form @submit.prevent="handleAddUser" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="add-firstName" v-model="newUser.firstName" type="text" label="First Name" required
                  placeholder="Enter..." />
               <BaseInput id="add-lastName" v-model="newUser.lastName" type="text" label="Last Name" required
                  placeholder="Enter..." />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="add-username" v-model="newUser.username" type="text" label="Username" required
                  placeholder="Enter..." />
               <BaseInput id="add-email" v-model="newUser.email" type="email" label="Email" required
                  placeholder="Enter..." />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="add-pass" v-model="newUser.pass" type="password" label="Password" required
                  placeholder="Enter..." />
               <BaseInput id="add-confirmPass" v-model="newUser.confirmPass" type="password" label="Confirm Password"
                  required placeholder="Enter..." />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseSelect id="add-permission" v-model="newUser.permissionId" :options="permissionOptions"
                  label="Select Permission" />
               <BaseInput id="add-createdBy" :model-value="getCreatedByLabel({ createdBy: loggedInUserId })"
                  label="Created By" disabled />
            </div>
            <div class="flex justify-end gap-2">
               <button type="button" @click="closeDialog"
                  class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Cancel</button>
               <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>
      <Dialog v-if="editUser" v-model:visible="showEditDialog" title="Edit User">
         <form @submit.prevent="handleEditUser" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="edit-firstName" v-model="editUser.firstName" type="text" label="First Name" required />
               <BaseInput id="edit-lastName" v-model="editUser.lastName" type="text" label="Last Name" required />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="edit-username" v-model="editUser.username" type="text" label="Username" required />
               <BaseInput id="edit-email" v-model="editUser.email" type="email" label="Email" required />
            </div>
            <BaseSelect id="edit-permission" v-model="editUser.permissionId" :options="permissionOptions"
               label="Select Permission" />
            <BaseInput id="edit-createdBy" :model-value="getCreatedByLabel(editUser)" label="Created By" disabled />
            <div class="flex justify-end gap-2">
               <button type="button" @click="closeDialog"
                  class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Cancel</button>
               <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>
      <Dialog v-if="viewUser" v-model:visible="showViewDialog" title="View User">
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-firstName" :model-value="viewUser?.firstName" label="First Name" disabled />
            <BaseInput id="view-lastName" :model-value="viewUser?.lastName" label="Last Name" disabled />
            <BaseInput id="view-username" :model-value="viewUser?.username" label="Username" disabled />
            <BaseInput id="view-email" :model-value="viewUser?.email" label="Email" disabled />
            <BaseInput id="view-createdBy" :model-value="getCreatedByLabel(viewUser)" label="Created By" disabled />
            <BaseInput id="view-permission" :model-value="viewUser?.permission?.name" label="Permission" disabled />
            <BaseInput id="view-createdAt" :model-value="formatDate(viewUser?.createdAt)" label="Created At" disabled />
         </div>
         <div class="flex justify-end mt-4">
            <button type="button" @click="closeDialog"
               class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Close</button>
         </div>
      </Dialog>
      <!-- Delete Modal -->
      <PopupAlert v-model="showDeleteModal" message="Do you really want to delete this user?"
         @confirm="handleConfirmDelete" />
   </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseSelect from '~/components/common/BaseSelect.vue'
import BaseTable from '~/components/common/BaseTable.vue'
import FormAlert from '~/components/common/FormAlert.vue'
import Dialog from '~/components/common/Dialog.vue'
import PopupAlert from '~/components/common/PopupAlert.vue'
import AddIcon from '~/components/icons/AddIcon.vue'
import SearchIcon from '~/components/icons/SearchIcon.vue'
import ViewIcon from '~/components/icons/ViewIcon.vue'
import EditIcon from '~/components/icons/EditIcon.vue'
import DeleteIcon from '~/components/icons/DeleteIcon.vue'
import { useUserSystem } from '~/composables/user/useUsersystemData'
import { useRolePermission } from '~/composables/user/useRolePermission'

definePageMeta({ layout: 'admin' })
const title = useDashboardTitle()
title.value = 'Usersystem Management'

// Permission
const { can } = useRolePermission()
const USER_MENU_ID = 1

// ---------------- State ----------------
const { users, fetchUsers, addUser, updateUser, deleteUser, loggedInUserId, fetchCurrentUser } = useUserSystem()
const loading = ref(true)
const searchQuery = ref('')
const activeSearchQuery = ref('')
const selectedPermissionFilter = ref('')

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteModal = ref(false)

const newUser = ref<any>({})
const editUser = ref<any>({})
const viewUser = ref<any>(null)
const deletingUserId = ref<number | null>(null)

// Headers
const headers = [
   { key: 'id', label: 'No' },
   { key: 'firstName', label: 'First Name' },
   { key: 'lastName', label: 'Last Name' },
   { key: 'username', label: 'Username' },
   { key: 'email', label: 'Email' },
   { key: 'createdBy', label: 'Created By' },
   { key: 'permission', label: 'Role Permission' },
   { key: 'actions', label: 'Action' },
]

// Permission options
const { permissions, fetchPermissions } = useRolePermission()
const permissionOptions = computed(() => permissions.value.map(p => ({ label: p.name, value: p.id.toString() })))

// Toast
const toast = reactive({ visible: false, message: '', type: 'success' as 'success' | 'error' })
function showToast(message: string, type: 'success' | 'error' = 'success') {
   toast.message = message
   toast.type = type
   toast.visible = true
   setTimeout(() => (toast.visible = false), 3000)
}

// Filtered Data
const filteredData = computed(() =>
   users.value.filter(user =>
      (!activeSearchQuery.value || Object.values(user).join(' ').toLowerCase().includes(activeSearchQuery.value.toLowerCase())) &&
      (!selectedPermissionFilter.value || user.permission?.id === Number(selectedPermissionFilter.value))
   )
)

// ---------------- Methods ----------------
function onSearchClick() { activeSearchQuery.value = searchQuery.value }

function getCreatedByLabel(user: any) {
   if (!user) return '-'
   if (user.createdBy === 1) return 'Super Admin'
   const creator = users.value.find(u => u.id === user.createdBy)
   return creator ? creator.username : 'Unknown'
}

// Format createdAt date
function formatDate(dateString: string | undefined) {
   if (!dateString) return '-'
   return new Date(dateString).toISOString().split('T')[0] // YYYY-MM-DD
}

function closeDialog() {
   showAddDialog.value = false
   showEditDialog.value = false
   showViewDialog.value = false
   newUser.value = { firstName: '', lastName: '', username: '', email: '', pass: '', confirmPass: '', permissionId: '' }
   editUser.value = {}
   viewUser.value = null
}

// Add
function openAddUserDialog() {
   if (can(USER_MENU_ID, 'create')) showAddDialog.value = true
}
async function handleAddUser() {
   // Password confirmation
   if (newUser.value.pass !== newUser.value.confirmPass) {
      return showToast('Passwords do not match', 'error')
   }

   // ✅ Check duplicate email
   const emailExists = users.value.some(
      (u) => u.email.toLowerCase() === newUser.value.email.toLowerCase()
   )
   if (emailExists) {
      return showToast('This email is already in use', 'error')
   }

   // Proceed if not duplicate
   await addUser({ ...newUser.value, createdBy: loggedInUserId.value ?? 1 })
   showToast('User added successfully', 'success')
   closeDialog()
   await fetchUsers()
}


// Edit
function openEditUserDialog(user: any) {
   if (can(USER_MENU_ID, 'edit')) {
      editUser.value = { ...user, permissionId: user.permission?.id || '' }
      showEditDialog.value = true
   }
}
async function handleEditUser() {
   // ✅ Check duplicate email (ignore the current user)
   const emailExists = users.value.some(
      (u) =>
         u.email.toLowerCase() === editUser.value.email.toLowerCase() &&
         u.id !== editUser.value.id
   )
   if (emailExists) {
      return showToast('This email is already in use', 'error')
   }

   // Proceed if not duplicate
   await updateUser(editUser.value)
   showToast('User updated successfully', 'success')
   closeDialog()
   await fetchUsers()
}


// View
function openViewUserDialog(user: any) {
   viewUser.value = user
   showViewDialog.value = true
}

// Delete
function confirmDeleteUser(id: number) {
   if (!can(USER_MENU_ID, 'delete')) return
   deletingUserId.value = id
   showDeleteModal.value = true
}
async function handleConfirmDelete() {
   if (deletingUserId.value) {
      await deleteUser(deletingUserId.value)
      showToast('User deleted successfully', 'success')
      await fetchUsers()
   }
   deletingUserId.value = null
}
try {
   await addUser({ ...newUser.value, createdBy: loggedInUserId.value ?? 1 })
   showToast('User added successfully', 'success')
   closeDialog()
   await fetchUsers()
} catch (error: any) {
   if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
      showToast('This email is already registered', 'error')
   }
}

// ---------------- Lifecycle ----------------
onMounted(async () => {
   loading.value = true
   await fetchCurrentUser()
   await fetchPermissions()
   await fetchUsers()
   loading.value = false
})
</script>
