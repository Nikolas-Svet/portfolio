<script setup lang="ts">
import CloseIcon from '~/assets/images/close.svg'
</script>

<template>
  <div class="inactive-block">
    <CloseIcon/>
  </div>
</template>

<style scoped lang="scss">
.inactive-block {
  min-width: 16px;
  max-width: 16px;
  height: 16px;
  background-color: $color-red;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 16px;
    height: 16px;
    transform: scale(0.6) translate(1px, 1px);
    * {
      stroke: $color-bg-primary;
    }
  }
}
</style>