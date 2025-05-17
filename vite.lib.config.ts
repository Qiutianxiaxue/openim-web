import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenIMWeb',
      fileName: (format) => `openim-web.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
        },
      },
    },
  },
})
