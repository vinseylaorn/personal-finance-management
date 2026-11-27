<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog"
    aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">
    <div class="relative bg-white rounded-lg shadow w-full max-w-3xl max-h-[90vh] overflow-y-auto" :class="customClass">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 id="dialog-title" class="text-lg font-semibold text-blue-700">
          {{ title }}
        </h3>
        <button @click="close" aria-label="Close dialog" class="text-gray-400 hover:text-white">
          <Icon name="mdi:close" size="18" />
        </button>
      </div>
      <!-- Body -->
      <div class="p-4 bg-white text-gray-900">
        <slot />
      </div>
      <!-- Footer -->
      <div v-if="$slots.footer" class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-100">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  title?: string
  customClass?: string
}>()

const emit = defineEmits(['update:visible'])

const close = () => emit('update:visible', false)
</script>
