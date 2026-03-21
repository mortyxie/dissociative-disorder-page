import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/',
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5174, // 固定端口
    open: false, // 不自动打开浏览器
  },
})
