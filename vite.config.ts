import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

// Custom domain (datalund.no) is served from the site root.
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        demo: resolve(root, 'demo/index.html'),
      },
    },
  },
})
