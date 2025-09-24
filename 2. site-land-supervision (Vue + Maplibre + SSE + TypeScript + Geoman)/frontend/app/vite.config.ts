import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    // 1) Авто-импорт Vue, Vue Router, VueUse и т.п.
    AutoImport({
      imports: [
        'vue',
        'vue-router'
        // '@vueuse/core'
      ],
      dts: 'src/auto-imports.d.ts'
    }),

    // 2) Авто-импорт компонентов из папки `components/`
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: 'src/components.d.ts',
      resolvers: [
        ElementPlusResolver()
      ]
    }),
    vue(),
    svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:map";
          @use "@/assets/styles/components/_variables.scss" as *;
        `
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
