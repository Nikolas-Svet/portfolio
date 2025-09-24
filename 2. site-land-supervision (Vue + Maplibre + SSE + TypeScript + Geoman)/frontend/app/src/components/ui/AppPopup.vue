<template>
  <div class="popup">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style lang="scss">
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 20px;
  transform: translate(-50%, -50%);
}
</style>
