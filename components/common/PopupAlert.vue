<!-- ConfirmModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
    @click.self="cancel">
    <div
      class="bg-white rounded-lg shadow-lg max-w-sm w-full p-3 relative">
      <!-- Icon -->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-3 text-red-500 w-12 h-12 ">
      <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
      <!-- Message -->
      <h3 class="text-center font-medium text-md  mb-5">{{ message }}</h3>
      <!-- Buttons -->
      <div class="flex justify-center space-x-4">
        <button
          @click="cancel"
          type="button"
          class="ml-3 py-2.5 px-5 bg-gray-200 text-sm font-medium text-gray-900  rounded-lg border border-gray-200 hover:bg-gray-100 w-30 ">
          Cancel
        </button>
        <button
          @click="confirm"
          type="button"
          class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300  font-medium rounded-lg text-sm py-2.5 w-30">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  message: {
    type: String,
    default: 'Are you sure you want to delete this product?',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
