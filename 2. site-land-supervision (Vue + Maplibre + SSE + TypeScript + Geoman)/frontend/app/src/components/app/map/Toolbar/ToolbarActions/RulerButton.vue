<script lang="ts" setup>
import Ruler from '@/components/icons/Toolbar/ruler.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import store from '@/store'
import maplibregl, { MapGeoJSONFeature, MapLayerMouseEvent, MapMouseEvent, Marker } from 'maplibre-gl'

// !!!!!  Созданные линии хранятся здесь, а не в vuex
import {
  clearMarkers,
  updateActiveLineEdgeDistances,
  updateClosedLineEdgeDistances
} from '@/utils/map/toolbar/lineDistanceMeasure'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'
import { Consts } from '@/consts/index.consts.ts'
import { checkHotKey } from '@/utils/checkHotKey.ts'

// Props
const props = defineProps<{
  map: maplibregl.Map | null
}>()

// Текущее средство (для кнопки)
const currentTool = computed(() => store.state.toolbar.is_active_tool)

watch(currentTool, (newValue, oldValue) => {
  if (oldValue === 'ruler' && newValue !== 'ruler') {
    deactivateDrawLineMode()
  }
})

// Состояние рисования
const isDrawing = ref(false)
const oldClickHandlers = ref<Function[]>([])
const oldContextmenuHandlers = ref<Function[]>([])

// «Активная» линия (ещё не «закрытая»)
const activeCoords = ref<[number, number][]>([])
const ephemeralCoord = ref<[number, number] | null>(null)

// Уже нарисованные (закрытые) линии (каждая — Feature<LineString>)
const drawnFeatures = ref<GeoJSON.Feature<GeoJSON.LineString>[]>([])

// ID для новых фич
let featureCounter = 1

// Источник и слои
const SOURCE_ID = 'ruler-source'
const LINE_LAYER_ID = 'ruler-layer'
const CIRCLE_LAYER_ID = 'ruler-circle'

// ======================
// Маркеры расстояний
// ======================
const activeLineMarkers = ref<Marker[]>([])
const closedLineMarkersMap = ref<Record<string, Marker[]>>({})

const current_delete_point = computed(() => {
  return store.state.toolbar.current_delete_point
})

const selectedLayerMainEdit = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

watch(selectedLayerMainEdit, (newValue) => {
  if (
    !newValue.id
  ) {
    deactivateDrawLineMode()
  }
})

watch(current_delete_point, (new_delete_point) => {
  if (
    new_delete_point &&
    new_delete_point.ringIndex === undefined &&
    new_delete_point.one_point === undefined
  ) {
    deleteVertex(new_delete_point.parentId, new_delete_point.vertexIndex)
  }
})

const currentLayer = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})
watch(
  currentLayer,
  async (newValue, oldValue) => {
    if (newValue.id !== oldValue.id) {
      clearMarkers(activeLineMarkers.value as any)
      activeLineMarkers.value = []

      Object.keys(closedLineMarkersMap.value).forEach((fid) => {
        clearMarkers(closedLineMarkersMap.value[fid])
      })
      closedLineMarkersMap.value = {}
      drawnFeatures.value = []
      updateSourceData()
    }
  },
  { deep: true })

// ======================
// Активируем рисование
// ======================
function activateDrawLineMode() {
  if (isDrawing.value) {
    deactivateDrawLineMode()
  }
  clearMarkers(activeLineMarkers.value as any)
  activeLineMarkers.value = []

  Object.keys(closedLineMarkersMap.value).forEach((fid) => {
    clearMarkers(closedLineMarkersMap.value[fid])
  })
  closedLineMarkersMap.value = {}
  drawnFeatures.value = []
  updateSourceData()

  store.dispatch('toolbar/ADD_ACTIVE_TOOL', 'ruler')
  store.dispatch('toolbar/SET_ACTIVE_CURSOR', 'crosshair')
  isDrawing.value = true

  activeCoords.value = []
  ephemeralCoord.value = null

  // Отключим предыдущие клики
  const clickListeners = (props.map as any)?._listeners?.click
  if (clickListeners && Array.isArray(clickListeners) && clickListeners.length > 0) {
    oldClickHandlers.value = [...clickListeners]
    clickListeners.forEach((fn: any) => props.map?.off('click', fn))
  }

  const contextmenuListeners = (props.map as any)?._listeners?.contextmenu
  if (contextmenuListeners && Array.isArray(contextmenuListeners) && contextmenuListeners.length > 0) {
    oldContextmenuHandlers.value = [...contextmenuListeners]
    contextmenuListeners.forEach((fn: any) => props.map?.off('contextmenu', fn))
  }

  addLayers()

  props.map?.on('click', handleMapClick)
  props.map?.on('mousemove', handleMapMouseMove)
  props.map?.on('dblclick', handleMapDoubleClick)
  props.map?.on('styledata', bringPolygonsToFront)
}

function bringPolygonsToFront() {
  if (!props.map) return
  [LINE_LAYER_ID, CIRCLE_LAYER_ID].forEach(layerId => {
    if (props.map!.getLayer(layerId)) {
      props.map!.moveLayer(layerId)
    }
  })
}

// Деактивируем рисование
function deactivateDrawLineMode() {
  console.log('deactivateDrawLineMode')
  props.map?.off('click', handleMapClick)
  props.map?.off('mousemove', handleMapMouseMove)
  props.map?.off('dblclick', handleMapDoubleClick)

  oldClickHandlers.value.forEach((fn: any) => props.map?.on('click', fn))
  oldClickHandlers.value = []
  oldContextmenuHandlers.value.forEach((fn: any) => props.map?.on('contextmenu', fn))
  oldContextmenuHandlers.value = []

  if (currentTool.value === 'ruler') {
    console.log('ADD_ACTIVE_TOOL')
    store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
  }
  isDrawing.value = false

  activeCoords.value = []
  ephemeralCoord.value = null

  clearMarkers(activeLineMarkers.value as any)
  activeLineMarkers.value = []
  updateSourceData()
}

// Клик => добавляем вершину
function handleMapClick(e: maplibregl.MapMouseEvent) {
  if (!isDrawing.value) return
  const { lng, lat } = e.lngLat
  activeCoords.value.push([lng, lat])

  updateSourceData() // чтобы линия появлялась
  recreateActiveLineMarkers() // пересоздаём маркеры расстояний
}

// Движение мыши => «резиновая» точка
function handleMapMouseMove(e: maplibregl.MapMouseEvent) {
  if (!isDrawing.value) return
  const { lng, lat } = e.lngLat
  ephemeralCoord.value = [lng, lat]

  updateSourceData()
  recreateActiveLineMarkers()
}

// Двойной клик => завершаем линию
function handleMapDoubleClick(e: maplibregl.MapMouseEvent) {
  e.preventDefault()
  if (!isDrawing.value || activeCoords.value.length < 2) return

  activeCoords.value.pop()

  // // Добавляем ещё одну точку в конец
  // const { lng, lat } = e.lngLat
  // activeCoords.value.push([lng, lat])

  closeLine()
}

function closeLine() {
  const newId = `line-${featureCounter++}`
  const newFeature: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: { id: newId },
    geometry: {
      type: 'LineString',
      coordinates: [...activeCoords.value]
    }
  }

  drawnFeatures.value.push(newFeature)

  if (closedLineMarkersMap.value[newId]) {
    clearMarkers(closedLineMarkersMap.value[newId])
  }
  // Создаём новые
  closedLineMarkersMap.value[newId] = updateClosedLineEdgeDistances(
    props.map!,
    newFeature,
    true
  )

  // Сбрасываем «активную» линию
  clearMarkers(activeLineMarkers.value as any)
  activeLineMarkers.value = []
  activeCoords.value = []
  ephemeralCoord.value = null

  updateSourceData()
  deactivateDrawLineMode()
}

// ======================
// Функция, которая пересоздаёт маркеры расстояний для "активной" линии
// ======================
function recreateActiveLineMarkers() {
  clearMarkers(activeLineMarkers.value as any)
  activeLineMarkers.value = []

  if (!props.map) return

  const newMarkers = updateActiveLineEdgeDistances(
    props.map,
    activeCoords.value,
    ephemeralCoord.value,
    true
  )
  activeLineMarkers.value = newMarkers
}

// ======================
//  updateSourceData: записываем
//   (1) уже закрытые линии
//   (2) активную линию
//   (3) Points для вершин (чтобы можно было drag/hover)
// ======================
function updateSourceData() {
  if (!props.map) return
  const src = props.map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource
  if (!src) return

  const features: GeoJSON.Feature[] = []

  // 1) Закрытые линии + их точки
  for (const line of drawnFeatures.value) {
    features.push(line)
    const coords = line.geometry.coordinates
    coords.forEach((coord, idx) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: {
          parentId: line.properties?.id!,
          vertexIndex: idx
        }
      })
    })
  }

  // 2) Активная «резиновая» линия + её точки
  if (activeCoords.value.length > 0) {
    const lineCoords = [...activeCoords.value]
    if (ephemeralCoord.value) lineCoords.push(ephemeralCoord.value)
    if (lineCoords.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: lineCoords },
        properties: { id: 'active' }
      })
    }
    lineCoords.forEach((coord, idx) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: {
          parentId: 'active-line',
          vertexIndex: idx
        }
      })
    })
  }
  src.setData({ type: 'FeatureCollection', features })
}

// ======================
//  addLayers: Линия и точки
//   + hover/drag событий на точки
// ======================
function addLayers() {
  if (!props.map) return

  if (!props.map.getSource(SOURCE_ID)) {
    props.map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })
  }

  // Линия
  if (!props.map.getLayer(LINE_LAYER_ID)) {
    props.map.addLayer({
      id: LINE_LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-width': 2,
        'line-color': '#d68166',
        'line-dasharray': [2, 2]
      }
    })
  }

  // Вершины
  if (!props.map.getLayer(CIRCLE_LAYER_ID)) {
    props.map.addLayer({
      id: CIRCLE_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 4,
        'circle-color': '#fff',
        'circle-stroke-width': 3,
        // При hover (feature-state.hover=true) => #D68166, иначе #C83202
        'circle-stroke-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#D68166',
          '#d68166'
        ]
      }
    })

    // Навешиваем события для hover + drag
    props.map.on('mousemove', CIRCLE_LAYER_ID, handleMouseMoveCircle)
    props.map.on('mouseleave', CIRCLE_LAYER_ID, handleMouseLeaveCircle)
    props.map.on('mousedown', CIRCLE_LAYER_ID, handleMouseDownCircle)

    // «Глобальные» mousemove/mouseup для drag
    props.map.on('mousemove', handleMapMouseDrag)
    props.map.on('mouseup', handleMapMouseUp)
  }
}

// ======================
//   Hover вершин
// ======================
function handleMouseMoveCircle(e: MapLayerMouseEvent) {
  if (currentTool.value === Consts.activeTools.delete_point) {
    return
  }
  if (!props.map || isDrawing.value) return

  const f = e.features?.[0]
  if (!f) return

  const fId = getFeatureUid(f)
  props.map.setFeatureState({ source: SOURCE_ID, id: fId }, { hover: true })
}

function handleMouseLeaveCircle(e: MapLayerMouseEvent) {
  if (currentTool.value === Consts.activeTools.delete_point) {
    return
  }
  if (!props.map || isDrawing.value) return

  const f = e.features?.[0]
  if (!f) return

  const fId = getFeatureUid(f)
  props.map.setFeatureState({ source: SOURCE_ID, id: fId }, { hover: false })
}

/** Формируем уникальный ID для Point-фичи, иначе feature-state не сработает. */
function getFeatureUid(f: MapGeoJSONFeature) {
  if (f.id !== null && f.id !== undefined) {
    return f.id
  }
  const pid = f.properties?.parentId || '???'
  const vid = f.properties?.vertexIndex || 0
  return `${pid}-${vid}`
}

// ======================
//   Drag вершин
// ======================
const isDragging = ref(false)
let dragInfo: { parentId: string; vertexIndex: number } | null = null

function handleMouseDownCircle(e: MapLayerMouseEvent) {
  if (currentTool.value === Consts.activeTools.delete_point) {
    return
  }
  if (!props.map || isDrawing.value) return
  e.preventDefault()

  const f = e.features?.[0]
  if (!f) return
  const pid = f.properties?.parentId
  const vid = f.properties?.vertexIndex
  if (pid === undefined || vid === undefined) return

  isDragging.value = true
  dragInfo = { parentId: pid, vertexIndex: vid }

  // Отключаем dragPan карты
  props.map.dragPan.disable()
}

function handleMapMouseDrag(e: MapMouseEvent) {
  if (currentTool.value === Consts.activeTools.delete_point) {
    return
  }
  if (!isDragging.value || !dragInfo) return
  if (!props.map) return

  e.preventDefault()
  const { lng, lat } = e.lngLat

  // Если это «active-line», редактируем activeCoords
  if (dragInfo.parentId === 'active-line') {
    if (dragInfo.vertexIndex < activeCoords.value.length) {
      console.log(activeCoords.value[dragInfo.vertexIndex])
      activeCoords.value[dragInfo.vertexIndex] = [lng, lat]

      updateSourceData()
      recreateActiveLineMarkers()
    }
  } else {
    // Ищем закрытую линию
    const line = drawnFeatures.value.find((f) => f.properties?.id === dragInfo!.parentId)
    if (!line) return

    if (dragInfo.vertexIndex >= line.geometry.coordinates.length) return

    line.geometry.coordinates[dragInfo.vertexIndex] = [lng, lat]

    // Обновляем источник
    updateSourceData()

    // Пересоздаём маркеры расстояний
    const fid = line.properties?.id
    if (fid) {
      if (closedLineMarkersMap.value[fid]) {
        clearMarkers(closedLineMarkersMap.value[fid])
        delete closedLineMarkersMap.value[fid]
      }
      closedLineMarkersMap.value[fid] = updateClosedLineEdgeDistances(props.map!, line, true)
    }
  }
}

function handleMapMouseUp() {
  if (!isDragging.value) return
  if (!props.map) return

  isDragging.value = false
  dragInfo = null

  // props.map.getCanvas().style.cursor = 'move'
  props.map.dragPan.enable()
}

/**
 * Удаляет вершину линии по заданным параметрам и обновляет источник и расстояния.
 *
 * @param parentId Идентификатор линии. Если равен 'active-line' — значит удаляем из activeCoords.
 * @param vertexIndex Индекс вершины, которую нужно удалить.
 */
function deleteVertex(parentId: string, vertexIndex: number) {
  if (!props.map) return

  if (parentId === 'active-line') {
    // Если удаляем вершину из активной линии:
    if (vertexIndex < activeCoords.value.length) {
      activeCoords.value.splice(vertexIndex, 1)
      updateSourceData()
      recreateActiveLineMarkers()
    }
  } else {
    // Удаляем вершину из закрытой линии.
    // Находим объект линии по parentId в drawnFeatures.
    const line = drawnFeatures.value.find((f) => f.properties?.id === parentId)
    if (!line) {
      console.warn(`Линия с id=${parentId} не найдена`)
      return
    }

    // Получаем массив координат линии
    let coords = [...line.geometry.coordinates]
    if (coords.length <= 2) {
      console.warn('Нельзя удалить вершину: слишком мало координат для линии')
      return
    }

    // Определяем, является ли линия замкнутой: первая и последняя координаты совпадают.
    const first = coords[0]
    const last = coords[coords.length - 1]
    const isClosed = Math.abs(first[0] - last[0]) < 1e-7 && Math.abs(first[1] - last[1]) < 1e-7

    if (isClosed) {
      // Если линия замкнута, при удалении первой или последней вершины нужно обновить обе.
      if (vertexIndex === 0) {
        // Удаляем первую точку...
        coords.splice(0, 1)
        // ...и обновляем последнюю, чтобы она теперь равнялась новой первой
        coords[coords.length - 1] = coords[0]
      } else if (vertexIndex === coords.length - 1) {
        // Если удаляем последнюю, то её удаление происходит, но затем
        // обновляем первую точку, чтобы сохранить замыкание.
        coords.splice(vertexIndex, 1)
        coords[0] = coords[coords.length - 1]
      } else {
        coords.splice(vertexIndex, 1)
      }
    } else {
      // Если линия не замкнута, просто удаляем нужный элемент.
      coords.splice(vertexIndex, 1)
    }

    // Обновляем геометрию линии
    line.geometry.coordinates = coords
    updateSourceData()

    // Пересоздаём маркеры расстояний для этой линии
    if (line.properties?.id) {
      const fid = line.properties.id
      if (closedLineMarkersMap.value[fid]) {
        clearMarkers(closedLineMarkersMap.value[fid])
        delete closedLineMarkersMap.value[fid]
      }
      // Здесь можно использовать либо updateClosedLineEdgeDistances,
      // либо напрямую addEdgeDistances, если это ваша логика.
      closedLineMarkersMap.value[fid] = addEdgeDistances(props.map, line.geometry, {
        dynamic: true
      })
    }
  }

  store.dispatch('toolbar/SET_CURRENT_DELETE_POINT', null)
}

// ----------------------------------------------------------------------------
// Горячие клавиши
// ----------------------------------------------------------------------------
async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  const isHotKey = await checkHotKey(e)

  if (isHotKey) {
    switch (isHotKey) {
      case 'ruler':
        activateDrawLineMode()
        break
    }
  }

  if (e.key.toLowerCase() === Consts.HotKeys.cancel_drawing.en && isDrawing.value) {
    deactivateDrawLineMode()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// ======================
//  onBeforeUnmount
// ======================
const featureCollectionLine = store.state.toolbarDrawing?.featureCollectionLine

watch(featureCollectionLine, (newVal) => {
  if (newVal.features.length === 0) {
    if (isDrawing.value) {
      deactivateDrawLineMode()
    }

    // «Активная» линия (ещё не «закрытая»)
    activeCoords.value = []
    ephemeralCoord.value = null

    // Уже нарисованные (закрытые) линии (каждая — Feature<LineString>)
    drawnFeatures.value = []

    clearMarkers(activeLineMarkers.value as any)
    Object.values(closedLineMarkersMap.value).forEach((m) => clearMarkers(m))
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (isDrawing.value) {
    deactivateDrawLineMode()
  }

  // Удаляем все маркеры
  clearMarkers(activeLineMarkers.value as any)
  Object.values(closedLineMarkersMap.value).forEach((m) => clearMarkers(m))

  if (!props.map) return
  props.map.off('mousemove', CIRCLE_LAYER_ID, handleMouseMoveCircle)
  props.map.off('mouseleave', CIRCLE_LAYER_ID, handleMouseLeaveCircle)
  props.map.off('mousedown', CIRCLE_LAYER_ID, handleMouseDownCircle)
  props.map.off('mousemove', handleMapMouseDrag)
  props.map.off('mouseup', handleMapMouseUp)
})
</script>

<template>
  <ruler
    :class="{
      toolbar__iconActive1: currentTool === 'ruler',
      toolbar__icon1: currentTool !== 'ruler'
    }"
    @click="activateDrawLineMode"></ruler>
</template>

<style lang="scss" scoped></style>
