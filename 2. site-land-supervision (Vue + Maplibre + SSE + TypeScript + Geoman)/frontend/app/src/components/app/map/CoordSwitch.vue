<script lang="ts" setup>
import maplibregl from 'maplibre-gl'
import proj4 from 'proj4'
import IconCheck from '@/assets/icons/check.svg'
import IconClose from '@/assets/icons/close.svg'
import { moveToPoint } from '@/utils/map/actionsLayers.ts'

const props = defineProps({
  map: maplibregl.Map,
  cursorLng: Number || null,
  cursorLat: Number || null
})

const emit = defineEmits<{
  (e: 'update:coords', coords: { lng: string; lat: string }): void
}>()

const crsOptions = ref<{ name: string; value: string }[]>([
  { name: 'МСК зона 1', value: 'MSK_ZONE_1' },
  { name: 'МСК зона 2', value: 'MSK_ZONE_2' },
  { name: 'WGS 84', value: 'WGS 84' },
  { name: 'EPSG:3857', value: 'EPSG:3857' }
])
const selectedCRS = ref<any>({ name: 'WGS 84', value: 'WGS 84' })
const currentIndex = ref<number>(2)
const editCoord = ref<boolean>(false)


interface ICoord {
  lng: string,
  lat: string,
}

const editCoords = ref<ICoord>({
  lng: '-',
  lat: '-'
})

const convertedCoords = computed(() => {
  if (props.cursorLng === null || props.cursorLat === null) return { lng: '—', lat: '—' }

  let lng = props.cursorLng
  let lat = props.cursorLat

  if (!lng || !lat) {
    return
  }

  switch (selectedCRS.value.value) {
    case 'WGS 84':
      return { lng: lng.toFixed(5), lat: lat?.toFixed(5) }
    case 'EPSG:3857':
      const [x3857, y3857] = proj4('EPSG:4326', 'EPSG:3857', [lng, lat])
      return { lng: x3857.toFixed(2), lat: y3857.toFixed(2) }
    case 'MSK_ZONE_1':
      return { lng: (lng + 100).toFixed(5), lat: (lat + 50).toFixed(5) }
    case 'MSK_ZONE_2':
      return { lng: (lng + 200).toFixed(5), lat: (lat + 100).toFixed(5) }
    default:
      return { lng: lng.toFixed(5), lat: lat.toFixed(5) }
  }
})

function prevCRS() {
  currentIndex.value = (currentIndex.value - 1 + crsOptions.value.length) % crsOptions.value.length
  selectedCRS.value = crsOptions.value[currentIndex.value]
}

function nextCRS() {
  currentIndex.value = (currentIndex.value + 1) % crsOptions.value.length
  selectedCRS.value = crsOptions.value[currentIndex.value]
}

const openEditCoord = () => {
  if ((editCoords as any).value) {
    (editCoords as any).value.lng = convertedCoords.value?.lng ?? '';
    (editCoords as any).value.lat = convertedCoords.value?.lat ?? ''
  }
  editCoord.value = !editCoord.value
}

const acceptEditCoords = () => {
  const lngStr = editCoords.value?.lng ?? ''
  const latStr = editCoords.value?.lat ?? ''
  const numLng = Number(lngStr.replace(',', '.'))
  const numLat = Number(latStr.replace(',', '.'))
  if (isNaN(numLng) || isNaN(numLat)) {
    ;(window as any).$notify('Неверный формат координат', true)
    return
  }

  let targetLng: number
  let targetLat: number

  switch (selectedCRS.value.value) {
    case 'WGS 84':
      targetLng = numLng
      targetLat = numLat
      break

    case 'EPSG:3857':
      const [lon4326, lat4326] = proj4('EPSG:3857', 'EPSG:4326', [numLng, numLat])
      targetLng = lon4326
      targetLat = lat4326
      break

    case 'MSK_ZONE_1':
      targetLng = numLng - 100
      targetLat = numLat - 50
      break

    case 'MSK_ZONE_2':
      targetLng = numLng - 200
      targetLat = numLat - 100
      break

    default:
      targetLng = numLng
      targetLat = numLat
      break
  }

  if (
    targetLng > 180 || targetLng < -180 ||
    targetLat > 90 || targetLat < -90
  ) {
    ;(window as any).$notify('Координаты вне допустимого диапазона.', true)
    return
  }

  editCoord.value = false

  moveToPoint(props.map, [targetLng, targetLat])
}

watch(convertedCoords, (newCoords) => {
  emit('update:coords', newCoords!)
}, { immediate: true })
</script>

<template>
  <div v-if="$route.path === '/'" class="info-coordinates">
    <div :class="{'coord-switch--edit': editCoord}" class="coord-switch">
      <div class="coord-switch__actions">
        <button class="arrow left" @click="prevCRS">&lt;</button>
        <div class="coord-switch__text">
          <span style="position: relative" :key="selectedCRS.value">{{ selectedCRS.name }}</span>
        </div>
        <button class="arrow right" @click="nextCRS">&gt;</button>
      </div>
      <div class="coord-switch__actions" style="height: 40px;">
        <button class="coord-switch__edit" @click="acceptEditCoords">
          <IconCheck />
        </button>
        <button class="coord-switch__edit" @click="editCoord = false;">
          <IconClose />
        </button>
      </div>
    </div>
    <div class="coord-switch__value">
      <span title="Широта" :style="{opacity: !editCoord ? '1' : '0', zIndex: !editCoord ? '1' : '0'}"
            @dblclick="openEditCoord">{{ convertedCoords?.lng
        }}</span>
      <span title="Долгота" :style="{opacity: !editCoord ? '1' : '0', zIndex: !editCoord ? '1' : '0'}"
            @dblclick="openEditCoord">{{ convertedCoords?.lat
        }}</span>
      <input style="left: 0" :style="{opacity: editCoord ? '1' : '0', zIndex: editCoord ? '1' : '0'}"
             @keyup.enter="acceptEditCoords" @keyup.esc="editCoord = false;"
             v-model.trim="editCoords.lng"
             type="text">
      <input style="right: 0" :style="{opacity: editCoord ? '1' : '0', zIndex: editCoord ? '1' : '0'}"
             @keyup.enter="acceptEditCoords" @keyup.esc="editCoord = false;"
             v-model.trim="editCoords.lat"
             type="text">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-coordinates {
  overflow: hidden;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  max-width: 380px;
  position: fixed;
  bottom: 0;
  right: 20px;
  z-index: 0;

  span {
    cursor: pointer;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 40px;
    opacity: 1;
    transition: all 0.3s ease;
    position: absolute;
    right: 0;
    top: 0;

    &:first-child {
      left: 0 !important;
    }
  }
}

.coord-switch {
  width: 40%;
  display: flex;
  align-items: center;
  border-radius: 4px;
  user-select: none;
  text-align: center;
  font-size: 14px;
  min-width: 140px;
  flex-direction: column;
  transform: translateY(20px);
  transition: all 0.3s ease;
  position: relative;

  &--edit {
    transform: translateY(-20px) !important;
  }

  * {
    border: none !important;
  }

  .arrow {
    background: transparent;
    border: none;
    min-width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }

  &__actions {
    justify-content: space-between;
    position: relative;
    display: flex;
    width: 100%;

    button {
      position: relative;
      z-index: 1;
    }
  }

  &__edit {
    width: 50%;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.7;
    }

    svg {
      transform: translateY(2px);
    }
  }

  &__text {
    height: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex: 1;
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
    justify-content: center;
    overflow: hidden;
    z-index: -1;

    span {
      height: 14px;
      width: 100%;
      display: inline-block;
      position: absolute;
    }
  }

  &__value {
    position: relative;
    display: flex;
    width: 60%;
    height: 100%;

    input {
      opacity: 1;
      transition: all 0.3s ease;
      outline: none;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 40px;
      background-color: transparent;
      border: none;
      font-size: 16px;
      position: absolute;
      top: 0;
    }
  }
}
</style>