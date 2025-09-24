<template>
  <div
    :class="{ dragAndDrop__wrap: dragAndDropFlag, wrap: !dragAndDropFlag }"
    :style="{ zIndex: flagCreateLayer ? -1 : 103 }"
  >
    <section
      :class="{ dragAndDrop__container: dragAndDropFlag }"
      class="forestArea"
    >
      <h2 class="forestArea__title">Площадь леса в области</h2>

      <modal style="display: none" @click="openModal()"></modal>

      <div class="forestArea__content">
        <!-- Блок выбора оригинальных слоёв -->
        <div class="forestArea__block">
          <span>Создать или выбрать векторный слой:</span>
          <p v-if="!toolGeom">
            {{
              selectedOriginalLayerTitles.length > 0 ? selectedOriginalLayerTitles.join(', ') : '-'
            }}
          </p>
          <p v-else>
            Новая геометрия
          </p>
          <button
            :style="{transform: toolGeom ? 'rotate(45deg)' : 'none'}"
            class="icon-add"
            style="background-color: transparent !important"
            @click="!toolGeom ? toggleSelectionLayer('original') : clearToolGeom()"
            :disabled="currentID > 0"
          ></button>
        </div>

        <!-- Блок выбора наложенных слоёв -->
        <div class="forestArea__block">
          <span>Размеченный лес:</span>
          <p>
            {{
              selectedOverlayLayerTitles.length > 0 ? selectedOverlayLayerTitles.join(', ') : '-'
            }}
          </p>
          <button
            class="icon-add"
            style="background-color: transparent !important"
            @click="toggleSelectionLayer('overlay')"
          ></button>
        </div>

        <!-- Кнопки управления -->
        <div class="forestArea__buttons">
          <button
            class="forestArea__button forestArea__button--accept defaultButtonTwo"
            @click="addNewLayer"
          >
            Произвести расчет
          </button>
          <button
            @click="close"
            class="forestArea__button forestArea__button--cancel defaultButton"
          >
            Отменить
          </button>
        </div>
      </div>
    </section>
    <!-- Окно выбора слоёв -->
    <selectionLayer
      v-if="selectionLayerFlag"
      :layers="layers"
      :selectedLayerType="selectedLayerType"
      @select-layers="updateLayers"
      @update:selectionLayerFlag="selectionLayerFlag = $event"
      :single-layer="true"
    />
  </div>
</template>

<script>
import store from '@/store'
import { forestAreaActions } from '@/store/actions/forestArea'
import { layersVectorActions } from '@/store/actions/layersVector'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { layerToMapLayers } from '@/utils/layers'

import selectionLayer from './selectionLayer.vue'
import Edit from '@/components/icons/edit.vue'
import { configActions } from '@/store/actions/config'
import Modal from '@/components/icons/modal.vue'
import { toolsStoreActions } from '@/store/actions/tools'

export default {
  name: 'forestArea',
  components: {
    Modal,
    Edit,
    selectionLayer
  },
  data() {
    return {
      edit: new URL('@/assets/images/edit.svg', import.meta.url).href, // Иконка редактирования
      selectionLayerFlag: false, // Флаг отображения окна выбора слоёв
      selectedLayerType: null, // Тип слоя для выбора ('original' или 'overlay')
      selectedOriginalLayerTitles: [],
      selectedOverlayLayerTitles: []
    }
  },
  computed: {
    openModal() {
      store.commit(toolsStoreActions.setDragAndDrop, true)
    },
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    },
    currentID() {
      return store.state.forestArea.currentID
    },
    flagCreateLayer() {
      return store.state.forestArea.flagCreateLayer
    },
    // Получение данных из Vuex напрямую через store.state
    originalLayers() {
      return store.state.forestArea.originalLayers
    },
    overlayLayers() {
      return store.state.forestArea.overlayLayers
    },
    // Получение списка слоёв для компонента selectionLayer
    layers() {
      let layers = store.getters['layersVector/forSubstractionLayers'].map((layer) => {
        return layerToMapLayers(layer)
      })

      if (!this.selectedLayerType) return layers

      if (this.selectedLayerType === 'original') {
        layers.forEach((l) => {
          l.selected = this.originalLayers.includes(l.id)
        })
      } else if (this.selectedLayerType === 'overlay') {
        layers.forEach((l) => {
          l.selected = this.overlayLayers.includes(l.id)
        })
      }
      return layers
    },
    toolGeom: () => store.getters.toolGeom
  },
  watch: {
    toolGeom: {
      handler(newValue) {
        if (newValue && this.flagCreateLayer) {
          console.log('NEW GEOM')
          store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
          store.commit(toolsStoreActions.showForestArea, true)
        }
      },
      deep: true
    },
    flagCreateLayer: {
      handler(newValue) {
        if (!newValue) {
          this.selectionLayerFlag = false
        }
      },
      immediate: true,
      deep: true
    },
    currentID: {
      handler(newVal) {
        if (newVal <= 0) {
          return
        }
        this.originalLayers.push(newVal)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // Загрузка слоёв и словарей при монтировании компонента
    store.dispatch(`layersVector/${layersVectorActions.fecthVectorLayers}`)
    store.dispatch(`layerCreation/${layerCreationActions.fetchDictTypeData}`)

    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    clearToolGeom() {
      store.commit(toolsStoreActions.setToolGeom, null)
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    // Открытие окна выбора слоёв
    toggleSelectionLayer(type) {
      this.selectedLayerType = type
      this.selectionLayerFlag = !this.selectionLayerFlag
    },
    // Обновление выбранных слоёв после выбора в модальном окне
    updateLayers(selectedLayers) {
      // console.log("sleectes layers - ", selectedLayers);
      const filteredLayers = this.layers.filter((layer) => selectedLayers.includes(layer.id))

      if (this.selectedLayerType === 'original') {
        this.selectedOriginalLayerTitles = filteredLayers.map((layer) => layer.name)

        store.dispatch(`forestArea/${forestAreaActions.SET_ORIGINAL_LAYERS}`, selectedLayers)
      } else if (this.selectedLayerType === 'overlay') {
        this.selectedOverlayLayerTitles = filteredLayers.map((layer) => layer.name)

        store.dispatch(`forestArea/${forestAreaActions.SET_OVERLAY_LAYERS}`, selectedLayers)
      }
      this.selectionLayerFlag = false
    },
    // Обработчик кнопки "Добавить новый слой"
    async addNewLayer() {
      // this.overlayLayers[0] = this.originalLayers[0]
      await store.dispatch(
        `forestArea/${forestAreaActions.SET_ORIGINAL_LAYERS}`,
        this.originalLayers
      )
      if (this.overlayLayers.length === 0) {
        window.$notify('Выберите хотя бы один слой', true)
        return
      }

      try {
        const response = await store.dispatch(`forestArea/${forestAreaActions.ADD_NEW_LAYER}`)

        if (response.success) {
          await store.dispatch(configActions.setFinalPriceForest, response.data)
        } else {
          console.log(response)
          window.$notify(response.data, true)
          return

        }
        this.originalLayers = []
        this.overlayLayers = []
        this.$emit('update:addForestAreaFlag', false)

        store.commit(toolsStoreActions.showForestArea, false)
      } catch (err) {
        console.error('Ошибка при добавлении нового слоя:', err)
      }
    },
    // Закрытие окна компонента
    close() {
      store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
      store.dispatch(`forestArea/${forestAreaActions.SET_CURRENT_ID}`, 0)
      this.originalLayers.length = 0
      this.overlayLayers.length = 0
      store.commit(toolsStoreActions.showForestArea, false)
    }
  }
}
</script>

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

.icon-add {
  border: none;
  outline: none;
  height: 20px !important;
  width: 20px !important;

  &:disabled {
    opacity: 0.8;
  }

  &:hover {
    opacity: 0.8;
  }

  &:after {
    height: 2px;
    width: 100%;
  }

  &:before {
    height: 2px;
    width: 100%;
  }
}

.angle {
  &__container {
    width: 45%;
  }

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

.wrap {
  position: absolute;
  z-index: 101;
  right: 0;
  bottom: 0;
  width: calc(100% - 473px - $width-panel);
  height: 100%;
  backdrop-filter: blur(5px);
}

.forestArea {
  position: absolute;
  z-index: 102;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  min-width: 500px;
  max-height: 100%;
  padding: 20px;

  .layers {
    padding-top: 0 !important;
  }

  &__title {
    font-size: 20px;
    text-align: left;
    width: 100%;
    margin-bottom: 24px;
    font-family: $Golos_Text_Medium;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  &__block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;

    svg {
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }

    span {
      width: 45%;
      text-wrap: wrap;
      line-height: 1.2;
    }

    p {
      text-align: center;
      width: 45%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    button {
      width: 45%;
      height: 30px;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 700;
      line-height: 100%;
      text-align: center;

      min-width: 24px;
    }

    input {
      height: 30px;
      background-color: transparent;
      width: 100%;
      outline: none;
      padding: 0 8px;
    }
  }

  &__buttons {
    display: grid;
    bottom: 0;
    grid-auto-flow: column;
    grid-gap: 0 15px;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-inline: 30px;
  }

  &__button {
    width: 180px;
    height: 50px;
    transition: all 0.15s ease;
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;
    text-align: center;

    &--cancel {
      background-color: transparent;
    }
  }
}
</style>
