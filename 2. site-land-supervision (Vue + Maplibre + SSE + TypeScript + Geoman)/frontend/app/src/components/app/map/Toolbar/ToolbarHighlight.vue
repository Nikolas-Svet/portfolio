<script lang="ts" setup>
import bboxIcon from '@/assets/icons/Toolbar/ToolbarHighlight/bbox.svg'
import polygonIcon from '@/assets/icons/Toolbar/ToolbarHighlight/polygon.svg'
import store from '@/store'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'
import { Consts } from '@/consts/index.consts.ts'
import { ref } from 'vue'
import { checkHotKey } from '@/utils/checkHotKey.ts'

const currentTool = computed(() => store.state.toolbar.is_active_tool)

// 1. Определяем входные пропсы
// const { highlightObjectsMode, highlightObjectsModeBbox } = defineProps<{
//   highlightObjectsMode: boolean
//   highlightObjectsModeBbox: boolean
// }>()

const props = defineProps<{
  geoman: any
}>()

const emit = defineEmits<{
  (e: 'draw-bbox'): void
}>()

const drawObject = () => {
  store.dispatch('toolbar/ADD_ACTIVE_TOOL', Consts.activeTools.highlight_polygon)
  if (!props.geoman.isModeEnabled('draw', Consts.activeTools.polygon)) {
    props.geoman.enableMode('draw', Consts.activeTools.polygon)
  }
}
const drawBbox = () => {
  store.dispatch('toolbar/ADD_ACTIVE_TOOL', Consts.activeTools.highlight_bbox)
  store.dispatch('toolbar/SET_ACTIVE_CURSOR', Consts.activeCursors.crosshair)
  emit('draw-bbox')
}

const currentLayer = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

const isEdit = computed(() => {
  return isEditLayer(Number(currentLayer.value.id))
})

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

// ----------------------------------------------------------------------------
// Горячие клавиши
// ----------------------------------------------------------------------------

async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  // if (checkHotKey(e)) {
  //   flag_alt.value = true
  // }

  const isHotKey = await checkHotKey(e)

  if (isHotKey) {
    switch (isHotKey) {
      case 'poly':
        drawObject()
        break
      case 'bbox':
        drawBbox()
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="toolbar-highlight toolbar-basic">
    <button :disabled="!isEdit"
            @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.highlightPolygon} (${Consts.HotKeys.toolbar.highlight.poly.full})` : Consts.messageForUser.notEdit)"
            @mouseleave="handleMouseLeave"
            class="toolbar__inactive" @click="drawObject">
      <polygonIcon
        :class="{
        toolbar__iconActive2: currentTool === Consts.activeTools.highlight_polygon,
        toolbar__icon2: currentTool !== Consts.activeTools.highlight_polygon
        }"
        :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
      />
    </button>
    <button
      @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.highlightBbox} (${Consts.HotKeys.toolbar.highlight.bbox.full})` : Consts.messageForUser.notEdit)"
      @mouseleave="handleMouseLeave"
      :disabled="!isEdit"
      class="toolbar__inactive" @click="drawBbox">
      <bboxIcon
        :class="{
            toolbar__iconActive2: currentTool === Consts.activeTools.highlight_bbox,
            toolbar__icon2: currentTool !== Consts.activeTools.highlight_bbox
          }"
        :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
      />
    </button>
  </div>
  <div
    v-show="isTooltipVisible"
    :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
    class="tooltip-warning"
  >
    {{ text_info }}
  </div>
</template>

<style lang="scss" scoped>

button {
  background: transparent;
  border: none;
}

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
  padding: 9px 20px 9px 0;
  max-width: 152px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
}

.toolbar-highlight {
  max-width: 132px !important;
  padding: 9px 20px 9px 20px !important;
}
</style>