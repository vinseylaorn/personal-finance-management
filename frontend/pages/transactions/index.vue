<template>
   <div>
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Transactions...
      </div>
      <!-- Filters + Table -->
      <div v-else>
         <!-- Filters -->
         <div class="filter-toolbar flex flex-wrap items-end gap-4 mb-3">
            <div class="w-48">
               <BaseInput id="start" v-model="filters.startDate" label="Start Date" type="date" />
            </div>
            <div class="w-48">
               <BaseInput id="end" v-model="filters.endDate" label="End Date" type="date" />
            </div>
            <div class="w-100">
               <BaseInput id="search" v-model="searchQuery" label="Filter Data"
                  placeholder="Search description/source..." />
            </div>
            <button @click="applySearch"
               class="border rounded-lg border-gray-300 px-3 py-2 cursor-pointer bg-white hover:bg-slate-50">
               <SearchIcon class="text-blue-600 hover:text-blue-800 transition" />
            </button>
            <div class="ml-auto flex gap-4">
               <button class="base-button cursor-pointer gap-2 p-1 bg-green-600 text-white hover:bg-green-700"
                  @click="exportCSV">
                  <ExportIcon /> Export CSV
               </button>
            </div>
         </div>
         <!-- Table -->
         <BaseTable :headers="headers" :data="filteredTransactions">
            <template #table-rows="{ items }">
               <tr v-for="t in items" :key="t.type + '-' + t.id"
                  class="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <td class="base-table-row-cell">
                     Created by: <span>{{ t.createdBy }}</span><br />{{ formatDateOnly(t.createdAt) }}

                  </td>
                  <td class="base-table-row-cell font-medium">
                     <span :class="t.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                        <Icon :icon="t.type === 'income' ? 'mdi:arrow-up-bold-circle' : 'mdi:arrow-down-bold-circle'"
                           class="w-4 h-4 inline-block mr-1" />
                        {{ t.type }}
                     </span>
                  </td>
                  <td class="base-table-row-cell">
                     {{ t.type === 'income' ? t.source : t.description }}
                  </td>
                  <td class="base-table-row-cell">
                     <span v-if="t.type === 'income'">+{{ t.amount }}</span>
                     <span v-else>-{{ t.amount }}</span>
                  </td>
               </tr>
            </template>
         </BaseTable>
      </div>
   </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import BaseTable from '~/components/common/BaseTable.vue'
import BaseInput from '~/components/common/BaseInput.vue'
import SearchIcon from '~/components/icons/SearchIcon.vue'
import ExportIcon from '~/components/icons/ExportIcon.vue'
import { useExpenseApi } from '~/composables/useExpense'
import { useIncomeApi } from '~/composables/useIncome'
import { useDashboardTitle } from '~/composables/useDashboardTitle'

definePageMeta({ layout: 'admin' })
const title = useDashboardTitle()
title.value = 'Budget Management'
// ✅ Transaction type
type Transaction =
   | {
      type: 'income'
      id: number
      source: string
      categoryId: number | string
      amount: number
      createdBy: string
      createdAt: string
   }
   | {
      type: 'expense'
      id: number
      description: string
      categoryId: number | string
      amount: number
      createdBy: string
      createdAt: string
   }
// ✅ Table headers
const headers = [
   { key: 'createdAt', label: 'Date' },
   { key: 'type', label: 'Type' },
   { key: 'description', label: 'Description' },
   { key: 'amount', label: 'Amount' },
]
// ✅ API
const { expenses, fetchExpenses } = useExpenseApi()
const { incomes, fetchIncomes } = useIncomeApi()
const loading = ref(true)
// ✅ Filters
const searchQuery = ref('')
const activeSearch = ref('')
const filters = ref({ startDate: '', endDate: '' })

watch(searchQuery, (val) => {
   activeSearch.value = val
})
function applySearch() {
   activeSearch.value = searchQuery.value
}
// ✅ Merge transactions
const transactions = computed<Transaction[]>(() =>
   [
      ...expenses.value.map((e) => ({ ...e, type: 'expense' } as Transaction)),
      ...incomes.value.map((i) => ({ ...i, type: 'income' } as Transaction)),
   ].sort(
      (a, b) =>
         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   )
)
// ✅ Filter transactions
const filteredTransactions = computed(() => {
   return transactions.value
      .filter((t) => {
         const text = (t.type === 'income' ? t.source : t.description).toLowerCase()
         return !activeSearch.value || text.includes(activeSearch.value.toLowerCase())
      })
      .filter((t) => {
         const created = new Date(t.createdAt)
         const start = filters.value.startDate ? new Date(filters.value.startDate) : null
         const end = filters.value.endDate ? new Date(filters.value.endDate) : null
         if (start && created < start) return false
         if (end && created > end) return false
         return true
      })
})
// ✅ Format date without time
function formatDateOnly(dateString: string) {
   const date = new Date(dateString)
   return date.toLocaleDateString('en-CA') // format YYYY-MM-DD
}
// ✅ Export CSV (without time)
function exportCSV() {
   if (!filteredTransactions.value.length) {
      alert('No data available to export')
      return
   }

   const rows = [
      ['Date', 'Type', 'Description/Source', 'Amount', 'Created By'],
      ...filteredTransactions.value.map((t) => [
         formatDateOnly(t.createdAt),
         t.type,
         t.type === 'income' ? t.source : t.description,
         t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
         t.createdBy,
      ]),
   ]
   const csvContent = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
   const link = document.createElement('a')
   const url = URL.createObjectURL(blob)

   const today = new Date().toISOString().split('T')[0]
   link.setAttribute('href', url)
   link.setAttribute('download', `transactions_${today}.csv`)

   document.body.appendChild(link)
   link.click()
   document.body.removeChild(link)
}
// ✅ Load data
onMounted(async () => {
   loading.value = true
   await Promise.all([fetchExpenses(), fetchIncomes()])
   loading.value = false
   activeSearch.value = searchQuery.value
})
</script>
