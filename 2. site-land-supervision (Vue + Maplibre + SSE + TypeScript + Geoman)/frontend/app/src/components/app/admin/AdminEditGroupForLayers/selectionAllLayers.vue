<template>
  <section style="z-index: 103" class="wrap"></section>
  <div class="selection">
    <div class="selection__title">
      <p>Выбор слоя</p>
    </div>

    <div class="angle__container">
      <div class="input">
        <input
          v-model="searchValue"
          placeholder="Поиск по названию слоя"
          type="text"
        />
        <div v-if="searchValue !== ''" class="icon-close" @click="searchValue = ''"></div>
        <div class="icon-search"><span></span></div>
      </div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
      <div class="angle"></div>
    </div>

    <div class="selection__body">
      <table>
        <thead>
        <tr>
          <th>Имя слоя</th>
          <th>
            <div v-if="!singleLayer" class="checkbox">
              <input id="select-all" type="checkbox" :checked="allLayersSelected" @change="toggleAllLayers" />
              <label for="select-all"></label>
            </div>
          </th>
          <th>Группа</th>
        </tr>
        </thead>
      </table>
      <section>
        <table class="selection__body">
          <tbody class="layers">
          <tr v-for="layer in resultLayers" :key="layer.id">
            <td>
              {{ layer.name && layer.name.length > 22 ? layer.name.slice(0, 22) + '...' : layer.name }}
            </td>
            <td>
              <div class="checkbox">
                <input :id="'select-layer' + layer.id" type="checkbox" :checked="layer.selected"
                       @change="toggleLayer(layer)" />
                <label :for="'select-layer' + layer.id"></label>
              </div>
            </td>
            <td>{{ getDictTypesNames(layer) ?? '—' }}</td>
          </tr>
          </tbody>
        </table>
        <transition name="expand">
          <div class="no-layers" v-if="resultLayers.length === 0">
            <div>Слои отсутствуют</div>
          </div>
        </transition>
      </section>
    </div>

    <div class="selection__buttonBlock">
      <button @click="save" class="orange-button">Сохранить</button>
    </div>
    <span style="transform: none !important; top: 13px; right: 13px" @click="close()" class="icon-close"></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IVectorLayer } from '@/types/layersVector'
import { IDictType } from '@/types/dicts.ts'
import store from '@/store'

const props = defineProps<{
  layers: IVectorLayer[]
  singleLayer?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectLayers', ids: number[]): void
  (e: 'close'): void
}>()

// Reactive state
const searchValue = ref('')
const allLayersSelected = ref(!!props.layers.length && props.layers.every(l => l.selected))
const selectedLayers = ref<IVectorLayer[]>(props.layers.filter(l => l.selected))

// Computed: только поиск по названию
const resultLayers = computed(() => {
  const list = props.layers
  if (!searchValue.value) return list
  return list.filter(l => l.name?.toLowerCase().includes(searchValue.value.toLowerCase()))
})

// Methods
function toggleAllLayers() {
  allLayersSelected.value = !allLayersSelected.value
  props.layers.forEach(l => (l.selected = allLayersSelected.value))
  selectedLayers.value = allLayersSelected.value ? [...props.layers] : []
}

function toggleLayer(layer: IVectorLayer) {
  if (props.singleLayer) {
    props.layers.forEach(l => (l.selected = false))
    layer.selected = !layer.selected
    selectedLayers.value = layer.selected ? [layer] : []
  } else {
    layer.selected = !layer.selected
    selectedLayers.value = layer.selected
      ? [...selectedLayers.value, layer]
      : selectedLayers.value.filter(l => l.id !== layer.id)
  }
  allLayersSelected.value = props.layers.every(l => l.selected)
}

const dicts = computed(() => {
  return store.getters['layerCreation/dicts']
})

function getDictTypesNames(layer: IVectorLayer): string {
  const dictTypes = layer.id_dict_types_data
  if (!dictTypes || dictTypes.length < 1) {
    return ''
  }

  return dictTypes
    .map((dictType) => dicts.value.find((dict: IDictType) => dict.id === dictType)?.name)
    .join(', ')
}

function save() {
  emit('selectLayers', selectedLayers.value.map(l => l.id))
  emit('close')
}

function close() {
  emit('close')
}
</script>

<style scoped lang="scss">
.layers {
  padding-top: 0 !important;

  tr {
    border-bottom: none !important;
  }
}

.no-layers {
  width: 100%;
  padding-left: 30px;
  text-align: left;
  font-weight: 500;
  margin-block-start: 0.7rem;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 50px;
}

.wrap {
  position: absolute;
  z-index: 106;
  right: 0;
  bottom: 0;
  width: calc(100% - 473px - clamp(0px, 5%, 90px));
  height: 100%;
}

.icon-search {
  width: 14px;
  height: 14px;
}

.input {
  width: 100%;
  display: flex;
}

.angle {
  &__container {
    height: 40px;
    display: flex;
    margin: 0 20px 20px 20px;

    .icon-close {
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &:nth-child(2) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(3) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(4) {
    height: 5px;
    width: 10px;
  }

  &:nth-child(5) {
    height: 5px;
    width: 10px;
  }
}

.selection {
  position: fixed;
  z-index: 107;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 540px;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 23px 0 13px 0;

  span {
    font-weight: 500;
  }

  &__title {
    font-size: 20px;
    padding-left: 20px;
    text-align: left;
    margin-bottom: 16px;

    p {
      font-family: $Golos_Text_Medium;
    }
  }

  &__filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px 20px 20px;

    &-block {
      display: flex;
      align-items: center;
    }

    button {
      width: 40%;
      height: 30px;
      border-radius: 0;
      outline: none;
      border: none;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .input {
    input:disabled {
      background-color: rgba(88, 88, 88, 0.3);
    }
  }

  input {
    width: 100%;
    height: 40px;
    background-color: transparent;
    outline: none;
    border-radius: 0;
    padding-left: 28px;

    &::placeholder {
      position: absolute;
    }
  }

  &__body {
    width: 100%;

    section {
      min-height: 350px;
      max-height: 350px;
      width: 100%;
      overflow: auto;
    }

    table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;
    }

    tbody {
      tr {
        padding: 0 20px;
      }
    }

    thead {
      th {
        &:first-child {
          padding-left: 20px;
        }
      }

      width: 100%;
      display: grid;
    }

    &:first-child {
      th {
        margin-top: 0;
      }
    }

    tr {
      display: flex;

      &:first-child {
        td:first-child {
          padding-left: 0;
        }
      }
    }

    th {
      &:first-child {
        padding-left: 5px;
      }
    }

    td {
      background-color: transparent;
      font-size: 16px;
    }

    & th,
    td {
      align-items: center;
      border: none;
      text-align: left;
      display: flex;
      justify-content: left;
      padding: 8px 0;
      width: 45%;
      font-weight: 400;

      &:nth-child(2) {
        width: 10%;
      }

      p {
        text-align: left;
      }
    }
  }

  &__buttonBlock {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
    margin-top: 10px;
    padding-right: 20px;

    button {
      border-radius: 0;
      border: none;
      width: 180px;
      height: 40px;
    }
  }
}
</style>
