<template>
   <div class="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-6"
      style="background-image: url('/image.png');">
      <div class="bg-blue bg-opacity-90 backdrop-blur-md login-panel rounded-3xl shadow-lg max-w-md w-full p-6 sm:p-10 space-y-6">
         <h2 class="text-3xl font-extrabold text-white text-center">Sign In</h2>
         <p class="text-center text-gray-200 text-sm">
            Welcome back! Please login to your account
         </p>
         <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
               <label for="username" class="block text-sm font-medium text-white mb-1">
                  Username
               </label>
               <input id="username" v-model="form.username" type="text" autocomplete="username" required
                  class="w-full px-3 py-2 border text-white border-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                  placeholder="Your username" />
            </div>
            <div class="relative">
               <label for="password" class="block text-sm font-medium text-white mb-1">
                  Password
               </label>
               <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password"
                  autocomplete="current-password" required
                  class="w-full px-3 py-2 border text-white border-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                  placeholder="Your password" />
               <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white mt-6"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                     <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white mt-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
               </button>
            </div>
            <!-- Button with spinner -->
            <button type="submit"
               class="w-full bg-blue-800 hover:bg-blue-500 text-white font-semibold py-2 rounded-md shadow-md transition flex justify-center items-center"
               :disabled="loading">
               <svg v-if="loading" class="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
               </svg>
               <span>{{ loading ? 'Logging...' : 'Log In' }}</span>
            </button>
            <p v-if="error" class="text-red-500 text-center text-sm mt-2">
               {{ error }}
            </p>
         </form>
      </div>
   </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from '#app'
const form = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const { login } = useAuth()
const handleSubmit = async () => {
   error.value = ''
   loading.value = true
   try {
      await login(form)
      await navigateTo('/dashboard')
   } catch (err: any) {
      error.value = err.message || 'Invalid username or password.'
   } finally {
      loading.value = false
   }
}
</script>