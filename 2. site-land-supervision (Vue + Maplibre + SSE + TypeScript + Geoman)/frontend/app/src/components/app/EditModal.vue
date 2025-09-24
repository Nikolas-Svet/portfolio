<script setup lang="ts">
import { ref } from 'vue'
import Edit from '@/components/icons/pencil.vue'
import Check from '@/components/icons/checkMark.vue'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'

export interface Props {
  title: string
  text: string
  id_layer: null | number
}

export interface Emits {
  (event: 'save', payload: string): void

  (event: 'close'): void
}

const { title, text } = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEdit = ref<boolean>(false)
const inputText = ref<string>(text)
</script>

<template>
  <div class="edit-modal-container">
    <span class="title">{{ title }}</span>

    <textarea
      class="textarea"
      v-model="inputText"
      v-if="isEdit"
    >
      {{ text }}
    </textarea>

    <div
      class="text"
      v-else
    >
      {{ text !== '' ? text : 'У слоя отсутствует описание' }}
    </div>

    <div
      v-if="isEdit"
      class="buttons"
    >
      <button
        class="save-button"
        @click="
          () => {
            emit('save', inputText)
            isEdit = !isEdit
          }
        "
      >
        Сохранить
        <Check />
      </button>
      <button
        class="cancel-button"
        @click="
          () => {
            isEdit = !isEdit
          }
        "
      >
        Отменить
      </button>
    </div>
    <div
      v-else
      class="buttons"
    >
      <button
        v-if="id_layer ? isEditLayer(id_layer) : true"
        class="edit-button"
        @click="isEdit = !isEdit"
      >
        Редактировать
        <Edit />
      </button>
      <button
        class="close-button"
        @click="emit('close')"
      >
        Закрыть
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-modal-container {

  width: 100%;
  padding: 30px 24px;

  display: flex;
  flex-direction: column;
  gap: 20px;

  z-index: 1;

  .text {
    white-space: pre-wrap;
    flex: 1;

    overflow-x: hidden;
    text-overflow: ellipsis;

    overflow-y: auto;
  }

  .title {
    text-align: center;

    font-size: 18px;
    font-weight: 500;
    line-height: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;

    font-family: $Golos_Text_Regular;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;

    button {
      width: 100%;
      height: 40px;

      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
    }

    .edit-button {
      svg {
        transform: translate(0, -2px);
      }
    }
  }

  .textarea {
    display: flex;
    height: 185px;
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
}
</style>
