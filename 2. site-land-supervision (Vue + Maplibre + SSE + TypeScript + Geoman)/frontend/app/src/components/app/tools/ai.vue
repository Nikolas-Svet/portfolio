<template>
  <div
    :style="{ opacity: !createLayerFlag ? '1' : '0', zIndex: !createLayerFlag ? '101' : '-100' }"
    :class="{ dragAndDrop__wrap: dragAndDropFlag, wrap: !dragAndDropFlag }"
    @keyup.esc="close"
  >
    <section
      :class="{ dragAndDrop__container: dragAndDropFlag }"
      class="ai"
    >
      <h2 class="ai__title">Прогноз залесенности участка</h2>

      <modal style="display: none" @click="openModal()"></modal>

      <div class="ai__content">
        <!-- Блок выбора оригинальных слоёв -->
        <div class="ai__block">
          <span>Область, которую нужно рассчитать:</span>
          <p v-if="!toolGeom">
            {{
              selectedOriginalLayerTitles.length > 0 ? selectedOriginalLayerTitles.join(', ') : '-'
            }}
          </p>
          <p v-else>Новая геометрия</p>
          <edit v-if="!toolGeom" @click="toggleSelectionLayer('original')"></edit>
          <button
            v-else
            :style="{transform: toolGeom ? 'rotate(45deg)' : 'none'}"
            class="icon-add"
            style="background-color: transparent !important"
            @click="clearToolGeom()"
          ></button>
        </div>

        <!-- Блок выбора наложенных слоёв -->
        <div class="ai__block">
          <span>Размеченный лес:</span>
          <p>
            {{
              selectedOverlayLayerTitles.length > 0 ? selectedOverlayLayerTitles.join(', ') : '-'
            }}
          </p>
          <edit @click="toggleSelectionLayer('overlay')"></edit>
        </div>

        <div class="ai__block">
          <span style="width: calc(45% - 20px)">Имя результирующего слоя:</span>
          <div class="angle__container">
            <input
              v-model="nameLayer"
              type="text"
              @change="setYearHandler"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <!-- Блок ввода года прогнозирования -->
        <div class="ai__block">
          <div class="tooltip-container">
            <i class="info-icon">!</i>
            <div class="tooltip">
              <p>
                За раз можно передать один период прогнозирования, отрицательные числа будут
                прогнозировать в прошлое.
              </p>
            </div>
          </div>
          <span style="width: calc(45% - 20px)">Период прогнозирования:</span>
          <div class="angle__container">
            <input
              v-model="yearLocal"
              type="text"
              @change="setYearHandler"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <!-- Кнопки управления -->
        <div class="ai__buttons">
          <button
            class="ai__button ai__button--accept defaultButtonTwo"
            @click="addNewLayer"
          >
            Добавить новый слой
          </button>
          <button
            @click="close"
            class="ai__button ai__button--cancel defaultButton"
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
      @flag-draw="drawSet"
      @update:selectionLayerFlag="selectionLayerFlag = $event"
      :single-layer="true"
    />
  </div>
</template>

<script>
import store from '@/store'
import { aiActions } from '@/store/actions/ai'
import { layersVectorActions } from '@/store/actions/layersVector'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { layerToMapLayers } from '@/utils/layers'

import selectionLayer from './selectionLayer.vue'
import Edit from '@/components/icons/edit.vue'
import Modal from '@/components/icons/modal.vue'
import { toolsStoreActions } from '@/store/actions/tools'
import { forestAreaActions } from '@/store/actions/forestArea'

export default {
  computed: {
    currentID() {
      return store.state.forestArea.currentID
    },
    openModal() {
      store.commit(toolsStoreActions.setDragAndDrop, true)
    },
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    },
    originalLayers() {
      return store.state.ai.originalLayers
    },
    overlayLayers() {
      return store.state.ai.overlayLayers
    },
    year() {
      return store.state.ai.year
    },
    createLayerFlag() {
      return store.state.forestArea.flagCreateLayer
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
        console.log(newValue, this.createLayerFlag, store.getters.ai)
        if (newValue && this.createLayerFlag && store.getters.ai) {
          console.log('NEW GEOM AI')
          store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
          store.commit(toolsStoreActions.showAi, true)
        }
      },
      deep: true
    },
    selectionLayerFlag: {
      handler(newValue) {
        if (!newValue) {
          this.selectionLayerFlag = false
        }
      }
    }
  },
  name: 'ai',
  components: {
    Modal,
    Edit,
    selectionLayer
  },
  data() {
    return {
      nameLayer: '',
      yearLocal: '', // Локальное хранилище для ввода года
      edit: new URL('@/assets/images/edit.svg', import.meta.url).href, // Иконка редактирования
      selectionLayerFlag: false, // Флаг отображения окна выбора слоёв
      selectedLayerType: null, // Тип слоя для выбора ('original' или 'overlay')
      selectedOriginalLayerTitles: [],
      selectedOverlayLayerTitles: []
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
      const filteredLayers = this.layers.filter((layer) => selectedLayers.includes(layer.id))

      if (this.selectedLayerType === 'original') {
        this.selectedOriginalLayerTitles = filteredLayers.map((layer) => layer.name)

        store.dispatch(`ai/${aiActions.SET_ORIGINAL_LAYERS}`, selectedLayers)
      } else if (this.selectedLayerType === 'overlay') {
        this.selectedOverlayLayerTitles = filteredLayers.map((layer) => layer.name)
        store.dispatch(`ai/${aiActions.SET_OVERLAY_LAYERS}`, selectedLayers)
      }
      this.selectionLayerFlag = false
    },
    // Обработчик изменения года
    setYearHandler() {
      const num = Number(this.yearLocal)
      store.dispatch(`ai/${aiActions.SET_YEAR}`, isNaN(num) ? 0 : num)
    },
    // Обработчик кнопки "Добавить новый слой"
    async addNewLayer() {
      await store.dispatch(`ai/${aiActions.SET_NAME_LAYER}`, this.nameLayer)
      if (this.overlayLayers.length === 0) {
        window.$notify('Выберите хотя бы один слой', true)
      } else {
        this.$emit('update:addAiFlag', false)
        try {
          await store.dispatch(`ai/${aiActions.ADD_NEW_LAYER}`)
          this.close()
        } catch (err) {
          console.error('Ошибка при добавлении нового слоя:', err)
        }
      }
    },

    drawSet() {
      console.log('drawSet')
      this.$emit('draw-place', '123')
    },
    // Закрытие окна компонента
    close() {
      store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
      store.dispatch(`forestArea/${forestAreaActions.SET_CURRENT_ID}`, 0)
      this.originalLayers.length = 0
      this.overlayLayers.length = 0
      store.commit(toolsStoreActions.showAi, false)
    }
  }
}
</script>

<style scoped lang="scss">
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

/* Контейнер для иконки и подсказки */
.tooltip-container {
  min-width: 20px;
  background-color: rgba(214, 129, 102, 0.2);
  border-radius: 50%;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Иконка информации */
.info-icon {
  font-family: $Golos_Text_Medium;
  font-size: 18px;
  cursor: pointer;
  margin-right: 8px;
  transform: translateX(2px);
}

/* Подсказка */
.tooltip {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  padding: 8px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease,
  visibility 0.3s ease;
  pointer-events: none;
  z-index: 100;
}

/* Треугольник под подсказкой */
.tooltip::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}

/* Показывать подсказку при наведении */
.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Задержка перед отображением подсказки */
.tooltip-container:hover .tooltip {
  animation: tooltip-delay 1s forwards;
}

@keyframes tooltip-delay {
  0% {
    opacity: 0;
    visibility: hidden;
  }
  100% {
    opacity: 1;
    visibility: visible;
  }
}

.angle {
  &__container {
    width: 50%;
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

.ai {
  position: absolute;
  z-index: 102;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  min-width: 500px;
  max-height: 100%;
  padding: 20px;

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
    }

    input {
      height: 30px;
      background-color: transparent;
      width: 100%;
      outline: none;
      padding: 0 8px;
    }

    svg {
      min-width: 24px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
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

    &:hover {
      opacity: 0.9;
    }

    &--cancel {
      background-color: transparent;
    }
  }
}
</style>
