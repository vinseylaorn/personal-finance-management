<template>
   <div class="ml-5 mr-5">
      <!-- Toast Notification -->
      <FormAlert :visible="toast.visible" :type="toast.type" title="" :message="toast.message"
         @update:visible="toast.visible = $event" />
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Incomes...
      </div>
      <!-- Filters + Table -->
      <div v-else>
         <!-- Filter Controls -->
         <div class="flex flex-wrap items-end gap-4 mb-3">
            <div class="w-50">
               <BaseInput id="startDate" label="Start Date" type="date" v-model="filters.startDate" class="w-full" />
            </div>
            <div class="w-50">
               <BaseInput id="endDate" label="End Date" type="date" v-model="filters.endDate" class="w-full" />
            </div>
            <div class="w-100">
               <BaseInput id="searchQuery" v-model="searchQuery" placeholder="Search income..." label="Filter Data" />
            </div>
            <button @click="applySearch"
               class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <div class="ml-auto flex gap-4">
               <!-- Export CSV -->
               <button class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
                  @click="exportCSV">
                  <ExportIcon /> Export CSV
               </button>
               <!-- Add Income with Permission -->
               <button v-if="can(INCOME_MENU_ID, 'create')" class="base-button cursor-pointer gap-2 p-1"
                  @click="openAddIncomeDialog">
                  <AddIcon /> Add Income
               </button>
            </div>
         </div>
         <!-- Income Table -->
         <BaseTable :headers="headers" :data="filteredData">
            <template #table-rows="{ items }">
               <tr v-for="(income, index) in items" :key="income.id"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <td class="base-table-row-cell">{{ index + 1 }}</td>
                  <td class="base-table-row-cell">
                     <span class="text-green-600 font-medium">
                        <Icon icon="mdi:arrow-up-bold-circle" class="w-5 h-5 inline-block mr-1" />
                     </span>
                     {{ income.source }}
                  </td>
                  <td class="base-table-row-cell">
                     <span class="px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full text-blue-800">
                        <Icon icon="mdi:category" class="w-4 h-4 mr-1" />
                     </span>
                     {{ getCategoryName(income.categoryId) }}
                  </td>
                  <td class="base-table-row-cell">
                     <span class="px-4 py-1 inline-flex text-xs font-semibold rounded-full text-green-500">
                        $ {{ income.amount }}
                     </span>
                  </td>
                  <td class="base-table-row-cell">
                     {{ income.createdBy }}<br />
                     <span class="text-xs text-gray-500">{{ income.createdAt }}</span>
                  </td>
                  <td class="base-table-row-cell flex items-center space-x-2">
                     <button class="text-gray-800 hover:text-blue-700" @click.prevent="openViewIncomeDialog(income)">
                        <ViewIcon />
                     </button>
                     <button v-if="can(INCOME_MENU_ID, 'edit')" class="text-blue-900 hover:text-blue-500"
                        @click.prevent="openEditIncomeDialog(income)">
                        <EditIcon />
                     </button>
                     <button v-if="can(INCOME_MENU_ID, 'delete')" class="text-red-700 hover:text-red-500"
                        @click.prevent="confirmDeleteIncome(income.id)">
                        <DeleteIcon />
                     </button>
                  </td>
               </tr>
            </template>
         </BaseTable>
         <div v-if="!filteredData.length" class="flex flex-col items-center justify-center h-[400px] text-center p-10">
            <h3 class="text-xl font-semibold text-slate-800">No Incomes Found</h3>
            <p class="text-slate-500 mt-1">Try adjusting your filters or add new income.</p>
         </div>
      </div>
      <!-- Delete Confirmation Modal -->
      <ConfirmModal v-model="showModal" message="Do you really want to delete this income?" @confirm="handleConfirm"
         @cancel="handleCancel" />
      <!-- Add/Edit/View Dialogs -->
      <Dialog v-model:visible="showAddDialog" title="Add New Income">
         <form @submit.prevent="handleAddIncome" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="add-source" v-model="newIncome.source" label="Income Description" required
                  placeholder="Enter..." />
               <BaseSelect id="add-category" v-model.number="newIncome.categoryId" :options="categoryOptions"
                  label="Category" required />

            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="add-amount" v-model="newIncome.amount" label="Amount" type="number" required />
            </div>
            <div class="flex justify-end gap-2">
               <button type="button" @click="showAddDialog = false"
                  class="px-4 py-2 hover:bg-gray-200 rounded-lg bg-gray-300">Cancel</button>
               <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>
      <Dialog v-model:visible="showEditDialog" title="Edit Income">
         <form @submit.prevent="handleEditIncome" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="edit-source" v-model="editIncome.source" label="Income Description" required />
               <BaseSelect id="edit-category" v-model.number="editIncome.categoryId" :options="categoryOptions"
                  label="Category" required />
            </div>
            <div class="grid grid-cols-2 gap-2">
               <BaseInput id="edit-amount" v-model="editIncome.amount" label="Amount" type="number" required />
            </div>
            <div class="flex justify-end gap-2">
               <button type="button" @click="showEditDialog = false"
                  class="px-4 py-2 hover:bg-gray-200 rounded-lg bg-gray-300">Cancel</button>
               <button type="submit" class="px-4 py-2 base-button text-white">Save</button>
            </div>
         </form>
      </Dialog>

      <Dialog v-model:visible="showViewDialog" title="View Income">
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-source" :model-value="viewIncome?.source" label="Income Description" disabled />
            <BaseInput id="view-category" :model-value="getCategoryName(viewIncome?.categoryId)" label="Category"
               disabled />
         </div>
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-amount" :model-value="viewIncome?.amount" label="Amount" disabled />
         </div>
         <div class="grid grid-cols-2 gap-2">
            <BaseInput id="view-createdBy" :model-value="viewIncome?.createdBy" label="Created By" disabled />
            <BaseInput id="view-createdAt" :model-value="viewIncome?.createdAt" label="Created At" disabled />
         </div>
         <div class="flex justify-end mt-4">
            <button type="button" @click="showViewDialog = false"
               class="px-4 py-2 hover:bg-gray-200 rounded-lg bg-gray-300">Close</button>
         </div>
      </Dialog>
   </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useIncomeApi } from "~/composables/useIncome";
import { useRolePermission } from "~/composables/user/useRolePermission";
import type { Income } from "~/types/income";
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
//Call page layout
definePageMeta({ layout: "admin" });
const title = useDashboardTitle();
title.value = "Income Management";
// Permission
const { can } = useRolePermission();
const INCOME_MENU_ID = 3;
// API
const { incomes, categories, fetchIncomes, fetchCategories, addIncome, updateIncome, deleteIncome } = useIncomeApi();
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
   { key: "source", label: "Income Description" },
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
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showViewDialog = ref(false);
const showModal = ref(false);
const deletingIncomeId = ref<number | null>(null);
// Income states
const newIncome = ref<Partial<Income>>({ source: "", categoryId: 0, amount: 0 });
const editIncome = ref<Income>({ id: 0, source: "", categoryId: 0, amount: 0, createdBy: "", createdAt: "" });
const viewIncome = ref<Income | null>(null);
// Category helper
const categoryOptions = computed(() => categories.value.filter(c => c.type === "income").map(c => ({ label: c.name, value: c.id })));
function getCategoryName(id?: string | number) {
   if (!id) return "Unknown";
   const cat = categories.value.find(c => c.id === Number(id));
   return cat ? cat.name : "Unknown";
}
// Filtered Data
const filteredData = computed(() =>
   incomes.value
      .filter(i => categories.value.find(c => c.id === i.categoryId)?.type === "income")
      .filter(i => {
         const matchesSearch = !activeSearchQuery.value || Object.values(i)
            .join(" ")
            .toLowerCase()
            .includes(activeSearchQuery.value.toLowerCase());
         const afterStart = !filters.value.startDate || i.createdAt >= filters.value.startDate;
         const beforeEnd = !filters.value.endDate || i.createdAt <= filters.value.endDate;
         return matchesSearch && afterStart && beforeEnd;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
);
// CSV Export
function exportCSV() {
   if (!filteredData.value.length) return showToast("No data to export", "error");
   const rows = [
      ["No", "Income Description", "Category", "Amount", "Created By", "Created At"],
      ...filteredData.value.map((income, index) => [
         index + 1,
         income.source,
         getCategoryName(income.categoryId),
         income.amount,
         income.createdBy,
         income.createdAt,
      ]),
   ];
   const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
   const link = document.createElement("a");
   link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
   link.download = "incomes.csv";
   link.click();
}
// CRUD Functions
function openAddIncomeDialog() {
   if (can(INCOME_MENU_ID, "create"))
      newIncome.value = { source: "", categoryId: 0, amount: 0 },
         showAddDialog.value = true
}
async function handleAddIncome() {
   await addIncome(newIncome.value);
   showAddDialog.value = false; await fetchIncomes();
   showToast("Income Added successfully");
}
function openEditIncomeDialog(i: Income) {
   if (can(INCOME_MENU_ID, "edit")) editIncome.value = { ...i },
      showEditDialog.value = true
}
async function handleEditIncome() {
   await updateIncome(editIncome.value);
   showEditDialog.value = false;
   await fetchIncomes();
   showToast("Income updated successfully");
}
function confirmDeleteIncome(id: number) {
   if (can(INCOME_MENU_ID, "delete"))
      deletingIncomeId.value = id, showModal.value = true
}
async function handleConfirm() {
   if (deletingIncomeId.value !== null) {
      await deleteIncome(deletingIncomeId.value);
      await fetchIncomes();
   }
   showModal.value = false;
   deletingIncomeId.value = null; showToast("Income deleted successfully");
}
function handleCancel() { showModal.value = false; deletingIncomeId.value = null; }
function openViewIncomeDialog(i: Income) { viewIncome.value = i; showViewDialog.value = true }

// Fetch Data
onMounted(async () => {
   loading.value = true
   await Promise.all([fetchIncomes(), fetchCategories()])
   loading.value = false
})
</script>
