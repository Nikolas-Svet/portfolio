<script setup lang="ts">
import { layersApi } from '@/api/layers'
import { Consts } from '@/consts/index.consts.ts'
import { loadRasterLayers, loadVectorLayers } from '@/utils/fetchLayers.ts'

const router = useRouter()

const tableThead = reactive({
  name: 'Наименование',
  date: 'Дата добавления',
  description: 'Описание',
  actions: 'Действие'
})
const layers = ref<any[]>([])
const filters = reactive({
  name: '',
  id_dict_type_data: 0
})
const flagLoader = ref(false)

async function loadLayers() {
  flagLoader.value = true
  try {
    let appliedFilters = {
      name: '' as string,
      id_dict_type_data: [] as number[]
    }
    if (filters.id_dict_type_data > 0) {
      appliedFilters = {
        name: filters.name || '',
        id_dict_type_data: [Number(filters.id_dict_type_data)]
      }
    }

    const [vectorLayers = [], rasterLayers = []] = await Promise.all([
      loadVectorLayers(appliedFilters),
      loadRasterLayers(appliedFilters)
    ])

    const combined = [...vectorLayers, ...rasterLayers]
    combined.sort((a, b) => {
      const dateA = a.created_date ? new Date(a.created_date) : 0
      const dateB = b.created_date ? new Date(b.created_date) : 0
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.getTime() - dateA.getTime()
    })

    layers.value = combined
  } catch (error) {
    console.error('Ошибка объединения слоев:', error)
  } finally {
    flagLoader.value = false
  }
}

async function deleteLayer(layer: any) {
  try {
    let response
    if (layer.type === Consts.LayerTypes.RASTER) {
      response = await layersApi.deleteRasterLayer(layer.id)
    } else {
      response = await layersApi.deleteVectorLayer(layer.id)
    }

    if (response!.status === 200 || response!.status === 204) {
      ;(window as any).$notify(
        `Слой "${layer.name.length > 22 ? layer.name.slice(0, 22) + '...' : layer.name}" удален`,
        true
      )
      layers.value = layers.value.filter(l => l.id !== layer.id)
    } else {
      ;(window as any).$notify(
        `Ошибка при удалении слоя "${layer.name.length > 22 ? layer.name.slice(0, 22) + '...' : layer.name}"`,
        true
      )
    }
  } catch (error) {
    console.error('Ошибка при удалении слоя:', error)
  }
}

function goToLayer(layerId: number) {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) {
    localStorage.setItem('editLayer', JSON.stringify(layer))
    router.push({
      path: Consts.ROUTES.ADMIN_LAYER_EDIT,
      query: { id: layerId.toString() }
    })
  }
}

onMounted(() => {
  loadLayers()
})
</script>

<template>
  <section class="layers">
    <AppAdminTitle title="Слои" />
    <LayerList
      :layers="layers"
      :tableThead="tableThead"
      :deleteLayer="deleteLayer"
      :goToLayer="goToLayer"
    />
    <AppLoader v-if="flagLoader" styles="absolute" text="Загрузка слоев" />
  </section>
</template>

<style scoped lang="scss">

.layers {
  position: relative;
  height: 100%;
  max-height: calc(100vh - 87px);
  display: flex;
  flex-direction: column;
}
</style>
