<template>
  <section class="add_vector__content">
    <div class="filters-block">
      <div class="add_vector__block">
        Описание

        <AngleContainer>
          <textarea
            class="add_vector__textarea textarea"
            v-model="description"
            @update:model-value="changeDescription"
          />
        </AngleContainer>
      </div>

      <div class="column">
        <div class="add_vector__block">
          Система координат
          <AngleContainer>
            <v-select
              label="name"
              :options="coordinates"
              v-model="id_crs"
              :reduce="reduceOptions"
              @update:model-value="changeCoorSystem"
            />
          </AngleContainer>
        </div>

        <div class="add_vector__block dict">
          Группа
          <AngleContainer>
            <v-select
              label="name"
              :options="dicts"
              v-model="idDict"
              :reduce="reduceOptions"
              @update:model-value="changeLayerType"
            />
          </AngleContainer>
        </div>
      </div>
    </div>

    <form class="add_vector__file_form">
      <div class="add_vector__block--file">
        <input
          id="add-vector-input"
          name="add-vector-input"
          ref="inputFile"
          class="add_vector__input"
          type="file"
          :with-angles="false"
          @change="changeFile"
          placeholder="Выберите файл"
        />
        <AppButton
          class="add_vector__clear"
          v-if="file"
          type="reset"
          @click="resetFileForm"
        >Очистить
        </AppButton
        >
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AngleContainer from '@/components/ui/AngleContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'

import { dataToOptions, reduceOptions } from '@/utils/select'
import store from '@/store'
import type { ISelectOption } from '@/types/admin'
import type { IComponentCustomProperties } from '@/types/component.ts'

export default defineComponent({
  data() {
    return {
      id_crs: undefined,
      idDict: undefined,
      file: undefined as File | undefined,
      readingGeoJSON: false,
      coordinates: [] as ISelectOption[],
      description: ''
    }
  },
  props: {
    dicts: {
      type: Array<ISelectOption>,
      default: []
    }
  },
  components: {
    AppInput,
    AngleContainer,
    AppButton
  },
  emits: ['file', 'clear-file', 'change-type', 'change-coor-system', 'change-description'],
  computed: {
    coorSystems: () => store.getters['layerCreation/coordinates']
  },
  async created() {
    await store.dispatch('layerCreation/FETCH_COORDINATES')

    this.coordinates = dataToOptions(this.coorSystems, 'Выберите систему координат')
  },
  methods: {
    changeDescription(text: string) {
      this.$emit('change-description', text)
    },
    reduceOptions,
    // changeFile(e: Event) {
    //   const target = e.target as HTMLInputElement
    //   if (!target.files) return
    //
    //   const [file] = target.files
    //   if (!file) return
    //
    //   const reader = new FileReader()
    //   reader.readAsText(file)
    //
    //   this.readingGeoJSON = true
    //
    //   reader.onload = (e) => {
    //     try {
    //       this.file = JSON.parse(e.target?.result as string)
    //       this.readingGeoJSON = false
    //       this.$emit('file', this.file)
    //     } catch (error) {
    //       (window as any).$notify('Ошибка при чтении загруженного файла', true)
    //     }
    //   }
    // },
    changeFile(e: Event) {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      const [file] = target.files
      if (!file) return

      this.file = file

      this.$emit('file', { file: this.file, name: file.name, type: file.type })
    },
    changeLayerType(id: number) {
      this.$emit('change-type', id)
    },
    changeCoorSystem(id: number) {
      this.$emit('change-coor-system', id)
    },
    resetFileForm() {
      const input = (this.$refs.inputFile as IComponentCustomProperties).$refs
        .input as HTMLInputElement
      if (!input) return

      input.value = ''
      this.file = undefined
      this.$emit('clear-file')
    }
  }
})
</script>

<style lang="scss" scoped>
.select-file {
  z-index: -1;
  text-align: center;
  align-content: center;
  max-width: 66px;
  width: 100%;
  height: calc(100% - 2px);
  top: 1px;
  left: 1px;
  position: absolute;
}

.textarea {
  display: flex;
  height: 100%;
  outline: none;
  width: 100%;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  font-size: 14px;
  resize: none;
}

.add_vector {
  .filters-block {
    padding: 30px 0;

    display: flex;
    gap: 20px;

    .column {
      flex: 1;

      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  &__block {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;

    font-family: $Golos_Text_Regular;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;

    .angle__container {
      height: 100%;
    }
  }

  &__content {
    padding: 0 30px;

    &__input {
      height: max-content;
      padding: 0;
      border: 0;
    }

    &__block--file {
      display: grid;
      position: relative;
      grid-gap: 8px 0;
      grid-auto-flow: column;
      justify-content: space-between;

      .add_vector__clear {
        display: inline-grid;
        align-items: center;
        justify-content: center;
        width: max-content;
        height: max-content;
        padding: 5px 10px;
        font-size: 0.7rem;
        cursor: pointer;
      }
    }

    &__name {
      font-size: 14px;
    }

    &__file_form {
      display: grid;
      grid-gap: 15px 0;
      width: 100%;
      margin-block-start: 30px;
    }
  }
}
</style>
