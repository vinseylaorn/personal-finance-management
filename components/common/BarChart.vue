<template>
  <div class="bg-white rounded-2xl shadow p-4 space-y-4 flex flex-col h-full">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-left">{{ title }}</h2>
      <slot name="filter" />
    </div>

    <div class="flex-1 relative h-full max-h-[250px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
  type ChartData,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

// Define Props
const props = defineProps<{
  title: string;
  labels: string[];
  data: number[];
  barColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}>();

const chartData = computed<ChartData<"bar">>(() => ({
  labels: props.labels,
  datasets: [
    {
      label: "Value",
      backgroundColor: props.barColor ?? "green",
      data: props.data,
      borderRadius: 4,
    },
  ],
}));

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = context.dataset.label ?? "";
          if (label) label += ": ";
          if (context.parsed.y !== null) label += context.parsed.y;
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: !!props.xAxisLabel,
        text: props.xAxisLabel,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: !!props.yAxisLabel,
        text: props.yAxisLabel,
      },
      grid: {
        color: "#e2e8f0",
      },
    },
  },
};
</script>