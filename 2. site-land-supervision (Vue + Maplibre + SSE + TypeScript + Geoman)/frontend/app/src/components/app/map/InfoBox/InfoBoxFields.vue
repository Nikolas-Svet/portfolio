<script lang="ts" setup>
import store from '@/store'
import { Consts } from '@/consts/index.consts'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'

const props = defineProps<{
  openedIdObject: number,
  openedIdLayer: number
}>()

const emit = defineEmits<{
  (e: 'update:openModal'): void
  (e: 'closeInfoBox'): void
  (e: 'openFieldsModal'): void
}>()

const fixed = ref<number>(3)

const data_info = computed(() => {
  return store.state.infoBox.data_info
})

const title_info_box = computed(() => {
  return store.state.infoBox.title_info_box
})

const flagEditForest = ref<boolean>(false)
const validationForestFlag = ref<boolean>(false)
const currentForest = ref<number | null>()

const closeInfoBox = async () => {
  emit('closeInfoBox')
}

const copyToClipboard = (value: any, name: string) => {
  if (name !== 'Кад. номер') {
    return
  }

  if (!value) return
  navigator.clipboard
    .writeText(value)
    .catch((err) => console.error('❌ Ошибка копирования:', err))
}

const validationForest = (num: number) => {
  validationForestFlag.value = Number.isNaN(num) || !Number.isFinite(num)
}

const saveForest = async () => {
  flagEditForest.value = false
  const default_price_forest = currentForest.value ? currentForest.value : 0
  if (!data_info.value) {
    return
  }
  const square_forest = store.getters['square_forest']
  const area_region = store.getters['final_price_forest'].area_region
  const new_data = [...(data_info?.value ?? [])]

  const infos = [
    {
      name: Consts.rowName.sum,
      value: `${(store.getters['measurement/convert'](square_forest * 10000) * default_price_forest).toFixed(fixed.value)} рублей`
    },
    {
      name: Consts.rowName.sum_2,
      value: `${default_price_forest} руб/${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
    },
    {
      name: Consts.rowName.area,
      value: `${store.getters['measurement/convert'](square_forest * 10000).toFixed(fixed.value)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
    },
    {
      name: Consts.rowName.area2,
      value: `${store.getters['measurement/convert'](area_region * 10000).toFixed(fixed.value)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
    }
  ]
  infos.forEach(({ name, value }) => {
    const idx = new_data.findIndex(item => item.name === name)
    if (idx !== -1) {
      new_data[idx].value = value
    } else {
      new_data.push({ name, value })
    }
  })
  await store.dispatch('infoBox/SET_TITLE_INFO_BOX', Consts.rowName.title)
  await store.dispatch('infoBox/SET_DATA_INFO', new_data)
}

const openInfoBoxModal = () => {
  emit('update:openModal')
  closeInfoBox()
}
</script>

<template>
  <div style="overflow-y: auto">
    <p>{{ title_info_box }}</p>
    <div class="icon-close" @click="closeInfoBox()"></div>
    <div class="info-box-actions">
      <edit v-if="isEditLayer(props.openedIdLayer as any)" @click="() => { emit('openFieldsModal') }"></edit>
      <modal @click="openInfoBoxModal()"></modal>
    </div>
    <ul v-if="data_info!.length">
      <li v-for="(info, index) in data_info" :key="index">
        <span>{{ info.name }}:</span>

        <p
          v-if="info.name === 'Стоимость расчистки полей с помощью мульчера' && !flagEditForest"
        >
          {{ info.value }}
        </p>
        <input
          v-if="info.name === 'Стоимость расчистки полей с помощью мульчера' && flagEditForest"
          v-model="currentForest"
          :class="{ edit_forest_price__invalid: validationForestFlag }"
          class="edit_forest_price__input"
          type="text"
          @input="validationForest(Number(currentForest))"
        />
        <p
          v-if="info.name !== 'Стоимость расчистки полей с помощью мульчера'"
          :class="{ copyable: info.name === 'Кад. номер' }"
          :title="info.name === 'Кад. номер' ? 'Скопировать' : ''"
          @click="copyToClipboard(info.value, info.name)"
        >
          {{ info.value }}
        </p>
        <button
          v-if="info.name === 'Стоимость расчистки полей с помощью мульчера' && !flagEditForest"
          class="edit_forest_price"
          @click="flagEditForest = true"
        >
          Изменить
        </button>

        <div
          v-if="info.name === 'Стоимость расчистки полей с помощью мульчера' && flagEditForest"
          class="edit_forest_price__block"
        >
          <button class="edit_forest_price" style="width: 50%" @click="flagEditForest = false">
            Отменить
          </button>
          <button
            :disabled="validationForestFlag"
            class="edit_forest_price--accept"
            style="width: 50%"
            @click="saveForest"
          >
            Сохранить
          </button>
        </div>
      </li>
    </ul>
    <p v-else>У объекта отсутствуют свойства</p>
  </div>
</template>

<style lang="scss" scoped>
.copyable {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.info-box {
  max-height: calc(100vh - 263px);
  margin: 10px;
  position: absolute;
  right: 20px !important;
  bottom: 20px;
  max-width: 480px;
  min-width: 270px;
  padding: 30px;
  width: 20%;
  display: flex;
  flex-direction: column;
  z-index: 10;
  clip-path: inset(2px);
  backdrop-filter: blur(8px);

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.8;
  }

  label {
    span {
      display: block;
    }
  }

  &:after {
    content: '';
    z-index: -1;
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    filter: blur(3px);
  }

  p {
    font-size: 16px;
    letter-spacing: 1px;

    &:first-child {
      position: relative;
      text-align: left;
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      font-size: 20px;
      margin-bottom: 20px;
    }
  }

  ul {
    list-style-type: none;

    span {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    li {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }

      span {
        margin-right: 5px;
      }
    }
  }
}

.edit_forest_price {
  margin-top: 8px;
  width: calc(50% - 4px);
  height: 25px;
  border-radius: 0;
  outline: none;

  &:hover {
    opacity: 0.9;
  }

  &__block {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__input {
    padding: 0 8px;
    margin-top: 8px;
    height: 25px;
    border-radius: 0;
    outline: none;
    font-size: 16px;
  }

  &--accept {
    margin-top: 8px;
    width: calc(50% - 4px);
    height: 25px;
    border-radius: 0;
    outline: none;
    border: none;

    :disabled {
      background-color: red !important;
    }

    &:hover {
      opacity: 0.9;
    }
  }
}

.info-box-actions {
  position: absolute;
  top: 15px;
  right: 60px;

  display: flex;
  gap: 20px;

  .modal-svg {
    width: 25px;
    height: 25px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .edit-svg {
    width: 25px;
    height: 25px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

}

.icon-close {
  right: 20px;
  top: 20px;
}
</style>