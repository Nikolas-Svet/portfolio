<script lang="ts" setup>
import SidebarLeft from '~/modules/layout/sidebar-left/sidebar-left.vue'
</script>

<template>
  <main>
    <sidebar-left />
    <slot />
  </main>
</template>


<style lang="scss">
main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-bg-primary;
}
</style>
