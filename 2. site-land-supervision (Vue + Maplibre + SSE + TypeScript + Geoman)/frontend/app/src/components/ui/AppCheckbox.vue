<template>
  <div class="app-checkbox" :class="{ 'with-label': label }" @click="change">
    <div class="app-checkbox__fake" :class="{ checked }"></div>
    <span class="app-checkbox__label">{{ label }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppCheckbox',
  props: {
    checked: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  },
  emits: ['change'],
  methods: {
    change() {
      this.$emit('change', !this.checked)
    }
  }
})
</script>

<style lang="scss" scoped>
.app-checkbox {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  cursor: pointer;

  &.with-label {
    grid-gap: 0 0.5rem;
  }

  &__fake {
    display: block;
    position: relative;
    width: 1.1rem;
    height: 1.1rem;

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 60%;
      height: 60%;
      transform: translate(-50%, -50%);
      mask-image: url('@/assets/images/checked.svg');
      opacity: 0;
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: 100% 100%;
      pointer-events: none;
    }

    &.checked {
      &::after {
        opacity: 1;
      }
    }
  }

  &__label {
    display: grid;
    align-items: center;
    font-size: 1rem;
  }
}
</style>
