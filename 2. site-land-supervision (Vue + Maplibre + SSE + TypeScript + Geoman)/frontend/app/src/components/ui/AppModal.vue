<script lang="ts" setup>
const props = defineProps({
  title: String
})
</script>

<template>
  <div class="window">
    <div class="window__content">
      <p class="window__title">{{ props.title }}</p>
      <div class="window__actions">
        <slot name="ActionsBlock" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.window {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  z-index: 100;

  &__title {
    font-family: $Golos_Text_Medium;
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 24px;
  }

  &__content {
    position: absolute;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    max-width: 490px;
    width: 100%;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);

    padding: 32px;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
}
</style>