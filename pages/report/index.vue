<template>
   <div class="ml-5 mr-5">
      <!-- Export Dialog (no Teleport) -->
      <div v-if="showExportDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div class="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h2 class="text-lg font-semibold mb-4 text-center">Select Export Option</h2>
            <div class="flex flex-col gap-3">
               <button @click="exportReportsOnly"
                  class="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Report Table</button>
               <button @click="exportUsersOnly"
                  class="w-full px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">User Table</button>
               <button @click="exportAllTables"
                  class="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">All Tables</button>
               <button @click="showExportDialog = false"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Cancel</button>
            </div>
         </div>
      </div>
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin inline-block mr-2" />
         Loading Report...
      </div>
      <div v-else>
         <!-- Filters -->
         <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <input type="date" v-model="startDate"
               class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            <input type="date" v-model="endDate"
               class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            <select v-model="transactionType"
               class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
               <option value="">All Types</option>
               <option value="income">Income</option>
               <option value="expense">Expense</option>
            </select>
            <button @click="showExportDialog = true"
               class="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-sm hover:bg-blue-700 transition">Export</button>
         </div>
         <!-- Summary Cards -->
         <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
               class="p-4 bg-green-100 rounded-xl flex items-center justify-between shadow hover:shadow-md transition">
               <div>
                  <h2 class="text-lg font-semibold">Total Income</h2>
                  <p class="text-2xl font-bold text-green-600">{{ totalIncome.toFixed(2) }} $</p>
               </div>
               <div class="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                  <Icon icon="mdi:cash-plus" class="w-6 h-6 text-green-600" />
               </div>
            </div>

            <div class="p-4 bg-red-100 rounded-xl flex items-center justify-between shadow hover:shadow-md transition">
               <div>
                  <h2 class="text-lg font-semibold">Total Expenses</h2>
                  <p class="text-2xl font-bold text-red-600">{{ totalExpenses.toFixed(2) }} $</p>
               </div>
               <div class="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                  <Icon icon="mdi:cash-minus" class="w-6 h-6 text-red-600" />
               </div>
            </div>

            <div class="p-4 bg-blue-100 rounded-xl flex items-center justify-between shadow hover:shadow-md transition">
               <div>
                  <h2 class="text-lg font-semibold">Balance</h2>
                  <p class="text-2xl font-bold text-blue-600">{{ netBalance.toFixed(2) }} $</p>
               </div>
               <div class="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <Icon icon="mdi:bank-outline" class="w-6 h-6 text-blue-600" />
               </div>
            </div>
         </div>
         <!-- Transactions & Chart -->
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Transactions Table -->
            <div class="overflow-x-auto bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
               <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon icon="mdi:history" class="w-5 h-5 text-blue-600" /> Recent Transactions
               </h2>
               <table class="w-full text-sm text-left text-gray-600">
                  <thead class="text-xs text-white uppercase bg-blue-900">
                     <tr>
                        <th class="px-6 py-2.5">Date</th>
                        <th class="px-6 py-2.5">Type</th>
                        <th class="px-6 py-2.5">Description</th>
                        <th class="px-6 py-2.5">Amount</th>
                     </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                     <tr v-for="t in filteredTransactions" :key="t.type + '-' + t.id"
                        class="hover:bg-blue-50 transition-colors duration-200">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                           {{ formatDate(t.date) }} <span class="text-xs text-gray-400">({{ t.createdBy }})</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <span :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'">
                              <Icon
                                 :icon="t.type === 'income' ? 'mdi:arrow-up-bold-circle' : 'mdi:arrow-down-bold-circle'"
                                 class="w-4 h-4 inline-block mr-1" />
                              {{ t.type }}
                           </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ t.resource }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                           <span v-if="t.type === 'income'" class="text-green-600">+{{ t.amount.toFixed(2) }}</span>
                           <span v-else class="text-red-600">-{{ t.amount.toFixed(2) }}</span>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
            <!-- Chart -->
            <div
               class="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition h-[700px]">
               <div class="flex items-center justify-between mb-4">
                  <h2 class="font-semibold text-lg flex items-center gap-2">
                     <Icon icon="mdi:chart-bar" class="w-6 h-6 text-blue-600" /> Overview Income & Expense
                  </h2>
                  <select v-model="selectedChartView"
                     class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                     <option value="thisWeek">This Week</option>
                     <option value="lastWeek">Last Week</option>
                  </select>
               </div>

               <div class="flex-1">
                  <Bar v-if="chartData.datasets.length" :data="chartData" :options="chartOptions"
                     class="w-full h-full" />
                  <p v-else class="text-center text-gray-500 mt-10">No chart data available</p>
               </div>
            </div>
         </div>

         <!-- Latest Users -->
         <div class="relative overflow-x-auto bg-white rounded-xl shadow-lg mb-8">
            <h2 class="text-lg font-semibold p-4 flex items-center gap-2">
               <Icon icon="mdi:account-group" class="w-5 h-5 text-blue-600" /> Latest Users
            </h2>
            <table class="w-full text-sm text-left text-gray-600">
               <thead class="text-xs text-white uppercase bg-blue-900">
                  <tr>
                     <th class="px-4 py-2">No</th>
                     <th class="px-4 py-2">Profile</th>
                     <th class="px-4 py-2">First Name</th>
                     <th class="px-4 py-2">Last Name</th>
                     <th class="px-4 py-2">Gender</th>
                     <th class="px-4 py-2">Email</th>
                     <th class="px-4 py-2">Phone</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="(user, index) in latestUsers" :key="user.id"
                     class="border-b border-gray-200 hover:bg-blue-100">
                     <td class="px-4 py-2">{{ index + 1 }}</td>
                     <td class="px-4 py-2">
                        <img :src="user.profile || '/img/default-avatar.png'"
                           class="w-8 h-8 rounded-full object-cover" />
                     </td>
                     <td class="px-4 py-2">{{ user.first_name }}</td>
                     <td class="px-4 py-2">{{ user.last_name }}</td>
                     <td class="px-4 py-2">{{ user.gender }}</td>
                     <td class="px-4 py-2">{{ user.email }}</td>
                     <td class="px-4 py-2">{{ user.phone_number }}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { Bar } from 'vue-chartjs';
import {
   Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type ChartOptions
} from 'chart.js';
import { useUserAppData } from '~/composables/user/useUserAppData';
import { useIncomeApi } from '~/composables/useIncome';
import { useExpenseApi } from '~/composables/useExpense';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
//Call Navbar
definePageMeta({ layout: 'admin' });
const title = useDashboardTitle();
title.value = "Report";

const { users, fetchUsers } = useUserAppData();
const { incomes, fetchIncomes } = useIncomeApi();
const { expenses, fetchExpenses } = useExpenseApi();
const loading = ref(true);
const selectedChartView = ref<'thisWeek' | 'lastWeek'>('thisWeek');
const startDate = ref('');
const endDate = ref('');
const transactionType = ref('');
const showExportDialog = ref(false);
//load data on mount
onMounted(async () => {
   loading.value = true;
   try {
      await Promise.all([fetchUsers(), fetchIncomes(), fetchExpenses()]);
   } finally {
      loading.value = false;
   }
});
const formatDate = (dateStr: string) => {
   if (!dateStr) return '-';
   const date = new Date(dateStr);
   return isNaN(date.getTime()) ? dateStr : date.toISOString().split('T')[0];
};
const reports = computed(() => [
   ...incomes.value.map(i => ({ id: i.id, date: i.createdAt, resource: i.source, type: 'income', amount: Number(i.amount), createdBy: i.createdBy })),
   ...expenses.value.map(e => ({ id: e.id, date: e.createdAt, resource: e.description, type: 'expense', amount: Number(e.amount), createdBy: e.createdBy }))
]);
//fillter
const filteredReports = computed(() =>
   reports.value.filter(r => {
      const rDate = new Date(r.date);
      const afterStart = startDate.value ? rDate >= new Date(startDate.value) : true;
      const beforeEnd = endDate.value ? rDate <= new Date(endDate.value) : true;
      const typeMatch = transactionType.value ? r.type === transactionType.value : true;
      return afterStart && beforeEnd && typeMatch;
   })
);

/* ---------- totals & lists ---------- */
const totalIncome = computed(() => filteredReports.value.filter(r => r.type === 'income').reduce((a, b) => a + b.amount, 0));
const totalExpenses = computed(() => filteredReports.value.filter(r => r.type === 'expense').reduce((a, b) => a + b.amount, 0));
const netBalance = computed(() => totalIncome.value - totalExpenses.value);

const latestUsers = computed(() =>
   [...users.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
);

const filteredTransactions = computed(() =>
   [...filteredReports.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
);

/* ---------- chart ---------- */
function getWeekRange(week: 'thisWeek' | 'lastWeek') {
   const now = new Date();
   const day = now.getDay();
   const diffToMonday = day === 0 ? -6 : 1 - day;
   const start = new Date(now);
   start.setDate(now.getDate() + diffToMonday);
   start.setHours(0, 0, 0, 0);
   if (week === 'lastWeek') start.setDate(start.getDate() - 7);
   const end = new Date(start);
   end.setDate(start.getDate() + 6);
   end.setHours(23, 59, 59, 999);
   return { start, end };
}

const chartData = computed(() => {
   const { start, end } = getWeekRange(selectedChartView.value);
   const labels: string[] = [];
   const incomeData: number[] = [];
   const expenseData: number[] = [];
   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const income = reports.value.filter(r => r.type === 'income' && r.date.startsWith(dayStr)).reduce((sum, r) => sum + r.amount, 0);
      const expense = reports.value.filter(r => r.type === 'expense' && r.date.startsWith(dayStr)).reduce((sum, r) => sum + r.amount, 0);
      incomeData.push(income);
      expenseData.push(expense);
   }
   return {
      labels,
      datasets: [
         { label: 'Income', data: incomeData, backgroundColor: '#3b82f6', borderRadius: 6 },
         { label: 'Expense', data: expenseData, backgroundColor: '#ef4444', borderRadius: 6 }
      ]
   };
});

const chartOptions: ChartOptions<'bar'> = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
   scales: { x: { grid: { display: false } }, y: { grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280' } } }
};

// escape a single cell (wrap with quotes, double any internal quotes)
function escapeCell(cell: any) {
   if (cell === null || cell === undefined) return '';
   const s = String(cell);
   if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
   }
   return s;
}

// build CSV string from headers and row arrays
function buildCSV(headers: string[], rows: any[][]) {
   const out: string[] = [];
   out.push(headers.map(escapeCell).join(','));
   for (const row of rows) {
      out.push(row.map(escapeCell).join(','));
   }
   return out.join('\r\n');
}

// download CSV reliably
function downloadCSV(headers: string[], rows: any[][], filename: string) {
   const csv = buildCSV(headers, rows);
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', filename);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
}

function exportReportsOnly() {
   if (!filteredReports.value.length) {
      alert('No report data!');
      return;
   }

   const headers = ['Date', 'Type', 'Description', 'Amount', 'Created By'];
   const rows = filteredReports.value.map(r => [formatDate(r.date), r.type, r.resource, r.amount, r.createdBy]);

   // Close dialog first so click isn't blocked, then start download slightly later
   showExportDialog.value = false;
   setTimeout(() => downloadCSV(headers, rows, 'report_table.csv'), 150);
}

function exportUsersOnly() {
   if (!users.value.length) {
      alert('No user data!');
      console.warn('Users array empty:', users.value);
      return;
   }

   const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender'];
   const rows = users.value.map(u => [u.id, u.first_name, u.last_name, u.email, u.phone_number, u.gender]);

   showExportDialog.value = false;
   setTimeout(() => downloadCSV(headers, rows, 'user_table.csv'), 150);
}

function exportAllTables() {
   if (!filteredReports.value.length && !users.value.length) {
      alert('No data to export!');
      showExportDialog.value = false;
      return;
   }

   // Combine report + user in one row
   const headers = [
      'Report Date', 'Report Type', 'Description', 'Amount', 'Created By',
      'First Name', 'Last Name', 'Email', 'Phone', 'Gender'
   ];

   // Take the longer array length to avoid missing rows
   const maxLength = Math.max(filteredReports.value.length, users.value.length);

   const rows: any[][] = [];

   for (let i = 0; i < maxLength; i++) {
      const report = filteredReports.value[i];
      const user = users.value[i];

      rows.push([
         report ? formatDate(report.date) : '',
         report ? report.type : '',
         report ? report.resource : '',
         report ? report.amount : '',
         report ? report.createdBy : '',
         user ? user.first_name : '',
         user ? user.last_name : '',
         user ? user.email : '',
         user ? user.phone_number : '',
         user ? user.gender : ''
      ]);
   }

   showExportDialog.value = false;
   setTimeout(() => {
      downloadCSV(headers, rows, 'all_tables_inline.csv');
   }, 150);
}

</script>
