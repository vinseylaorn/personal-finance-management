<template>
   <div class="ml-5 mr-5">
      <!-- Toast Notification -->
      <FormAlert :visible="toast.visible" :type="toast.type" title="" :message="toast.message"
         @update:visible="toast.visible = $event" />
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Expenses...
      </div>
      <div v-else>
         <!-- Filter Controls -->
         <div class="flex flex-wrap items-end gap-4 mb-3">
            <div class="w-50">
               <BaseInput id="start-date" type="date" v-model="filters.startDate" label="Start Date" class="w-full" />
            </div>
            <div class="w-50">
               <BaseInput id="end-date" type="date" v-model="filters.endDate" label="End Date" class="w-full" />
            </div>
            <div class="w-100">
               <BaseInput id="search-expense" v-model="searchQuery" placeholder="Search expense..."
                  label="Filter Data" />
            </div>
            <button @click="applySearch" class="border rounded-lg border-gray-300 px-3 py-2 bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <div class="ml-auto flex gap-4">
               <!-- Export CSV -->
               <button class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
                  @click="exportCSV">
                  <ExportIcon /> Export CSV
               </button>
               <!-- Add Expense with Permission -->
               <button v-if="can(EXPENSE_MENU_ID, 'create')" class="base-button cursor-pointer gap-2 p-1"
                  @click="openAddExpenseDialog">
                  <AddIcon /> Add Expense
               </button>
            </div>
         </div>
         <!-- Expenses Table -->
         <BaseTable :headers="headers" :data="filteredData">
            <template #table-rows="{ items }">
               <tr v-for="(expense, index) in items" :key="expense.id"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <td class="base-table-row-cell">{{ index + 1 }}</td>
                  <td class="base-table-row-cell">
                     <span class="text-red-600 font-medium">
                        <Icon icon="mdi:arrow-down-bold-circle" class="w-5 h-5 inline-block mr-1" />
                     </span>
                     {{ expense.description }}
                  </td>
                  <td class="base-table-row-cell">
                     <span class="px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full text-blue-800">
                        <Icon icon="mdi:category" class="w-4 h-4 mr-1" />
                     </span>
                     {{ getCategoryName(expense.categoryId) }}
                  </td>
                  <td class="base-table-row-cell">
                     <span class="px-4 py-1 inline-flex text-xs font-semibold rounded-full text-red-500">
                        $ {{ expense.amount }}
                     </span>
                  </td>
                  <td class="base-table-row-cell">
                     {{ expense.createdBy }}<br />
                     <span class="text-xs text-gray-500">{{ expense.createdAt }}</span>
                  </td>
                  <td class="base-table-row-cell flex items-center space-x-2">
                     <button @click.prevent="openViewExpenseDialog(expense)" class="text-gray-800 hover:text-blue-700">
                        <ViewIcon />
                     </button>
                     <button v-if="can(EXPENSE_MENU_ID, 'edit')" @click.prevent="openEditExpenseDialog(expense)"
                        class="text-blue-900 hover:text-blue-500">
                        <EditIcon />
                     </button>
                     <button v-if="can(EXPENSE_MENU_ID, 'delete')" @click.prevent="confirmDeleteExpense(expense.id)"
                        class="text-red-700 hover:text-red-500">
                        <DeleteIcon />
                     </button>
                  </td>
               </tr>
            </template>
         </BaseTable>
         <!-- Empty state -->
         <div v-if="!filteredData.length" class="flex flex-col items-center justify-center h-[400px] text-center p-10">
            <h3 class="text-xl font-semibold text-slate-800">No Expenses Found</h3>
            <p class="text-slate-500 mt-1">Try adjusting your filters or add new expense.</p>
         </div>
      </div>
      <!-- Delete Confirmation Modal -->
      <ConfirmModal v-model="showModal" message="Do you really want to delete this expense?"
         @confirm="handleConfirmDelete" @cancel="handleCancelDelete" />

      <!-- Add/Edit Expense Dialog -->
      <Dialog v-model:visible="showExpenseDialog" :title="dialogMode === 'edit' ? 'Edit Expense' : 'Add Expense'">
         <form @submit.prevent="saveExpense" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="expense-description" v-model="dialogData.description" label="Expense Description"
                  placeholder="Enter Expense description" required />
               <BaseSelect id="expense-category" v-model.number="dialogData.categoryId" :options="categoryOptions"
                  label="Category" required />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="expense-amount" v-model="dialogData.amount" label="Amount" type="number" required />
            </div>
            <div class="flex justify-end gap-2">
               <button type="button" @click="closeExpenseDialog"
                  class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">
                  Cancel
               </button>
               <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>
      <!-- View Expense Dialog -->
      <Dialog v-model:visible="showViewDialog" title="View Expense">
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-description" :model-value="viewData?.description" label="Expense Description"
               disabled />
            <BaseInput id="view-category" :model-value="getCategoryName(viewData?.categoryId)" label="Category"
               disabled />
         </div>
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-amount" :model-value="viewData?.amount" label="Amount" disabled />
         </div>
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-createdBy" :model-value="viewData?.createdBy" label="Created By" disabled />
            <BaseInput id="view-createdAt" :model-value="viewData?.createdAt" label="Created At" disabled />
         </div>
         <div class="flex justify-end mt-4">
            <button type="button" @click="showViewDialog = false"
               class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200">
               Close
            </button>
         </div>
      </Dialog>
   </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useExpenseApi } from "~/composables/useExpense";
import type { Expense } from "~/types/expense";
import { useRolePermission } from "~/composables/user/useRolePermission";
import BaseTable from "~/components/common/BaseTable.vue";
import BaseInput from "~/components/common/BaseInput.vue";
import BaseSelect from "~/components/common/BaseSelect.vue";
import Dialog from "~/components/common/Dialog.vue";
import FormAlert from "~/components/common/FormAlert.vue";
import ConfirmModal from "~/components/common/PopupAlert.vue";
import AddIcon from "~/components/icons/AddIcon.vue";
import ViewIcon from "~/components/icons/ViewIcon.vue";
import EditIcon from "~/components/icons/EditIcon.vue";
import DeleteIcon from "~/components/icons/DeleteIcon.vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import ExportIcon from "~/components/icons/ExportIcon.vue";

definePageMeta({ layout: "admin" });
const title = useDashboardTitle();
title.value = "Expense Management";

// Permission
const { can } = useRolePermission();
const EXPENSE_MENU_ID = 4;
// API
const { expenses, categories, fetchExpenses, fetchCategories, addExpense, updateExpense, deleteExpense } = useExpenseApi();
// Loading & Toast
const loading = ref(true);
const toast = reactive({ visible: false, message: "", type: "success" as "success" | "error" });
function showToast(message: string, type: "success" | "error" = "success") {
   toast.message = message;
   toast.type = type;
   toast.visible = true;
   setTimeout(() => (toast.visible = false), 3000);
}
// Table Headers
const headers = [
   { key: "id", label: "No" },
   { key: "description", label: "Expense Description" },
   { key: "categoryId", label: "Category" },
   { key: "amount", label: "Amount" },
   { key: "createdBy", label: "Created By" },
   { key: "actions", label: "Actions" },
];
// Filters
const searchQuery = ref("");
const activeSearchQuery = ref("");
const filters = ref({ startDate: "", endDate: "" });
function applySearch() { activeSearchQuery.value = searchQuery.value; }
// Dialogs
const showExpenseDialog = ref(false);
const showViewDialog = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const dialogData = ref<Partial<Expense>>({});
const viewData = ref<Partial<Expense>>({});
const showModal = ref(false);
const deletingExpenseId = ref<number | null>(null);
// Category options
const categoryOptions = computed(() => categories.value.filter(c => c.type === "expense").map(c => ({ label: c.name, value: c.id })));

// Filtered Data
const filteredData = computed(() =>
   expenses.value
      .filter(exp => !activeSearchQuery.value || Object.values(exp).join(" ").toLowerCase().includes(activeSearchQuery.value.toLowerCase()))
      .filter(exp => (!filters.value.startDate || exp.createdAt >= filters.value.startDate) && (!filters.value.endDate || exp.createdAt <= filters.value.endDate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
);

// Helper
function getCategoryName(id?: number | string) { const cat = categories.value.find(c => c.id === Number(id)); return cat ? cat.name : "Unknown"; }

// CRUD Functions
function openAddExpenseDialog() { if (can(EXPENSE_MENU_ID, 'create')) { dialogMode.value = "add"; dialogData.value = { description: "", categoryId: categories.value[0]?.id || 0, amount: 0 }; showExpenseDialog.value = true; } }
function openEditExpenseDialog(exp: Expense) { if (can(EXPENSE_MENU_ID, 'edit')) { dialogMode.value = "edit"; dialogData.value = { ...exp }; showExpenseDialog.value = true; } }
async function saveExpense() {
   try {
      if (dialogMode.value === "edit" && dialogData.value.id) { await updateExpense(dialogData.value as Expense); showToast("Expense updated successfully"); }
      else { await addExpense(dialogData.value as Expense); showToast("Expense added successfully"); }
      fetchExpenses(); showExpenseDialog.value = false;
   } catch (err) { showToast("Failed to save expense", "error"); console.error(err); }
}
function closeExpenseDialog() { showExpenseDialog.value = false; }
function openViewExpenseDialog(exp: Expense) { viewData.value = { ...exp }; showViewDialog.value = true; }
function confirmDeleteExpense(id: number) { if (can(EXPENSE_MENU_ID, 'delete')) { deletingExpenseId.value = id; showModal.value = true; } }
async function handleConfirmDelete() { if (deletingExpenseId.value !== null) { await deleteExpense(deletingExpenseId.value); fetchExpenses(); showToast("Expense deleted successfully"); } showModal.value = false; deletingExpenseId.value = null; }
function handleCancelDelete() { showModal.value = false; deletingExpenseId.value = null; }

// CSV Export
function exportCSV() {
   if (!filteredData.value.length) return showToast("No data to export", "error");
   const rows = [
      ["No", "Expense Description", "Category", "Amount", "Created By", "Created At"],
      ...filteredData.value.map((exp, i) => [i + 1, exp.description, getCategoryName(exp.categoryId), exp.amount, exp.createdBy, exp.createdAt])
   ];
   const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
   const link = document.createElement("a");
   link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
   link.download = "expenses.csv"; link.click();
}

// Fetch Data
onMounted(async () => { loading.value = true; await Promise.all([fetchExpenses(), fetchCategories()]); loading.value = false; });
</script>
