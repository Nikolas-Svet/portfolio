<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="empty">
    <img src="@/assets/images/empty.webp" alt="">
    <p v-if="props.title" class="empty__title text text--size--24 text--weight--600">
      {{ props.title }}
    </p>
    <span v-if="props.subtitle" class="empty__subtitle text text--size--16 text--weight--400">
      {{ props.subtitle }}
    </span>
  </div>
</template>

<style lang="scss">
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  img {
    width: 160px;
    aspect-ratio: 1 / 1;
  }

  &__title {
    margin-top: 16px;
    color: $color-text-primary;
  }

  &__subtitle {
    margin-top: 16px;
    color: $color-text-secondary;
  }
}
</style>