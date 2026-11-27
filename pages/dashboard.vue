<template>
   <div class="p-6 mx-auto space-y-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20 text-gray-500">
         <Icon icon="mdi:loading" class="w-8 h-8 animate-spin mr-2" />
         <span class="text-lg">Loading dashboard...</span>
      </div>
      <div v-else>
         <!-- Summary Cards -->
         <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
               class="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition">
               <div>
                  <p class="text-sm text-gray-500 font-medium">Total Income</p>
                  <p class="text-3xl font-bold text-green-600">${{ totalIncome.toFixed(2) }}</p>
               </div>
               <div class="bg-green-100 p-3 rounded-full">
                  <Icon :icon="incomeIcon" class="w-8 h-8 text-green-600" />
               </div>
            </div>
            <div
               class="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition">
               <div>
                  <p class="text-sm text-gray-500 font-medium">Total Expense</p>
                  <p class="text-3xl font-bold text-red-600">${{ totalExpense.toFixed(2) }}</p>
               </div>
               <div class="bg-red-100 p-3 rounded-full">
                  <Icon :icon="expenseIcon" class="w-8 h-8 text-red-600" />
               </div>
            </div>
            <div
               class="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition">
               <div>
                  <p class="text-sm text-gray-500 font-medium">Net Balance</p>
                  <p class="text-3xl font-bold text-blue-800">${{ netBalance.toFixed(2) }}</p>
               </div>
               <div class="bg-blue-100 p-3 rounded-full">
                  <Icon :icon="balanceIcon" class="w-8 h-8 text-blue-800" />
               </div>
            </div>
         </div>
         <!-- Charts Section -->
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <div class="bg-white rounded-2xl">
               <DonutChart title="Overview Category" :labels="donutLabels" :data="donutData" :colors="donutColors"
                  total-label="Total Categories" />
            </div>

            <div class="lg:col-span-2 bg-white rounded-2xl shadow-md p-4">
               <div class="flex items-center justify-between mb-4">
                  <h2 class="font-semibold text-lg flex items-center gap-2">
                     <Icon icon="mdi:chart-bar" class="w-6 h-6 text-blue-600" /> Overview Income & Expense
                  </h2>
                  <select v-model="selectedYear"
                     class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                     <option value="thisYear">This Year</option>
                     <option value="lastYear">Last Year</option>
                  </select>
               </div>
               <div class="h-[350px]">
                  <canvas id="incomeExpenseChart" class="w-full h-full"></canvas>
               </div>
            </div>
         </div>
         <!-- Recent Transactions Table -->
         <div class="mt-4 bg-white rounded-2xl shadow-md p-6">
            <h2 class="font-semibold text-lg mb-4">Recent Transactions</h2>
            <div class="overflow-x-auto">
               <table class="w-full text-sm text-left text-gray-600">
                  <thead class="text-xs text-white uppercase bg-blue-900">
                     <tr>
                        <th class="px-4 py-2.5 text-left text-md font-medium text-white uppercase tracking-wider">Date
                        </th>
                        <th class="px-4 py-2.5 text-left text-md font-medium text-white uppercase tracking-wider">Type
                        </th>
                        <th class="px-4 py-2.5 text-left text-md font-medium text-white uppercase tracking-wider">
                           Description
                        </th>
                        <th class="px-4 py-2.5 text-left text-md font-medium text-white uppercase tracking-wider">Amount
                        </th>
                     </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                     <tr v-for="t in recentTransactions" :key="t.type + '-' + t.id"
                        class="hover:bg-blue-50 transition-colors duration-200">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                           {{ new Date(t.createdAt).toISOString().slice(0, 10) }}<br />
                           <span class="text-gray-400">{{ t.createdBy }}</span>
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                           <span :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'">
                              <Icon
                                 :icon="t.type === 'income' ? 'mdi:arrow-up-bold-circle' : 'mdi:arrow-down-bold-circle'"
                                 class="w-4 h-4 inline-block mr-1" />
                              {{ t.type }}
                           </span>
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{{ getDescription(t) }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold">
                           <span v-if="t.type === 'income'" class="text-green-600">+{{ Number(t.amount).toFixed(2)
                           }}</span>
                           <span v-else class="text-red-600">-{{ Number(t.amount).toFixed(2) }}</span>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend } from "chart.js";
import DonutChart from "~/components/common/DonutChart.vue";
import { Icon } from "@iconify/vue";
import { useIncomeApi } from "~/composables/useIncome";
import { useExpenseApi } from "~/composables/useExpense";
import { useCategory } from "~/composables/useCategory";
import { useUserStore } from '~/store/user'
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from '#app'
definePageMeta({ layout: "admin" });
const title = useDashboardTitle();
title.value = "Dashboard";
const userStore = useUserStore()
const { fetchUser } = useAuth()
const user = ref(userStore.user)
// Icons
const incomeIcon = "mdi:cash";
const expenseIcon = "mdi:credit-card";
const balanceIcon = "mdi:bank";
// Loading state
const loading = ref(true);
// Summary values
const totalIncome = ref(0);
const totalExpense = ref(0);
const netBalance = computed(() => totalIncome.value - totalExpense.value);
// Chart states
const selectedYear = ref<"thisYear" | "lastYear">("thisYear");
const totalIncomeCategories = ref(0);
const totalExpenseCategories = ref(0);
const donutLabels = ["Income", "Expense"];
const donutColors = ["#3B82F6", "#EF4444"];
const donutData = computed(() => [totalIncomeCategories.value, totalExpenseCategories.value]);
// Chart instance
let chartInstance: Chart | null = null;
Chart.register(CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend);
// APIs
const { incomes, fetchIncomes } = useIncomeApi();
const { expenses, fetchExpenses } = useExpenseApi();
const { categories, fetchCategories } = useCategory();
onMounted(async () => {
   if (!userStore.user) {
      try {
         const fetchedUser = await fetchUser()
         user.value = fetchedUser
      } catch {
         navigateTo('/login')
      }
   }
})
// Transaction types
type IncomeTransaction = {
   type: "income";
   id: number;
   source: string;
   categoryId: string | number;
   amount: number;
   createdBy: string;
   createdAt: string;
};
type ExpenseTransaction = {
   type: "expense";
   id: number;
   description: string;
   categoryId: string | number;
   amount: number;
   createdBy: string;
   createdAt: string;
};
type Transaction = IncomeTransaction | ExpenseTransaction;
// Merge incomes & expenses
const transactions = computed<Transaction[]>(() =>
   [
      ...expenses.value.map((e) => ({ ...e, type: "expense" } as ExpenseTransaction)),
      ...incomes.value.map((i) => ({ ...i, type: "income" } as IncomeTransaction)),
   ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
);
// Latest 5 transactions
const recentTransactions = computed(() => transactions.value.slice(0, 5));
// Helper for description
const getDescription = (t: Transaction) => (t.type === "income" ? t.source : t.description);
// Compute totals with 2 decimal places
const computeTotals = () => {
   totalIncome.value = Number(incomes.value.reduce((sum, i) => sum + Number(i.amount), 0).toFixed(2));
   totalExpense.value = Number(expenses.value.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2));
   totalIncomeCategories.value = categories.value.filter(c => c.type === "income").length;
   totalExpenseCategories.value = categories.value.filter(c => c.type === "expense").length;
};
// Chart data
const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "short" }));
const chartData = {
   thisYear: {
      labels: months,
      datasets: [
         { label: "Income", data: Array(12).fill(0), backgroundColor: "#3B82F6" },
         { label: "Expense", data: Array(12).fill(0), backgroundColor: "#EF4444" },
      ],
   },
   lastYear: {
      labels: months,
      datasets: [
         { label: "Income", data: Array(12).fill(0), backgroundColor: "#3B82F6" },
         { label: "Expense", data: Array(12).fill(0), backgroundColor: "#EF4444" },
      ],
   },
};
// Map DB data to chart with 2 decimals
const mapDataToChart = () => {
   const currentYear = new Date().getFullYear();
   const lastYear = currentYear - 1;
   const thisYearIncome = Array(12).fill(0);
   const thisYearExpense = Array(12).fill(0);
   const lastYearIncome = Array(12).fill(0);
   const lastYearExpense = Array(12).fill(0);
   incomes.value.forEach(i => {
      const d = new Date(i.createdAt);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (y === currentYear) thisYearIncome[m] += Number(i.amount);
      else if (y === lastYear) lastYearIncome[m] += Number(i.amount);
   });
   expenses.value.forEach(e => {
      const d = new Date(e.createdAt);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (y === currentYear) thisYearExpense[m] += Number(e.amount);
      else if (y === lastYear) lastYearExpense[m] += Number(e.amount);
   });
   chartData.thisYear.datasets[0].data = thisYearIncome.map(v => Number(v.toFixed(2)));
   chartData.thisYear.datasets[1].data = thisYearExpense.map(v => Number(v.toFixed(2)));
   chartData.lastYear.datasets[0].data = lastYearIncome.map(v => Number(v.toFixed(2)));
   chartData.lastYear.datasets[1].data = lastYearExpense.map(v => Number(v.toFixed(2)));
};
// Init chart
const initChart = async () => {
   await nextTick();
   const ctx = document.getElementById("incomeExpenseChart") as HTMLCanvasElement;
   if (!ctx) return;
   if (chartInstance) chartInstance.destroy();

   chartInstance = new Chart(ctx, {
      type: "bar",
      data: chartData[selectedYear.value],
      options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
         scales: { x: { stacked: false }, y: { beginAtZero: true } },
      },
   });
};
// Watch year change
watch(selectedYear, () => {
   mapDataToChart();
   if (!chartInstance) return;
   chartInstance.data = {
      labels: chartData[selectedYear.value].labels,
      datasets: chartData[selectedYear.value].datasets.map(ds => ({ ...ds })),
   };
   chartInstance.update();
});
// Mounted
onMounted(async () => {
   loading.value = true;
   await fetchCategories();
   await fetchIncomes();
   await fetchExpenses();
   computeTotals();
   mapDataToChart();
   loading.value = false;
   await nextTick();
   await initChart();
});
</script>
