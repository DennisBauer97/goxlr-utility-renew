import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// The daemon embeds `daemon/web-content` at compile time (see daemon/src/servers/http_server.rs),
// so the production build is written straight into that directory.
const daemon = process.env.GOXLR_DAEMON ?? 'http://localhost:14564'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: '../daemon/web-content',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api/websocket': { target: daemon.replace(/^http/, 'ws'), ws: true },
      '/api': daemon,
      '/files': daemon,
      '/firmware-upload': daemon,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
