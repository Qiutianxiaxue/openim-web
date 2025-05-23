import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace(/src\//, ''),
        content,
      }),
    }),
    UnoCSS(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenIMWeb',
      fileName: (format) => `openim-web.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        'vue',
        'vxe-pc-ui',
        'pinia',
        'pinia-plugin-persistedstate',
        'vue-i18n',
        'dayjs',
        'openim-websocket',
      ],
      output: {
        exports: 'named',
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'vxe-pc-ui': 'VxeUI',
          pinia: 'Pinia',
          'pinia-plugin-persistedstate': 'piniaPluginPersistedstate',
          'vue-i18n': 'VueI18n',
          dayjs: 'dayjs',
          'openim-websocket': 'OpenIMWebsocket',
        },
        // 确保CSS文件名正确
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'openim-web.css'
          if (assetInfo.name === 'index.css') return 'openim-web.css'
          return assetInfo.name || 'unknown'
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
