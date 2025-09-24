<script setup lang="ts">
import { computed } from 'vue'
import SearchIcon from '@/assets/images/search.svg'

const props = defineProps<{
  modelValue: string | number
  type?: string
  placeholder?: string
  label?: string
  id?: string
  disabled?: boolean
  error?: string
  isSearchIcon?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'focus', ev: FocusEvent): void
  (e: 'blur', ev: FocusEvent): void
}>()

const inputId = computed(
  () => props.id || `ui-input-${Math.random().toString(36).substr(2, 9)}`
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onFocus(event: FocusEvent) {
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <div
    class="ui-input">
    <label
      v-if="label"
      :for="inputId"
      class="ui-input__label"
    >{{ label }}</label>

    <input
      :style="{paddingLeft: props.isSearchIcon ? '64px' : '24px'}"
      :id="inputId"
      :type="type || 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      class="ui-input__control text text--weight--400 text--size--16"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />

    <p v-if="error" class="ui-input__error">{{ error }}</p>

    <SearchIcon class="ui-input__search-icon" v-if="props.isSearchIcon"/>
  </div>
</template>

<style lang="scss">
.ui-input {
  position: relative;
  width: 100%;
  height: 42px;
  border-radius: 8px;

  input {
    padding: 0 24px;
    height: 100%;
    width: 100%;
    border-radius: 8px;
    background-color: $color-bg-primary;
    border: 1px solid $color-border-chat-secondary;
    transition: all 0.3s ease;
    color: $color-text-primary;

    &:focus {
      border: 1px solid $color-primary;
    }

    &:hover {
      border: 1px solid $color-primary;
    }

    &::placeholder {
      color: $color-border-chat;
    }
  }

  &__label {

  }
  &__control {

  }
  &__error   {

  }

  &__search-icon {
    position: absolute;
    left: 24px;
    width: 24px;
    height: 24px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
