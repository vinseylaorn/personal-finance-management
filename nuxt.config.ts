import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],
  pages: true,

  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:8000",
    },
  },

  devServer: {
    port: 3002,
    host: "localhost",
  },
  nitro: {
    preset: 'netlify'
  }

});
