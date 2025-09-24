<template>
  <component :is="layout" :class="[{ darkTheme: isDark, lightTheme: !isDark }]" class="App">
    <RouterView />
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import LoginLayout from '@/layouts/LoginLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useDark } from '@vueuse/core'
import Notification from '@/components/app/notification.vue'

export default defineComponent({
  name: 'AppLayout',
  data() {
    return {
      isDark: useDark()
    }
  },
  components: {
    Notification,
    LoginLayout,
    MainLayout
  },
  setup() {
    const route = useRoute()

    const layout = computed(() => `${route.meta.layout || 'main'}-layout`)

    return {
      layout
    }
  }
})
</script>
