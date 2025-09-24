<script lang="ts" setup>
import store from '@/store'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Consts } from '@/consts/index.consts.ts'
import Geometry_line from '@/components/icons/Toolbar/geometry_line.vue'
import CircleIcon from '@/assets/icons/Toolbar/geometry_circle.svg'
import { checkHotKey } from '@/utils/checkHotKey.ts'

const props = defineProps<{
  map: maplibregl.Map | null
  geoman: any
}>()

const currentLayer = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

const isEdit = computed(() => {
  return isEditLayer(Number(currentLayer.value.id))
})

const windowWidth = ref(window.innerWidth)

function updateWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateWidth))
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const width = computed(() => windowWidth.value)

const currentTool = computed(() => store.state.toolbar.is_active_tool)
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

const toggleDrawMode = (param: string) => {
  if (!props.geoman.isModeEnabled('draw', param)) {
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', param)
    props.geoman.enableMode('draw', param)
  } else {
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
    props.geoman.disableDraw()
  }
}

async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  if (e.key.toLowerCase() === Consts.HotKeys.cancel_drawing.en) {
    await store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
    props.geoman.disableDraw()
    return
  }

  const isHotKey = await checkHotKey(e)

  if (isHotKey) {
    switch (isHotKey) {
      case 'polygon':
      case 'circle':
      case 'circle_marker':
      case 'line':
        toggleDrawMode(isHotKey)
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="toolbar-basic toolbar-drawing">
    <div class="burger">
      <button
        :disabled="!isEdit"
        :style="{order: currentTool === Consts.activeTools.circle_marker && width < 1710 ? '-1' : '0'}"
        class="toolbar__inactive"
        @click="toggleDrawMode('circle_marker')"
        @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.circle_marker} (${Consts.HotKeys.toolbar.draw.circle_marker.full})` : Consts.messageForUser.notEdit)"
        @mouseleave="handleMouseLeave"
      >
        <geometry_point
          :class="{
            toolbar__iconActive1: currentTool === Consts.activeTools.circle_marker,
            toolbar__icon1: currentTool !== Consts.activeTools.circle_marker
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
        />
      </button>
      <button
        :disabled="!isEdit"
        :style="{order: currentTool === Consts.activeTools.polygon && width < 1710 ? '-1' : '0'}"
        @click="toggleDrawMode('polygon')"
        @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.polygon} (${Consts.HotKeys.toolbar.draw.polygon.full})` : Consts.messageForUser.notEdit)"
        @mouseleave="handleMouseLeave"
      >
        <geometry_polygon
          :class="{
            toolbar__iconActive1: currentTool === Consts.activeTools.polygon,
            toolbar__icon1: currentTool !== Consts.activeTools.polygon
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
        />
      </button>
      <button
        :disabled="!isEdit"
        :style="{order: currentTool === Consts.activeTools.line && width < 1710 ? '-1' : '0'}"
        class="toolbar__inactive"
        @click="toggleDrawMode('line')"
        @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.line} (${Consts.HotKeys.toolbar.draw.line.full})` : Consts.messageForUser.notEdit)"
        @mouseleave="handleMouseLeave"
      >
        <geometry_line
          :class="{
            toolbar__iconActive1: currentTool === Consts.activeTools.line,
            toolbar__icon1: currentTool !== Consts.activeTools.line
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
        />
      </button>
      <button
        :disabled="!isEdit"
        :style="{order: currentTool === Consts.activeTools.circle_marker && width < 1710 ? '-1' : '0'}"
        :title="isEdit ? Consts.messageForUser.circle : Consts.messageForUser.notEdit" class="toolbar__inactive"
        @click="toggleDrawMode('circle')"
        @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.circle} (${Consts.HotKeys.toolbar.draw.circle.full})` : Consts.messageForUser.notEdit)"
        @mouseleave="handleMouseLeave"
      >
        <CircleIcon
          :class="{
            toolbar__iconActive2: currentTool === Consts.activeTools.circle,
            toolbar__icon2: currentTool !== Consts.activeTools.circle
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
          style="max-width: 32px"
        />
      </button>
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
  max-width: 212px !important;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
}

.burger {
  width: 100%;
  padding: 9px 20px 9px 20px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (width < 1710px) {
  .burger {
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 3px;
    height: 184px;
    clip-path: inset(0 0 74% 0);
    transition: all 0.3s ease;
    padding-bottom: 10px;

    &:hover {
      clip-path: inset(0 0 0 0);
    }
  }
  .toolbar-basic {
    height: 55px;
    max-width: 65px !important;
    position: relative;
  }
}
</style>
