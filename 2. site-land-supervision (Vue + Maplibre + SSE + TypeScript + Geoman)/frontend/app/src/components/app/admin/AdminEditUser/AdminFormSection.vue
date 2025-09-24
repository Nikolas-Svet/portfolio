<template>
  <div class="form__item">
    <AppAdminTitle :title="title" />
    <ul v-if="listTag === 'ul'" class="form__list">
      <slot />
    </ul>
    <div v-else class="inputs-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; listTag?: 'ul' | 'div' }>()
const listTag = props.listTag || 'div'
</script>

<style scoped lang="scss">
.form {
  height: 100%;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .inputs-container {
      padding: 0 64px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
  }
}
</style>