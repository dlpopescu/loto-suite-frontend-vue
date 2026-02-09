import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Loto No Scan',
        short_name: 'Loto',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2196F3',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  root: '.',
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
