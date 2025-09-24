<template>
  <div
    @click="toggleAddLayer()"
    v-if="addFlag"
    class="wrap"
  ></div>
  <section
    v-if="addFlag"
    class="add-layer"
  >
    <div class="add-layer__content">
      <div class="add-layer__content__header">
        Добавить слой
        <button
          class="create-layer__button"
          @click="addEmptyVector"
        >
          Новый слой
          <div class="icon-add"></div>
        </button>
      </div>
      <div class="add-layer__content__filters">
        <div class="top-filters-container">
          <div class="icon-search"></div>
          <AppInput
            id="title-filter"
            name="title-filter"
            placeholder="Название"
            :value="filters.name"
            @input="(e: any) => (filters.name = String(e.value))"
            :can-clear="filters.name !== ''"
            @clear="clearFilter()"
          />

          <AngleContainer>
            <v-select
              v-model="filters.id_dict_type_data"
              :options="dicts"
              label="name"
              :reduce="datasetReducer"
              placeholder="Группа слоя"
            />
          </AngleContainer>
        </div>

        <div class="checkboxes-container">
          <div class="checkbox-filter">
            <div class="checkbox">
              <input
                type="checkbox"
                id="vector-layers-checkbox"
                v-model="showVectorLayers"
              />
              <label for="vector-layers-checkbox"></label>
            </div>
            <span>Векторные слои</span>
          </div>
          <div class="checkbox-filter">
            <div class="checkbox">
              <input
                type="checkbox"
                id="raster-layers-checkbox"
                v-model="showRasterLayers"
              />
              <label for="raster-layers-checkbox"></label>
            </div>
            <span>Растровые слои</span>
          </div>
        </div>
      </div>

      <div class="add-layer__content__main">
        <table>
          <thead>
          <tr>
            <th>
              <div
                class="filters_add"
                @click="sortName()"
              >
                Наименование
                <span
                  :class="{ active_add: sortName_ }"
                  class="icon-arrow"
                ></span>
              </div>
            </th>
            <th>
              <div
                class="filters_add"
                @click="clickSortGroup()"
              >
                Группа
                <span
                  :class="{ active_add: sortByGroup }"
                  class="icon-arrow"
                ></span>
              </div>
            </th>

            <th>
              <div
                class="filters_add"
                @click="sortData()"
              >
                Дата добавления
                <span
                  :class="{ active_add: sortDate }"
                  class="icon-arrow"
                ></span>
              </div>
            </th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-if="filteredLayers.length > 0"
            v-for="(layer, index) in filteredLayers"
            :key="`layer_${index}`"
            :class="{ active_row: isLayerInOrder(+layer.id, layer.type) }"
          >
            <td>
              <div
                class="layer-label"
                :class="{ active_row: isLayerInOrder(+layer.id, layer.type) }"
              >
                {{ layer.name }}
              </div>
            </td>
            <td>
              <div :class="{ active_row: isLayerInOrder(+layer.id, layer.type) }">
                {{ getDictTypesNames(layer) }}
              </div>
            </td>
            <td>
                <span :class="{ active_row: isLayerInOrder(+layer.id, layer.type) }">
                  {{ formatDate(layer.created_date as any) }}
                </span>
            </td>
            <td>
              <div class="actions-container">
                  <span
                    v-if="!isLayerInOrder(+layer.id, layer.type)"
                    @click="addLayerToCurrent(layer)"
                    class="icon-add"
                  ></span>
                <span
                  v-else
                  class="icon-added"
                  @click="removeLayerFromCurrent(layer)"
                ></span>
                <delete
                  class="delete-icon"
                  v-if="layer.delete"
                  @click="openDeleteConfirmation(layer)"
                ></delete>
                <div
                  style="width: 24px; height: 24px"
                  v-else
                ></div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <span
          class="add-layer__empty"
          v-if="!filteredLayers.length && !flagFetchLayers"
        >Слои не найдены</span
        >

        <div
          v-if="flagFetchLayers"
          class="add-layer__loader"
        >
          <loader style="height: 60px; width: 60px"></loader>
          <span>Загрузка слоев</span>
        </div>
      </div>

      <div
        v-if="isDeleteModalOpen"
        style="backdrop-filter: none"
        class="window"
      >
        <div class="window__delete">
          <p>Вы уверены, что хотите удалить слой "{{ layerToDelete.name }}"?</p>
          <div class="window__delete-block">
            <button @click="confirmDelete()">Удалить</button>
            <button @click="closeDeleteConfirmation()">Отменить</button>
          </div>
        </div>
      </div>

      <div class="add-layer__content__footer">
        <button @click="toggleAddLayer()"><span>Закрыть</span></button>
      </div>
    </div>
  </section>
  <div
    v-if="loaderFlag"
    class="layer-list__loader"
  >
    <span class="loader"></span>
    <span>Удаление слоя</span>
  </div>
  <div
    v-if="loaderFlag"
    class="layer-list__wrap"
  ></div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import { layersApi } from '@/api/layers'
import store from '@/store'
import { defineComponent } from 'vue'
import { layersMainActions } from '@/store/actions/layersMain'
import vSelect from 'vue-select'
import Delete from '@/components/icons/deleteGray.vue'
import Loader from '@/components/app/loader.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AngleContainer from '@/components/ui/AngleContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import Plus from '@/components/icons/plus.vue'
import { Layer } from '@/types/layersVector'
import { toolsStoreActions } from '@/store/actions/tools'
import { loadVectorLayers } from '@/utils/fetchLayers.ts'

interface Data {
  layers: Layer[]
  filters: {
    name: string
    id_dict_type_data: number
    startDate: string | null
    endDate: string | null
  }
  flagFetchLayers: boolean
  isDeleteModalOpen: boolean
  layerToDelete: any | null
  date: string
  currentType: number
  showRasterLayers: boolean
  showVectorLayers: boolean
  sortDate: boolean
  sortName_: boolean
  sortOrder: string
  sortByGroup: boolean
  loaderFlag: boolean
  count_layer: number
}

interface Dataset {
  id: number | string
  name_type: string
}

export default defineComponent({
  name: 'AddLayer',
  components: { AppButton, Loader, Delete, vSelect, AppInput, AngleContainer, Plus },
  data(): Data {
    return {
      layers: [],
      filters: {
        name: '',
        id_dict_type_data: 0,
        startDate: null,
        endDate: null
      },
      flagFetchLayers: false,
      isDeleteModalOpen: false,
      layerToDelete: null,
      date: '',
      currentType: 0,
      showRasterLayers: true,
      showVectorLayers: true,
      sortDate: true,
      sortName_: false,
      sortByGroup: false,
      sortOrder: '',
      loaderFlag: false,
      count_layer: -1
    }
  },

  inject: ['API_URL'],
  watch: {
    filters: {
      handler() {
        this.loadLayers()
      },
      deep: true
    },

    addFlag(newValue: any) {
      if (newValue) {
        this.flagFetchLayers = false
        this.loadLayers()
      }
    },
    async newLayerFromTool(newValue: number[]) {
      console.log('[SSE] сработал обработчик, пришли слои, которые нужно добавить в левую панель ', newValue)
      if (newValue.length === 0) {
        return
      }
      setTimeout(async () => {
        const res = await loadVectorLayers({})
        console.log('[SSE] загрузка слоев', res)
        console.log('[SSE] все слои, по которым будем искать слой', this.layers)

        console.log('[SSE] слои загружены, поиск слоя с подходящим id')
        for (const value of newValue) {
          for (const layer of res) {
            if (Number(layer.id) === Number(value)) {
              layer.visible = true
              console.log('[SSE] слой найден, добавляем его', layer)
              await store.dispatch(`layersMain/${layersMainActions.addLayerMain}`, layer)
              await store.dispatch(`layersMain/${layersMainActions.setNewLayerFromTool}`, [])
              break
            }
          }
        }
      }, 1000)
    }
  },
  props: {
    addFlag: Boolean
  },
  emits: ['addLayerToCurrent', 'toggleAddLayer'],
  async created() {
    try {
      await store.dispatch('layerCreation/FETCH_DICT_TYPE_DATA')
    } catch (err: any) {
      console.error(err.message)
    }
  },
  computed: {
    // dicts: () => store.getters['layerCreation/dicts'],
    ...mapGetters('currentDatasets', [
      'getCurrentLayers',
      'getSelectedLayerId',
      'getSelectedLayerType',
      'getSelectedDatasetId'
    ]),
    layerOrderMain() {
      return store.state.layersMain?.layerOrderMain || []
    },
    dicts() {
      return [
        {
          name: 'Группа слоя',
          id: 0
        }
        // ...store.getters['layerCreation/dicts'].map((el: IDictType) => ({
        //   name: el.name,
        //   id: el.id
        // }))
      ]
    },
    filteredLayers() {
      return this.layers.filter((layer: any) => {
        if (layer.type === 'layer-raster' && !this.showRasterLayers) {
          return false
        }
        if (layer.type === 'layer-vector' && !this.showVectorLayers) {
          return false
        }
        return true
      })
    },
    newLayerFromTool() {
      return store.getters['layersMain/newLayerFromTool']
    }
  },
  methods: {
    ...mapActions('currentDatasets', ['addCurrentLayer']),

    async deleteLayer(layer: Layer) {
      try {
        let responce
        if (layer.type === 'layer-raster') {
          responce = await layersApi.deleteRasterLayer(+layer.id)
        } else {
          responce = await layersApi.deleteVectorLayer(layer.id)
        }

        if (responce.status === 200 || responce.status === 204) {
          await store.dispatch(`layersMain/${layersMainActions.deleteLayerMain}`, layer)
          window.$notify(
            `Слой "${layer.name.length > 22 ? layer.name.slice(0, 22) + '...' : layer.name}" удален`,
            true
          )
        } else {
          window.$notify(
            `Ошибка при удалении слоя "${layer.name.length > 22 ? layer.name.slice(0, 22) + '...' : layer.name}"`,
            true
          )
        }

        this.layers = this.layers.filter((l: any) => l.id !== layer.id)
      } catch (error) {
        console.error('Ошибка при удалении слоя:', error)
      }
    },

    openDeleteConfirmation(layer: Layer) {
      this.layerToDelete = layer
      this.isDeleteModalOpen = true
    },

    getDictTypesNames(layer: Layer) {
      const dictTypes = layer.id_dict_types_data
      if (!dictTypes || dictTypes.length < 1) {
        return ''
      }

      return dictTypes
        .map((dictType) => this.dicts.find((dict: any) => dict.id === dictType)?.name)
        .join(', ')
    },

    addEmptyVector() {
      const emptyVector = {
        id: this.count_layer,
        name: `Пустой слой ${this.count_layer * -1}`,
        id_crs: 3,
        visible: true,
        is_edit: false,
        type: 'layer-vector',
        update: true,
        delete: true,
        add: true
      }
      store.dispatch(`layersMain/${layersMainActions.addLayerMain}`, emptyVector)
      this.count_layer -= 1
      store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, emptyVector)
      this.$emit('toggleAddLayer')
    },

    openAddVector() {
      store.commit(toolsStoreActions.showAddVector, true)
      store.commit(toolsStoreActions.showAi, false)
      store.commit(toolsStoreActions.showSubstractionVectors, false)
      store.commit(toolsStoreActions.showForestArea, false)
      store.commit(toolsStoreActions.showArtificialAi, false)
      store.commit(toolsStoreActions.showMergingVector, false)
      store.commit(toolsStoreActions.showFilterVector, false)
      store.commit(toolsStoreActions.setDragAndDrop, false)

      this.$emit('toggleAddLayer')
    },

    // Закрыть модальное окно
    closeDeleteConfirmation() {
      this.layerToDelete = null
      this.isDeleteModalOpen = false
    },
    // Подтверждение удаления слоя
    async confirmDelete() {
      if (this.layerToDelete) {
        try {
          // Логика удаления слоя
          console.log(`Удаление слоя: ${this.layerToDelete.name}`)
          this.loaderFlag = true
          await this.deleteLayer(this.layerToDelete)
          this.loaderFlag = false
          this.isDeleteModalOpen = false
        } catch (error) {
          console.error('Ошибка при удалении слоя:', error)
        }
      }
    },

    isLayerInOrder(layerId: number, layerType: string) {
      // Проверяем, есть ли объект с таким id в массиве layerOrderMain
      return this.layerOrderMain.some((order: any) => order.id === layerId && order.type === layerType)
    },

    clearFilter() {
      this.filters.name = ''
    },

    clickSortGroup() {
      this.sortName_ = false
      this.sortDate = false
      this.sortByGroup = !this.sortByGroup

      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'

      this.layers.sort((a: any, b: any) => {
        const nameA = this.getDictTypesNames(a)
        const nameB = this.getDictTypesNames(b)

        const collator = new Intl.Collator('ru', { sensitivity: 'base' })
        const result = collator.compare(nameA || '', nameB || '')

        return this.sortOrder === 'asc' ? result : -result
      })
    },

    sortName() {
      this.sortByGroup = false
      if (this.sortDate || (!this.sortDate && !this.sortName_)) {
        this.sortOrder = 'desc'
        this.sortName_ = !this.sortName_
      } else {
        if (this.sortName_) {
          // Меняем порядок сортировки, если текущий фильтр уже активен
          this.sortName_ = !this.sortName_
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
        } else {
          // Устанавливаем сортировку по имени
          this.sortName_ = !this.sortName_
          this.sortOrder = 'asc' // Начинаем с возрастания
        }
      }

      this.sortDate = false

      // Сортировка по имени
      this.layers.sort((a: any, b: any) => {
        const collator = new Intl.Collator('ru', { sensitivity: 'base' })
        const isRussianA = /^[А-Яа-я]/.test(a.name)
        const isRussianB = /^[А-Яа-я]/.test(b.name)

        if (isRussianA && !isRussianB) return this.sortOrder === 'asc' ? -1 : 1 // Русский идет первым
        if (!isRussianA && isRussianB) return this.sortOrder === 'asc' ? 1 : -1 // Английский идет вторым

        // Сравнение в пределах одного языка
        const result = collator.compare(a.name, b.name)
        return this.sortOrder === 'asc' ? result : -result
      })
    },

    // Сортировка по дате
    sortData() {
      this.sortName_ = false
      this.sortByGroup = false

      if (this.sortDate) {
        this.sortDate = !this.sortDate
        // Меняем порядок сортировки, если текущий фильтр уже активен
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDate = !this.sortDate
        this.sortOrder = 'desc' // Начинаем с убывания
      }

      // Сортировка по дате
      this.layers.sort((a: any, b: any) => {
        const result = +new Date(a.created_date as any) - +new Date(b.created_date as any)
        return this.sortOrder === 'asc' ? result : -result // Меняем направление
      })
    },

    datasetReducer(dataset: Dataset) {
      return dataset.id
    },
    async loadVectorLayers(filters: { name?: string; id_dict_type_data?: number[] }) {
      const data = await layersApi.getVectorLayers(filters)

      return data.map((layer) => ({
        id: layer.id,
        id_dict_types_data: layer.id_dict_types_data,
        name: layer.name,
        description: layer.description,
        name_file: layer.name_file,
        bbox_geojson: layer.bbox_geojson,
        created_date: layer.created_date,
        visible: true,
        expanded: true,
        update: layer.update,
        add: layer.add,
        is_edit: false,
        delete: layer.delete,
        type: 'layer-vector'
      }))
    },
    async loadRasterLayers(filters: { name?: string; id_dict_type_data?: number[] }) {
      const data = await layersApi.getRasterLayers(filters)

      return data.map((layer) => ({
        id: layer.id,
        id_user: layer.id_user,
        id_dict_types_data: layer.id_dict_types_data,
        name: layer.name,
        description: layer.description,
        name_dir: layer.name_dir,
        created_date: layer.created_date,
        bbox_geojson: layer.bbox_geojson,
        visible: true,
        expanded: true,
        update: layer.update,
        add: layer.add,
        delete: layer.delete,
        type: 'layer-raster'
      }))
    },
    async loadLayers() {
      try {
        this.sortDate = true
        this.sortName_ = false
        let filters = {
          name: this.filters.name,
          id_dict_type_data: []
        } as { name: string; id_dict_type_data: number[] }
        if (this.filters.id_dict_type_data > 0 && this.filters) {
          filters = {
            name: this.filters.name || '',
            id_dict_type_data: [this.filters.id_dict_type_data]
          }
        }
        this.flagFetchLayers = true
        const [vectorLayers = [], rasterLayers = []] = await Promise.all([
          this.loadVectorLayers(filters),
          this.loadRasterLayers(filters)
        ])
        this.flagFetchLayers = false

        this.layers = [...(vectorLayers as any), ...(rasterLayers as any)]

        // Сортируем по полю `created_date`
        this.layers.sort((a: any, b: any) => {
          const dateA = a.created_date ? new Date(a.created_date) : null
          const dateB = b.created_date ? new Date(b.created_date) : null

          // Случай, если одна из дат пустая
          if (!dateA && !dateB) return 0 // Оба пустые — равны
          if (!dateA) return 1 // Пустая дата идет после
          if (!dateB) return -1 // Пустая дата идет после

          // Сравниваем даты
          return +dateB - +dateA // Для сортировки в порядке убывания (сначала новые)
        })
        return true
      } catch (error) {
        console.error('Ошибка объединения слоев:', error)
        return false
      }
    },
    formatDate(dateString: string) {
      const date = new Date(dateString)

      // Форматируем дату
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()

      // Форматируем время
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${day}.${month}.${year} ${hours}:${minutes}`
    },
    addLayerToCurrent(layer: Layer) {
      store.dispatch(`layersMain/${layersMainActions.addLayerMain}`, layer)
    },
    removeLayerFromCurrent(layer: Layer) {
      store.dispatch(`layersMain/${layersMainActions.deleteLayerMain}`, layer).catch((err) => {
        console.error(`Ошибка при удалении слоя ${layer.type}-${layer.id}:`, err)
      })
    },
    toggleAddLayer() {
      this.$emit('toggleAddLayer')
    }
  }
} as any)
</script>

<style scoped lang="scss">
.add-layer {
  max-width: 760px;
  min-height: 600px;
  max-height: 800px;
  height: 100%;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 105;

  display: flex;
  flex-direction: column;
  width: 100%;

  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;

    span {
      font-family: $Golos_Text_Regular;
    }
  }

  &__empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__content {
    padding: 20px 0;

    display: flex;
    flex-direction: column;

    border: 1px solid rgb(104, 104, 104);

    &__header {
      padding: 0 30px;
      display: flex;
      gap: 30px;
      justify-content: space-between;
      align-items: center;

      font-weight: 500;
      font-family: $Golos_Text_Medium;
      font-size: 24px;
      line-height: 100%;
      letter-spacing: 0%;

      .create-layer__button {
        padding: 12px 30px;
        display: flex;
        gap: 15px;
        align-items: center;
        outline: none;
        border: none;
        font-family: $Golos_Text_Medium;
        font-weight: 500;
        font-size: 16px;

        &:hover {
          box-shadow: 0 0 3px #9a99997e;
        }

        svg {
          fill: #4d4d4d;
          stroke: #4d4d4d;
        }
      }
    }

    &__filters {
      padding: 0 30px;

      display: flex;
      flex-direction: column;
      margin-top: 40px;
      margin-bottom: 30px;
      gap: 30px;

      .top-filters-container {
        display: flex;
        justify-content: space-between;
        gap: 20px;

        .input-container {
          width: 100%;
        }

        .angle__container {
          width: 100%;
        }
      }

      input {
        width: 100%;
        height: 40px;
        border: 1px solid rgb(167, 167, 167);
        border-radius: 0;
        background-color: transparent;
        outline: none;
        padding: 0 16px;
      }

      .checkboxes-container {
        display: flex;
        gap: 30px;
      }

      .checkbox-filter {
        display: flex;
        align-items: center;
        // gap: 10px;
        // должен быть 10, но у checkbox mr:16
      }
    }

    &__main {
      max-height: 400px;
      min-height: 300px;
      overflow: auto;

      table {
        position: relative;
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;

        thead {
          position: sticky;
          top: 0;
          z-index: 2;
        }

        img {
          height: 27px;
          width: 27px;
        }

        th {
          background: rgba(255, 255, 255, 0.07);
          font-family: $Golos_Text_Medium;
          font-weight: 500;
        }

        th,
        td {
          padding: 10px 30px;
          text-align: left;

          &:last-child {
            padding: 0;
            width: 120px;
          }
        }

        .actions-container {
          width: 100%;
          display: flex;
          justify-content: space-evenly;
          align-items: center;
        }
      }
    }

    &__footer {
      padding: 16px 30px 0px 30px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      border-top: 1px solid #e8e8e8;

      button {
        width: 170px;
        height: 48px;
        border: none;
        outline: none;
        border-radius: 0;

        &:hover {
          box-shadow: 0 0 3px #9a99997e;
        }

        span {
          font-family: $Golos_Text_Medium;
          font-weight: 500;
          font-size: 18px;
          line-height: 100%;
          letter-spacing: 0%;

          color: #4d4d4d;
        }
      }
    }
  }
}

.layer-label {
  width: 150px;

  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;

  &:hover {
    text-wrap: wrap;
  }
}

.layer-list {
  &__loader {
    z-index: 111;
    position: fixed;
    bottom: 64px;
    left: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__wrap {
    position: fixed;
    width: 100%;
    inset: 0;
    height: 100%;
    z-index: 111;
  }
}

.filters_add {
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  .active_add {
    transform: rotate(180deg);
  }

  .icon-arrow {
    margin-left: 5px;
    height: 20px;
    width: 16px;
    position: relative;

    &::after {
      position: absolute;
      content: '';
      right: 0;
      top: 50%;
      transform: rotate(-45deg);
      height: 2px;
      border-radius: 1px;
      width: 10px;
    }

    &::before {
      position: absolute;
      content: '';
      left: 0;
      top: 50%;
      transform: rotate(45deg);
      height: 2px;
      border-radius: 1px;
      width: 10px;
    }
  }
}

.v-select {
  display: grid;
  width: 100%;
  height: 100%;
}

.icon-close {
  right: 7px;
  top: 27.5px !important;
  transform: translateY(-50%);
}

@keyframes expand {
  0% {
    clip-path: inset(100% 0 0 0);
    transform: translateY(-100%);
    opacity: 0;
  }

  100% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes collapse {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }

  100% {
    clip-path: inset(100% 0 0 0);
    transform: translateY(-100%);
    opacity: 0;
  }
}

.wrap {
  backdrop-filter: blur(4px);
  cursor: pointer;
  position: absolute;
  z-index: 104;
  inset: 0;
  width: 100% !important;
  height: 100%;
}

.icon-add {
  height: 20px;
  width: 20px;

  &:hover {
    opacity: 0.8;
  }

  &:after {
    height: 2px;
    width: 14px;
  }

  &:before {
    height: 2px;
    width: 14px;
  }
}

.icon-added {
  position: relative;
  background-color: transparent;

  opacity: 0.5;
  width: 20px;
  height: 20px;
  cursor: pointer;

  &::after {
    left: 2px;
    position: absolute;
    content: '';
    width: 16px;
    height: 1px;
    top: 50%;
    border-radius: 2px;
  }

  &:hover {
    opacity: 1;
  }
}

.delete-icon {
  width: 24px;
  height: 24px;

  padding: 2px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
