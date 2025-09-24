<template>
  <section class="login_layout">
    <div v-if="authFlag" class="login_layout__container">
      <div class="background"></div>
      <RouterView />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import check from '@/components/icons/check.vue'

export default defineComponent({
  name: 'LoginLayout',
  data() {
    return {
      authFlag: true,
      flag: false
    }
  },
  components: {
    check
  }
})
</script>

<style scoped lang="scss">
.exit {
  display: none !important;
}

.login_layout {
  position: relative;
  z-index: 4;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 100vh;
  background-image: url('@/assets/images/background-login2.webp');

  &__container {
    max-width: 540px;
    margin: 0 20px;
    width: 100%;
  }
}
</style>
