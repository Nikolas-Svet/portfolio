<script setup lang="ts">
import EditIcon from '@/assets/images/edit.svg'
import CheckIcon from '@/assets/images/check.svg'
import CloseIcon from '@/assets/images/close.svg'
import BurgerBlock from '~/components/ui/BurgerBlock.vue'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const editTitle = ref<string>('')
const isEditWindow = ref<boolean>(false)
const isEditWindowMobile = ref<boolean>(false)

const onEdit = async () => {
  if (window.innerWidth <= 1024) {
    isEditWindowMobile.value = true
  }
  isEditWindow.value = true
  editTitle.value = props.title

  await nextTick(() => {
    autoInput.value?.focus()
  })
}

const onEditClose = () => {
  isEditWindow.value = false
  isEditWindowMobile.value = false
}

const acceptEdit = () => {
  console.log('Сохранение нового заголовка')
}

const autoInput = ref<HTMLInputElement>()

function adjustWidth() {
  const el = autoInput.value
  if (!el) return
  el.style.width = '0'
  el.style.width = `${el.scrollWidth + 2}px`
}

watch(editTitle, adjustWidth)


const updateDeviceClass = () => {
  if (window.innerWidth <= 1024 && isEditWindow.value && !isEditWindowMobile.value) {
    isEditWindowMobile.value = isEditWindow.value
  } else if (window.innerWidth > 1024 && isEditWindow.value && isEditWindowMobile.value) {
    isEditWindow.value = isEditWindowMobile.value
    isEditWindowMobile.value = false
  }
}

onMounted(() => {
  adjustWidth()
  updateDeviceClass()
  window.addEventListener('resize', updateDeviceClass)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDeviceClass)
})
</script>

<template>
  <header class="chat-window__header">
    <BurgerBlock/>

    <div class="container-chat">
      <h2 v-if="!isEditWindow" class="chat-window__title text text--size--18 text--weight--500">{{ props.title }}</h2>
      <button
        v-if="!isEditWindow"
        type="button"
        class="chat-window__edit-button"
        aria-label="Редактировать название чата"
        @click="onEdit"
      >
        <EditIcon class="chat-window__edit-icon" aria-hidden="true" />
      </button>

      <input
        v-model="editTitle"
        v-if="isEditWindow"
        class="chat-window__edit-input text text--size--18 text--weight--500"
        type="text"
        @input="adjustWidth"
        ref="autoInput"
      >
      <div v-if="isEditWindow" class="chat-window__edit-actions">
        <button @click="onEditClose" class="chat-window__edit-button--cancel text text--size--14 text--weight--500">
          Отменить изменения
          <CloseIcon class="chat-window__edit-icon"/>
        </button>
        <button @click="acceptEdit" class="chat-window__edit-button--accept text text--size--14 text--weight--500">
          Сохранить
          <CheckIcon class="chat-window__edit-icon"/>
        </button>
      </div>

      <div :class="{'chat-window__edit-actions-mobile--active': isEditWindowMobile}" class="chat-window__edit-actions-mobile">
        <button @click="onEditClose" class="chat-window__edit-button--cancel text text--size--14 text--weight--500">
          Отменить изменения
          <CloseIcon class="chat-window__edit-icon"/>
        </button>
        <button @click="acceptEdit" class="chat-window__edit-button--accept text text--size--14 text--weight--500">
          Сохранить
          <CheckIcon class="chat-window__edit-icon"/>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.chat-window {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 100%;
    box-shadow: 1px 4px 16.6px 0 #30435B14;
    padding: 32px 0;

    .container-chat {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  &__title {
    align-content: center;
    height: 33px;
    color: $color-text-primary;
    margin-right: 24px;
  }

  &__edit {
    &-button {
      background-color: transparent;
      border: none;
      width: 24px;
      height: 24px;
      cursor: pointer;

      &:hover {
        * {
          stroke: $color-primary
        }
      }

      &--accept {
        width: 37%;
        height: 33px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        color: $color-primary;
        border-radius: 6px;
        gap: 10px;
        border: 1px solid $color-primary;
        background-color: transparent;
        transition: all 0.3s ease;
        max-width: 130px;
        svg {
          min-width: 16px;
          max-width: 16px;
          transform: scale(1.5) translateY(1px);
          height: 11px;
        }

        &:hover {
          background-color: $color-hover-sidebar;
        }
      }

      &--cancel {
        max-width: 215px;
        width: 60%;
        height: 33px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        color: $color-text-secondary;
        border-radius: 6px;
        gap: 10px;
        border: 1px solid $color-border-chat;
        background-color: transparent;
        transition: all 0.3s ease;
        svg {
          min-width: 15px;
          max-width: 15px;
          height: 14px;
        }

        &:hover {
          border: 1px solid $color-primary;
          color: $color-text-primary;
        }
      }
    }
    &-icon {
      width: 100%;
      height: 100%;
      * {
        transition: all 0.3s ease;
      }
    }

    &-input {
      background-color: transparent;
      border: none;
      padding-right: 16px;
      flex: 1;
      max-width: 280px;
    }

    &-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      flex: 1;
      width: 100%;

      &-mobile {
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: space-between;
        left: 50%;
        transform: translateX(-50%) scale(0);
        top: 0;
        max-width: 390px;
        width: 100%;
        padding: 20px;
        border-radius: 10px;
        //height: 100px;
        z-index: 1;
        background-color: $color-bg-sidebar;
        box-shadow: 1px 4px 16.6px 0 rgba(48, 67, 91, 0.0784313725);
        transition: transform 0.2s ease, top 0.2s ease;

        &:after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 20px solid $color-bg-sidebar;
          left: 50%;
          top: -20px;
          transform: translateX(-50%);
          box-shadow: drop-shadow(1px -11px 16.6px rgba(48,67,91,0.58));
          z-index: -1;
        }

        &--active {
          transform: translateX(-50%) scale(1);
          top: 150%;
          transition: transform 0.2s ease, top 0.2s ease;
        }

      }
    }
  }
}

@media (width < 1024px) {
  .chat-window {
    &__header {
      position: relative;
      padding: 24px 0;
      .container-chat {
        position: relative;
        justify-content: center;
      }
    }

    &__icon {
      &-burger {
        display: flex;
      }
    }

    &__edit {
      &-actions {
        display: none;
      }

      &-input {
        width: 110px;
        height: 33px;
        flex: none;
      }

      &-actions-mobile {
        display: flex;
      }
    }
  }
}

@media (width < 768px) {
  .chat-window {
    &__header {
      padding: 16px 0;
    }

    &__edit {
      &-input {
        max-width: 200px;
      }
    }
  }
}
</style>