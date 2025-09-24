<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Map, MapMouseEvent } from 'maplibre-gl'
import { Marker } from 'maplibre-gl'

import MessageIcon from '@/components/icons/Toolbar/message.vue'
import Enter from '@/components/icons/Toolbar/enter.vue'
import Smile from '@/components/icons/smile.vue'
import enterIcon from '@/assets/icons/enter.svg?raw'
import deleteIcon from '@/assets/icons/delete.svg?raw'

import store from '@/store'
import messageIcon from '@/assets/icons/message.svg?raw'
import messageIcon2 from '@/assets/icons/message2.svg?raw'

import {
  disableZoomControls,
  enableZoomControls,
  getScreenCoordsFromLngLat,
  svgToDataUri
} from '@/utils/map/toolbar/ToolbarBasic.ts'
import { Consts } from '@/consts/index.consts.ts'
import { checkHotKey } from '@/utils/checkHotKey.ts'

type TCursor = '' | 'move' | 'message' | 'crosshair'

const messages = computed(() => {
  return store.state.toolbar.messages
})

watch(
  () => messages.value,
  (newVal) => {
    if (!props.map) return
    if (newVal.length > 0) {
      newVal.forEach((item: any) => {
        // Создаем див-контейнер, куда поместим иконку + тултип
        const markerContainer = document.createElement('div')
        markerContainer.style.width = '24px'
        markerContainer.style.height = '24px'
        markerContainer.style.cursor = 'pointer'

        // Иконка
        const iconEl = document.createElement('div')
        iconEl.innerHTML = messageIcon2
        iconEl.style.width = '24px'
        iconEl.style.height = '24px'

        markerContainer.appendChild(iconEl)

        // Создаём Marker
        currentMarker = new Marker({ element: markerContainer })
          .setLngLat(item.lngLat)
          .addTo(props.map!)
        // ---- Создаём новое сообщение ----
        // Предположим, экшен ADD_MESSAGE возвращает ID:
        // Если не возвращает, можно взять последний элемент из store.state.toolbar.messages

        // Привязываем тултип к маркеру
        attachTooltip(currentMarker, {
          id: item.id,
          lngLat: item.lngLat,
          text: item.text
        })
      })
    }
  },
  { deep: true }
)

const currentTool = computed(() => {
  return store.state.toolbar.is_active_tool
})

const currentCursor = computed(() => {
  return store.state.toolbar.activeCursor
})

watch(
  () => currentTool.value,
  (newValue) => {
    if (newValue !== 'message' && (showInputAt.value || activeCursor.value === 'message')) {
      disableMessageClickHandler()
    }
  }
)

// ----------------------------------------------------------------------------
// Пропсы
// ----------------------------------------------------------------------------
const props = defineProps<{
  map: Map | null | undefined
}>()

// ----------------------------------------------------------------------------
// Локальное состояние
// ----------------------------------------------------------------------------

// Текущий режим курсора
const activeCursor = ref<TCursor>('')
// Чтобы "вспомнить", какой курсор был до временного переключения (например, при зажатом пробеле)
const previousCursor = ref<TCursor>('')

// Обработчики клика, которые отключаем при 'message'
const oldClickHandlers = ref<Function[]>([])

// Координаты клика + вводимая строка
const showInputAt = ref<[number, number] | null>(null)

watch(
  () => showInputAt.value,
  (newValue) => {
    if (newValue) {
      disableZoomControls(props.map)
      props.map!.dragPan.disable()
    } else {
      enableZoomControls(props.map)
      // props.map!.dragPan.enable()
    }
  }
)

const inputText = ref('')

// Ссылка на маркер, пока вводим текст
let currentMarker: Marker | null = null

// ID сообщения, если редактируем (null => создаём новое)
const editingMessageId = ref<string | null>(null)

// Автоподстройка высоты textarea
const textarea = ref<HTMLTextAreaElement | null>(null)
const height = ref<string>('auto')
const autoResize = () => {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  height.value = el.scrollHeight + 'px'
}
onMounted(autoResize)
watch(inputText, autoResize)

// ----------------------------------------------------------------------------
// Установка курсора
// ----------------------------------------------------------------------------
function setCursor(cursor: TCursor) {
  if (!props.map) return

  if (activeCursor.value === cursor) {
    disableMessageClickHandler()
    return
  }

  store.dispatch('toolbar/SET_ACTIVE_CURSOR', cursor)

  activeCursor.value = cursor

  if (cursor === 'message') {
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', 'message')
    const cursorDataUri = `url("${svgToDataUri(messageIcon)}") 12 12, auto`
    props.map.getCanvas().style.cursor = cursorDataUri
    props.map.dragPan.disable()
    enableMessageClickHandler()
  }
}

// ----------------------------------------------------------------------------
// Подключаем/отключаем обработчик клика
// ----------------------------------------------------------------------------
function enableMessageClickHandler() {
  if (!props.map) return
  const listeners = (props.map as any)._listeners?.click
  if (Array.isArray(listeners) && listeners.length > 0) {
    oldClickHandlers.value = [...listeners]
    listeners.forEach((fn: any) => props.map?.off('click', fn))
  }
  props.map.on('click', handleMapClick)
}

function disableMessageClickHandler() {
  if (!props.map) return
  props.map.off('click', handleMapClick)
  oldClickHandlers.value.forEach((fn: any) => {
    props.map?.on('click', fn)
  })
  oldClickHandlers.value = []

  activeCursor.value = previousCursor.value
  props.map.dragPan.enable()
  if (currentCursor.value === Consts.activeTools.message) {

    if (previousCursor.value === 'message') {
      console.log('previous cursor')
      store.dispatch('toolbar/SET_ACTIVE_CURSOR', '')
      activeCursor.value = ''
      return
    }

    props.map.getCanvas().style.cursor = previousCursor.value
    activeCursor.value = previousCursor.value
    setCursor(activeCursor.value)
  }
}

// ----------------------------------------------------------------------------
// Обработчик клика карты (режим 'message')
// ----------------------------------------------------------------------------
function handleMapClick(e: MapMouseEvent) {
  if (activeCursor.value !== 'message' || showInputAt.value) return

  // Создаем див-контейнер, куда поместим иконку + тултип
  const markerContainer = document.createElement('div')
  markerContainer.style.width = '24px'
  markerContainer.style.height = '24px'
  markerContainer.style.cursor = 'pointer'

  // Иконка
  const iconEl = document.createElement('div')
  iconEl.innerHTML = messageIcon2
  iconEl.style.width = '24px'
  iconEl.style.height = '24px'

  markerContainer.appendChild(iconEl)

  // Создаём Marker
  currentMarker = new Marker({ element: markerContainer }).setLngLat(e.lngLat).addTo(props.map!)

  // Переходим в режим "создание нового сообщения"
  editingMessageId.value = null
  showInputAt.value = [e.lngLat.lng, e.lngLat.lat]
  inputText.value = ''
}

// ----------------------------------------------------------------------------
// Сохранить сообщение: либо создать новое, либо обновить старое
// ----------------------------------------------------------------------------
async function saveMessage() {
  if (!showInputAt.value || !currentMarker) return

  const textToSave = inputText.value
  const lngLat = showInputAt.value

  if (!editingMessageId.value) {
    // ---- Создаём новое сообщение ----
    const newMsgPayload = { lngLat, text: textToSave }
    // Предположим, экшен ADD_MESSAGE возвращает ID:
    const newId = await store.dispatch('toolbar/ADD_MESSAGE', newMsgPayload)
    // Если не возвращает, можно взять последний элемент из store.state.toolbar.messages

    // Привязываем тултип к маркеру
    attachTooltip(currentMarker, {
      id: newId,
      lngLat,
      text: textToSave
    })
  } else {
    // ---- Редактируем ----
    await store.dispatch('toolbar/UPDATE_MESSAGE_TEXT', {
      id: editingMessageId.value,
      newText: textToSave
    })
    // Обновим тултип
    attachTooltip(currentMarker, {
      id: editingMessageId.value,
      lngLat,
      text: textToSave
    })
  }

  // Скрываем форму
  showInputAt.value = null
  inputText.value = ''
  currentMarker = null
  editingMessageId.value = null

  disableMessageClickHandler()
}

// ----------------------------------------------------------------------------
// attachTooltip: Привязать текст + кнопки к уже созданному маркеру
// ----------------------------------------------------------------------------
function attachTooltip(
  marker: Marker,
  msg: { id: string; lngLat: [number, number]; text: string }
) {
  const markerEl = marker.getElement()
  markerEl.innerHTML = '' // очищаем

  // Общий контейнер
  markerEl.style.position = 'absolute'
  markerEl.style.width = '24px'
  markerEl.style.height = '24px'
  markerEl.style.cursor = 'pointer'

  // Иконка
  const iconEl = document.createElement('div')
  iconEl.innerHTML = messageIcon2
  iconEl.style.width = '24px'
  iconEl.style.height = '24px'
  iconEl.style.position = 'relative'
  markerEl.appendChild(iconEl)

  // Основной контейнер
  const tooltipEl = document.createElement('div')
  tooltipEl.classList.add('toolbar-basic__info2')
  tooltipEl.style.display = 'none'
  tooltipEl.style.zIndex = '10001'

  // Контентная обёртка
  const contentWrapper = document.createElement('div')
  contentWrapper.classList.add('info2__content')

  // Текст
  const textDiv = document.createElement('div')
  textDiv.innerText = msg.text
  textDiv.classList.add('info2__text')

  // Кнопки
  const buttonsWrapper = document.createElement('div')
  buttonsWrapper.classList.add('info2__buttons')
  const editBtn = document.createElement('button')
  editBtn.style.marginRight = '8px'

  const delBtn = document.createElement('button')

  editBtn.innerHTML = enterIcon

  delBtn.innerHTML = deleteIcon

  buttonsWrapper.appendChild(editBtn)
  buttonsWrapper.appendChild(delBtn)

  contentWrapper.appendChild(textDiv)
  contentWrapper.appendChild(buttonsWrapper)
  tooltipEl.appendChild(contentWrapper)

  markerEl.appendChild(tooltipEl)

  // События, чтобы тултип не пропадал, когда курсор на нём
  markerEl.addEventListener('mouseenter', () => {
    tooltipEl.style.display = 'block'
  })
  markerEl.addEventListener('mouseleave', () => {
    // Если курсор ушёл за пределы markerEl и не попал на tooltipEl => спрятать
    // Но т. к. tooltipEl внутри markerEl, переход на tooltip не вызывает leave
    // => когда уходим совсем за пределы контейнера, tooltip скрывается
    tooltipEl.style.display = 'none'
  })

  // "Редактировать" => снова показать input
  editBtn.addEventListener('click', () => {
    editingMessageId.value = msg.id
    showInputAt.value = msg.lngLat
    inputText.value = msg.text
    currentMarker = marker
    tooltipEl.style.display = 'none'
  })

  // "Удалить" => убрать из Vuex и с карты
  delBtn.addEventListener('click', () => {
    store.dispatch('toolbar/DELETE_MESSAGE', msg.id)
    marker.remove()
  })
}

// ----------------------------------------------------------------------------
// Горячие клавиши
// ----------------------------------------------------------------------------
async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  if (e.key.toLowerCase() === Consts.HotKeys.cancel_drawing.en) {
    disableMessageClickHandler()
    return
  }

  const isHotKey = await checkHotKey(e)

  if (isHotKey) {
    switch (isHotKey) {
      case 'message':
        setCursor('message')
        break
    }
  }
}

// ----------------------------------------------------------------------------
// Lifecycle
// ----------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  disableMessageClickHandler()
})

// Авто-Resize textarea
onMounted(autoResize)
watch(inputText, autoResize)

const isTooltipVisible = ref<boolean>(false)
const tooltipPosition = ref({ top: 0, left: 0 })

let mouseMoveListener: any = null
let timer: any = null

const text_info = ref<string>('')

function handleMouseEnter(text: string) {
  text_info.value = text
  mouseMoveListener = (e: any) => {
    tooltipPosition.value = {
      top: e.clientY,
      left: e.clientX + 20
    }
  }
  window.addEventListener('mousemove', mouseMoveListener)

  timer = setTimeout(() => {
    isTooltipVisible.value = true
  }, 500)
}

function handleMouseLeave() {
  if (mouseMoveListener) {
    window.removeEventListener('mousemove', mouseMoveListener)
    mouseMoveListener = null
  }
  clearTimeout(timer)
  isTooltipVisible.value = false
}
</script>

<template>
  <div class="toolbar-basic">
    <!-- Message курсор -->
    <div
      v-if="showInputAt"
      :style="{
        left: getScreenCoordsFromLngLat(showInputAt, map).x + 30 + 'px',
        top: getScreenCoordsFromLngLat(showInputAt, map).y + 70 + 'px'
      }"
      class="message-input-popup"
      style="position: fixed; z-index: 10001"
    >
      <div class="message-input-popup__empty">
        <textarea
          ref="textarea"
          v-model="inputText"
          :style="{
            minHeight: inputText.length > 0 ? '60px' : '0',
            height: inputText.length > 0 ? height : '35px'
          }"
          placeholder="Добавить комментарий..."
          @input="autoResize"
        ></textarea>
        <Enter v-if="!inputText" @click="saveMessage" />
      </div>
      <div v-if="inputText" class="message-input-popup__filled">
        <Smile style="opacity: 0; cursor: default" />
        <Enter @click="saveMessage" />
      </div>
    </div>

    <!-- Окно ввода для создания/редактирования -->
    <div
      @mouseenter="handleMouseEnter(`Оставить комментарий (${Consts.HotKeys.toolbar.base.message.full})`)"
      @mouseleave="handleMouseLeave"
    >
      <MessageIcon
        :class="{
        toolbar__iconActive2: activeCursor === 'message',
        toolbar__iconActive1: activeCursor === 'message',
        toolbar__icon2: activeCursor !== 'message',
        toolbar__icon1: activeCursor !== 'message'
      }"
        @click="setCursor('message')"
      />
    </div>
  </div>
  <div
    v-show="isTooltipVisible"
    :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
    class="tooltip-warning"
  >
    {{ text_info }}
  </div>
</template>

<style lang="scss">
.toolbar-basic {
  &__info {
    background-color: $primary-background-two;
    position: absolute;
    border: none;
    padding: 6px;
    pointer-events: none;
    z-index: 9999;
    width: 240px;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }

  &__info2 {
    transform: translateY(-5px);
    position: absolute;
    display: block;
    width: 240px;
    padding: 6px 6px 6px 26px;
    border-radius: 4px;
    font-size: 16px;
    top: 0;
    left: 24px;
    z-index: 9999;

    &:after {
      content: '';
      position: absolute;
      border-radius: 4px;
      z-index: -1;
      width: calc(100% - 20px);
      height: 100%;
      right: 0;
      top: 0;
    }

    .info2__content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .info2__text {
      flex: 1;
      max-width: 180px;
      word-break: break-word;
    }

    .info2__buttons {
      display: flex;
      gap: 4px;

      button {
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        cursor: pointer;
        background-color: transparent;

        display: flex;
        align-items: center;
        justify-content: center;

        &:first-child {
          height: 24px;
          width: 24px;
        }

        &:last-child {
          transform: translate(-2px, 2px);
          height: 18px;
          width: 18px;
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>

.tooltip-warning {
  z-index: 10;
  position: fixed;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  width: max-content;
  pointer-events: none; /* Чтобы тултип не мешал взаимодействию */
}

.toolbar-basic {
  padding: 12px 20px 12px 0;
  max-width: 45px;
  min-height: 35px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
}

/* Пример стилей для всплывающего инпута */
.message-input-popup {
  position: absolute;
  border: none;
  outline: none;
  z-index: 999999;
  transform: translateY(-7px);
  border-radius: 4px;
  padding: 0 10px;

  display: flex;
  align-items: center;
  flex-direction: column;

  textarea {
    resize: none;
    padding: 8px 10px 8px 0;
    border: none;
    outline: none;
    background-color: transparent;
    margin-right: 6px;
  }

  svg {
    cursor: pointer;
  }

  &__empty {
    textarea {
      font-size: 16px;

      &::placeholder {
        text-wrap: nowrap;
        font-size: 16px;
      }
    }

    max-height: 400px;
    display: flex;
    align-items: center;
  }

  &__filled {
    width: 100%;
    padding-top: 6px;
    padding-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    svg {
      width: 18px;
      height: 18px;

      &:last-child {
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style>
