<script setup lang="ts">
import { ref } from 'vue'

// Список уведомлений
const notifications = ref<
  { id: number; message: string; isAutoClose: boolean; isVisible: boolean }[]
>([])

// Добавление нового уведомления
function showNotification(text: string, autoClose: boolean) {
  const id = Date.now() // Уникальный идентификатор уведомления

  // Добавляем уведомление в список
  notifications.value.push({ id, message: text, isAutoClose: autoClose, isVisible: false })

  // Ограничиваем максимум до 4 уведомлений
  if (notifications.value.length > 4) {
    notifications.value.shift() // Удаляем первое уведомление
  }

  // Активируем анимацию через 50 мс
  setTimeout(() => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) notification.isVisible = true
  }, 50)

  // Если нужно автозакрытие, запускаем таймер
  if (autoClose) {
    setTimeout(() => hideNotification(id), 5000)
  }
}

// Удаление уведомления
function hideNotification(id: number) {
  const notificationIndex = notifications.value.findIndex((n) => n.id === id)
  if (notificationIndex !== -1) {
    notifications.value[notificationIndex].isVisible = false // Скрыть анимацией
    setTimeout(() => {
      notifications.value.splice(notificationIndex, 1) // Удалить из DOM после анимации
    }, 500)
  }
}

defineExpose({
  showNotification
})

const hasVisible = computed(() =>

  notifications.value.some(n => n.isVisible)
)
</script>

<template>
  <div :style="{right: hasVisible ? '0' : '-500px'}" class="notifications-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="panel-info angle__container panel-info__border"
      :class="{ 'panel-info__show': notification.isVisible }"
    >
      <div class="angle angle__first"></div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
      <span>{{ notification.message }}</span>
      <button
        class="notification__close"
        @click="hideNotification(notification.id)"
        v-if="!notification.isAutoClose"
      ></button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.angle__first {
  bottom: 0;
  right: 0;
}

.notification__close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  background-color: transparent;
  border: none;
  outline: none;

  &:after {
    content: '';
    position: absolute;
    height: 2px;
    width: 17px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &:before {
    content: '';
    position: absolute;
    height: 2px;
    width: 17px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}

.notifications-container {
  position: fixed;
  bottom: 0;
  right: 0;
  gap: 10px;
  display: flex;
  flex-direction: column-reverse; /* Последние уведомления сверху */
  align-items: flex-end;
  transition: all 0.3s ease;
  z-index: 1000;
}

.panel-info {
  position: relative;
  right: -300px; /* Начальное положение за пределами экрана */
  width: 300px;
  height: 100px;
  padding: 8px;
  bottom: 0;
  z-index: 111;
  border-radius: 0;
  transition: right 0.3s ease,
  bottom 0.3s ease,
  opacity 0.3s ease;
  //backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0; /* Изначально невидимо */
  &:first-child {
    margin-bottom: 20px;
  }

  span {
    font-size: 20px;
    text-align: center;
  }

  &.panel-info__show {
    right: 64px; /* Въезжает на экран */
    opacity: 1; /* Делается видимым */
  }
}

.angle {
  height: 10px;
  width: 10px;
}
</style>
