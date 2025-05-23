import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { mkdir, copyFile } from 'fs/promises'
import { existsSync } from 'fs'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    {
      name: 'copy-types',
      async buildEnd() {
        // 复制类型声明文件到 dist 目录
        const typesDir = resolve(__dirname, 'dist/types')
        if (!existsSync(typesDir)) {
          await mkdir(typesDir, { recursive: true })
        }
        await copyFile(resolve(__dirname, 'src/types/index.d.ts'), resolve(typesDir, 'index.d.ts'))
      },
    },
  ],
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
        'unocss',
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
          unocss: 'UnoCSS',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'openim-web.css'
          return assetInfo.name || 'unknown'
        },
      },
    },
    cssCodeSplit: false,
    minify: 'terser',
    sourcemap: true,
  },
})
