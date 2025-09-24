<template>
  <div
    class="wrap"
    :class="{ dragAndDrop__wrap: dragAndDropFlag }"
  >
    <section
      :class="{ dragAndDrop__subtraction: dragAndDropFlag }"
      class="subtraction"
    >
      <div class="subtraction__title">Вычитание векторов</div>
      <modal style="display: none" @click="openModal()"></modal>
      <div class="subtraction__currentDataset">
        <span>Название результирующего слоя:</span>
        <div class="angle__container">
          <input
            v-model="newLayer.name"
            type="text"
          />
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
        </div>
      </div>

      <div class="subtraction__currentDataset">
        <span>Группа результирующего слоя:</span>
        <div class="angle__container">
          <v-select
            v-model="newLayer.id_dict_type_data"
            :options="dicts"
            label="name"
            :reduce="datasetReducer"
          />
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
        </div>
      </div>

      <!-- <div class="subtraction__currentDataset bbox">
        <span>Выберите границы слоя:</span>
          <AppButton class="bbox__btn" @click="defineBbox">
            Выбрать
          </AppButton>
      </div> -->

      <div class="subtraction__currentDataset">
        <span>Описание:</span>
        <div class="angle__container">
          <input
            v-model="newLayer.description"
            type="text"
          />
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
        </div>
      </div>

      <div class="subtraction__currentLayers">
        <div>
          <span>Исходный слой:</span>
          <p class="vectors-titles">
            {{
              selectedOriginalLayerTitles.length > 0 ? selectedOriginalLayerTitles.join(', ') : '-'
            }}
          </p>
          <edit @click="toogleSelectionLayer('original')"></edit>
        </div>
        <div>
          <span>Слой наложения:</span>
          <p>
            {{
              selectedOverlayLayerTitles.length > 0 ? selectedOverlayLayerTitles.join(', ') : '-'
            }}
          </p>
          <edit @click="toogleSelectionLayer('overlay')"></edit>
        </div>
      </div>

      <div class="subtraction__buttonBlock">
        <button
          @click="save"
          class="subtraction__buttonBlock--accept orange-button"
        >
          Сохранить
        </button>
        <button
          @click="close"
          class="subtraction__buttonBlock--cancel"
        >
          Отменить
        </button>
      </div>
    </section>
    <selectionLayer
      v-if="selectionLayerFlag"
      :layers="layers"
      @select-layers="updateLayers"
      @update:selectionLayerFlag="selectionLayerFlag = $event"
    ></selectionLayer>
  </div>
</template>

<script lang="ts">
import vSelect from 'vue-select'
import selectionLayer from './selectionLayer.vue'

import 'vue-select/dist/vue-select.css'

import store from '@/store'

import { layersVectorActions } from '@/store/actions/layersVector'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { layerToMapLayers } from '@/utils/layers'

import type { IVectorApiLayer, IVectorLayer } from '@/types/layersVector'
import type { IDictType } from '@/types/dicts'
import { substractionLayerActions } from '@/store/actions/substractionLayer'
import AppButton from '@/components/ui/AppButton.vue'
import Edit from '@/components/icons/edit.vue'
import Modal from '@/components/icons/modal.vue'
import { toolsStoreActions } from '@/store/actions/tools.ts'

interface Dataset {
  id: number | string
  name_type: string
}

export default {
  name: 'subtractionVector',
  components: {
    Modal,
    Edit,
    vSelect,
    selectionLayer,
    AppButton
  },
  data() {
    return {
      edit: new URL('@/assets/images/edit.svg', import.meta.url).href,
      originalLayers: [] as number[],
      overlayLayers: [] as number[],
      selectionLayerFlag: false,
      selectedLayerType: null as 'original' | 'overlay' | null,
      collapsed: false,
      bbox: [],
      selectedOriginalLayerTitles: [] as string[],
      selectedOverlayLayerTitles: [] as string[]
    }
  },
  watch: {
    subtractionVectorFlag: {
      handler(newValue: any) {
        if (newValue) {
          this.fetchData()
        }
      },
      immediate: true
    }
  },
  computed: {
    showSubstrationPopup() {
      return store.getters.substraction
    },
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    },
    layers() {
      let layers = store.getters['layersVector/forSubstractionLayers'].map(
        (layer: IVectorApiLayer) => layerToMapLayers(layer)
      )

      if (!this.selectedLayerType) return layers

      if (this.selectedLayerType === 'original') {
        layers.forEach((el: IVectorLayer) => (el.selected = this.originalLayers.includes(el.id)))
      } else {
        layers.forEach((el: IVectorLayer) => (el.selected = this.overlayLayers.includes(el.id)))
      }

      return layers
    },
    dicts() {
      return [
        {
          name: 'Выберите группу',
          id: 0
        },
        ...store.getters['layerCreation/dicts'].map((el: IDictType) => ({
          name: el.name,
          id: el.id
        }))
      ]
    },
    newLayer() {
      return store.getters.newLayer
    }
  },
  async mounted() {
    window.addEventListener('keydown', this.handleKeydown)

    try {
      await Promise.all([
        store.dispatch(`layersVector/${layersVectorActions.fecthVectorLayers}`),
        store.dispatch(`layerCreation/${layerCreationActions.fetchDictTypeData}`)
      ])
    } catch (e) {
      throw new Error((e as Error).message)
    }
  },
  inject: ['API_URL'],
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(event: any) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    openModal() {
      store.commit(toolsStoreActions.setDragAndDrop, true)
    },
    datasetReducer(dataset: Dataset) {
      return dataset.id
    },
    async fetchData() {
      try {
        await Promise.all([
          store.dispatch(`layersVector/${layersVectorActions.fecthVectorLayers}`),
          store.dispatch(`layerCreation/${layerCreationActions.fetchDictTypeData}`)
        ])
      } catch (e) {
        console.error('Ошибка при загрузке данных:', e)
        throw new Error((e as Error).message)
      }
    },
    async save() {
      store.commit(substractionLayerActions.UPDATE_LAYERS_1, this.originalLayers)
      store.commit(substractionLayerActions.UPDATE_LAYERS_2, this.overlayLayers)

      try {
        store.dispatch(substractionLayerActions.CREATE_SUBSTRACTION_LAYER)
        this.close()
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error)
      }
    },
    close() {
      store.commit(substractionLayerActions.CLEAR_NEW_LAYER_DATA)
      store.commit(toolsStoreActions.showSubstractionVectors, false)
    },
    toogleSelectionLayer(type: 'original' | 'overlay') {
      this.selectedLayerType = type
      this.selectionLayerFlag = !this.selectionLayerFlag
    },
    updateLayers(selectedLayers: number[]) {
      const filteredLayers = this.layers.filter((layer: any) => selectedLayers.includes(layer.id))

      if (this.selectedLayerType === 'original') {
        this.originalLayers = selectedLayers

        const filteredLayers = this.layers.filter((layer: any) => selectedLayers.includes(layer.id))
        this.selectedOriginalLayerTitles = filteredLayers.map((layer: any) => layer.name)
      } else if (this.selectedLayerType === 'overlay') {
        this.overlayLayers = selectedLayers
        this.selectedOverlayLayerTitles = filteredLayers.map((layer: any) => layer.name)
      }

      this.selectionLayerFlag = false
    }
    // defineBbox() {
    //   if (!this.map || !this.draw) return

    //   this.collapsed = true
    //   this.map._canvas.style.cursor = 'crosshair'
    //   this.draw.changeMode('draw_polygon')

    //   this.map.on('draw.create', this.drawBBox)
    // },
    // drawBBox(e) {
    //   this.bbox = e.features[0].geometry.coordinates
    //   this.collapsed = false
    // }
  }
}
</script>

<style lang="scss">
.vs__clear {
  display: none;
}

:root,
:host {
  --vs-colors--lightest: #a7a7a7ff;
  --vs-colors--light: #a7a7a7ff;
  --vs-colors--dark: #fff;
  --vs-colors--darkest: rgba(0, 0, 0, 0.15);

  /* Search Input */
  --vs-search-input-color: inherit;
  --vs-search-input-bg: rgb(255, 255, 255);
  --vs-search-input-placeholder-color: inherit;

  /* Font */
  --vs-font-size: 16px;
  --vs-line-height: 1.4;

  /* Disabled State */
  --vs-state-disabled-bg: rgb(248, 248, 248);
  --vs-state-disabled-color: var(--vs-colors--light);
  --vs-state-disabled-controls-color: var(--vs-colors--light);
  --vs-state-disabled-cursor: not-allowed;

  /* Borders */
  --vs-border-color: var(--vs-colors--lightest);
  --vs-border-width: 1px;
  --vs-border-style: solid;
  --vs-border-radius: 0;

  /* Actions: house the component controls */
  --vs-actions-padding: 4px 6px 0 3px;

  /* Component Controls: Clear, Open Indicator */
  --vs-controls-color: var(--vs-colors--light);
  --vs-controls-size: 1;
  --vs-controls--deselect-text-shadow: 0 1px 0 #fff;

  /* Selected */
  --vs-selected-bg: #f0f0f0;
  --vs-selected-color: var(--vs-colors--dark);
  --vs-selected-border-color: var(--vs-border-color);
  --vs-selected-border-style: var(--vs-border-style);
  --vs-selected-border-width: var(--vs-border-width);

  /* Dropdown */
  --vs-dropdown-bg: #a7a7a7ff;
  --vs-dropdown-color: inherit;
  --vs-dropdown-z-index: 1000;
  --vs-dropdown-min-width: 160px;
  --vs-dropdown-max-height: 350px;
  --vs-dropdown-box-shadow: 0px 3px 6px 0px var(--vs-colors--darkest);

  /* Option */
  --vs-dropdown-option-bg: #000;
  --vs-dropdown-option-color: var(--vs-dropdown-color);
  --vs-dropdown-option-padding: 3px 20px;

  --vs-dropdown-option--active-bg: #5897fb;
  --vs-dropdown-option--active-color: #fff;

  --vs-dropdown-option--deselect-bg: #fb5858;
  --vs-dropdown-option--deselect-color: #fff;

  --vs-transition-timing-function: cubic-bezier(1, -0.115, 0.975, 0.855);
  --vs-transition-duration: 150ms;
}
</style>

<style scoped lang="scss">
.modal-svg {
  width: 25px;
  height: 25px;
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.wrap {
  position: absolute;
  z-index: 101;
  bottom: 0;
  right: 0;
  width: calc(100% - 473px - clamp(0px, 5%, 90px));
  height: 100%;
  backdrop-filter: blur(5px);

  &.collapsed {
    display: none;
  }

  &.opened {
    display: block;
  }
}

.icon-close {
  z-index: 103;
  right: 13px;
  top: 13px;
}

.angle {
  &:nth-child(2) {
    height: 5px;
    width: 5px;
  }

  &:nth-child(3) {
    height: 5px;
    width: 5px;
  }

  &:nth-child(4) {
    height: 5px;
    width: 5px;
  }

  &:nth-child(5) {
    height: 5px;
    width: 5px;
  }
}

.subtraction {
  display: flex;
  position: absolute;
  z-index: 103;
  top: 50%;
  left: 50%;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  padding: 23px 13px 13px;
  transform: translate(-50%, -50%);

  span {
    font-weight: 500;
  }

  &__title {
    font-size: 20px;
    margin-bottom: 20px;
    text-align: left;
    font-family: $Golos_Text_Medium;
  }

  &__current {
    &Layers {
      div {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 20px;

        span {
          width: 45%;
        }

        p {
          text-align: center;
          width: 45%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      svg {
        min-width: 24px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    &Dataset {
      margin: 10px 0;

      &:nth-child(2) {
        margin-block-start: 0;
      }

      span {
        display: block;
        margin-bottom: 10px;
      }

      &.bbox {
        display: grid;
        grid-auto-flow: column;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  input {
    height: 34px;
  }

  textarea,
  input {
    width: 100%;
    padding: 5px 10px;
    border-radius: 0;
    outline: none;
    background-color: transparent;
    resize: none;
  }

  &__newDataset {
    span {
      display: block;
      margin-bottom: 10px;
      margin-top: 10px;
    }
  }

  &__buttonBlock {
    margin-top: 16px;
    display: grid;
    bottom: 0;
    grid-auto-flow: column;
    grid-gap: 0 15px;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-inline: 30px;

    button {
      border-radius: 0;
      border: none;
      width: 180px;
      height: 50px;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 700;
      line-height: 100%;
      text-align: center;

      &--accept {
        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}

.bbox {
  &__btn {
    width: max-content;
    height: max-content;
    padding: 8px 15px;
    background-color: white;
    color: black;
    font-size: 0.8rem;
    letter-spacing: 0.1rem;
  }
}
</style>
