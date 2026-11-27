<template>
  <div
    class="space-y-4 flex flex-col h-full bg-white"
    :class="[border ? 'rounded-2xl shadow p-4' : '']"
  >
    <!-- Chart title -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-left">{{ title }}</h2>
      <slot name="header" />
    </div>

    <!-- Donut Chart -->
    <div class="flex justify-center items-center flex-grow relative">
      <div class="relative" :style="{ width, height }">
        <Pie :data="chartData" :options="chartOptions" ref="pieChart" />

        <!-- Centered Total -->
        <div
          v-if="showTotal"
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
        >
          <p class="text-xl font-semibold text-gray-800">{{ totalValue }}</p>
          <p class="text-sm text-gray-500">{{ totalLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <ul class="space-y-1">
      <li
        v-for="(label, i) in labels"
        :key="label"
        class="flex items-center gap-2 text-sm cursor-pointer"
        @click="toggleDataset(i)"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-2 h-2 rounded-full p-2"
            :style="{
              backgroundColor: colors[i],
              opacity: datasetVisibility[i] ? 1 : 0.4,
            }"
          />
          <span
            class="text-gray-700"
            :class="{ 'line-through': !datasetVisibility[i] }"
          >
            {{ label }}
          </span>
        </div>
        <span class="text-gray-500 font-medium">({{ data[i] }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Tooltip,
  ArcElement,
  type ChartData,
  type ChartOptions,
} from "chart.js";

ChartJS.register(Tooltip, ArcElement);

interface PieChartProps {
  title: string;
  labels: string[];
  data: number[];
  colors?: string[];
  border?: boolean;
  width?: string;
  height?: string;
  showTotal?: boolean;
  totalLabel?: string;
  totalValue?: string | number;
}

const props = withDefaults(defineProps<PieChartProps>(), {
  colors: () => ["#3B82F6", "#06B6D4", "#10B981", "#6366F1"],
  border: true,
  width: "250px",
  height: "250px",
  showTotal: true,
  totalLabel: "Total",
});

const pieChart = ref<ChartJS<"pie"> | null>(null);
const datasetVisibility = ref<boolean[]>([]);

onMounted(() => {
  datasetVisibility.value = props.labels.map(() => true);
});

watch(
  () => props.labels.length,
  () => {
    datasetVisibility.value = props.labels.map(() => true);
  }
);

const chartData = computed<ChartData<"pie">>(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors,
      borderWidth: 0,
    },
  ],
}));

const chartOptions: ChartOptions<"pie"> = {
  responsive: true,
  cutout: "70%", // makes it donut
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw}`,
      },
    },
  },
};

const toggleDataset = (index: number) => {
  if (pieChart.value) {
    const chartInstance = (pieChart.value as any).chart as ChartJS<"pie">;
    if (chartInstance) {
      datasetVisibility.value[index] = !datasetVisibility.value[index];
      const meta = chartInstance.getDatasetMeta(0);
      (meta.data[index] as any).hidden = !datasetVisibility.value[index];
      chartInstance.update();
    }
  }
};

const totalValue = computed(() => {
  if (props.totalValue !== undefined && props.totalValue !== null) {
    return props.totalValue;
  }
  return props.data.reduce(
    (sum, val, i) => (datasetVisibility.value[i] ? sum + val : sum),
    0
  );
});
</script>
