<template>
  <div class="draggable-modal" :style="modalStyle" @mousedown="bringToFront">
    <div class="modal-header" @mousedown="onMouseDown">
      <!--      <span>{{ title }}</span>-->
      <div class="modal-buttons">
        <!-- Можно добавить кнопку для переключения режима, если требуется -->
        <modal :class="{ 'modal-svg-active': !isModal }" @click="toggleModalMode"></modal>
        <!--        <button @click="toggleModalMode">-->
        <!--          {{ isModal ? 'Выйти из модального режима' : 'Сделать модальным' }}-->
        <!--        </button>-->
        <div class="icon-close" @click="close"></div>
        <!--        <button @click="close">Закрыть</button>-->
      </div>
    </div>
    <div class="modal-content">
      <!-- Слот для содержимого окна -->
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Modal from '@/components/icons/modal.vue'

export default defineComponent({
  name: 'DraggableModal',
  components: { Modal },
  props: {
    title: {
      type: String,
      default: 'Модальное окно'
    },
    // Начальная позиция окна
    initialStyle: {
      type: Object as () => { top: string; left: string },
      default: () => ({ top: '100px', left: '100px' })
    }
  },
  data() {
    return {
      // Стиль, который изменяется при перемещении окна
      modalStyle: { ...this.initialStyle },
      isModal: true, // флаг, управляющий режимом окна (для перетаскивания и z-index)
      dragging: false,
      dragOffset: { x: 0, y: 0 }
    }
  },
  methods: {
    close() {
      // Передаём событие закрытия родителю
      this.$emit('close')
    },
    toggleModalMode() {
      // Переключение режима (если требуется логика для не модального режима)
      this.isModal = !this.isModal
    },
    onMouseDown(event: MouseEvent) {
      if (!this.isModal) return
      // Вычисляем смещение между позицией окна и курсором
      const box = (this.$el as HTMLElement).getBoundingClientRect()
      this.dragOffset.x = event.clientX - box.left
      this.dragOffset.y = event.clientY - box.top + 90
      this.dragging = true
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
      // Чтобы предотвратить выделение текста
      event.preventDefault()
    },
    onMouseMove(event: MouseEvent) {
      if (!this.dragging) return
      // Обновляем стиль с новой позицией
      this.modalStyle.top = event.clientY - this.dragOffset.y + 'px'
      this.modalStyle.left = event.clientX - this.dragOffset.x + 'px'
    },
    onMouseUp() {
      this.dragging = false
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    },
    bringToFront() {
      // Простейшая логика для поднятия окна на передний план (можно доработать)
      ;(this.$el as HTMLElement).style.zIndex = '1000'
    }
  }
})
</script>

<style scoped lang="scss">
.modal-svg {
  width: 25px;
  height: 25px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.draggable-modal {
  pointer-events: auto;
  position: absolute;
  width: 300px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 8px;
  cursor: move;
  display: flex;
  font-size: 18px;
  justify-content: flex-end;
  align-items: center;
  user-select: none;
}

.modal-buttons {
  display: flex;
  width: 70px;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  padding: 10px;
  max-height: 500px;
  overflow-y: auto;

  font-size: 16px;
}
</style>
