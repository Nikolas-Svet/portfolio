<template>
  <div
    :style="{ zIndex: filterPlace ? -100 : 101 }"
    :class="{ dragAndDrop__wrapFilter: dragAndDropFlag, wrap: !dragAndDropFlag }"
  >
    <section
      :class="{ dragAndDrop__containerFilter: dragAndDropFlag }"
      class="filter"
    >
      <h2 class="filter__title">Фильтрация векторных слоёв</h2>
      <modal style="display: none" @click="openModal()"></modal>
      <div class="filter__content">
        <!-- Блок выбора слоёв -->
        <div class="filter__block">
          <span>Выбранные слои:</span>
          <p class="vectors-titles">
            {{ selectedLayerTitles.length > 0 ? selectedLayerTitles.join(', ') : '-' }}
          </p>
          <edit @click="toggleSelectionLayer"></edit>
        </div>

        <!-- Блок ввода имени результирующего слоя -->
        <div class="filter__block">
          <span style="width: calc(45% - 20px)">Имя результирующего слоя:</span>
          <div class="angle__container">
            <input
              v-model="nameLayer"
              type="text"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <!-- Блок ввода описания -->
        <div
          style="align-items: flex-start"
          class="filter__block"
        >
          <span style="width: calc(45% - 20px)">Описание:</span>
          <div class="angle__container">
            <textarea v-model="description"></textarea>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <!-- Чекбокс для фильтрации по площади -->
        <div
          class="filter__block filter__checkbox"
          :class="{ filter__disabled: selectedLayers.length === 0 }"
        >
          <div class="checkbox">
            <input
              :id="computedId3"
              type="checkbox"
              v-model="areaFilterActive"
              @change="handleAreaFilterChange"
            />
            <label :for="computedId3"></label>
          </div>
          Фильтрация по площади
        </div>

        <div
          class="filter__block filter__checkbox"
          :class="{ filter__disabled: selectedLayers.length === 0 }"
        >
          <div class="checkbox">
            <input
              :id="computedId2"
              type="checkbox"
              v-model="placeFilterActive"
            />
            <label :for="computedId2"></label>
          </div>
          Фильтрация по области
          <button
            v-if="placeFilterActive"
            style="margin-left: auto"
            class="filter__button filter__button--draw"
            @click="drawPlace"
          >
            Указать область
          </button>
        </div>

        <div
          v-if="placeFilterActive"
          style="justify-content: flex-end !important; padding-right: 90px"
          class="filter__block filter__checkbox"
          :class="{ filter__disabled: selectedLayers.length === 0 }"
        >
          <div class="checkbox">
            <input
              style="border-radius: 50%"
              :id="computedId22"
              type="checkbox"
              v-model="crop"
            />
            <label
              class="radio"
              :for="computedId22"
            ></label>
          </div>
          Обрезать по границам
        </div>

        <div
          class="filter__block filter__checkbox"
          :class="{ filter__disabled: selectedLayers.length === 0 }"
        >
          <div class="checkbox">
            <input
              :id="computedId"
              type="checkbox"
              v-model="optionsFilterActive"
              @change="addFieldsFilter"
            />
            <label :for="computedId"></label>
          </div>
          Фильтрация по свойствам
        </div>

        <!-- Блок условий фильтрации -->
        <div
          v-if="optionsFilterActive || areaFilterActive"
          class="filter__block filter__conditions"
        >
          <span>Условия фильтрации:</span>

          <!-- Если нет доступных полей и фильтр по площади не активен -->
          <div v-if="availableFields.length === 0 && !areaFilterActive">
            <p style="margin: 16px; text-align: left; line-height: 1.2; width: 100%">
              Поля еще не загружены. <br />Выберите слои для фильтрации.
            </p>
          </div>

          <div
            style="width: 100%"
            v-else
          >
            <!-- Фильтр по площади -->
            <div
              v-if="areaFilterActive"
              class="filter__condition"
            >
              <input
                class="filter__input filter__input-disabled"
                type="text"
                :value="areaFieldName"
                disabled
                style="width: 35%"
              />
              <v-select
                style="width: 30%"
                v-model="areaFilter.actions"
                :options="['<', '>', '=']"
                placeholder="Выберите действие"
              />
              <input
                class="filter__input"
                v-model="areaFilter.value"
                type="text"
                @blur="validateNumber(areaFilter)"
                :placeholder="value"
                style="width: 30%"
              />
            </div>

            <!-- Остальные условия фильтрации -->
            <div v-if="optionsFilterActive">
              <div
                v-for="(condition, index) in filterConditions"
                :key="index"
                class="filter__condition"
              >
                <v-select
                  style="width: 40%"
                  v-model="condition.name"
                  :options="availableFields"
                  placeholder="Выберите поле"
                />
                <v-select
                  style="width: 35%"
                  v-model="condition.actions"
                  :options="['<', '>', '=', 'содержит']"
                  placeholder="Выберите действие"
                />
                <input
                  class="filter__input"
                  v-model="condition.value"
                  type="text"
                  @blur="validateNumber(condition)"
                  placeholder="Значение"
                  style="width: 25%"
                />
                <delete @click="removeCondition(index)">Удалить</delete>
              </div>
            </div>

            <!-- Кнопка добавления условия (только если есть доступные поля и активен optionsFilterActive) -->
            <button
              v-if="availableFields.length > 0 && optionsFilterActive"
              class="filter__button filter__button--add"
              @click="addCondition"
            >
              Добавить условие
            </button>
          </div>
        </div>

        <!-- Блок кнопок управления -->
        <div class="filter__buttons">
          <button
            class="filter__button filter__button--apply defaultButtonTwo"
            @click="applyFilter"
          >
            Применить фильтр
          </button>
          <button
            class="filter__button filter__button--cancel defaultButton"
            @click="close"
          >
            Отменить
          </button>
        </div>
      </div>
    </section>

    <!-- Модальное окно выбора слоёв -->
    <selectionLayer
      v-if="selectionLayerFlag"
      class="custom-select"
      :layers="layers"
      :selectedLayerType="'filter'"
      @select-layers="updateSelectedLayers"
      @update:selectionLayerFlag="selectionLayerFlag = $event"
    />
  </div>
  <div
    v-if="loaderFlag"
    class="layer-list__loader"
  >
    <span class="loader"></span>
    <span>Получение полей</span>
  </div>
</template>

<script>
import store from '@/store'
import selectionLayer from './selectionLayer.vue'
import Edit from '@/components/icons/edit.vue'
import Delete from '@/components/icons/delete.vue'
import Modal from '@/components/icons/modal.vue'
import { toolsApi } from '@/api/tools'
import { layerToMapLayers } from '@/utils/layers'
import { toolsStoreActions } from '@/store/actions/tools'
import { layersVectorActions } from '@/store/actions/layersVector'

export default {
  name: 'filterVectorLayers',
  components: {
    Modal,
    Delete,
    selectionLayer,
    Edit
  },
  data() {
    return {
      computedId: `select-area-${Date.now()}-${Math.random()}`,
      computedId2: `select-area2-${Date.now()}-${Math.random()}`,
      computedId22: `select-area22-${Date.now()}-${Math.random()}`,
      computedId3: `select-area3-${Date.now()}-${Math.random()}`,
      areaFilter: {
        actions: '',
        value: ''
      },
      nameLayer: '',
      description: '',
      selectedLayers: [],
      availableFields: [],
      filterConditions: [],
      selectionLayerFlag: false,
      loaderFlag: false,
      areaFilterActive: false,
      placeFilterActive: false,
      crop: false,
      optionsFilterActive: false,
      areaFieldName: 'Площадь',
      selectedLayerTitles: []
    }
  },
  computed: {
    value() {
      return `Значение ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
    },
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    },
    layers() {
      let layers = store.getters['layersVector/forSubstractionLayers'].map((layer) =>
        layerToMapLayers(layer)
      )
      layers.forEach((l) => {
        l.selected = this.selectedLayers.includes(l.id)
      })
      return layers
    },
    filterBBox() {
      // Получаем координаты области (bbox) через getter (например, 'place')
      return store.getters.place || null
    },
    filterPlace() {
      return store.getters.filterPlace
    }
  },
  async mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    try {
      await Promise.all([store.dispatch(`layersVector/${layersVectorActions.fecthVectorLayers}`)])
    } catch (e) {
      throw new Error(e.message)
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    openModal() {
      store.commit(toolsStoreActions.setDragAndDrop, true)
    },
    toggleSelectionLayer() {
      this.selectionLayerFlag = !this.selectionLayerFlag
    },
    validateNumber(condition) {
      if (condition.actions == 'содержит') {
        return
      }

      condition.value = condition.value.replace(',', '.')

      if (condition.value.trim() !== '' && isNaN(Number(condition.value))) {
        window.$notify('Введите корректное числовое значение', true)
        condition.value = ''
      }
    },
    async updateSelectedLayers(selectedLayers) {
      this.selectedLayers = selectedLayers
      this.selectionLayerFlag = false

      const filteredLayers = this.layers.filter((layer) => selectedLayers.includes(layer.id))
      this.selectedLayerTitles = filteredLayers.map((layer) => layer.name)

      // Если слои выбраны, запрашиваем поля
      if (this.selectedLayers.length > 0) {
      } else {
        this.availableFields = []
        this.filterConditions = []
      }
    },
    async addFieldsFilter() {
      if (this.availableFields.length > 0) {
        return
      }
      if (!this.optionsFilterActive) {
        return
      }
      await this.getFields()
    },
    async getFields() {
      this.loaderFlag = true
      try {
        const fields = await toolsApi.getFieldsByFilters(this.selectedLayers)
        // Если API вернул пустой результат – уведомляем пользователя и не заполняем availableFields
        if (!fields || fields.length === 0) {
          window.$notify('Поля пусты', true)
          this.availableFields = []
          return
        }
        // Извлекаем уникальные названия полей
        // const names = fields.map(field => field.name)
        this.availableFields = fields
      } catch (error) {
        console.error('Ошибка при получении полей:', error)
        window.$notify('Ошибка при получении полей', true)
      } finally {
        this.loaderFlag = false
      }
    },
    addCondition() {
      // Добавляем условие с пустыми значениями для обычного фильтра
      this.filterConditions.push({
        name: '',
        actions: '',
        value: ''
      })
    },
    removeCondition(index) {
      // Не разрешаем удаление условия фильтрации по площади (оно управляется чекбоксом)
      if (this.filterConditions[index].name === this.areaFieldName) return
      this.filterConditions.splice(index, 1)
    },
    handleAreaFilterChange() {
      if (this.areaFilterActive) {
        this.areaFilter = {
          actions: '',
          value: ''
        }
      } else {
        this.areaFilter = null
      }
    },
    validate() {
      // Базовая валидация: слои выбраны и имя результирующего слоя заполнено
      if (this.selectedLayers.length === 0) {
        console.log(1)
        window.$notify('Не все данные заполнены', true)
        return false
      }
      if (!this.nameLayer.trim()) {
        console.log(2)
        window.$notify('Не все данные заполнены', true)
        return false
      }
      // Если заданы условия фильтрации, проверяем каждое (для обычных полей)
      console.log(this.filterConditions)
      for (let condition of this.filterConditions) {
        if (condition.actions === 'содержит' && condition.name) {
          console.log('Validate содержит')
          continue
        }
        if (
          !condition.name ||
          !condition.actions ||
          condition.value.trim() === '' ||
          isNaN(Number(condition.value))
        ) {
          console.log(3)
          window.$notify('Не все данные заполнены', true)
          return false
        }
      }
      // Если фильтрация по площади активна, убеждаемся, что соответствующее условие заполнено корректно
      if (this.areaFilterActive) {
        if (
          !this.areaFilter ||
          !this.areaFilter.actions ||
          this.areaFilter.value.trim() === '' ||
          isNaN(Number(this.areaFilter.value))
        ) {
          console.log(4)
          window.$notify('Заполните данные для фильтрации по площади', true)
          return false
        }
        if (this.areaFilter.actions === 'содержит') {
          return true
        }
      }
      return true
    },
    drawPlace() {
      store.commit(toolsStoreActions.showFilterPlaceFlag, true)
      this.$emit('draw-place')
    },
    async applyFilter() {
      if (!this.validate()) return

      // Преобразуем выбранные операторы в требуемые строки
      const actionsMapping = {
        '<': 'less',
        '>': 'more',
        '=': 'equal',
        содержит: 'present'
      }

      const queryParams = {
        name_layer: this.nameLayer,
        description: this.description
      }

      // Отдельно извлекаем условие фильтрации по площади
      const areaCondition = this.filterConditions.find(
        (condition) => condition.name === this.areaFieldName
      )

      // Формируем тело запроса
      const body = {
        id_vector_layer: this.selectedLayers
      }

      // Остальные условия отправляем в list_name_fields (если они есть)
      if (this.filterConditions.length > 0) {
        body.list_name_fields = this.filterConditions
          .filter((condition) => condition.name !== this.areaFieldName)
          .map((condition) => ({
            name: condition.name,
            value: String(condition.value),
            actions: actionsMapping[condition.actions] || condition.actions
          }))
      }

      // Если фильтр по площади активен, добавляем его отдельно в body.filter_area
      if (this.areaFilterActive && this.areaFilter) {
        body.filter_area = {
          value: String(
            this.areaFilter.value /
            store.getters['measurement/selectedUnit'].conversionFactor /
            10000
          ),
          actions: actionsMapping[this.areaFilter.actions] || this.areaFilter.actions
        }
      }

      // Если есть данные bbox (полученные через vuex), добавляем их
      if (
        this.filterBBox &&
        (Number(this.filterBBox.point_min.lat) !== 0 ||
          Number(this.filterBBox.point_min.lon) !== 0 ||
          Number(this.filterBBox.point_max.lat) !== 0 ||
          Number(this.filterBBox.point_max.lon) !== 0)
      ) {
        const points2 = {
          point_min: { lat: this.filterBBox.point_min.lat, lon: this.filterBBox.point_min.lon },
          point_max: { lat: this.filterBBox.point_max.lat, lon: this.filterBBox.point_max.lon },
          crop: this.crop
        }
        await store.commit(toolsStoreActions.setFilterPlace, points2)
        body.filter_bbox = this.filterBBox
      }

      // Пример: установка пустых координат через vuex (если требуется сброс)
      const points = {
        point_min: { lat: 0, lon: 0 },
        point_max: { lat: 0, lon: 0 },
        crop: this.crop
      }
      store.commit(toolsStoreActions.setFilterPlace, points)

      try {
        this.close()
        const response = await toolsApi.filterVectorLayers(queryParams, body)
        // window.$notify('Фильтр успешно применен', true)
      } catch (error) {
        console.error('Ошибка при применении фильтра:', error)
        window.$notify('Ошибка при применении фильтра', true)
      }
    },
    close() {
      store.commit(toolsStoreActions.showFilterVector, false)
    }
  }
}
</script>

<style scoped lang="scss">
.radio {
  border-radius: 50% !important;

  &:after {
    border-radius: 50% !important;
  }
}

input:disabled {
  background-color: red;
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

.wrap {
  --vs-line-height: 1.5 !important;
}

.delete-svg {
  width: 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.edit-svg {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
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

.wrap {
  position: absolute;
  //z-index: 101;
  right: 0;
  bottom: 0;
  width: calc(100% - 473px - $width-panel);
  height: 100%;
  backdrop-filter: blur(5px);
}

.filter {
  position: absolute;
  z-index: 102;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 700px;
  max-height: 100%;
  padding: 20px;

  .vs__selected-options {
    height: 30px !important;
  }

  .vs__search {
    display: none !important;
  }

  input,
  textarea {
    display: flex;
    font-size: 16px;
  }

  &__disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &__title {
    font-size: 20px;
    text-align: left;
    width: 100%;
    margin-bottom: 24px;
    font-family: $Golos_Text_Medium;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  &__checkbox {
    height: 30px;
    justify-content: flex-start !important;
  }

  &__block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;

    svg {
      min-width: 24px;
    }

    span {
      width: 45%;
      word-wrap: break-word;
      line-height: 1.2;
    }

    p {
      width: 45%;
      text-align: center;
    }

    button {
      outline: none;
      border: none;
      width: 45%;
      height: 30px;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 700;
      line-height: 100%;
      text-align: center;
    }

    textarea {
      resize: none;
      height: 130px;
      background-color: transparent;
      width: 100% !important;
      outline: none;
      display: flex;
      padding: 8px;
    }

    input,
    select {
      height: 30px;
      background-color: transparent;
      width: 100%;
      outline: none;
      padding: 8px;
    }
  }

  &__conditions {
    flex-direction: column;
    align-items: flex-start;

    .filter__condition {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 12px;

      select {
        margin-right: 10px;
      }

      input {
        height: 33px;
        border: none;
        outline: none;
        width: 15%;
        margin-right: 10px;
      }
    }
  }

  &__buttons {
    display: grid;
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

    &--add {
      margin-top: 12px;
    }

    &:hover {
      opacity: 0.9;
    }

    &--cancel {
      background-color: transparent;
    }
  }

  .angle__container {
    width: 55%;
    position: relative;
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
}
</style>
