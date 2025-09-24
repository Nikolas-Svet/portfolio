<template>
  <section class="upload-layer">
    <AppAdminTitle title="Редактирование слоя" />
    <div class="upload-layer__content">
      <div class="upload-layer__left">
        <!-- Тип слоя -->
        <div class="upload-layer__block">
          <span>Группа слоя:</span>
          <div class="angle__container">
            <v-select
              label="name"
              :options="dicts"
              v-model="layerData.id_dict_type_data"
              :reduce="datasetReducer"
            />
          </div>
        </div>

        <!-- Имя слоя -->
        <div class="upload-layer__block">
          <span>Имя:</span>
          <div class="angle__container">
            <input
              class="input"
              v-model="layerData.name"
            />
          </div>
        </div>

        <!-- Описание -->
        <div class="upload-layer__block">
          <span>Описание:</span>
          <div class="angle__container">
            <textarea
              class="textarea"
              v-model="layerData.description"
            ></textarea>
          </div>
        </div>

        <!-- Путь для растрового слоя -->
        <div class="upload-layer__block" v-if="layerData.type === 'layer-raster'">
          <span>Путь:</span>
          <div class="angle__container">
            <input
              class="input"
              v-model="layerData.name_dir"
              disabled
            />
          </div>
        </div>
      </div>

      <div class="upload-layer__right">
        <div class="upload-layer__buttonBlock">
          <button class="defaultButtonTwo" @click="saveLayer">Сохранить</button>
          <button class="defaultButton" @click="cancelEdit">Отмена</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import mapLibre from '../app/mapLibre.vue'
import store from '@/store'
import { layersApi } from '@/api/layers'

export default defineComponent({
  name: 'AdminLayerEdit',
  components: {
    AppTextarea,
    mapLibre
  },
  data() {
    return {
      layerData: {
        id: null,
        name: '',
        description: '',
        id_dict_type_data: null,
        name_dir: '',
        type: ''
      }
    }
  },
  computed: {
    dicts: () => store.getters['layerCreation/dicts']
  },
  async created() {
    try {
      await store.dispatch('layerCreation/FETCH_DICT_TYPE_DATA')
    } catch (err: any) {
      console.error(err.message)
    }
  },
  mounted() {
    this.initLayerData()
  },
  methods: {
    datasetReducer(dataset: any) {
      return dataset.id
    },
    initLayerData() {
      const storedLayer = localStorage.getItem('editLayer')

      if (storedLayer) {
        this.layerData = JSON.parse(storedLayer) // Извлекаем слой из localStorage
        localStorage.removeItem('editLayer') // Удаляем слой после загрузки
      }
    },
    async saveLayer() {
      try {
        const updatedLayer = {
          id: this.layerData.id,
          name: this.layerData.name,
          description: this.layerData.description,
          name_dir: this.layerData.name_dir
        }

        if (this.layerData.id_dict_type_data) {
          (updatedLayer as any).id_dict_type_data = [this.layerData.id_dict_type_data]
        }

        if (this.layerData.type === 'layer-raster') {
          await layersApi.updateRasterLayer(updatedLayer as any)
        } else {
          await layersApi.updateVectorLayer(updatedLayer as any)
        }

        this.$router.go(-1)
      } catch (error) {
        console.error('Ошибка при сохранении данных слоя:', error)
      }
    },
    cancelEdit() {
      this.$router.go(-1)
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
  border: 1px solid #A7A7A7FF;
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
  border: 1px solid #A7A7A7FF;
}


.angle {
  height: 8px;
  width: 8px;

  &__container {
    width: 400px;
  }
}

.upload-layer {
  display: flex;
  flex-direction: column;

  padding: 30px 64px;

  &__content {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
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
