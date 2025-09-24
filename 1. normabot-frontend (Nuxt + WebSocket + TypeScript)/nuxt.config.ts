import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'vuetify-nuxt-module',
    '@nuxt/eslint',
  ],
  css: ['~/assets/styles/main.scss'],
  dir: {
    pages: 'modules/pages'
  },
  vuetify: {
    autoImport: true,
  },
  components: [
    {
      path: '~/modules/pages',
      pathPrefix: false
    }
  ],
  app: {
    head: {
      titleTemplate: '%sNormabot.Ai',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ]
    }
  },
  vite: {
    plugins: [
      svgLoader({
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:map";
            @use "@/assets/styles/_variables.scss" as *;
            @use "@/assets/styles/_mixins.scss" as *;
          `
        }
      }
    }
  }
})