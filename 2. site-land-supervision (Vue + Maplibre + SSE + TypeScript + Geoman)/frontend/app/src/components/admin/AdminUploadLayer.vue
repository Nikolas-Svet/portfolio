<template>
  <section class="upload-layer">
    <AppAdminTitle title="Загрузить слой" />
    <div class="upload-layer__content">
      <div class="upload-layer__left">
        <div class="upload-layer__block">
          <span>Имя *:</span>
          <div class="angle__container">
            <input class="input" v-model="newLayer.layerName" />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <div class="upload-layer__block">
          <span>Описание:</span>
          <div class="angle__container">
            <textarea class="textarea" v-model="newLayer.description"></textarea>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <div class="upload-layer__block">
          <span>Система координат *:</span>
          <div class="angle__container">
            <v-select
              label="name"
              :options="coorsSystemOptions"
              v-model="newLayer.id_crs"
              :reduce="reduceOptions"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <div class="upload-layer__block">
          <span>Группа слоя:</span>
          <div class="angle__container">
            <v-select
              label="name"
              :options="dictsOptions"
              v-model="newLayer.id_dict_type_data"
              :reduce="reduceOptions"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <div style="align-items: center" class="upload-layer__block">
          <span>Файл .geoJson *:</span>
          <div class="upload-layer__currentFile">
            <p>{{ selectedFileName }}</p>
            <button class="defaultButton" @click="triggerFileSelect">Выбрать</button>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".geojson"
              style="display: none"
            />
          </div>
        </div>
        <div style="justify-content: end" class="upload-layer__block">
          <button class="defaultButton" @click="uploadGeoJSON">Загрузить</button>
        </div>
      </div>
      <div class="upload-layer__right">
        <div class="upload-layer__map">
          <map-libre ref="mapLibreComponent"></map-libre>
        </div>
        <div class="upload-layer__buttonBlock">
          <button @click="save()" class="defaultButtonTwo">Сохранить</button>
          <button class="defaultButton">Отмена</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import mapLibre from '../app/mapLibre.vue'
import store from '@/store'
import { dataToOptions, reduceOptions } from '@/utils/select'
import { ISelectOption } from '@/types/admin'
import { INewLayerData } from '@/store/modules/layerCreation'
import { substractionLayerActions } from '@/store/actions/substractionLayer'

interface IAdminUploadLayerComponent {
  coorsSystemOptions: ISelectOption[]
  dictsOptions: ISelectOption[]
  newLayer: INewLayerData
  selectedFileName: string
  geojsonData: Record<string, unknown> | null
  geojsonFile: File | null
}

export default defineComponent({
  name: 'AdminUploadLayer',
  components: {
    mapLibre
  },
  data(): IAdminUploadLayerComponent {
    return {
      coorsSystemOptions: [],
      dictsOptions: [],
      newLayer: {
        layerName: '',
        description: '',
        id_crs: 1,
        id_dict_type_data: 1,
        geometryType: '',
        attributes: []
      },
      selectedFileName: '',
      geojsonData: null,
      geojsonFile: null
    }
  },
  computed: {
    coordinates: () => store.getters['layerCreation/coordinates'],
    dicts: () => store.getters['layerCreation/dicts'],
    createQueryParams: () => store.getters['layerCreation/createQueryParams']
  },
  async created() {
    try {
      await Promise.all([
        store.dispatch('layerCreation/FETCH_COORDINATES'),
        store.dispatch('layerCreation/FETCH_DICT_TYPE_DATA')
      ])

      this.coorsSystemOptions = dataToOptions(this.coordinates, 'Выберите систему координат')
      this.dictsOptions = dataToOptions(this.dicts, 'Выберите группу')
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error)
    }
  },
  unmounted() {
    store.commit(substractionLayerActions.CLEAR_NEW_LAYER_DATA)
  },
  methods: {
    reduceOptions,
    triggerFileSelect() {
      const fileInput = this.$refs.fileInput as HTMLInputElement
      fileInput.click()
    },

    handleFileUpload(event: Event) {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]

      if (file) {
        this.geojsonFile = file
        this.selectedFileName = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            this.geojsonData = JSON.parse(e.target?.result as string)
          } catch (error) {
            console.error('Ошибка чтения GeoJSON:', error)
          }
        }
        reader.readAsText(file)
      }
    },

    uploadGeoJSON() {
      if (this.geojsonData) {
        const mapComponent = this.$refs.mapLibreComponent as any
        if (mapComponent?.addGeoJSONLayer) {
          mapComponent.addGeoJSONLayer(this.geojsonData)
        } else {
          console.error('Метод addGeoJSONLayer не найден в mapLibreComponent')
        }
      }
    },

    async save() {
      try {
        if (!this.newLayer.layerName || !this.geojsonFile) {
          alert('Заполните имя слоя и выберите файл GeoJSON')
          return
        }

        store.commit('layerCreation/SET_NEW_LAYER_DATA', this.newLayer)

        const formData = new FormData()
        const blob = new Blob([JSON.stringify(this.geojsonData)])
        formData.append('geo_json_file', blob, this.geojsonFile.name)

        // Вызываем API
        await store.dispatch('layersVector/CREATE_VECTOR_LAYER', {
          query: this.createQueryParams,
          payload: formData
        })
        // alert('Слой успешно создан')
      } catch (error) {
        // alert('Ошибка создания слоя: Возможно невалидный файл')
        console.error('Ошибка создания слоя:', error)
      }
    }
  }
})
</script>

<style scoped lang="scss">
.textarea {
  display: flex;
  height: 185px;
  outline: none;
  width: 100%;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  color: $text-color;
  font-size: 14px;
  resize: none;
  border: 1px solid #a7a7a7ff;
}

.input {
  outline: none;
  width: 100%;
  height: 40px;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  color: $text-color;
  font-size: 14px;
  border: 1px solid #a7a7a7ff;
}

.angle {
  height: 8px;
  width: 8px;

  &__container {
    width: 400px;
  }
}

.upload-layer {

  &__content {
    display: grid;
    grid-auto-flow: column;
    gap: 32px;
    grid-auto-columns: 563px 1fr;
    width: 100%;
  }

  &__left {
    padding-left: 64px;
    width: 100%;
    max-width: 563px;
  }

  &__block {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    span {
      font-weight: 900;
    }

    &:last-child {
      button {
        margin-top: 20px;
        height: 50px;
        width: 260px;
        font-family: $Golos_Text_Medium;
      }
    }
  }

  &__currentFile {
    max-width: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      width: 180px;
      height: 40px;
    }
  }

  &__right {
    padding-right: 64px;
    display: grid;
    grid-auto-rows: 500px auto;
    place-items: flex-end;
  }

  &__map {
    width: 100%;
    height: 100%;
  }

  &__buttonBlock {
    max-width: 540px;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    button {
      margin-top: 40px;
      height: 50px;
      width: 48%;
    }
  }
}

@media (width < 1500px) {
  .upload-layer {
    &__content {
      grid-auto-flow: row;
      grid-auto-columns: 1fr;
    }
  }
}
</style>

<style lang="scss">
.dp__input {
  background-color: transparent !important;
}

.vs__search {
  height: 30px;
}

.vs__selected {
  height: 30px;
}
</style>
