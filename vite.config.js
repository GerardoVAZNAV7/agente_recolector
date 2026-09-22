import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuración estándar de Vite para un proyecto Vue3 desplegable en Vercel.
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173
  }
})
