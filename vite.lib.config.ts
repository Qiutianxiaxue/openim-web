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
      external: [
        'vue',
        'vue-router',
        'pinia',
        'dayjs',
        'openim-websocket',
        'pinia-plugin-persistedstate',
        'vue-i18n',
        'vxe-pc-ui',
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          dayjs: 'dayjs',
          'openim-websocket': 'OpenIMWebSocket',
          'pinia-plugin-persistedstate': 'piniaPluginPersistedstate',
          'vue-i18n': 'VueI18n',
          'vxe-pc-ui': 'VxeUI',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'openim-web.css'
          return assetInfo.name || 'unknown'
        },
      },
    },
    cssCodeSplit: true,
    minify: 'terser',
    sourcemap: true,
  },
})
