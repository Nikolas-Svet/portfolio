// vite.config.ts
import { defineConfig } from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import svgLoader from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/vite-svg-loader/index.js";
import { fileURLToPath, URL } from "node:url";
import Components from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/unplugin-vue-components/dist/vite.js";
import AutoImport from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/unplugin-auto-import/dist/vite.js";
import { ElementPlusResolver } from "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/node_modules/unplugin-vue-components/dist/resolvers.js";
var __vite_injected_original_import_meta_url = "file:///Users/nikitasvetkin/PycharmProjects/site-land-supervision/frontend/app/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    // 1) Авто-импорт Vue, Vue Router, VueUse и т.п.
    AutoImport({
      imports: [
        "vue",
        "vue-router"
        // '@vueuse/core'
      ],
      dts: "src/auto-imports.d.ts"
    }),
    // 2) Авто-импорт компонентов из папки `components/`
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      deep: true,
      dts: "src/components.d.ts",
      resolvers: [
        ElementPlusResolver()
      ]
    }),
    vue(),
    svgLoader()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
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
    host: "0.0.0.0",
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbmlraXRhc3ZldGtpbi9QeWNoYXJtUHJvamVjdHMvc2l0ZS1sYW5kLXN1cGVydmlzaW9uL2Zyb250ZW5kL2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL25pa2l0YXN2ZXRraW4vUHljaGFybVByb2plY3RzL3NpdGUtbGFuZC1zdXBlcnZpc2lvbi9mcm9udGVuZC9hcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL25pa2l0YXN2ZXRraW4vUHljaGFybVByb2plY3RzL3NpdGUtbGFuZC1zdXBlcnZpc2lvbi9mcm9udGVuZC9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcidcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgLy8gMSkgXHUwNDEwXHUwNDMyXHUwNDQyXHUwNDNFLVx1MDQzOFx1MDQzQ1x1MDQzRlx1MDQzRVx1MDQ0MFx1MDQ0MiBWdWUsIFZ1ZSBSb3V0ZXIsIFZ1ZVVzZSBcdTA0MzggXHUwNDQyLlx1MDQzRi5cbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgJ3Z1ZScsXG4gICAgICAgICd2dWUtcm91dGVyJ1xuICAgICAgICAvLyAnQHZ1ZXVzZS9jb3JlJ1xuICAgICAgXSxcbiAgICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cydcbiAgICB9KSxcblxuICAgIC8vIDIpIFx1MDQxMFx1MDQzMlx1MDQ0Mlx1MDQzRS1cdTA0MzhcdTA0M0NcdTA0M0ZcdTA0M0VcdTA0NDBcdTA0NDIgXHUwNDNBXHUwNDNFXHUwNDNDXHUwNDNGXHUwNDNFXHUwNDNEXHUwNDM1XHUwNDNEXHUwNDQyXHUwNDNFXHUwNDMyIFx1MDQzOFx1MDQzNyBcdTA0M0ZcdTA0MzBcdTA0M0ZcdTA0M0FcdTA0MzggYGNvbXBvbmVudHMvYFxuICAgIENvbXBvbmVudHMoe1xuICAgICAgZGlyczogWydzcmMvY29tcG9uZW50cyddLFxuICAgICAgZXh0ZW5zaW9uczogWyd2dWUnXSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKClcbiAgICAgIF1cbiAgICB9KSxcbiAgICB2dWUoKSxcbiAgICBzdmdMb2FkZXIoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICB9XG4gIH0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBcbiAgICAgICAgICBAdXNlIFwic2FzczptYXBcIjtcbiAgICAgICAgICBAdXNlIFwiQC9hc3NldHMvc3R5bGVzL2NvbXBvbmVudHMvX3ZhcmlhYmxlcy5zY3NzXCIgYXMgKjtcbiAgICAgICAgYFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDUxNzNcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVksU0FBUyxvQkFBb0I7QUFDcGEsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZUFBZTtBQUN0QixTQUFTLGVBQWUsV0FBVztBQUNuQyxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQU5rTixJQUFNLDJDQUEyQztBQVF2UyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUE7QUFBQSxJQUVQLFdBQVc7QUFBQSxNQUNULFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBO0FBQUEsTUFFRjtBQUFBLE1BQ0EsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsSUFHRCxXQUFXO0FBQUEsTUFDVCxNQUFNLENBQUMsZ0JBQWdCO0FBQUEsTUFDdkIsWUFBWSxDQUFDLEtBQUs7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsUUFDVCxvQkFBb0I7QUFBQSxNQUN0QjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLElBQ0osVUFBVTtBQUFBLEVBQUM7QUFBQSxFQUNiLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
