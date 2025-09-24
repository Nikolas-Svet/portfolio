<template>
  <form class="form" @submit.prevent="onSubmit">
    <slot name="avatar" />

    <section class="form__wrapper">
      <slot />
    </section>

    <nav class="nav_">
      <slot name="buttons" />
    </nav>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'submit'): void
}>()

function onSubmit() {
  emit('submit')
}
</script>

<style lang="scss" scoped>
.form {
  height: 100%;
  display: grid;
  align-content: normal;

  &__wrapper {
    display: grid;
    grid-gap: 32px 0;
    align-content: start;
    margin-block-end: 64px;
  }
}
</style>