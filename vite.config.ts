import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'
import UnoCSS from 'unocss/vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS(),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: 'vxe-pc-ui',
        }),
      ],
    }),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      beforeWriteFile: (filePath, content) => {
        return {
          filePath,
          content,
        }
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenIMWeb',
      fileName: (format) => `openim-web.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vxe-table', 'vxe-table/lib/style.css', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          'vxe-table': 'VXETable',
          '@vueuse/core': 'VueUse',
        },
        assetFileNames: (assetInfo) => {
          const source = assetInfo.source as string
          if (source.endsWith('.ttf') || source.endsWith('.woff') || source.endsWith('.woff2')) {
            return 'assets/fonts/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 0,
  },
})
