<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'AppTextarea',
  props: {
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    value: {
      type: [String, Number],
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      required: true
    }
  },
  setup() {
    const isUploadLayerPath = ref(false)

    onMounted(() => {
      isUploadLayerPath.value = window.location.pathname === '/admin/upload-layer/'
    })

    return {
      isUploadLayerPath
    }
  },
  methods: {
    updateValue(e: Event) {
      const { value } = e.target as HTMLInputElement
      this.$emit('input', {
        id: this.$props.id,
        value
      })
    }
  }
})
</script>

<template>
  <div class="angle__container">
    <textarea
      class="textarea"
      :class="{ 'textarea--small': isUploadLayerPath }"
      :value="value"
      @input="updateValue"
      :name="name"
      :id="id"
      :placeholder="placeholder"
    >
    </textarea>
    <div class="angle"></div>
    <div class="angle"></div>
    <div class="angle"></div>
    <div class="angle"></div>
  </div>
</template>

<style scoped lang="scss">
.textarea {
  outline: none;
  width: 100%;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  color: $text-color;
  font-size: 14px;
  resize: none;
  border: 1px solid #a7a7a7ff;
}

.textarea--small {
  height: 185px;
  min-width: 400px;
  width: 100%;
}

.angle {
  width: 8px;
  height: 8px;

  &__container {
    display: flex;
  }
}
</style>
