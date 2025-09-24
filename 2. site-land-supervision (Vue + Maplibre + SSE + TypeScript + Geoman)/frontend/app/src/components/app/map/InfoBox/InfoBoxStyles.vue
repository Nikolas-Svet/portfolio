<script lang="ts" setup>
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import { Consts } from '@/consts/index.consts.ts'
import { IRasterLayer, IVectorLayer } from '@/types/layersVector.ts'

const props = defineProps<{
  map: maplibregl.Map | null
}>()

const currentOpacity = ref<number>((Consts.GeometryStylesConsts as any).primary_fill_opacity)
const currentOutlineWidth = ref<number>((Consts.GeometryStylesConsts as any).primary_line_width)
const currentColor = ref<string>((Consts.GeometryStylesConsts as any).primary_color)
const currentOutlineColor = ref<string>((Consts.GeometryStylesConsts as any).primary_color_hover)
const currentSaturation = ref<number>(0)

const selectedLayerMain = computed(() => {
  return store.state.layersMain?.selectedLayerMain
})

watch(
  () => selectedLayerMain.value,
  (newValue: IVectorLayer | IRasterLayer) => {
    if (!newValue || !newValue.type) {
      return
    }

    if (store.getters['treeItemStore/isSelectedKebab']) {
      return
    }

    if (newValue.type === Consts.LayerTypes.VECTOR) {
      const layer = newValue as IVectorLayer
      currentColor.value = layer.style?.color || (Consts.GeometryStylesConsts as any).primary_color
      currentOpacity.value = layer.style?.opacity || (Consts.GeometryStylesConsts as any).primary_fill_opacity
      currentOutlineWidth.value = layer.style?.outlineWidth || (Consts.GeometryStylesConsts as any).primary_line_width
      currentOutlineColor.value = layer.style?.outlineColor || (Consts.GeometryStylesConsts as any).primary_color_hover
    } else if (newValue.type === Consts.LayerTypes.RASTER) {
      const layer = newValue as IRasterLayer
      currentOpacity.value = layer.style?.opacity || (Consts.GeometryStylesConsts as any).primary_fill_opacity
      currentSaturation.value = layer.style?.contrast || 0
    }
  },
  {
    deep: true,
    immediate: true
  }
)

const isSelectedLegend = computed(() => {
  return store.getters['treeItemStore/isSelectedLegend']
})

const closeInfoBox = async () => {
  await store.dispatch('treeItemStore/SET_SELECTED_LEGEND', false)
  await store.dispatch('infoBox/SET_DATA_INFO', null)
  await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMain}`, {})
}

const updateLayerStyle = async () => {
  if (!props.map) return

  const layer: IVectorLayer | IRasterLayer = store.state.layersMain?.selectedLayerMain
  if (!layer) {
    console.error('[updateLayerStyle] Слой не найден в Vuex')
    return
  }

  if (layer.type === Consts.LayerTypes.VECTOR) {
    (layer as any).style!.color = currentColor.value as any
    (layer as IVectorLayer).style!.opacity = currentOpacity.value as any
    (layer as IVectorLayer).style!.outlineColor = currentOutlineColor.value as any
    (layer as IVectorLayer).style!.outlineWidth = currentOutlineWidth.value as any

    const layerId = `${Consts.LayerTypes.VECTOR}-${layer.id}`
    const layerIdOutline = `${Consts.LayerTypes.VECTOR}-${layer.id}-outline`

    if (props.map.getLayer(layerId)) {
      props.map.setPaintProperty(layerId, 'fill-color', [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#D68166',
        currentColor.value
      ])
      props.map.setPaintProperty(layerId, 'fill-opacity', currentOpacity.value)
      if (props.map.getLayer(layerIdOutline)) {
        props.map.setPaintProperty(layerIdOutline, 'line-width', currentOutlineWidth.value)
        props.map.setPaintProperty(layerIdOutline, 'line-color', currentOutlineColor.value)
      } else {
        console.warn(`⚠️ Слой ${layerIdOutline} не найден.`)
      }
    }
  } else if (layer.type === Consts.LayerTypes.RASTER) {
    (layer as IRasterLayer).style!.contrast = currentSaturation.value as any
    (layer as IRasterLayer).style!.opacity = currentOpacity.value as any

    const layerId = `${Consts.LayerTypes.RASTER}-${layer.id}`
    if (props.map.getLayer(layerId)) {
      props.map.setPaintProperty(layerId, 'raster-opacity', currentOpacity.value)
      props.map.setPaintProperty(layerId, 'raster-contrast', currentSaturation.value)
    }
  }

  await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, layer)
}
</script>

<template>
  <div
    style="overflow-y: auto"
  >
    <div class="icon-close" @click="closeInfoBox()"></div>
    <div>
      <div v-if="selectedLayerMain.type === Consts.LayerTypes.VECTOR && isSelectedLegend" class="colorPickerDark">
        <label>
          <span>Прозрачность:</span>
          <div class="slider-container">
            <input
              v-model.number="currentOpacity"
              class="slider"
              max="1"
              min="0"
              step="0.01"
              type="range"
              @input="updateLayerStyle"
            />
            <div class="slider-value">{{ Math.round(currentOpacity * 100) }}%</div>
          </div>
        </label>

        <label>
          <span>Ширина окантовки:</span>
          <div class="slider-container">
            <input
              v-model.number="currentOutlineWidth"
              class="slider"
              max="20"
              min="1"
              step="1"
              type="range"
              @input="updateLayerStyle"
            />
            <div class="slider-value">{{ currentOutlineWidth }} px</div>
          </div>
        </label>
        <label>
          <span>Цвет заливки:</span>
          <ColorPicker
            v-model:pureColor="currentColor"
            inline
            @update:pureColor="updateLayerStyle"
          />
        </label>

        <label>
          <span>Цвет окантовки:</span>
          <ColorPicker
            v-model:pureColor="currentOutlineColor"
            inline
            @update:pureColor="updateLayerStyle"
          />
        </label>
      </div>
      <div v-else-if="selectedLayerMain.type === Consts.LayerTypes.RASTER">
        <label>
          <span>Прозрачность:</span>
          <div class="slider-container">
            <input
              v-model.number="currentOpacity"
              class="slider"
              max="1"
              min="0"
              step="0.01"
              type="range"
              @input="updateLayerStyle"
            />
            <div class="slider-value">{{ Math.round(currentOpacity * 100) }}%</div>
          </div>
        </label>
        <label>
          <span>Насыщенность:</span>
          <div class="slider-container">
            <input
              v-model.number="currentSaturation"
              class="slider"
              max="1"
              min="0"
              step="0.01"
              type="range"
              @input="updateLayerStyle"
            />
            <div class="slider-value">{{ Math.round(currentSaturation * 100) }}%</div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon-close {
  right: 20px;
  top: 20px;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider {
  -webkit-appearance: none;
  width: 123px;
  height: 2px;
  background: linear-gradient(to right, rgba(255, 140, 80, 0.2), rgba(255, 140, 80, 1));
  outline: none;
  position: relative;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 6px;
  height: 18px;
  background-color: #d08060;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  z-index: 1;
}

.slider::-moz-range-thumb {
  width: 8px;
  height: 20px;
  background-color: #d08060;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 2px;
  position: relative;
  z-index: 1;
}

.slider-value {
  margin-left: 26px;
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: bold;
  //color: #212121;
}
</style>