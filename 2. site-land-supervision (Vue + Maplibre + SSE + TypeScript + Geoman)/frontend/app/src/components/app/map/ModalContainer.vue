<template>
  <div v-if="modals.length" class="modal-container">
    <!-- Рендерим все модальные окна из массива -->
    <DraggableModal
      v-for="modal in modals"
      :key="modal.id"
      :title="modal.title"
      :initialStyle="modal.style"
      @close="closeModal(modal.id)"
    >
      <!-- Если содержимое окна – компонент, рендерим его динамически -->
      <component :is="modal.component" v-bind="modal.props" />
    </DraggableModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import DraggableModal from './DraggableModal.vue'

export default defineComponent({
  name: 'ModalContainer',
  components: { DraggableModal },
  data() {
    return {
      // Массив модальных окон
      modals: [] as Array<{
        id: number
        title: string
        component: any
        props: any
        style: { top: string; left: string }
      }>
    }
  },
  methods: {
    /**
     * Открывает новое модальное окно
     * @param options.title - Заголовок окна
     * @param options.component - Компонент, который будет отображён внутри окна (например, InfoBoxContent)
     * @param options.props - Пропсы для дочернего компонента
     * @param options.style - Начальная позиция окна (top, left)
     */
    openModal(options: {
      title: string
      component: any
      props?: any
      style?: { top: string; left: string }
    }) {
      const id = Date.now() + Math.random()
      this.modals.push({
        id,
        title: options.title,
        component: markRaw(options.component),
        props: options.props || {},
        style: options.style || { top: '100px', left: '100px' }
      })
    },
    /**
     * Закрывает модальное окно по id
     */
    closeModal(id: number) {
      this.modals = this.modals.filter((modal: any) => modal.id !== id)
    }
  }
})
</script>

<style scoped>
/* CSS для контейнера модальных окон */
.modal-container {
  position: absolute; /* или fixed, если нужно */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Контейнер не перехватывает события мыши */
  pointer-events: none;
  z-index: 100; /* При необходимости, чтобы модальные окна были поверх карты */
}

/* Для каждого DraggableModal задаём pointer-events: auto, чтобы они были интерактивными */
.draggable-modal {
  pointer-events: auto;
}
</style>
