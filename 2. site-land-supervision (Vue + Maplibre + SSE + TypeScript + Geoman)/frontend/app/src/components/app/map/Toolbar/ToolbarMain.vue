<script setup lang="ts">
import ToolbarBasic from '@/components/app/map/Toolbar/ToolbarBasic.vue'
import ToolbarDrawing from '@/components/app/map/Toolbar/ToolbarDrawing.vue'
import ToolbarActions from '@/components/app/map/Toolbar/ToolbarActions.vue'
import ToolbarSaveChanges from '@/components/app/map/Toolbar/ToolbarSaveChanges.vue'
import { computed, watch } from 'vue'
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'
import { deleteAllMarkers } from '@/utils/map/toolbar/measureDistance.ts'

const props = defineProps<{
  map: any
  geoman: any
}>()

const emit = defineEmits<{
  (e: 'draw-bbox'): void
}>()

const featurePoint = computed(() => {
  return store.state.toolbarDrawing?.featureCollectionPoint
})

const featureLine = computed(() => {
  return store.state.toolbarDrawing?.featureCollectionLine
})

const featurePolygon = computed(() => {
  return store.state.toolbarDrawing?.featureCollection
})

const measure_distance = computed(() => store.state.toolbar.measure_distance)

watch(measure_distance, async (newValue) => {
  if (newValue) {
    if (props.geoman.isModeEnabled('edit', 'cut')) {
      props.geoman.disableMode('edit', 'cut')
      await store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
    }
    const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []
    const geojsonData = props.geoman.features.getAll()
    console.log('geojsonData', geojsonData)
    const geoDataFinal = new Set()
    for (const geoms_id of current_geoms_ids) {
      for (const geoData of geojsonData.features) {
        if (geoms_id === geoData.id && !geoms_id.includes('circle-feature')) {
          geoDataFinal.add(geoData)
        }
      }
    }

    for (const geom of geoDataFinal) {
      const markers = addEdgeDistances(props.map, (geom as any).geometry, {
        cssClass: 'distance-icon',
        rotatePerpendicular: true,
        collisionPx: 20,
        dynamic: true,
        isCreate: true
      })

      await store.dispatch('GeometryMarkersDistance/ADD_LAYER', { id: (geom as any).id, markers: markers })
    }
  } else {
    await deleteAllMarkers()
  }
})

// Функция для обновления состояния
const updateLayerMain = () => {
  const selectedLayerMainEdit = store.state.layersMain?.selectedLayerMainEdit
  if (selectedLayerMainEdit) {
    (selectedLayerMainEdit as any).is_edit = true
    store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, selectedLayerMainEdit)
  }
}

watch(
  featurePoint,
  (newValue) => {
    if (newValue?.features.length > 0) {
      updateLayerMain()
    }
  },
  { immediate: true, deep: true }
)

watch(
  featureLine,
  (newValue) => {
    if (newValue?.features.length > 0) {
      updateLayerMain()
    }
  },
  { immediate: true, deep: true }
)

watch(
  featurePolygon,
  (newValue) => {
    if (newValue?.features.length > 0) {
      updateLayerMain()
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <section class="toolbar">
    <ToolbarBasic :map="props.map"></ToolbarBasic>
    <ToolbarDrawing :map="props.map" :geoman="props.geoman"></ToolbarDrawing>
    <ToolbarHighlight
      :geoman="props.geoman"
      @draw-bbox="emit('draw-bbox')"
    />
    <ToolbarActions :geoman="props.geoman" :map="props.map"></ToolbarActions>
    <ToolbarSaveChanges :map="props.map" :geoman="props.geoman"></ToolbarSaveChanges>
  </section>
</template>

<style scoped lang="scss">
.toolbar {
  transition: top 0.3s ease,
  width 0.4s ease !important;
  position: absolute;
  display: flex;
  align-items: center;
  top: -60px;
  width: 100%;
  z-index: 2;
  padding: 8px 30px;
  right: 0;

  svg {
    height: 30px;
    width: 30px;
  }
}
</style>
