<script setup lang="ts">

import CheckIcon from '~/assets/images/check.svg'
</script>

<template>
  <div class="active-block">
    <CheckIcon/>
  </div>
</template>

<style lang="scss">
.active-block {
  min-width: 16px;
  max-width: 16px;
  height: 16px;
  background-color: $color-green;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    transform: scale(0.7) translate(1px, 1px);
    * {
      stroke: $color-bg-primary;
    }
  }
}
</style>