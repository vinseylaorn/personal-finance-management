<template>
  <div class="relative">
    <label :for="id" class="base-label ">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input :id="id" :type="type" :placeholder="placeholder" :value="modelValue" @input="handleChange"
      class="base-input " :required="required" :aria-required="required" :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined" :disabled="disabled" />
    <p v-if="error" :id="`${id}-error`" class="base-error-message">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  type: {
    type: String,
    default: "text",
    validator: (value: string) =>
      ["text", "email", "password", "number", "url", "tel", "search"].includes(
        value
      ),
  },
  placeholder: {
    type: String,
    default: "",
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
});

const emit = defineEmits(["update:modelValue"]);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit("update:modelValue", target.value);
  }
};
</script>