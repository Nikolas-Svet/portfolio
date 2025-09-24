<script setup lang="ts">
import SidebarLeft from '~/modules/layout/sidebar-left/sidebar-left.vue'
import SidebarRight from '~/modules/layout/sidebar-right/sidebar-right.vue'
import ChatWindow from '~/modules/layout/chat-window/ChatWindow.vue'
</script>

<template>
  <chat-window/>
  <sidebar-right/>
</template>

<style lang="scss">
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>