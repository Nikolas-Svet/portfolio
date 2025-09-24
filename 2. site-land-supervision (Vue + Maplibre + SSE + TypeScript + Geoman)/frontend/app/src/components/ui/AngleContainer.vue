<template>
  <div class="angle__container">
    <slot />
    <div class="angle__wrapper">
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'AngleContainer',
  props: {
    size: {
      type: Number,
      default: 7
    }
  },
  setup(props) {
    const size = ref(props.size + 'px')

    return {
      size
    }
  }
})
</script>

<style lang="scss" scoped>
.angle__wrapper {
  --size: v-bind(size);

  .angle {
    width: var(--size);
    height: var(--size);

    &:first-child {
      right: -1px;
      bottom: -1px;
      border-right: 2px solid #d68166;
      border-bottom: 2px solid #d68166;
    }
  }
}
</style>
