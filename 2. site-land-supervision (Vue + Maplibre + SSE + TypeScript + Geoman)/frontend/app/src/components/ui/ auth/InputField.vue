<template>
  <div class="reset-password__container-input">
    <span>{{ label }}</span>
    <input
      :type="type"
      :placeholder="placeholder"
      v-model="internalValue"
      :class="{ filled: internalValue }"
      @keyup.enter="$emit('enter')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'enter'): void
}>()

const internalValue = computed<string>({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
</script>

<style lang="scss" scoped>
.reset-password {
  &__container-input {
    display: flex !important;
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
}
</style>
