<script setup lang="ts">
import mapLibre from '@/components/app/mapLibre.vue'
import { dictsApi } from '@/api/dicts'
import { displayLayerGeometry, flyToLocation } from '@/utils/map/actionsLayers'
import { Territory, UpdatedTerritory } from '@/types/admin/AdminTerritories'
import { Consts } from '@/consts/index.consts'

const tableThead = reactive({
  name: 'Наименование',
  actions: 'Действие'
})

const delIcon = new URL('@/assets/images/delete.svg', import.meta.url).href
const editIcon = new URL('@/assets/images/edit.svg', import.meta.url).href

const territories = ref<Territory[]>([])
const selectedTerritory = ref<Territory | null>(null)
const isMapLoaded = ref(false)
const isEditingGeometry = ref(false)
const editingNameId = ref<number | null>(null)
const updatedTerritories = ref<UpdatedTerritory[]>([])
const mapComponent = ref<any>(null)
const mapLibreComponentRef = ref<InstanceType<typeof mapLibre> | null>(null)
const flagFetchTerritories = ref<boolean>(false)

onMounted(async () => {
  flagFetchTerritories.value = true
  await fetchTerritories()
  await waitForMapLoad()
  flagFetchTerritories.value = false
})

async function waitForMapLoad() {
  const checkMap = () => {
    const cmp = mapLibreComponentRef.value
    if (cmp?.map) {
      mapComponent.value = cmp
      isMapLoaded.value = true
    } else {
      setTimeout(checkMap, 100)
    }
  }
  checkMap()
  return
}

async function fetchTerritories() {
  try {
    const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTerritories)
    const data = responseDict.success ? responseDict.data : []
    territories.value = data.map((item: any) => ({
      ...item,
      geojson: item.geojson ? JSON.parse(item.geojson) : null
    }))
  } catch {
    territories.value = []
  } finally {
    return
  }
}

async function selectTerritory(territory: Territory & { bbox_geojson?: any }) {
  selectedTerritory.value = territory
  if (!isMapLoaded.value) {
    console.warn('Карта еще не загружена')
    return
  }

  const map = mapComponent.value.map
  await displayLayerGeometry(map, territory.geojson, territory.id)

  if (territory.bbox_geojson) {
    try {
      const bbox = JSON.parse(territory.bbox_geojson)
      const coords = bbox.coordinates[0]
      if (coords?.length > 2) {
        await flyToLocation(map, coords)
      }
    } catch (err) {
      console.error('Ошибка парсинга bbox_geojson:', err)
    }
  }
}

function showTerritory(geojson: any) {
  const cmp = mapLibreComponentRef.value
  if (cmp?.showTerritory) {
    cmp.showTerritory(geojson)
  } else {
    console.error('Метод showTerritory отсутствует в mapLibreComponent')
  }
}

function editName(id: number) {
  editingNameId.value = id
}

function saveNameEdit(id: number) {
  const t = territories.value.find(t => t.id === id)
  if (t) addToUpdatedTerritories(t)
  editingNameId.value = null
}

function deleteTerritory(id: number) {
  if (!confirm('Вы уверены, что хотите удалить эту территорию?')) return

  dictsApi.deleteDict(Consts.DictsPrefixAPI.DictTerritories, id)
    .then(() => {
      territories.value = territories.value.filter(t => t.id !== id)
      alert('Территория успешно удалена')
    })
    .catch(err => {
      console.error('Ошибка при удалении территории:', err)
      alert('Ошибка при удалении территории')
    })
}

function uploadGeometry() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.geojson'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file || !selectedTerritory.value) return

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const geojson = JSON.parse(ev.target?.result as string)
        selectedTerritory.value!.geojson = geojson
        showTerritory(geojson)
        addToUpdatedTerritories(selectedTerritory.value!)
        alert('Геометрия успешно загружена')
      } catch (err) {
        console.error(err)
        alert('Ошибка при чтении файла GeoJSON')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

function toggleEditGeometry() {
  const sel = selectedTerritory.value
  if (!sel) return

  const cmp = mapLibreComponentRef.value
  if (!isEditingGeometry.value) {
    isEditingGeometry.value = true
    cmp?.enableEditing?.()
  } else {
    isEditingGeometry.value = false
    const newGeo = cmp?.getEditedGeometry?.()
    if (newGeo) {
      sel.geojson = newGeo
      addToUpdatedTerritories(sel)
      alert('Геометрия успешно сохранена')
    } else {
      alert('Не удалось получить отредактированную геометрию')
    }
  }
}

function addToUpdatedTerritories(t: Territory) {
  const idx = updatedTerritories.value.findIndex((u: any) => u.id === t.id)
  const upd: UpdatedTerritory = { id: t.id, name: t.name, geojson: t.geojson }
  if (idx >= 0) {
    updatedTerritories.value[idx] = upd
  } else {
    updatedTerritories.value.push(upd)
  }
}

function saveChanges() {
  const promises = updatedTerritories.value.map((t: any) =>
    dictsApi.updateDict(
      Consts.DictsPrefixAPI.DictTerritories,
      t.id,
      { name: t.name, geojson: JSON.stringify(t.geojson) }
    )
  )
  Promise.all(promises)
    .then(() => {
      alert('Изменения успешно сохранены')
      updatedTerritories.value = []
      fetchTerritories()
    })
    .catch(err => {
      console.error('Ошибка при сохранении изменений:', err)
      alert('Ошибка при сохранении изменений')
    })
}

function cancelChanges() {
  updatedTerritories.value = []
  selectedTerritory.value = null
  isEditingGeometry.value = false
  fetchTerritories()
}
</script>

<template>
  <section class="territories">
    <AppAdminTitle title="Территории" />
    <div class="territories__content">
      <div class="territories__content-left">
        <AppTable>
          <template #THeader>
            <thead>
            <tr>
              <th>{{ tableThead.name }}</th>
              <th>{{ tableThead.actions }}</th>
            </tr>
            </thead>
          </template>

          <template #TBody>
            <tbody>
            <tr
              v-for="territory in territories"
              :key="territory.id"
              :class="{ selected: selectedTerritory && selectedTerritory.id === territory.id }"
              @click="selectTerritory(territory as any)"
            >
              <td>
                <div v-if="editingNameId !== territory.id">
                  {{ territory.name }}
                </div>
                <div v-else>
                  <input
                    v-model="territory.name"
                    class="input"
                    @blur="saveNameEdit(territory.id)"
                  />
                </div>
              </td>
              <td>
                <img :src="editIcon" alt="edit" @click.stop="editName(territory.id)" />
                <img :src="delIcon" alt="delete" @click.stop="deleteTerritory(territory.id)" />
              </td>
            </tr>
            </tbody>
          </template>
        </AppTable>
      </div>
      <div class="territories__content-right">
        <div class="map">
          <mapLibre ref="mapLibreComponent"></mapLibre>
        </div>
      </div>
    </div>
    <AppLoader v-if="flagFetchTerritories" styles="absolute" text="Загрузка территорий" />
  </section>
  <div class="territories__buttons">
    <div v-if="selectedTerritory !== null" class="buttonBlock">
      <button
        :disabled="!selectedTerritory"
        class="defaultButton"
        style="margin-top: 0"
        @click="uploadGeometry"
      >
        Загрузить геометрию
      </button>
      <button
        :disabled="!selectedTerritory"
        class="defaultButton"
        style="margin-top: 0"
        @click="toggleEditGeometry"
      >
        {{ isEditingGeometry ? 'Сохранить геометрию' : 'Редактировать геометрию' }}
      </button>
    </div>
  </div>
  <div class="territories__buttons">
    <div class="buttonBlock">
      <button class="defaultButtonTwo" @click="saveChanges">Сохранить</button>
      <button class="defaultButton" @click="cancelChanges">Отмена</button>
    </div>
  </div>
</template>

<style scoped>
.selected {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

<style lang="scss" scoped>

.input {
  height: 40px;
  width: 200px;
  background-color: transparent;
  border-radius: 0;
  outline: none;
  padding: 0 5px;
}

.territories {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  &__content {
    flex: 1;
    display: flex;
    width: 100%;
    flex-wrap: nowrap;

    &-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 100%;
      height: 100%;

      .map {
        width: 100%;
        height: 100%;
      }
    }

    &-left {
      flex: 1;
      max-width: 655px;
      overflow: auto;
      width: 50%;
      aspect-ratio: calc(10 / 7);
    }
  }

  &__buttons {
    position: fixed;
    bottom: 64px;
    right: 64px;
    width: 100%;
    padding: 0 64px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    button {
      margin-top: 0 !important;

      backdrop-filter: blur(3px);
    }

    &:nth-child(2) {
      bottom: 128px;
      right: 64px;
    }
  }
}

@media (width < 1920px) {
  .territories {
    &__content {
      &-left {
        max-width: 450px;
      }
    }
  }
}

@media (width < 1600px) {
  .territories {
    border-bottom: none;
    padding-right: 0;

    &__content {
      flex-direction: column;

      &-left {
        max-height: 450px;
        max-width: none;
        width: 100%;
      }

      &-right {
        flex: 1;
      }
    }
  }
}
</style>
