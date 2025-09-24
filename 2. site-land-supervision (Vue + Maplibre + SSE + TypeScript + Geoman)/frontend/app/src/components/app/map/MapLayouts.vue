<script lang="ts" setup>
import store from '@/store'
import maplibregl from 'maplibre-gl'
import { Consts } from '@/consts/index.consts'

const props = defineProps({ map: maplibregl.Map })

const emit = defineEmits<{ (event: 'update:updateMapLayers'): void }>()

const selectedLayerMainEdit = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit || []
})
const showFlagMapControls = ref(<boolean>false)
const currentStyle = ref(<string>'streets')

function changeMapStyle(styleId: keyof typeof Consts.mapStyles.value) {
  if (!props.map) {
    console.error('Карта не инициализирована.')
    return
  }

  showFlagMapControls.value = false

  if (props.map.getLayer('raster-layer')) {
    props.map.removeLayer('raster-layer')
  }
  if (props.map.getSource('raster-tiles')) {
    props.map.removeSource('raster-tiles')
  }

  const newStyle = Consts.mapStyles.value[styleId]
  if (!newStyle) {
    console.error(`Стиль не найден.`)
    return
  }

  props.map.addSource('raster-tiles', {
    type: 'raster',
    tiles: [newStyle],
    tileSize: 256,
    maxzoom: styleId === 'terrain' ? 7.5 : 21
  })

  props.map.addLayer({
    id: 'raster-layer',
    type: 'raster',
    source: 'raster-tiles',
    minzoom: 0,
    maxzoom: styleId === 'terrain' ? 7.5 : 21
  })

  if (styleId === 'terrain') {
    props.map.setMaxZoom(7.4)
  } else {
    props.map.setMaxZoom(21)
  }

  currentStyle.value = styleId as any
  emit('update:updateMapLayers')
}
</script>

<template>
  <div :class="{ 'map-controls__act': showFlagMapControls }" class="map-controls">
    <button
      :class="{ 'map-controls__active': showFlagMapControls }"
      class="map-controls__button"
      @click="showFlagMapControls = !showFlagMapControls"
    >
      {{
        currentStyle === 'streets'
          ? 'Схема'
          : currentStyle === 'satellite'
            ? 'Спутник'
            : 'Карта высот'
      }}
    </button>
    <div :class="{ 'map-controls__acti': showFlagMapControls }" class="map-controls__block">
      <button
        :class="{ 'map-controls__activ': currentStyle === 'streets' }"
        @click="changeMapStyle('streets')"
      >
        Схема
      </button>
      <button
        :class="{ 'map-controls__activ': currentStyle === 'satellite' }"
        @click="changeMapStyle('satellite')"
      >
        Спутник
      </button>
      <button
        :class="{ 'map-controls__activ': currentStyle === 'terrain' }"
        @click="changeMapStyle('terrain')"
      >
        Карта высот
      </button>
    </div>
  </div>
  <div v-if="showFlagMapControls" @click="showFlagMapControls = false" class="map-controls__wrap">
  </div>
</template>

<style lang="scss" scoped>
.map-controls {
  transition: all 0.3s ease;
  position: absolute;
  z-index: 2;
  height: 35px;
  width: 170px;
  right: 90px;
  top: v-bind('selectedLayerMainEdit.id ? "94px" : "30px"') !important;
  display: flex;
  flex-direction: column;

  &__wrap {
    position: absolute;
    z-index: 1;
    inset: 0;
  }

  &__act {
    transition: all 0.3s ease;
  }

  &__button {
    height: 100%;
    width: 100%;
    background-color: transparent;
    position: relative;
    border: none;
    outline: none;
    min-height: 35px;
    display: flex;
    padding-left: 20px;
    align-items: center;
    justify-content: flex-start;
    font-size: 16px;

    &:after {
      content: '';
      position: absolute;
      right: 20px;
      top: 40%;
      transform: translate(0, -50%) rotate(45deg);
      width: 10px;
      height: 10px;
    }
  }

  &__acti {
    transition: all 0.3s ease;
    clip-path: inset(0 0 0 0) !important;
  }

  &__active {
    &:after {
      top: 55%;
      transform: translate(0, -50%) rotate(225deg);
    }
  }

  &__block {
    transition: all 0.3s ease !important;
    width: 100%;
    display: flex;
    flex-direction: column;
    clip-path: inset(0 0 100% 0);

    button {
      width: 100%;
      height: 30px;
      background-color: transparent;
      border: none;
      outline: none;
    }
  }
}
</style>