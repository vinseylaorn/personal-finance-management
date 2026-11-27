<template>
  <div class="relative overflow-x-auto rounded-2xl shadow-md">
    <table class="w-full text-sm text-left rtl:text-right">
      <thead class="text-xs uppercase text-white bg-blue-900">
        <tr>
          <th v-for="header in headers" :key="header.key" scope="col" class="base-table-cell">
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="paginatedData.length === 0">
          <tr class="bg-white border-b border-gray-200">
            <td :colspan="headers.length" class="base-table-row-cell text-center">
              No data available.
            </td>
          </tr>
        </template>
        <template v-else>
          <!-- Named slot with fallback -->
          <slot name="table-rows" :items="paginatedData" :headers="headers">
            <tr v-for="(item, index) in paginatedData" :key="item.id ?? index"
              class="bg-white border-b border-gray-200 hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
              <td v-for="header in headers" :key="header.key" class="base-table-row-cell">
                {{ item[header.key] }}
              </td>
            </tr>
          </slot>
        </template>
      </tbody>

      <tfoot v-if="!hidePagination">
        <tr>
          <td :colspan="headers.length" class="p-4">
            <div class="flex justify-center items-center space-x-4">
              <button @click="prevPage" :disabled="currentPage === 1" class="base-button">
                Previous
              </button>
              <span class="text-sm">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="base-button">
                Next
              </button>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface TableHeader {
  key: string;
  label: string;
}

const props = defineProps({
  headers: {
    type: Array as () => TableHeader[],
    required: true,
  },
  data: {
    type: Array as () => any[],
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  hidePagination: {
    type: Boolean,
    default: false,
  },
});

const currentPage = ref(1);

const totalPages = computed(() => {
  if (!Array.isArray(props.data)) return 1;
  return Math.max(1, Math.ceil(props.data.length / props.itemsPerPage));
});

const paginatedData = computed(() => {
  if (!Array.isArray(props.data)) return [];
  const start = (currentPage.value - 1) * props.itemsPerPage;
  return props.data.slice(start, start + props.itemsPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Reset to page 1 when data changes
watch(
  () => props.data,
  () => {
    currentPage.value = 1;
  }
);
</script>