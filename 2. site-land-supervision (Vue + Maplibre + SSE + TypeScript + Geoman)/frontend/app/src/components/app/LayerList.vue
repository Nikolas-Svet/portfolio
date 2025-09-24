<template>
  <div class="add-layer__content__filters">
    <div class="angle__container" style="width: 30%">
      <input v-model="filters.name" placeholder="Название" type="text" />
      <div v-if="filters.name !== ''" class="icon-close" @click="clearFilter('name')"></div>
      <div class="icon-search"><span></span></div>
    </div>

    <div class="angle__container">
      <v-select
        v-model="filters.id_dict_type_data"
        :options="dicts"
        label="name"
        :reduce="datasetReducer"
      />
    </div>

    <div class="add-layer__content__setLayer" style="max-width: 190px">
      <div class="add-layer__content__layer">
        <div class="checkbox">
          <input id="raster-layers-checkbox" v-model="showRasterLayers" type="checkbox" />
          <label for="raster-layers-checkbox"></label>
        </div>
        <span>Растровые слои</span>
      </div>
      <div class="add-layer__content__layer">
        <div class="checkbox">
          <input id="vector-layers-checkbox" v-model="showVectorLayers" type="checkbox" />
          <label for="vector-layers-checkbox"></label>
        </div>
        <span>Векторные слои</span>
      </div>
    </div>
  </div>

  <div :style="{marginBottom: selectedLayers.length > 0 ? '83px' : '0'}" class="layers__content layer-list">
    <AppTable v-if="sortedAndFilteredLayers.length">
      <template #THeader>
        <thead>
        <tr>
          <th
            :class="{ active_add: sortBy === 'name' }"
            class="layer-list__th"
            style="width: 40%"
            @click="setSort('name')"
          >
            Наименование
          </th>
          <th
            :class="{ active_add: sortBy === 'created_date' }"
            class="layer-list__th"
            style="width: 40%"
            @click="setSort('created_date')"
          >
            Дата добавления
          </th>
          <th style="width: 20%">{{ tableThead.actions }}</th>
        </tr>
        </thead>
      </template>
      <template #TBody>
        <tbody>
        <tr v-for="layer in sortedAndFilteredLayers"
            :key="layer.id" :class="{'add-layer-in-group__inactive': selectedLayers.includes(layer)}">
          <td>
            {{ layer.name.length > 32 ? layer.name.slice(0, 32) + '...' : layer.name }}
          </td>
          <td @click="goToLayer(layer.id)">{{ formatDate(layer.created_date) }}</td>
          <td>
            <deleteIcon v-if="!selectedLayers.includes(layer)" @click="selectedLayers.push(layer)" />
            <restoreIcon v-else style="height: 24px; width: 24px" @click="resetDeleteLayer(layer)" />
          </td>
        </tr>
        </tbody>
      </template>
    </AppTable>
    <p v-else class="not_layers">Слои не найдены</p>
    <div :class="{nav__active: selectedLayers.length > 0}" class="nav_">
      <div v-if="selectedLayers.length > 0" class="numbers">
        <span>Количество выбранных слоев:</span>
        {{ selectedLayers.length }}
      </div>
      <AppButton :disabled="selectedLayers.length === 0" class="defaultButtonTwo" @click="deleteSelectedLayers">Удалить
        слои
      </AppButton>
      <AppButton :disabled="selectedLayers.length === 0" class="defaultButton" @click="selectedLayers = []">Отменить
      </AppButton>
    </div>
  </div>
  <AppLoader v-if="loaderFlag && selectedLayers.length > 1" styles="absolute" text="Удаление слоев" />
  <AppLoader v-else-if="loaderFlag" styles="absolute" text="Удаление слоя" />
</template>

<script lang="ts" setup>
import deleteIcon from '@/assets/icons/delete.svg'
import restoreIcon from '@/assets/icons/restore.svg'
import { formatDate } from '../../utils/formatDate.ts'
import { dictsApi } from '@/api/dicts.ts'
import { Consts } from '@/consts/index.consts.ts'

const props = withDefaults(defineProps<{
  layers: any[]
  tableThead: Record<string, string>
  editingLayerId?: number | null
  deleteLayer: (layer: any) => Promise<void>
  goToLayer: (layerId: number) => void
}>(), {
  editingLayerId: null
})

const loaderFlag = ref(false)
const filters = reactive({
  name: '',
  id_dict_type_data: 0
})
const showRasterLayers = ref(true)
const showVectorLayers = ref(true)
const sortBy = ref<'name' | 'created_date'>('created_date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedLayers = ref<any[]>([])

function uniqueLayers(layers: any[]) {
  return layers.filter(
    (layer, idx, self) => idx === self.findIndex(l => l.id === layer.id)
  )
}

const filteredLayers = computed(() => {
  const unique = uniqueLayers(props.layers)
  return unique.filter(layer => {
    const nameMatch = layer.name
      .toLowerCase()
      .includes(filters.name.toLowerCase())
    const typeMatch =
      filters.id_dict_type_data === 0 ||
      layer.id_dict_type_data === filters.id_dict_type_data
    const rasterOk = showRasterLayers.value || layer.type !== 'layer-raster'
    const vectorOk = showVectorLayers.value || layer.type !== 'layer-vector'
    return nameMatch && typeMatch && rasterOk && vectorOk
  })
})

const sortedAndFilteredLayers = computed(() => {
  return [...filteredLayers.value].sort((a, b) => {
    if (sortBy.value === 'name') {
      const coll = new Intl.Collator('ru', { sensitivity: 'base' })
      return sortOrder.value === 'asc'
        ? coll.compare(a.name, b.name)
        : coll.compare(b.name, a.name)
    } else {
      const tA = new Date(a.created_date).getTime()
      const tB = new Date(b.created_date).getTime()
      return sortOrder.value === 'asc' ? tA - tB : tB - tA
    }
  })
})

const dicts = ref(<any[]>([{
  name: 'Группа слоя',
  id: 0
}]))

watch(filters, () => {

}, { deep: true })

onMounted(async () => {
  const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTypesData)
  dicts.value = [
    {
      name: 'Группа слоя',
      id: 0
    },
    ...(responseDict.success ? responseDict.data : [])
  ]
})

function resetDeleteLayer(layer: any) {
  const idx = selectedLayers.value.indexOf(layer)
  if (idx !== -1) {
    selectedLayers.value.splice(idx, 1)
  }
}

async function deleteSelectedLayers() {
  loaderFlag.value = true
  for (const layer of selectedLayers.value) {
    await props.deleteLayer(layer)
  }
  selectedLayers.value = []
  loaderFlag.value = false
}

function setSort(field: 'name' | 'created_date') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

function clearFilter(filterName: 'name' | 'id_dict_type_data') {
  if (filterName === 'name') filters.name = ''
  else filters.id_dict_type_data = 0
}

function datasetReducer(dataset: any) {
  return dataset.id
}
</script>

<style lang="scss" scoped>
.nav_ {
  width: calc(100% - 400px);
  position: fixed;
  opacity: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease,
  opacity 0.3s ease 0s !important;
}

.nav__active {
  opacity: 1;
  transform: translateY(0) !important;
}

.icon-close {
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
}

.angle {
  &__container {
    width: 33%;

    input {
      &::placeholder {
        font-size: 16px;
      }
    }
  }
}

.v-select {
  display: grid;
  width: 100%;
  height: 40px;
}

tr {
  transition: all 0.3s ease;

  &:hover {
    background-color: transparent !important;
  }

  td {
    &:last-child {
      text-align: center !important;
    }

    svg {
      cursor: pointer;
      height: 20px;
      width: 20px;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.not_layers {
  text-align: center;
  font-size: 20px;
}

thead {
  z-index: 11;
}

.numbers {
  position: absolute;
  top: 50%;
  left: 32px;
  transform: translateY(-50%);
}

.add-layer__content__filters {
  position: relative;
}

.layers__content {
  transition: all 0.3s ease;
  flex: 1;
  overflow: auto;
}

.active_add {
  span {
    transform: rotate(180deg) !important;
  }
}

.add-layer {
  &__content {
    &__filters {
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 32px;
      margin-bottom: 32px;
      padding: 0 50px;
      width: 100%;

      input {
        width: 100%;
        height: 40px;
        border-radius: 0;
        background-color: transparent;
        outline: none;
        padding: 0 28px;

        &::placeholder {
          position: absolute;
        }
      }
    }

    &__setLayer {
      width: 30%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__layer {
      width: 100%;
      display: flex;
      align-content: center;

      span {
        margin-right: 16px;
      }
    }
  }
}
</style>
