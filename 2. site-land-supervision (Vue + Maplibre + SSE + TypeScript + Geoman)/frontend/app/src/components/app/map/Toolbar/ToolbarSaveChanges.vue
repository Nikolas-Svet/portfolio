<script lang="ts" setup>
import Save from '@/components/icons/save.vue'
import store from '@/store'
import { vectorApi } from '@/api/admin.ts'
import { configActions } from '@/store/actions/config.ts'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { removeAllLayers, removeAllLayers2, showAllLayers2 } from '@/utils/map/showObjects.ts'
import { combineFeatureCollections, createGeoJsonBlob, removeProperties } from '@/utils/fileBlob.ts'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'
import { updateGeomForLayer } from '@/utils/updateGeom.ts'
import { Consts } from '@/consts/index.consts.ts'
import { Feature } from 'geojson'
import { INotSavedGeoms } from '@/types/toolbar.ts'
import { IVectorLayer } from '@/types/layersVector.ts'
import { addAllMarkers, deleteAllMarkers } from '@/utils/map/toolbar/measureDistance.ts'
import deleteIconSvg from '@/assets/icons/delete.svg'
import { saveGeomObj } from '@/utils/map/utilsObject.ts'
import { checkHotKey } from '@/utils/checkHotKey.ts'

// ----------------------------------------------------------------------------
// Пропсы
// ----------------------------------------------------------------------------
const props = defineProps<{
  map: maplibregl.Map | null
  geoman: any
}>()

const saveAllChanges = computed(() => store.state.toolbar.saveAllChanges)

watch(saveAllChanges, async (newVal) => {
  if (newVal) {
    console.log('saveAllChanges', newVal)
    const geoms_for_not_saved = store.state.toolbar.geoms_for_not_saved ? store.state.toolbar.geoms_for_not_saved : []
    console.log('geoms_for_not_saved', geoms_for_not_saved)


    for (const geoms of geoms_for_not_saved) {
      let geom_for_save = [] as Feature[]
      const savedObjects = new Set<string>
      const id_layer = geoms.id_layer
      await removeAllLayers2(props.map!, geoms.geoms)
      for (const geom of geoms.geoms) {
        if (!(geom as any).id.startsWith('edit-object-')) {
          geom_for_save.push(geom as Feature)
        } else {
          if (!savedObjects.has(geom.id as any)) {
            savedObjects.add(geom.id as any)
            await saveGeomObj(geom, Number((geom as any).id.split('-')[(geom as any).id.split('-').length - 1]))
          }
        }
      }
      const featureCollection = { features: geom_for_save }
      const featureCollectionLine = { features: [] }
      const featureCollectionPoint = { features: [] }

      const combined = combineFeatureCollections(
        removeProperties(featureCollection as any),
        removeProperties(featureCollectionLine as any),
        removeProperties(featureCollectionPoint as any)
      )

      const fileBlob = createGeoJsonBlob(combined)

      const formData = new FormData()
      formData.append('geo_json_file', fileBlob, 'geometry.geojson')

      if (Number(id_layer) < 0) {
        let empty_layer = null as any
        store.state.layersMain?.layersMain.forEach((layer: any) => {
          if (layer.id === id_layer) {
            empty_layer = layer
          }
        })

        const query = {
          name: empty_layer.name,
          id_crs: 3
        }


        await store.dispatch(`layersMain/${layersMainActions.deleteLayerMain}`, Number(id_layer))

        const queryParams = new URLSearchParams(query as any).toString()
        const res = await vectorApi.createVectorLayer(queryParams, formData)
        await store.dispatch(`layersMain/${layersMainActions.setNewLayerFromTool}`, [res.id])

        const selectedLayer: any = empty_layer
        selectedLayer.id = res.id
        await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, selectedLayer)
      } else {
        await updateGeomForLayer(combined, Number(id_layer), 3)
      }

      const layer = store.state.layersMain?.selectedLayerMainEdit
      const geoms_for_layer_not_saved = store.state.toolbar.geoms_for_layer_not_saved

      const idx = geoms_for_layer_not_saved.findIndex((item: any) => Number(id_layer) === Number(item.id_layer))

      geoms_for_layer_not_saved.splice(idx, 1)

      await store.dispatch('toolbar/SET_GEOM_NOT_SAVED', geoms_for_layer_not_saved)

      await store.dispatch(configActions.SET_UPDATE_LAYER, Number(layer.id))
    }

    if (currentLayer.value.id) {
      await saveChanges()
    }
    await store.dispatch('toolbar/SET_SAVE_ALL', false)
    await store.dispatch('toolbar/SET_GEOMS_FOR_NOT_SAVED', [])
    await store.dispatch('toolbar/SET_CURRENT_GEOMS_IDS', [])
  }
})

const currentLayer = computed(() => {
  return store.state.layersMain?.selectedLayerMainEdit
})

const geoms_for_layer = computed(() => {
  return store.state.toolbar.geoms_for_layer_not_saved
})

const showPopupSaveChanges = ref(false)

const showPopupCancelChanges = ref(false)

watch(geoms_for_layer, async (newValue, oldValue) => {
  if (newValue.length === 0) {
    await removeAllLayers(props.map, oldValue)
  }
})

const saveOldGeom = async (oldLayer: IVectorLayer) => {
  const geoms_for_not_saved = store.state.toolbar.geoms_for_not_saved ? store.state.toolbar.geoms_for_not_saved : []
  const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []

  if (current_geoms_ids.length) {
    const geoms: Feature[] = props.geoman.features.getAll().features

    if (geoms.length === 0) {
      return
    }

    let geom_for_save = [] as Feature[]

    for (const geom of geoms) {
      for (const geom_id of current_geoms_ids) {
        if (geom.id === geom_id) {
          geom_for_save.push(geom as Feature)
          props.geoman.features.delete(geom.id)
        }
      }
    }
    console.log('Геометрия сохранилась', geom_for_save)
    geoms_for_not_saved.push({
      id_layer: Number(oldLayer.id),
      geoms: geom_for_save
    })

    await showAllLayers2(props.map!, geom_for_save)
    await store.dispatch('toolbar/SET_GEOMS_FOR_NOT_SAVED', geoms_for_not_saved)
    await store.dispatch('toolbar/SET_CURRENT_GEOMS_IDS', [])
  }
}

watch(
  currentLayer,
  async (newValue, oldValue) => {
    if (newValue.id === oldValue.id) {
      return
    }

    const geoms_for_not_saved = store.state.toolbar.geoms_for_not_saved ? store.state.toolbar.geoms_for_not_saved : []

    for (let i = 0; i < geoms_for_not_saved.length; i++) {
      const geom = geoms_for_not_saved[i] as INotSavedGeoms
      if (geom.id_layer === Number(newValue.id)) {
        await saveOldGeom(oldValue as IVectorLayer)
        await removeAllLayers2(props.map!, geom.geoms)

        const current_geoms_ids_new = [] as string[]

        for (const feature of geom.geoms) {
          // props.geoman.features.importGeoJsonFeature(feature)
          current_geoms_ids_new.push(String(feature.id as any))
        }

        console.log('current_geoms_ids_new', current_geoms_ids_new)


        props.map!.fire('gm:loaded', { geoms: geom.geoms })

        const geoms_for_not_saved_new = store.state.toolbar.geoms_for_not_saved ? store.state.toolbar.geoms_for_not_saved : []

        geoms_for_not_saved_new.splice(i, 1)
        await store.dispatch('toolbar/SET_CURRENT_GEOMS_IDS', current_geoms_ids_new)
        await store.dispatch('toolbar/SET_GEOMS_FOR_NOT_SAVED', geoms_for_not_saved_new)
        await deleteAllMarkers()

        const isMeasureDistance = store.state.toolbar.measure_distance
        if (isMeasureDistance) {
          await addAllMarkers(props.geoman, props.map)
        }

        if (newValue.id) {
          if (props.geoman.isModeEnabled('edit', 'change')) {
            props.geoman.disableMode('edit', 'change')
            await nextTick()
            props.geoman.toggleMode('edit', 'change')
          } else if (props.geoman.isModeEnabled('edit', 'rotate')) {
            props.geoman.disableMode('edit', 'rotate')
            await nextTick()
            props.geoman.toggleMode('edit', 'rotate')
          }
        }
        return
      }
    }

    await deleteAllMarkers()
    await saveOldGeom(oldValue as IVectorLayer)
    return
  },
  { deep: true }
)

function ruler_f() {
  if (!props.map) return

  const layerPrefixes = [
    'polygons-line',
    'polygons-fill',
    'polygons-circle',
    'lines-layer',
    'lines-circle',
    'drawnPoints'
  ]

  const layers = props.map!.getStyle().layers || []
  layerPrefixes.forEach((prefix) => {
    layers
      .filter((layer: any) => layer.id.startsWith(prefix))
      .forEach((layer: any) => {
        const layerId = layer.id
        const sourceId = layer.source

        if (props.map!.getLayer(layerId)) {
          props.map!.removeLayer(layerId)
        }

        // Удаляем источник, если он есть и не используется другими слоями
        const isSourceUsedElsewhere = props
          .map!.getStyle()
          .layers?.some((l: any) => l.id !== layerId && l.source === sourceId)

        if (!isSourceUsedElsewhere && props.map!.getSource(sourceId)) {
          props.map!.removeSource(sourceId)
        }
      })
  })
}

async function cancelChanges() {
  const id_layer = store.state.layersMain?.selectedLayerMainEdit.id
  const selectedLayerMainEdit = store.state.layersMain?.selectedLayerMainEdit;
  (selectedLayerMainEdit as any).is_edit = false
  await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, selectedLayerMainEdit)

  const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []

  let geom_for_save = [] as Feature[]

  if (current_geoms_ids.length) {
    const geoms: Feature[] = props.geoman.features.getAll().features

    if (geoms.length === 0) {
      return
    }

    for (const geom of geoms) {
      for (const geom_id of current_geoms_ids) {
        if (geom.id === geom_id) {
          geom_for_save.push(geom as Feature)
          props.geoman.features.delete(geom.id)
        }
      }
    }
  }

  const featureCollection = { features: geom_for_save }
  const featureCollectionLine = { features: [] }
  const featureCollectionPoint = { features: [] }

  ruler_f()

  const combined = combineFeatureCollections(
    removeProperties(featureCollection as any),
    removeProperties(featureCollectionLine as any),
    removeProperties(featureCollectionPoint as any)
  )

  const fileBlob = createGeoJsonBlob(combined)

  const formData = new FormData()
  formData.append('geo_json_file', fileBlob, 'geometry.geojson')


  const layer = store.state.layersMain?.selectedLayerMainEdit
  const geoms_for_layer_not_saved = store.state.toolbar.geoms_for_layer_not_saved

  const idx = geoms_for_layer_not_saved.findIndex((item: any) => Number(id_layer) === Number(item.id_layer))

  geoms_for_layer_not_saved.splice(idx, 1)

  await store.dispatch('toolbar/SET_GEOM_NOT_SAVED', geoms_for_layer_not_saved)

  await store.dispatch(configActions.SET_UPDATE_LAYER, Number(layer.id))
  await store.dispatch('toolbarDrawing/CLEAR_ALL')
  await store.dispatch('toolbar/CLEAR_ALL')
  await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, {})
  await deleteAllMarkers()
  showPopupCancelChanges.value = false
}

async function saveChanges() {
  const id_layer = store.state.layersMain?.selectedLayerMainEdit.id
  const selectedLayerMainEdit = store.state.layersMain?.selectedLayerMainEdit;
  (selectedLayerMainEdit as any).is_edit = false
  await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, selectedLayerMainEdit)
  const id_crs = 3

  const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []

  let geom_for_save = [] as Feature[]

  if (current_geoms_ids.length) {
    const geoms: Feature[] = props.geoman.features.getAll().features

    if (geoms.length === 0) {
      return
    }

    const savedObjects = new Set<string>

    for (const geom of geoms) {
      for (const geom_id of current_geoms_ids) {
        if (geom.id === geom_id && !geom_id.startsWith('edit-object-')) {
          geom_for_save.push(geom as Feature)
          props.geoman.features.delete(geom.id)
        } else if (geom.id === geom_id && geom_id.startsWith('edit-object-')) {
          if (!savedObjects.has(geom_id)) {
            savedObjects.add(geom_id)
            await saveGeomObj(geom, Number(geom_id.split('-')[geom_id.split('-').length - 1]))
          }
          props.geoman.features.delete(geom.id)
        }
      }
    }
  }

  const featureCollection = { features: geom_for_save }
  const featureCollectionLine = { features: [] }
  const featureCollectionPoint = { features: [] }

  ruler_f()

  const combined = combineFeatureCollections(
    removeProperties(featureCollection as any),
    removeProperties(featureCollectionLine as any),
    removeProperties(featureCollectionPoint as any)
  )

  const fileBlob = createGeoJsonBlob(combined)

  const formData = new FormData()
  formData.append('geo_json_file', fileBlob, 'geometry.geojson')

  if (Number(id_layer) < 0) {
    const query = {
      name: selectedLayerMainEdit.name,
      id_crs: selectedLayerMainEdit.id_crs
    }

    await store.dispatch(`layersMain/${layersMainActions.deleteLayerMain}`, Number(id_layer))

    const queryParams = new URLSearchParams(query as any).toString()
    const res = await vectorApi.createVectorLayer(queryParams, formData)
    await store.dispatch(`layersMain/${layersMainActions.setNewLayerFromTool}`, [res.id])

    const selectedLayer = store.state.layersMain?.selectedLayerMainEdit as any
    (selectedLayer as any).id = res.id
    await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, selectedLayer)
  } else {
    await updateGeomForLayer(combined, Number(id_layer), id_crs)
  }

  const layer = store.state.layersMain?.selectedLayerMainEdit
  const geoms_for_layer_not_saved = store.state.toolbar.geoms_for_layer_not_saved

  const idx = geoms_for_layer_not_saved.findIndex((item: any) => Number(id_layer) === Number(item.id_layer))

  geoms_for_layer_not_saved.splice(idx, 1)

  await store.dispatch('toolbar/SET_GEOM_NOT_SAVED', geoms_for_layer_not_saved)

  await store.dispatch(configActions.SET_UPDATE_LAYER, Number(layer.id))
  await store.dispatch('toolbarDrawing/CLEAR_ALL')
  await store.dispatch('toolbar/CLEAR_ALL')
  await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, {})
  await deleteAllMarkers()
  showPopupSaveChanges.value = false
}

// ----------------------------------------------------------------------------
// Горячие клавиши
// ----------------------------------------------------------------------------

async function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  const isHotKey = await checkHotKey(e)

  if (e.key.toLowerCase() === Consts.HotKeys.cancel_save.en && store.state.layersMain?.selectedLayerMainEdit.id) {
    showPopupSaveChanges.value = false
    showPopupCancelChanges.value = false
  } else if (e.key.toLowerCase() === Consts.HotKeys.accept_save.en && store.state.layersMain?.selectedLayerMainEdit.id && showPopupCancelChanges.value) {
    await cancelChanges()
  } else if (e.key.toLowerCase() === Consts.HotKeys.accept_save.en && store.state.layersMain?.selectedLayerMainEdit.id && showPopupSaveChanges.value) {
    await saveChanges()
  }

  if (isHotKey) {
    switch (isHotKey) {
      case 'save_geometry':
        showPopupSaveChanges.value = true
        break
      case 'reset_geometry':
        showPopupCancelChanges.value = true
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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
      left: e.clientX - 240
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
  <div class="toolbarSaveChanges">
    <button :disabled="!isEdit"
            class="toolbar__inactive toolbar__delete" @click="showPopupCancelChanges = true"
            @mouseenter="handleMouseEnter(isEdit ? `Отменить изменения (${Consts.HotKeys.toolbar.base.reset_geometry.full})` : Consts.messageForUser.notEdit)"
            @mouseleave="handleMouseLeave"
    >
      <deleteIconSvg />
    </button>
    <button :disabled="!isEdit"
            class="toolbar__inactive"
            @click="showPopupSaveChanges = true"
            @mouseenter="handleMouseEnter(isEdit ? `${Consts.messageForUser.saveChanges} (${Consts.HotKeys.toolbar.base.save_geometry.full})` : Consts.messageForUser.notEdit)"
            @mouseleave="handleMouseLeave"
    >
      <save :style="{ 'pointer-events': isEdit ? 'auto' : 'none' }" class="toolbar__icon1"></save>
    </button>
  </div>
  <section v-if="showPopupSaveChanges || showPopupCancelChanges" class="popup__saveChanges toolbar">
    <div class="popup__content">
      <p v-if="showPopupSaveChanges">Сохранить нарисованную геометрию?</p>
      <p v-if="showPopupCancelChanges">Удалить нарисованную геометрию?</p>
      <div class="popup__actions">
        <button v-if="showPopupSaveChanges" @click="saveChanges()">Cохранить</button>
        <button v-if="showPopupCancelChanges" @click="cancelChanges()">Удалить</button>
        <button @click="showPopupSaveChanges = false; showPopupCancelChanges = false">Закрыть</button>
      </div>
    </div>
  </section>
  <div
    v-show="isTooltipVisible"
    :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
    class="tooltip-warning"
  >
    {{ text_info }}
  </div>
</template>

<style lang="scss" scoped>
$radius-popup: 5px;

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

.toolbarSaveChanges {
  border-right: none !important;
  padding: 12px 0 12px 20px;
  display: flex;
  gap: 22px;
  align-items: center;
  justify-content: space-between;

  svg {
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
}

.popup {

  &__saveChanges {
    z-index: 1;
    transition: all 0.3s ease;
    position: fixed;
    height: calc(100% - 87.7px);
    display: flex;
    align-items: center;
    justify-content: center;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(5px);
    background-color: transparent !important;
  }

  &__content {
    padding: 32px;
    width: 470px;
    border-radius: $radius-popup;

    p {
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      font-size: 18px;
      text-align: center;
      margin-bottom: 24px;
    }
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      border-radius: $radius-popup;
      height: 39px;
      width: 47%;
      font-family: $Golos_Text_Medium;
      font-size: 16px;
    }
  }
}
</style>
