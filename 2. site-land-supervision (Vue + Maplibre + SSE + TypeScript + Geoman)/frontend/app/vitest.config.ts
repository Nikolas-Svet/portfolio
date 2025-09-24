// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'vue-router'
      ],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: false,
      resolvers: [
        ElementPlusResolver()
      ]
    }),
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // добавляем .vue в список расширений
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // единственный setup-файл
    setupFiles: './vitest.setup.ts',
    // чтобы Vitest подхватывал .vue
    transformMode: {
      web: [/\.vue$/]
    }
  }
})
