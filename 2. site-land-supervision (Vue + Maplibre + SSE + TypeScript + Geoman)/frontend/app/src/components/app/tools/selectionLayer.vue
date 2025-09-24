<template>
  <section
    style="z-index: 103"
    class="wrap"
  ></section>
  <div
    :class="{ dragAndDrop__selection: dragAndDropFlag }"
    class="selection"
  >
    <div class="selection__title">
      <p>Выбор слоя</p>
    </div>

    <div class="selection__filter">
      <div class="selection__filter-block">
        <div class="checkbox">
          <input
            type="checkbox"
            id="raster-layers-checkbox"
            v-model="flag_layers"
          />
          <label for="raster-layers-checkbox"></label>
        </div>
        <span>Слои из рабочей области</span>
      </div>
      <button
        v-if="showForestAreaPopup && selectedLayerType === 'original'"
        @click="openAddVector()"
      >
        Создать слой
      </button>
      <button
        v-if="showAiPopup && selectedLayerType === 'original'"
        @click="openAddVector()"
      >
        Создать слой
      </button>
    </div>

    <div class="angle__container">
      <div class="input">
        <input
          v-model="searchValue"
          @update:model-value="searchLayers"
          placeholder="Поиск по названию слоя"
          type="text"
          :disabled="flag_layers"
        />
        <div
          @click="clearSearchValue()"
          v-if="searchValue !== ''"
          class="icon-close"
        ></div>
        <div class="icon-search">
          <span></span>
        </div>
      </div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
    </div>

    <div class="selection__body">
      <table>
        <thead>
        <tr>
          <th>Имя слоя</th>
          <th>
            <div
              v-if="!singleLayer"
              class="checkbox"
            >
              <input
                id="select-all"
                type="checkbox"
                :checked="allLayersSelected"
                @change="toggleAllLayers"
              />
              <label for="select-all"></label>
            </div>
          </th>
          <th>Группа</th>
        </tr>
        </thead>
      </table>
      <section>
        <table class="selection__body">
          <tbody
            class="layers"
            v-for="layer in resultLayers.filter((el: any) => el.visible)"
            :key="layer.id"
          >
          <tr v-if="layer.type === 'layer-vector'">
            <td>
              {{
                layer.name
                  ? layer.name.length > 22
                    ? layer.name.slice(0, 22) + '...'
                    : layer.name
                  : ''
              }}
            </td>
            <td>
              <div class="checkbox">
                <input
                  :id="'select-layer' + layer.id"
                  type="checkbox"
                  :checked="layer.selected"
                  @change="toggleLayer(layer)"
                />
                <label :for="'select-layer' + layer.id"></label>
              </div>
            </td>
            <td>
              {{ getDictTypesNames(layer) ?? '—' }}
            </td>
          </tr>
          </tbody>
        </table>
        <transition name="expand">
          <div
            class="no-layers"
            v-if="searchValue ? !resultLayers.length : !layers.length"
          >
            <div>Слои отсутствуют</div>
          </div>
        </transition>
      </section>
    </div>

    <div class="selection__buttonBlock">
      <button
        @click="save"
        class="orange-button"
      >
        Сохранить
      </button>
    </div>
    <span
      style="transform: none !important; top: 13px; right: 13px"
      @click="close()"
      class="icon-close"
    ></span>
  </div>
</template>

<script lang="ts">
import store from '@/store'
import { IVectorLayer, Layer } from '@/types/layersVector'
import { forestAreaActions } from '@/store/actions/forestArea.ts'
import { aiActions } from '@/store/actions/ai.ts'

interface IDictType {
  id: number
  name: string
  description: string
  is_seeders: boolean
}

interface Params {
  search_name_dataset: string | null
  search_name_layer: string | null
  type_datasets: string | null
}

interface ISelectionLayerData {
  filteredLayers: IVectorLayer[]
  selectedLayers: IVectorLayer[]
  loading: boolean
  error: null | string
  allLayersSelected: boolean
  params: Params
  searchValue: string
  flag_layers: boolean
  resultLayers: IVectorLayer[]
}

export default {
  name: 'selectionLayer',
  props: {
    layers: {
      type: Array as () => IVectorLayer[],
      default: () => []
    },
    selectedLayerType: {
      type: String,
      default: ''
    },
    singleLayer: {
      type: Boolean,
      default: false
    }
  },
  data(): ISelectionLayerData {
    return {
      filteredLayers: [],
      loading: false,
      error: null as string | null,
      selectedLayers: [],
      allLayersSelected: false,
      resultLayers: [],
      searchValue: '',
      params: {
        search_name_dataset: null,
        search_name_layer: null,
        type_datasets: null
      },
      flag_layers: true as boolean
    }
  },
  computed: {
    dicts() {
      return store.getters['layerCreation/dicts']
    },
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    },
    showForestAreaPopup() {
      return store.getters.forestArea
    },
    showAiPopup() {
      return store.getters.ai
    },
    layersMain() {
      return store.getters['layersMain/layers']
    }
  },
  emits: ['update:selectionLayerFlag', 'selectLayers', 'flag-draw'],
  mounted() {
    this.allLayersSelected = !!this.layers.length && this.layers.every((el: any) => el.selected)
    this.selectedLayers = this.layers.filter((el: any) => el.selected)
    this.searchValue = ''

    const activeLayerIds = (store.getters['layersMain/layers'] || [])
      .filter((layer: any) => layer.type !== 'layer-raster' && layer.id && layer.visible)
      .map((layer: any) => layer.id)

    this.resultLayers = this.layers.filter((layer: any) => activeLayerIds.includes(layer.id))
  },
  watch: {
    flag_layers: {
      handler(newValue) {
        if (newValue) {
          this.searchValue = ''
          const activeLayerIds = (store.getters['layersMain/layers'] || [])
            .filter((layer: any) => layer.type !== 'layer-raster' && layer.id && layer.visible)
            .map((layer: any) => layer.id)

          this.resultLayers = this.layers.filter((layer: any) => activeLayerIds.includes(layer.id))
        } else {
          this.resultLayers = this.layers
        }
      }
    },
    layersMain: {
      handler() {
        this.searchValue = ''
        const activeLayerIds = (store.getters['layersMain/layers'] || [])
          .filter((layer: any) => layer.type !== 'layer-raster' && layer.id && layer.visible)
          .map((layer: any) => layer.id)

        this.resultLayers = this.layers.filter((layer: any) => activeLayerIds.includes(layer.id))
      },
      deep: true
    }
  },
  inject: ['API_URL'],
  methods: {
    clearSearchValue() {
      this.searchValue = ''
    },

    getDictTypesNames(layer: Layer) {
      const dictTypes = layer.id_dict_types_data
      if (!dictTypes || dictTypes.length < 1) {
        return ''
      }

      return dictTypes
        .map((dictType) => this.dicts.find((dict: IDictType) => dict.id === dictType)?.name)
        .join(', ')
    },

    openAddVector() {
      if (this.showAiPopup) {
        store.dispatch(`ai/${aiActions.SET_CREATE_FLAG_LAYER}`, true)
      }
      store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, true)
      this.$emit('update:selectionLayerFlag', false)
    },

    searchLayers() {
      this.resultLayers = this.layers.filter((el: any) =>
        el.name.toLowerCase().includes(this.searchValue.toLowerCase())
      )

      this.resultLayers = this.resultLayers.map((el: any) => {
        const current = this.layers.find((item: any) => el.id === item.id)

        return current!
      })
    },
    close() {
      this.$emit('update:selectionLayerFlag', false)
    },
    toggleAllLayers() {
      this.allLayersSelected = !this.allLayersSelected

      this.layers.forEach((layer: any) => {
        layer.selected = this.allLayersSelected
      })

      if (this.allLayersSelected) {
        this.selectedLayers = this.layers.slice(0)
      } else {
        this.selectedLayers = []
      }

      this.updateAllSelectedLayers()
    },
    toggleLayer(layer: IVectorLayer) {
      if (this.singleLayer) {
        if (layer.selected) {
          layer.selected = false

          this.selectedLayers = []
        } else {
          this.resultLayers.forEach((item: any) => {
            item.selected = false
          })
          layer.selected = true

          this.selectedLayers = [layer]
        }
        return
      }

      layer.selected = !layer.selected
      if (!layer.selected)
        this.selectedLayers = this.selectedLayers.filter((el: any) => el.id != layer.id)
      else this.selectedLayers.push(layer)

      this.updateAllSelectedLayers()
    },
    updateAllSelectedLayers() {
      this.allLayersSelected = this.layers.every((el: any) => el.selected)
    },
    draw() {
      this.$emit('flag-draw')
      this.close()
    },
    save() {
      this.$emit(
        'selectLayers',
        this.selectedLayers.map((el: any) => el.id)
      )
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.layers {
  padding-top: 0 !important;

  tr {
    border-bottom: none !important;
  }
}

.no-layers {
  width: 100%;
  padding-left: 30px;
  text-align: left;
  font-weight: 500;
  margin-block-start: 0.7rem;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 50px;
}

.wrap {
  position: absolute;
  z-index: 106;
  right: 0;
  bottom: 0;
  width: calc(100% - 473px - clamp(0px, 5%, 90px));
  height: 100%;
}

.icon-search {
  width: 14px;
  height: 14px;
}

.input {
  width: 100%;
  display: flex;
}

.angle {
  &__container {
    height: 40px;
    display: flex;
    margin: 0 20px 20px 20px;

    .icon-close {
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &:nth-child(2) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(3) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(4) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(5) {
    height: 5px;
    width: 10px;
  }
}

.selection {
  position: absolute;
  z-index: 107;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 540px;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 23px 0 13px 0;

  span {
    font-weight: 500;
  }

  &__title {
    font-size: 20px;
    padding-left: 20px;
    text-align: left;
    margin-bottom: 16px;

    p {
      font-family: $Golos_Text_Medium;
    }
  }

  &__filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px 20px 20px;

    &-block {
      display: flex;
      align-items: center;
    }

    button {
      width: 40%;
      height: 30px;
      border-radius: 0;
      outline: none;
      border: none;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .input {
    input:disabled {
      background-color: rgba(88, 88, 88, 0.3);
    }
  }

  input {
    width: 100%;
    height: 40px;
    background-color: transparent;
    outline: none;
    border-radius: 0;
    padding-left: 28px;

    &::placeholder {
      position: absolute;
    }
  }

  &__body {
    width: 100%;

    section {
      min-height: 350px;
      max-height: 350px;
      width: 100%;
      overflow: auto;
    }

    table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;
    }

    tbody {
      tr {
        padding: 0 20px;
      }
    }

    thead {
      th {
        &:first-child {
          padding-left: 20px;
        }
      }

      width: 100%;
      display: grid;
    }

    &:first-child {
      th {
        margin-top: 0;
      }
    }

    tr {
      display: flex;

      td:first-child {
        padding-left: 29px;
      }

      &:first-child {
        td:first-child {
          padding-left: 0;
        }
      }
    }

    th {
      &:first-child {
        padding-left: 5px;
      }
    }

    td {
      background-color: transparent;
      font-size: 16px;
    }

    & th,
    td {
      align-items: center;
      border: none;
      text-align: left;
      display: flex;
      justify-content: left;
      padding: 8px 0;
      width: 45%;
      font-weight: 400;

      &:nth-child(2) {
        width: 10%;
      }

      p {
        text-align: left;
      }
    }
  }

  &__buttonBlock {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
    margin-top: 10px;
    padding-right: 20px;

    button {
      border-radius: 0;
      border: none;
      width: 180px;
      height: 40px;
    }
  }
}
</style>
