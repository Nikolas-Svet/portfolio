<script setup lang="ts">
const props = defineProps<{
  title: string
}>()
</script>

<template>
<header class="primary-header">
  <div class="container-chat">
    <h2 class="chat-window__title text text--size--18 text--weight--500">{{ props.title }}</h2>
  </div>
</header>
</template>

<style lang="scss">
.primary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-shadow: 1px 4px 16.6px 0 #30435B14;
  padding: 32px 0;
}
</style>