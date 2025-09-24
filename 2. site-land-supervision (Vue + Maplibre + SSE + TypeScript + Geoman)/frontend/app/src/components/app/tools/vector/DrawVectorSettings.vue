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
          Тип геометрии
          <AngleContainer>
            <v-select
              label="name"
              :options="geometryTypeOptions"
              v-model="selectedGeometryType"
              :reduce="reduceOptions"
              @update:model-value="changeGeometryType"
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
              append-to-body
            />
          </AngleContainer>
        </div>
      </div>
    </div>

    <div class="add_vector__table">
      <table>
        <thead>
        <tr>
          <th>Имя</th>
          <th>Тип</th>
          <th class="add_vector__th--add">
              <span
                class="icon-add"
                @click="addAttribute"
              ></span>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          class="add_vector__tr"
          v-for="(attribute, index) in attributes"
          :key="index"
        >
          <td class="add_vector__td">
            <input
              class="attribute__input"
              v-model="attribute.name"
              placeholder="Имя поля"
            />
          </td>
          <td class="add_vector__td">
            <div
              style="min-width: 205px"
              class="angle__container"
            >
              <AppSelect
                label="name"
                :options="attributeTypeOptions"
                :value="attribute.type"
                @update="attribute.type = $event"
              ></AppSelect>
            </div>
          </td>
          <td class="add_vector__td add_vector__td--remove">
            <div
              class="icon-added"
              @click="removeAttribute(index)"
            ></div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AngleContainer from '@/components/ui/AngleContainer.vue'

import { reduceOptions } from '@/utils/select'
import { ISelectOption } from '@/types/admin'
import { Attribute } from '@/types/layersVector'
import AppSelect from '@/components/ui/AppSelect.vue'

export default defineComponent({
  components: {
    AngleContainer,
    AppSelect
  },
  props: {
    dicts: {
      type: Array<ISelectOption>,
      default: []
    },
    attributes: {
      type: Array<Attribute>,
      default: []
    }
  },
  data() {
    return {
      idDict: undefined,
      geometryTypeOptions: [
        { id: 'Polygon', name: 'Полигон' },
        { id: 'LineString', name: 'Линия' }
      ],
      selectedGeometryType: 'Polygon',
      attributeTypeOptions: [
        { id: 'integer', name: 'Целое число' },
        { id: 'float', name: 'Десятичное число' },
        { id: 'string', name: 'Строка' }
      ],
      description: ''
    }
  },
  emits: [
    'change-geometry-type',
    'change-layer-type',
    'add-attribute',
    'remove-attribute',
    'change-description'
  ],
  mounted() {
    this.changeGeometryType(this.selectedGeometryType)
  },
  methods: {
    reduceOptions,
    addAttribute() {
      this.$emit('add-attribute', { name: '', type: 'string' })
    },
    removeAttribute(index: number) {
      this.$emit('remove-attribute', index)
    },
    changeGeometryType(geometryType: string) {
      this.$emit('change-geometry-type', geometryType)
    },
    changeLayerType(layerType: number) {
      this.$emit('change-layer-type', layerType)
    },
    changeDescription(text: string) {
      this.$emit('change-description', text)
    }
  }
})
</script>

<style>
.v-select-dropdown {
  position: absolute;
  z-index: 100000; /* Чтобы быть поверх всех элементов */
  top: 100%; /* Расположить под контейнером */
  left: 0;
}
</style>

<style lang="scss" scoped>

.add_vector__block {
  font-family: $Golos_Text_Regular;
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
    padding: 30px;

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

  &__name {
    font-size: 14px;
    font-weight: 400;
  }

  &__table {
    max-height: 180px;
    min-height: 180px;
    overflow: auto;

    table {
      position: relative;
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;

      thead {
        position: sticky;
        top: 0;
        z-index: 2;
      }

      img {
        height: 27px;
        width: 27px;
      }

      th {
        background: #eaebed;
        font-family: $Golos_Text_Medium;
        font-weight: 500;
      }

      th,
      td {
        padding: 10px 30px;
        text-align: left;
      }
    }
  }
}

.subtitle {
  width: 100%;
  margin-top: 30px;
  color: rgb(255 255 255);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: -1px;
  text-align: left;
}

.icon-add {
  margin-left: auto;
  width: 20px;
  height: 20px;
  background-color: $primary-color;

  &:hover {
    opacity: 0.8;
  }

  &::after {
    width: 11px;
    height: 1.5px;
  }

  &::before {
    width: 11px;
    height: 1.5px;
  }
}

.attribute {
  &__input {
    width: 100%;
    height: 34px;
    padding: 0 5px;
    border: 0;
    outline: none;
    background-color: rgba(255 255 255 / 2%);
  }
}

.icon-added {
  margin-left: auto;
  position: relative;
  background-color: transparent;

  opacity: 0.5;
  width: 20px;
  height: 20px;
  cursor: pointer;

  &::after {
    left: 2px;
    position: absolute;
    content: '';
    width: 16px;
    height: 1px;
    top: 50%;
    border-radius: 2px;
  }

  &:hover {
    opacity: 1;
  }
}

:global(.add_vector__file .app-checkbox.with-label) {
  justify-content: start;
}
</style>
