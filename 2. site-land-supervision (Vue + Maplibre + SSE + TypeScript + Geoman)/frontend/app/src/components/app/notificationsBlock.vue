<template>
  <div :class="[{ 'notifications__active': props.active }, 'notifications__block']">
    <div class="notifications__title">
      <span>Слой</span>
      <p>Статус</p>
    </div>
    <div class="notifications__content">
      <div
        v-for="(event, index) in props.events"
        :key="event.id"
        class="notifications__event"
      >
        <div
          :class="[{ 'notifications__hoverEvent': visibleIndex === index }, 'notifications__titleEvent']"
          @click="toggle(index)"
        >
          <p class="notifications__name">
            {{ displayName(event.name) }}
          </p>
          <span
            v-if="!event.result.error"
            :class="{ 'notification__loader-wave': isProcessing(event.process) }"
            class="notification__process"
          >
            {{ processText(event.process) }}
          </span>
          <span v-if="event.result.error" class="notification__error">
            {{ event.result.error }}
          </span>
        </div>
        <div v-show="visibleIndex === index" class="notifications__info">
          <!--          <span v-if="event.name !== 'Инструмент разгруппировки объектов'">Имя слоя: {{ event.result.name_layer-->
          <!--            }}</span>-->
          <span>Имя слоя: {{ event.result.name_layer ? event.result.name_layer : '-' }}</span>
          <span>Дата создания: {{ formatDate(event.created_date) }}</span>
          <span v-if="event.updated_date">
            Дата обновления: {{ formatDate(event.updated_date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface EventItem {
  id: string | number;
  name: string;
  process: string;
  result: { error?: string; name_layer?: string };
  created_date: string;
  updated_date?: string;
}

const props = defineProps<{
  active: boolean;
  events: EventItem[];
}>()

const visibleIndex = ref<number | null>(null)

function toggle(index: number) {
  visibleIndex.value = visibleIndex.value === index ? null : index
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function displayName(name: string) {
  return name.includes('name:') ? name.split('name:')[1].trim() : name
}

const processingStates = ['start', 'Старт', 'process', 'Вычисления']

function isProcessing(state: string) {
  return processingStates.includes(state)
}

function processText(state: string) {
  return isProcessing(state) ? 'Обработка данных' : state
}
</script>

<style scoped lang="scss">
.notification__process {
  text-wrap: nowrap;
}

.notifications {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute !important;
  bottom: 0 !important;

  svg {
    height: 22px;
    width: 22px;
    margin-right: 0;

    * {
      transition: all 0.3s ease;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    position: relative;
    z-index: 1;
    width: calc(473px - 1px);
    max-width: 500px;

    &:after {
      transition: none !important;
      content: '';
      position: absolute;
      top: 0;
      left: -16px;
      width: calc(100% + 32px);
      height: 1px;
    }
  }

  &__content {
    height: 200px;
    overflow: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }

  &__block {
    position: absolute;
    bottom: 0;
    z-index: 103;
    left: -473px;
    max-width: 473px;
    width: 100%;
    transition: left 0.3s ease;
    overflow: hidden;
  }

  &__active {
    overflow-x: hidden;
    //clip-path: inset(0 0 0 0);
    left: $width-panel;
    transition: left 0.3s ease;
  }

  &__event {
    //padding: 0 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }

  &__titleEvent {
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
  }

  &__info {
    padding-bottom: 4px;
    width: 100%;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      padding: 0 16px;
    }
  }
}
</style>
