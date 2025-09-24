<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AngleContainer from './AngleContainer.vue'

export interface IUpdateInput {
  id: string | number
  value: string | number
}

interface Props {
  id: string
  name: string
  type?: string

  value: string | number

  placeholder?: string
  withAngles?: boolean
  withBorder?: boolean
  canClear?: boolean
}

interface Emits {
  (event: 'input', payload: IUpdateInput): void

  (event: 'clear'): void
}

const {
  id,
  name,
  type = 'text',
  value = '',
  placeholder,
  withAngles = true,
  withBorder = true,
  canClear
} = defineProps<Props>()

const emit = defineEmits<Emits>()

const isUploadLayerPath = ref(false)
const inputBorder = withBorder ? '1px solid' : 'none'

const updateValue = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  // Эмитим событие "input", передавая { id, value }
  emit('input', {
    id,
    value
  })
}

onMounted(() => {
  isUploadLayerPath.value = window.location.pathname === '/admin/upload-layer/'
})
</script>

<template>
  <div class="input-container">
    <AngleContainer v-if="withAngles">
      <input
        ref="input"
        class="input"
        :class="{ 'input--small': isUploadLayerPath }"
        :value="value"
        @input="updateValue"
        :type="type"
        :name="name"
        :id="id"
        :placeholder="placeholder"
      />
      <div
        v-if="canClear"
        @click="emit('clear')"
        class="icon-close"
      />
    </AngleContainer>

    <input
      v-else
      ref="input"
      class="input"
      :class="{ 'input--small': isUploadLayerPath }"
      :value="value"
      @input="updateValue"
      :type="type"
      :name="name"
      :id="id"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped lang="scss">
.input-container {
  position: relative;

  .input {
    outline: none;
    width: 100%;
    height: 55px;
    background-color: transparent;
    border: v-bind(inputBorder);
    padding: 1.25rem;
    border-radius: 0;
    font-size: 16px;

    &::placeholder {
      font-size: 16px;
      opacity: 0.6;
    }
  }

  .input--small {
    height: 40px; // Высота для пути /admin/upload-layer/
    min-width: 400px;
    width: 100%;
  }

  .angle {
    width: 8px;
    height: 8px;
  }

  .icon-close {
    right: 7px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
