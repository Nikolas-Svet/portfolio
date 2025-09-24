<script setup lang="ts">
import ChatHeader from '~/modules/layout/chat-window/components/ChatHeader.vue'
import ChatBody from '~/modules/layout/chat-window/components/ChatBody.vue'
import ChatInput from '~/modules/layout/chat-window/components/ChatInput.vue'


</script>

<template>
<section class="chat-window">
  <ChatHeader :title="'Новый чат'"/>
  <ChatBody/>
  <ChatInput/>
</section>
</template>

<style lang="scss">
.chat-window {
  height: 100%;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
</style>