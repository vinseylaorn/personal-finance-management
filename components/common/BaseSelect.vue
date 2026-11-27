<template>
  <div class="relative">
    <label :for="id" class="base-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- SELECT WRAPPER -->
    <div class="relative">
      <select :id="id" :value="validatedModelValue" @change="handleChange" :required="required" :disabled="disabled"
        :aria-required="required" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined"
        class="base-select appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
        <!-- Show placeholder only if required and no value is selected -->
        <option value="" v-if="!modelValue" :disabled="required">
          {{ placeholder }}
        </option>
        <option v-for="option in safeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- ICON -->
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-4 h-4 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>

    <!-- ERROR -->
    <p v-if="error" :id="`${id}-error`" class="base-error-message">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from "vue";

interface Option {
  value: string | number;
  label: string;
}

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    default: "",
  },
  options: {
    type: Array as () => Option[],
    required: true,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },

  placeholder: {
    type: String,
    default: "Select..",
  },
});


const emit = defineEmits(["update:modelValue"]);

// Computed to ensure we always have valid options
const safeOptions = computed(() => {
  return Array.isArray(props.options) ? props.options : [];
});

// Computed to validate if current modelValue exists in options
const validatedModelValue = computed(() => {
  // Always return the current modelValue, even if empty
  return props.modelValue;
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target) {
    emit("update:modelValue", target.value);
  }
};
</script>