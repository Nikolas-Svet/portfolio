<script lang="ts" setup>
import Fullscreen_polygon from '@/components/icons/Toolbar/fullscreen_polygon.vue'
import store from '@/store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import RulerButton from '@/components/app/map/Toolbar/ToolbarActions/RulerButton.vue'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'
import { Consts } from '@/consts/index.consts.ts'
import EditMode from '@/assets/icons/Toolbar/editMode.svg'
import SnapMode from '@/assets/icons/Toolbar/snapMode.svg'
import DeleteMode from '@/assets/icons/Toolbar/deleteMode.svg'
import RotateMode from '@/assets/icons/Toolbar/rotateMode.svg'
import CutMode from '@/assets/icons/Toolbar/cutMode.svg'
import { checkHotKey } from '@/utils/checkHotKey.ts'

// ----------------------------------------------------------------------------
// Пропсы
// ----------------------------------------------------------------------------
const props = defineProps<{
  map: maplibregl.Map | null
  geoman: any
}>()

const isTooltipVisible = ref<boolean>(false)
const tooltipPosition = ref({ top: 0, left: 0 })

const selectedLayerMainEdit = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

const measure_distance = computed(() => store.state.toolbar.measure_distance)

watch(measure_distance, (newValue) => {
  flag.value = newValue
})

function setFlagMeasure() {
  store.dispatch('toolbar/SET_MEASURE_DISTANCE', !flag.value)
  flag.value = !flag.value
}

function flyLayer() {
  store.dispatch(`layersMain/${layersMainActions.setFlyLayerMain}`, selectedLayerMainEdit.value)
}

const flag = ref<boolean>(false)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const isEditMode = ref<string>('')
const isSnapMode = ref<boolean>(false)


const toggleSnapMode = () => {
  if (!props.geoman.isModeEnabled('helper', 'snapping')) {
    isSnapMode.value = true
    props.geoman.enableMode('helper', 'snapping')
  } else {
    isSnapMode.value = false
    props.geoman.disableMode('helper', 'snapping')
  }
}

const toggleMode = (typeMode: string) => {
  if (!props.geoman.isModeEnabled('edit', typeMode)) {
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', typeMode)
    isEditMode.value = typeMode
    props.geoman.enableMode('edit', typeMode)
  } else {
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
    isEditMode.value = ''
    props.geoman.disableMode('edit', typeMode)
  }
}
// ----------------------------------------------------------------------------
// Горячие клавиши
// ----------------------------------------------------------------------------

async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  // if (e.key.toLowerCase() === Consts.HotKeys.cancel_drawing.en) {
  //   disableMessageClickHandler()
  //   return
  // }

  const isHotKey = await checkHotKey(e)

  if (isHotKey) {
    switch (isHotKey) {
      case 'cut':
      case 'delete':
      case 'change':
      case 'rotate':
        toggleMode(isHotKey)
        break
      case 'snap':
        toggleSnapMode()
        break
      case 'measure_distance':
        setFlagMeasure()
        break
      case 'fly_to_layer':
        flyLayer()
    }
  }
}

const currentLayer = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

// watch(currentLayer, () => {
//   flag.value = false
// }, { deep: true })

const isEdit = computed(() => {
  return isEditLayer(Number(currentLayer.value.id))
})

const currentTool = computed(() => store.state.toolbar.is_active_tool)

watch(currentTool, (newValue, oldValue) => {
  console.log(newValue, oldValue)
  if (props.geoman.isModeEnabled('edit', oldValue)) {
    props.geoman.disableMode('edit', oldValue)
  } else if (props.geoman.isModeEnabled('draw', oldValue)) {
    props.geoman.disableMode('draw', oldValue)
  }
}, { deep: true })

const windowWidth = ref(window.innerWidth)

function updateWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateWidth))
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const width = computed(() => windowWidth.value)

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
  <div class="toolbar-actions toolbar-actions-first toolbar-basic">
    <ruler-button
      :map="props.map"
      @mouseenter="handleMouseEnter(`Линейка (${Consts.HotKeys.toolbar.base.ruler.full})`)"
      @mouseleave="handleMouseLeave"
    ></ruler-button>
    <button style="width: 30px; height: 33px; display: flex; align-items: center; justify-content: center"
            @click="flyLayer"
            @mouseenter="handleMouseEnter(`Приблизиться к слою (${Consts.HotKeys.toolbar.base.fly_to_layer.full})`)"
            @mouseleave="handleMouseLeave"
    >
      <fullscreen_polygon class="toolbar__icon1"></fullscreen_polygon>
    </button>
  </div>
  <div class="toolbar-actions toolbar-actions-second toolbar-basic">
    <div class="burger">
      <button :disabled="!isEdit" :style="{order: currentTool === 'change' && width < 1710 ? '-1' : '0'}"
              class="toolbar__inactive"
              style="width: 30px; height: 33px;" @click="toggleMode('change')"
              @mouseenter="handleMouseEnter(isEdit ? `Перемещение точек (${Consts.HotKeys.toolbar.edit.change.full})` : Consts.messageForUser.notEdit)"
              @mouseleave="handleMouseLeave"
      >

        <EditMode
          :class="{
        toolbar__iconActive1: currentTool === 'change',
        toolbar__icon1: currentTool !== 'change'
        }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
          class="toolbar__icon1"
        />
      </button>
      <button :disabled="!isEdit"
              :style="{order: currentTool === 'delete' && width < 1710 ? '-1' : '0'}"
              class="toolbar__inactive"
              style="width: 30px; height: 33px; display: flex; align-items: center; justify-content: center"
              @click="toggleMode('delete')"
              @mouseenter="handleMouseEnter(isEdit ? `Удалить геометрию (${Consts.HotKeys.toolbar.edit.delete.full})` : Consts.messageForUser.notEdit)"
              @mouseleave="handleMouseLeave"
      >
        <DeleteMode
          :class="{
            toolbar__iconActive1: currentTool === 'delete',
            toolbar__icon1: currentTool !== 'delete'
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
          class="toolbar__icon1"
        />
      </button>
      <button :disabled="!isEdit" :style="{order: currentTool === 'rotate' && width < 1710 ? '-1' : '0'}"
              class="toolbar__inactive"
              style="width: 30px; height: 33px;" @click="toggleMode('rotate')"
              @mouseenter="handleMouseEnter(isEdit ? `Поворот геометрии (${Consts.HotKeys.toolbar.edit.rotate.full})` : Consts.messageForUser.notEdit)"
              @mouseleave="handleMouseLeave"
      >
        <RotateMode
          :class="{
        toolbar__iconActive1: currentTool === 'rotate',
        toolbar__icon1: currentTool !== 'rotate',
        }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
          class="toolbar__icon1"
        />
      </button>
      <button
        :disabled="!isEdit"
        :style="{order: currentTool === 'cut' && width < 1710 ? '-1' : '0'}"
        class="toolbar__inactive"
        style="width: 30px; height: 33px; display: flex; align-items: center; justify-content: center; margin-right: 7px"
        @click="toggleMode('cut')"
        @mouseenter="handleMouseEnter(isEdit ? `Обрезать геометрию по полигону (${Consts.HotKeys.toolbar.edit.cut.full})` : Consts.messageForUser.notEdit)"
        @mouseleave="handleMouseLeave"
      >
        <CutMode
          :class="{
          toolbar__iconActive2: currentTool === 'cut',
          toolbar__iconActive1: currentTool === 'cut',
          toolbar__icon2: currentTool !== 'cut',
          }"
          :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
          class="toolbar__icon1"
        />
      </button>
    </div>
  </div>
  <div class="toolbar-actions toolbar-basic" style="max-width: 65px; margin-left: -8px; ">
    <button :disabled="!isEdit"
            class="toolbar__inactive"
            style="width: 30px; height: 33px; display: flex; align-items: center; justify-content: center"
            @click="toggleSnapMode"
            @mouseenter="handleMouseEnter(isEdit ? `Магнит (${Consts.HotKeys.toolbar.edit.snap.full})` : Consts.messageForUser.notEdit)"
            @mouseleave="handleMouseLeave"
    >
      <SnapMode
        :class="{
        toolbar__iconActive1: isSnapMode,
        toolbar__icon1: !isSnapMode
        }"
        :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
        class="toolbar__icon1"
      />
    </button>
  </div>
  <div class="toolbar-actions__check">
    <button :disabled="!isEdit" class="checkbox toolbar__inactive">
      <input :id="`select-line`" v-model="flag" :disabled="!isEdit"
             :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }"
             type="checkbox"
             @click="setFlagMeasure" />
      <label :for="`select-line`"></label>
    </button>
    Отображать расстояние
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

.burger {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.toolbar-actions {
  padding: 11px 0 11px 0 !important;
  position: relative;
  max-width: 141px;
  justify-content: space-around;


  &-first {
    &:after {
      content: '';
      position: absolute;
      width: 1px;
      height: 100%;
      top: 0;
      right: 50%;
    }
  }

  &-second {
    max-width: 190px;
    margin: 0 8px;
  }

  svg {
    cursor: pointer;
    width: 26px;
    height: 26px;
  }

  &__check {
    flex: 1;
    padding: 0 20px;
    display: flex;
    align-items: center;
    font-size: 14px;

    .checkbox {
      height: 16px !important;
      width: 16px !important;

      label {
        height: 16px !important;
        width: 16px !important;

        &:after {
          height: 14px !important;
          width: 14px !important;
        }

        &:before {
          width: 4px !important;
          height: 8px !important;
          left: 33% !important;
          top: 12% !important;
        }
      }
    }
  }
}

.toolbar-basic {
  width: 100%;
  display: flex;
  align-items: center;
}

@media (width < 1710px) {
  .burger {
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 12px;
    height: 184px;
    clip-path: inset(0 0 74% 0);
    transition: all 0.3s ease;
    padding-bottom: 10px;

    &:hover {
      clip-path: inset(0 0 0 0);
    }
  }
  .toolbar-actions {
    &-second {
      margin: 0;
      height: 55px;
      max-width: 65px;
      position: relative;
    }
  }
}
</style>
