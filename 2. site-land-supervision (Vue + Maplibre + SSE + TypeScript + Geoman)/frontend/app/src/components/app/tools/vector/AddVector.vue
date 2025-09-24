<template>
  <div :class="{ dragAndDrop__wrap: dragAndDropFlag, wrap: !dragAndDropFlag }">
    <section
      :class="{ dragAndDrop__container: dragAndDropFlag }"
      class="add_vector add_vector--theme"
    >
      <h2 class="title">Загрузить векторный слой</h2>
      <div class="add_vector__content">
        <div class="top-row">
          <div class="block">
            Имя слоя

            <AngleContainer>
              <input
                v-model="newLayer.name"
                class="add_vector__input"
              />
            </AngleContainer>
          </div>
        </div>

        <div class="add_vector__block add_vector__block--settings">
          <VectorFromFile
            :dicts="dictTypes"
            @file="applyFile"
            @clear-file="clearFile"
            @change-type="changeType"
            @change-coor-system="changeCoorSystem"
            @change-description="changeDescription"
          />
        </div>

        <div class="add_vector__buttons">
          <button
            :class="{
              disabled: false
            }"
            class="add_vector__button add_vector__button--accept defaultButtonTwo"
            @click="addNewLayer"
          >
            Добавить новый слой
          </button>
          <button
            class="add_vector__button add_vector__button--cancel defaultButton"
            @click="close(true)"
          >
            Отменить
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import VueDatePicker from '@vuepic/vue-datepicker'

import '@vuepic/vue-datepicker/dist/main.css'

import store from '@/store'

import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppButton from '@/components/ui/AppButton.vue'
import VectorFromFile from '@/components/app/tools/vector/VectorFromFile.vue'
import DrawVectorSettings from '@/components/app/tools/vector/DrawVectorSettings.vue'
import AngleContainer from '@/components/ui/AngleContainer.vue'

import { dataToOptions, reduceOptions } from '@/utils/select'

import type { ISelectOption } from '@/types/admin'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { Attribute } from '@/types/layersVector'
import { layersMainActions } from '@/store/actions/layersMain'
import { INewLayerData } from '@/store/modules/layerCreation'
import { layersVectorActions } from '@/store/actions/layersVector.ts'
import { toolsStoreActions } from '@/store/actions/tools.ts'

export default defineComponent({
  name: 'AddVector',
  components: {
    VueDatePicker,
    AppCheckbox,
    AppButton,
    VectorFromFile,
    DrawVectorSettings,
    AngleContainer
  },
  data() {
    return {
      attributes: [] as Array<Attribute>,
      dictTypes: [] as Array<ISelectOption>,
      newLayer: {
        geometryType: '',
        name: '',
        description: '',
        id_dict_type_data: 0,
        file: undefined as File | undefined,
        id_crs: 0
      },
      isFileCb: false
    }
  },
  computed: {
    dicts: () => store.getters['layerCreation/dicts'],
    createQueryParams: () => store.getters['layerCreation/createQueryParams'],
    createLayerQueryParams: () => store.getters['layerCreation/createQueryParams'],
    createdLayer: () => store.getters['layersVector/createdLayer'],
    dragAndDropFlag() {
      return store.getters.dragAndDrop
    }
  },
  async created() {
    try {
      await store.dispatch('layerCreation/FETCH_DICT_TYPE_DATA')

      this.dictTypes = dataToOptions(this.dicts, 'Выберите группу слоя')
    } catch (e) {
      throw new Error((e as Error).message)
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    this.newLayer = {
      name: '',
      description: '',
      id_dict_type_data: 0,
      file: undefined,
      geometryType: '',
      id_crs: 0
    }
    this.isFileCb = false
    this.attributes.length = 0

    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(event: any) {
      if (event.key === 'Escape') {
        this.close(true)
      }
    },
    reduceOptions,
    ...mapActions('layerCreation', ['setNewLayerData', 'clearNewLayerData']), // Используем 'layerCreation' без '/'

    openModal() {
      store.commit(toolsStoreActions.setDragAndDrop, true)
    },
    close(value: boolean, isFile = false) {
      this.$emit('update:addVectorFlag', {
        value: false,
        cancel: value,
        isFile
      })
    },
    changeLayerType(layerType: number) {
      this.newLayer.id_dict_type_data = layerType
    },
    changeGeometryType(geometryType: string) {
      this.newLayer.geometryType = geometryType
    },
    addAttribute(attr: Attribute) {
      this.attributes.push(attr)
    },
    removeAttribute(index: number) {
      this.attributes.splice(index, 1)
    },
    changeDescription(text: string) {
      this.newLayer.description = text
    },
    applyFile(file?: { file: File }) {
      this.newLayer.file = file?.file
    },
    clearFile() {
      this.newLayer.file = undefined
    },
    changeType(id: number) {
      this.newLayer.id_dict_type_data = id
    },
    changeCoorSystem(id: number) {
      this.newLayer.id_crs = id
    },
    async addNewLayer() {
      let newLayerData = {} as INewLayerData
      if (!this.newLayer.name || !this.newLayer.id_crs) {
        window.$notify('Заполните имя или выберите файл, или выберите систему координат', true)
        return
      }

      newLayerData = {
        id_crs: this.newLayer.id_crs,
        description: this.newLayer.description,
        layerName: this.newLayer.name
      } as INewLayerData

      store.commit(`layerCreation/${layerCreationActions.setNewLayerData}`, newLayerData)

      if (!this.newLayer.file && this.isFileCb) {
        window.$notify('Ошибка при чтении загруженного файла', true)
        return
      }

      try {
        await this.saveFile()
        this.close(false, true)
      } catch {
        window.$notify('Ошибка при создании слоя', true)
      }
    },
    async saveFile() {
      try {
        if (!this.newLayer.file) throw new Error('Ошибка! Файл не прикреплен')

        const formData = new FormData()
        formData.append('geo_json_file', this.newLayer.file)

        await store.dispatch(`layersVector/${layersVectorActions.createLayer}`, {
          payload: formData,
          query: this.createLayerQueryParams,
          settings: {
            visible: true
          }
        })

        if (!this.createdLayer) return
        store.commit(`layersMain/${layersMainActions.addLayerMain}`, this.createdLayer)
        store.commit(`layerCreation/${layerCreationActions.clearNewLayerData}`)
      } catch (e) {
        throw new Error((e as Error).message)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.wrap {
  position: absolute;
  z-index: 102;
  bottom: 0;
  right: 0;
  width: calc(100% - 473px - clamp(0px, 5%, 90px));
  height: 100%;
  backdrop-filter: blur(5px);
}

.title {
  margin-bottom: 16px;
  padding: 0 30px;
  text-align: left;
  width: 100%;

  font-size: 24px;
  font-family: $Golos_Text_Medium;
  font-weight: 500;
  line-height: 100%;
  letter-spacing: 0%;
}

.icon-close {
  top: 35px;
  right: 30px !important;
}

.add_vector {
  overflow: auto;
  display: flex;
  position: absolute;
  z-index: 103;
  top: 50%;
  left: 50%;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  max-height: 100%;
  padding: 30px 0;
  transform: translate(-50%, -50%);

  --vs-line-height: 1.7 !important;

  .block {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;

    font-family: $Golos_Text_Regular;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;
  }

  .top-row {
    flex: 1;
    padding: 0 30px;
    display: flex;
    gap: 20px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__file {
    flex: 1;
    transform: translate(0, 25px);
  }

  &__block--settings {
    display: grid;

    --settings {
      grid-template-columns: 1fr;
      margin-block-start: 30px;
    }
  }

  &__buttons {
    margin: 30px 30px 0 30px;
    display: flex;
    gap: 30px;

    font-family: $Golos_Text_Regular;
    font-weight: 500;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;
    text-align: center;
  }

  &__textarea {
    height: 100px;
    padding: 10px;
  }

  &__button {
    width: 230px;
    height: 50px;
    transition: all 0.15s ease;
    font-size: 16px;
    line-height: 100%;
    text-align: center;

    &--accept {
      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.vs__search {
  height: 20px;
}

.dp__theme_light {
  --dp-background-color: transparent !important;
  --dp-input-padding: 2px !important;
}

.dp__input {
  height: 30px !important;
}

.dp__pointer {
  height: 30px !important;
}

.vs__selected {
  margin: 0 !important;
}

.vs__search {
  margin: 0 !important;
}

:root {
  --dp-input-padding: 2px !important;
}

.add_vector__input {
  outline: none;
  width: 100%;
  height: 40px;
  padding: 8px;
  background-color: transparent;
  border: 1px solid;
  border-radius: 0;
  font-size: 14px;
}

:global(.add_vector__block .button) {
  height: max-content;
  padding: 0;
  border: 0;
}

:global(.add_vector__file .app-checkbox__label) {
  font-size: 14px;
  font-weight: 400;
}
</style>
