<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<'submit' | 'button' | 'reset'>,
      default: 'button'
    }
  }
})
</script>

<template>
  <button class="button" :type="type">
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
.button {
  width: 260px;
  height: 50px;
  background-color: transparent;
  font-family: $Golos_Text_Medium;
  font-size: 16px;
  font-weight: 500;
}
</style>
