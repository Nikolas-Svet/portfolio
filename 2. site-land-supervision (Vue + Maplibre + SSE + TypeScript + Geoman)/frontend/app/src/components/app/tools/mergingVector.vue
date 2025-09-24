<script setup lang="ts">
import { computed, defineEmits, onMounted, ref } from 'vue'
import Edit from '@/components/icons/edit.vue'
import selectionLayer from './selectionLayer.vue'
import store from '@/store'
import { layerToMapLayers } from '@/utils/layers.ts'
import { toolsApi } from '@/api/tools.ts'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import Modal from '@/components/icons/modal.vue'
import { toolsStoreActions } from '@/store/actions/tools.ts'
import { layersVectorActions } from '@/store/actions/layersVector'

const emit = defineEmits<{
  (event: 'update:addMergingVectorFlag', value: boolean): void
  (event: 'selectLayers', value: number[]): void
}>()

const nameLayer = ref('')
const descriptionLayer = ref('')
const selectionLayerFlag = ref(false)
const selectedLayerType = ref<string | null>(null)
const loaderFlag = ref(false)
const selectedLayerTitles = ref<string[]>([])

const originalLayers = ref<Array<number>>([])

function toggleSelectionLayer(type: string) {
  selectedLayerType.value = type
  selectionLayerFlag.value = !selectionLayerFlag.value
}

function openModal(): void {
  store.commit(toolsStoreActions.setDragAndDrop, true)
}

function close() {
  store.commit(toolsStoreActions.showMergingVector, false)
}

async function save() {
  loaderFlag.value = true
  const responce = await toolsApi.mergingVector(
    descriptionLayer.value,
    nameLayer.value,
    originalLayers.value
  )
  loaderFlag.value = false

  const data = {
    id: responce.id,
    id_user: responce.id_user,
    id_dict_type_data: responce.id_dict_type_data,
    name: responce.name,
    description: responce.description,
    name_file: responce.name_file,
    created_date: responce.created_date,
    bbox_geojson: responce.bbox_geojson,
    delete: responce.delete,
    visible: true,
    type: 'layer-vector'
  }

  await store.dispatch(`layersMain/${layersMainActions.addLayerMain}`, data)
  originalLayers.value = []
  descriptionLayer.value = ''
  nameLayer.value = ''
  store.commit(toolsStoreActions.showMergingVector, false)
}

const layers = computed(() => {
  let layers = store.getters['layersVector/forSubstractionLayers'].map((layer: any) => {
    return layerToMapLayers(layer)
  })

  return layers
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    await Promise.all([store.dispatch(`layersVector/${layersVectorActions.fecthVectorLayers}`)])
  } catch (e) {
    console.error('Ошибка при загрузке данных:', (e as Error).message)
  }
})

onBeforeMount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (event: any) => {
  if (event.key === 'Escape') {
    close()
  }
}

const dragAndDropFlag = computed(() => {
  return store.getters.dragAndDrop
})

function updateLayers(selectedLayers: number[]) {
  originalLayers.value = selectedLayers
  const filteredLayers = layers.value.filter((layer: any) => selectedLayers.includes(layer.id))
  selectedLayerTitles.value = filteredLayers.map((layer: any) => layer.name)

  emit('selectLayers', selectedLayers)

  selectionLayerFlag.value = false
}
</script>

<template>
  <div
    :class="{ dragAndDrop__wrap: dragAndDropFlag }"
    class="wrap"
  >
    <section
      :class="{ dragAndDrop__container: dragAndDropFlag }"
      class="mergingVector"
    >
      <h2 class="mergingVector__title">Объединение слоев</h2>

      <modal style="display: none" @click="openModal()"></modal>
      <!-- Блок выбора оригинальных слоёв -->
      <div class="mergingVector__block">
        <span>Выберите слои для объединения:</span>
        <p class="vectors-titles">
          {{ selectedLayerTitles.length > 0 ? selectedLayerTitles.join(', ') : '-' }}
        </p>
        <edit @click="toggleSelectionLayer('original')" />
      </div>
      <div
        style="align-items: flex-start"
        class="mergingVector__block"
      >
        <span style="width: calc(45% - 20px)">Описание:</span>
        <div class="angle__container">
          <textarea
            style="display: flex"
            v-model="descriptionLayer"
            type="text"
          ></textarea>
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
          <div class="angle"></div>
        </div>
      </div>
      <div class="mergingVector__block">
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

      <!-- Кнопки управления -->
      <div class="mergingVector__buttons">
        <button
          class="mergingVector__button mergingVector__button--accept defaultButtonTwo"
          @click="save"
        >
          Добавить новый слой
        </button>
        <button
          @click="close"
          class="mergingVector__button mergingVector__button--cancel defaultButton"
        >
          Отменить
        </button>
      </div>
    </section>

    <!-- Окно выбора слоёв -->
    <selectionLayer
      v-if="selectionLayerFlag"
      :layers="layers"
      @select-layers="updateLayers"
      @update:selectionLayerFlag="selectionLayerFlag = $event"
    />
  </div>

  <div
    v-if="loaderFlag"
    class="layer-list__loader"
  >
    <span class="loader"></span>
    <span>Создание слоя</span>
  </div>
  <div
    v-if="loaderFlag"
    class="layer-list__wrap"
  ></div>
</template>

<style lang="scss">
.dragAndDrop {
  &__wrap {
    position: relative !important;
    width: 500px !important;
  }

  &__selection {
    max-width: 500px !important;
    width: 500px !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }

  &__subtraction {
    min-width: 500px !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }

  &__wrapFilter {
    position: relative !important;
    width: 700px !important;
  }

  &__container {
    width: 500px;
    left: 0 !important;
    top: 0 !important;
    position: relative !important;
    transform: none !important;
  }

  &__containerFilter {
    width: 700px;
    left: 0 !important;
    top: 0 !important;
    position: relative !important;
    transform: none !important;
  }
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

.angle {
  &__container {
    width: 55%;
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

.mergingVector {
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

    .vectors-titles {
      text-align: center;
      width: 45%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    textarea {
      background-color: transparent;
      width: 100%;
      resize: none;
      outline: none;
      height: 100px;
      padding: 6px;
    }

    span {
      width: 45%;
      text-wrap: wrap;
      line-height: 1.2;
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
