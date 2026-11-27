<template>
  <div class="ml-5 mr-5">
    <!-- Toast Notification -->
    <FormAlert :visible="toast.visible" :type="toast.type" title="" :message="toast.message"
      @update:visible="toast.visible = $event" />
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-gray-500">
      <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
      Loading Categories...
    </div>
    <!-- Filters + Table -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="flex flex-wrap items-end gap-4 mb-3">
        <BaseInput id="searchQuery" v-model="searchQuery" placeholder="Search by category name..."
          label="Filter Data" />
        <button @click="onSearchClick"
          class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
          <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
        </button>
        <BaseSelect id="typeFilter" label="Type" v-model="selectedTypeFilter" :options="categoryTypeOptions" />
        <div class="ml-auto flex gap-4">
          <button class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
            @click="exportCSV">
            <ExportIcon /> Export CSV
          </button>
          <button v-if="can(CATEGORY_MENU_ID, 'create')" class="base-button" @click="openAddDialog">
            <AddIcon class="w-5 h-5" /> New Category
          </button>
        </div>
      </div>
      <!-- Category Table -->
      <BaseTable :headers="headers" :data="filteredData">
        <template #table-rows="{ items }">
          <tr v-for="(category, index) in items" :key="category?.id || index"
            class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
            <td class="base-table-row-cell">{{ index + 1 }}</td>
            <td class="base-table-row-cell">
              <span class="px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full text-blue-800">
                <Icon icon="mdi:category" class="w-4 h-4 mr-1" />
              </span>
              {{ category?.name || '-' }}
            </td>
            <td class="px-4 py-2 capitalize">
              <span :class="category?.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                <Icon :icon="category?.type === 'income' ? 'mdi:arrow-up-bold-circle' : 'mdi:arrow-down-bold-circle'"
                  class="w-4 h-4 inline-block mr-1" />
                {{ category?.type || '-' }}
              </span>
            </td>
            <td class="base-table-row-cell">
              {{ category?.createdBy || 'Admin' }}<br />
              <span class="text-xs text-gray-500">{{ formatDate(category?.createdAt || category?.created_at) }}</span>
            </td>
            <td class="base-table-row-cell flex items-center space-x-2">
              <!-- View -->
              <button class="text-gray-800 hover:text-blue-700" @click.prevent="openViewDialog(category)">
                <ViewIcon />
              </button>
              <!-- Edit -->
              <button v-if="can(CATEGORY_MENU_ID, 'edit')" class="text-blue-900 hover:text-blue-500"
                @click.prevent="openEditDialog(category)">
                <EditIcon />
              </button>
              <!-- Delete -->
              <button v-if="can(CATEGORY_MENU_ID, 'delete')" class="text-red-700 cursor-pointer hover:text-red-500"
                @click.prevent="confirmDeleteCategory(category?.id)">
                <DeleteIcon />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
      <div v-if="!filteredData.length" class="flex flex-col items-center justify-center h-[400px] text-center p-10">
        <h3 class="text-xl font-semibold text-slate-800">No Categories Found</h3>
        <p class="text-slate-500 mt-1">Try adjusting your filters or create a new category.</p>
      </div>
    </div>
    <!-- Add Dialog -->
    <Dialog v-model:visible="showAddDialog" title="Add Category">
      <form @submit.prevent="handleAddCategory" class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <BaseInput id="newCategoryName" v-model="newCategory.name" label="Category Name"
            placeholder="Enter Category name" required />
          <BaseSelect id="newCategoryType" v-model="newCategory.type" :options="categoryTypeOptions" label="Type"
            required />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="closeDialog"
            class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Cancel</button>
          <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
        </div>
      </form>
    </Dialog>
    <!-- Edit Dialog -->
    <Dialog v-if="editCategory" v-model:visible="showEditDialog" title="Edit Category">
      <form @submit.prevent="handleEditCategory" class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <BaseInput id="editCategoryName" v-model="editCategory!.name" label="Category Name" required />
          <BaseSelect id="editCategoryType" v-model="editCategory!.type" :options="categoryTypeOptions" label="Type"
            required />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="closeDialog"
            class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Cancel</button>
          <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
        </div>
      </form>
    </Dialog>
    <!-- View Dialog -->
    <Dialog v-if="viewCategory" v-model:visible="showViewDialog" title="View Category">
      <div class="grid grid-cols-2 gap-2">
        <BaseInput id="viewCategoryName" :model-value="viewCategory.name" label="Category Name" disabled />
        <BaseSelect id="viewCategoryType" :model-value="viewCategory.type" :options="categoryTypeOptions" label="Type"
          disabled />
      </div>
      <div class="flex justify-end mt-4">
        <button type="button" @click="closeDialog"
          class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">Close</button>
      </div>
    </Dialog>
    <!-- Delete Modal -->
    <PopupAlert v-model="showDeleteModal" message="Do you really want to delete this category?"
      @confirm="handleConfirmDelete" />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseSelect from '~/components/common/BaseSelect.vue'
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
import ExportIcon from '~/components/icons/ExportIcon.vue'
import { useCategory } from '~/composables/useCategory'
import { useRolePermission } from '~/composables/user/useRolePermission'

definePageMeta({ layout: 'admin' })
const title = useDashboardTitle()
title.value = 'Category Management'

// Permission
const { can } = useRolePermission()
const CATEGORY_MENU_ID = 4

// Types
type Category = {
  id: number
  name: string
  type: 'income' | 'expense'
  createdBy: string
  createdAt: string
  isActive: boolean
}
type NewCategory = { name: string; type: 'income' | 'expense'; isActive: boolean }

// States
const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategory()
const loading = ref(true)
const searchQuery = ref('')
const activeSearchQuery = ref('')
const selectedTypeFilter = ref('')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteModal = ref(false)
const newCategory = ref<NewCategory>({ name: '', type: 'expense', isActive: true })
const editCategory = ref<Category | null>(null)
const viewCategory = ref<Category | null>(null)
const deletingCategoryId = ref<number | null>(null)

// Options & Headers
const categoryTypeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]
const headers = [
  { key: 'no', label: 'No' },
  { key: 'name', label: 'Category Name' },
  { key: 'type', label: 'Type' },
  { key: 'createdBy', label: 'Created by' },
  { key: 'actions', label: 'Action' },
]

// Toast
const toast = reactive({ visible: false, message: '', type: 'success' as 'success' | 'error' })
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.visible = true
  setTimeout(() => (toast.visible = false), 3000)
}

// ✅ Format date to show only yyyy-mm-dd
function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toISOString().split('T')[0]
}

// Computed
const filteredData = computed(() => {
  return (categories.value || [])
    .filter(
      item =>
        item &&
        (!activeSearchQuery.value || item.name.toLowerCase().includes(activeSearchQuery.value.toLowerCase())) &&
        (!selectedTypeFilter.value || item.type === selectedTypeFilter.value)
    )
    .sort((a, b) => a.id - b.id)
})

// Methods
function onSearchClick() {
  activeSearchQuery.value = searchQuery.value
}

// Export CSV (formatted date)
function exportCSV() {
  if (!filteredData.value.length) return showToast("No data available to export", "error")
  const rows = [["No", "Category Name", "Type", "Created By", "Created At"],
  ...filteredData.value.map((c, i) => [i + 1, c.name, c.type, c.createdBy, formatDate(c.createdAt)])
  ]
  const csvContent = rows.map(e => e.map(v => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "categories.csv"
  link.click()
}

// Dialogs
function closeDialog() {
  showAddDialog.value = false
  showEditDialog.value = false
  showViewDialog.value = false
  editCategory.value = null
  viewCategory.value = null
  newCategory.value = { name: '', type: 'expense', isActive: true }
}

// Add
function openAddDialog() {
  if (can(CATEGORY_MENU_ID, 'create')) showAddDialog.value = true
}
async function handleAddCategory() {
  if (!newCategory.value.name.trim()) return showToast('Category name is required', 'error')
  await addCategory(newCategory.value)
  showToast('Category added successfully', 'success')
  closeDialog()
}

// Edit
function openEditDialog(category: Category) {
  if (can(CATEGORY_MENU_ID, 'edit')) {
    editCategory.value = { ...category }
    showEditDialog.value = true
  }
}
async function handleEditCategory() {
  if (!editCategory.value?.name.trim()) return showToast('Category name is required', 'error')
  await updateCategory(editCategory.value!)
  showToast('Category updated successfully', 'success')
  closeDialog()
}

// View
function openViewDialog(category: Category) {
  viewCategory.value = category
  showViewDialog.value = true
}

// Delete
function confirmDeleteCategory(id?: number) {
  if (!id || !can(CATEGORY_MENU_ID, 'delete')) return
  deletingCategoryId.value = id
  showDeleteModal.value = true
}
async function handleConfirmDelete() {
  if (deletingCategoryId.value !== null) {
    await deleteCategory(deletingCategoryId.value)
    showToast('Category deleted successfully', 'success')
  }
  deletingCategoryId.value = null
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  await fetchCategories()
  loading.value = false
})
</script>
