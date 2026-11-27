<template>
  <transition name="fade">
    <div v-if="visible" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div class="flex items-center px-6 py-4 mx-4 rounded-md text-lg max-w-lg w-full shadow-md border"
        :class="alertClasses" role="alert">
        <!-- Dynamic Icon -->
        <span class="shrink-0 w-6 h-6 mr-3" v-html="alertIcon"></span>

        <!-- Message -->
        <div class="flex-1">
          <span class="font-semibold">{{ title }}</span> {{ message }}
        </div>

        <!-- Close Button -->
        <button @click="close" class="ml-4 font-bold text-xl leading-none hover:text-gray-700" aria-label="Close alert">
          &times;
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "FormAlert",
  props: {
    type: { type: String, default: "info" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    visible: { type: Boolean, default: false },
  },
  computed: {
    alertClasses() {
      const colors = {
        success: "bg-green-200 text-green-800 border-green-300",
        danger: "bg-red-200 text-red-800 border-red-300",
        warning: "bg-orange-200 text-yellow-800 border-yellow-300",
        info: "bg-blue-200 text-blue-800 border-blue-300",
      };
      return colors[this.type] || colors.info;
    },
    alertIcon() {
      const icons = {
        success: `<svg viewBox="0 0 24 24" class="text-green-600 w-6 h-6"><path fill="currentColor" d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"/></svg>`,
        danger: `<svg viewBox="0 0 24 24" class="text-red-600 w-6 h-6"><path fill="currentColor" d="M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207,11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" class="text-yellow-600 w-6 h-6"><path fill="currentColor" d="M23.119,20,13.772,2.15h0a2,2,0,0,0-3.543,0L.881,20a2,2,0,0,0,1.772,2.928H21.347A2,2,0,0,0,23.119,20ZM11,8.423a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Zm1.05,11.51h-.028a1.528,1.528,0,0,1-1.522-1.47,1.476,1.476,0,0,1,1.448-1.53h.028A1.527,1.527,0,0,1,13.5,18.4,1.475,1.475,0,0,1,12.05,19.933Z"/></svg>`,
        info: `<svg viewBox="0 0 24 24" class="text-blue-600 w-6 h-6"><path fill="currentColor" d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm.25,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,12.25,5ZM14.5,18.5h-4a1,1,0,0,1,0-2h.75a.25.25,0,0,0,.25-.25v-4.5a.25.25,0,0,0-.25-.25H10.5a1,1,0,0,1,0-2h1a2,2,0,0,1,2,2v4.75a.25.25,0,0,0,.25.25h.75a1,1,0,1,1,0,2Z"/></svg>`,
      };
      return icons[this.type] || icons.info;
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  /* springy effect */
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
  filter: blur(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  filter: blur(4px);
}
</style>
