<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { layersApi } from '@/api/layers'
import type { IField } from '@/types/Vector'
import DeleteIcon from '@/assets/icons/delete.svg'
import RestoreIcon from '@/assets/icons/restore.svg'
import EditIcon from '@/assets/images/edit.svg'
import store from '@/store'

interface Props {
  objectId: number | null
}

interface Emits {
  (event: 'close'): void

  (event: 'save', payload: IField[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const objectFields = ref<IField[]>([])
const displayedFields = ref<IField[]>([])
const defaultFields = ref<IField[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const getFields = async () => {
  console.log('props.objectId', props.objectId)
  try {
    if (!props.objectId) {
      throw new Error('ID объекта не указан')
    }

    isLoading.value = true
    const data = await layersApi.getFildsByObjectId({ id_object: props.objectId })

    // if (!data || data.length === 0) {
    //   throw new Error('Поля не найдены')
    // }

    objectFields.value = data ? data : []
    displayedFields.value = data ? data : []
    defaultFields.value = JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при загрузке полей:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Неизвестная ошибка'
    emit('close')
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async () => {
  try {
    console.log('arrAddFields', arrAddFields.value)
    console.log('arrDeleteFields', arrDeleteFields.value)
    console.log('arrEditFields', arrEditFields.value)
    if (!props.objectId) {
      throw new Error('ID объекта не указан')
    }

    if (!arrAddFields.value.length && !arrDeleteFields.value.length && !arrEditFields.value.length) {
      throw new Error('Изменений нет')
    }

    for (const item of arrAddFields.value) {
      if (item.name === '') {
        ;(window as any).$notify('Не все поля заполнены', true)
        return
      }
    }
    for (const item of arrEditFields.value) {
      if (item.name === '') {
        ;(window as any).$notify('Не все поля заполнены', true)
        return
      }
    }


    if (arrEditFields.value.length) {
      await layersApi.updateFields(arrEditFields.value)
    }

    if (arrAddFields.value.length) {
      const payload = (arrAddFields as any).value.map((field: any) => ({
        ...field,
        id_geom: props.objectId
      }))
      await layersApi.addFields(payload)
    }

    if (arrDeleteFields.value.length) {
      const payload = arrDeleteFields.value.map(field => (field.id))
      await layersApi.deleteFields(payload)
    }

    isLoading.value = true

    arrAddFields.value = []
    arrDeleteFields.value = []
    arrEditFields.value = []

    // await store.dispatch('infoBox/FETCH_DATA_INFO', [])
    await store.dispatch('infoBox/FETCH_DATA_INFO', Number(props.objectId))

    // emit('save', displayedFields.value)
    ;(window as any).$notify('Свойства обновлены', true)
    emit('close')
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка сохранения'
  } finally {
    isLoading.value = false
  }
}

const arrAddFields = ref<IField[]>([])

const arrDeleteFields = ref<IField[]>([])

const arrEditFields = ref<IField[]>([])

onMounted(() => {
  if (!props.objectId) {
    errorMessage.value = 'ID объекта не указан'
    return
  }
  getFields()
})

function resetDeleteFiled(field: any) {
  const idx = arrDeleteFields.value.indexOf(field)
  if (idx !== -1) {
    arrDeleteFields.value.splice(idx, 1)
  }
}

function resetEditFiled(field: any) {
  const idx = arrEditFields.value.indexOf(field)
  let idx2 = -1
  for (let i = 0; i < defaultFields.value.length - 1; i++) {
    if (Number(defaultFields.value[i].id) === Number(field.id)) {
      idx2 = i
    }
  }
  console.log(idx2)
  if (idx !== -1 && idx2 !== -1) {
    console.log(displayedFields.value[idx], defaultFields.value[idx])
    displayedFields.value[idx2] = defaultFields.value[idx2]
    arrEditFields.value.splice(idx, 1)
  }
}
</script>

<template>
  <div class="edit-fields-modal-container__wrap">
    <div class="edit-fields-modal-container">
      <span class="title">Изменение свойств полей</span>
      <AppButton class="defaultButtonTwo" style="min-height: 50px" type="submit"
                 @click="arrAddFields.unshift({ name: '', value: '' })">
        Добавить поле
      </AppButton>
      <div v-if="isLoading" class="loading">Загрузка...</div>
      <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-else class="edit-fields-modal-container__content">
        <AppTable>
          <template #THeader>
            <thead>
            <tr>
              <th>Наименование</th>
              <th>Описание</th>
              <th>Действие</th>
            </tr>
            </thead>
          </template>

          <template #TBody>
            <tbody>
            <template v-if="arrAddFields.length">
              <tr v-for="(field, index) in arrAddFields" :key="index">
                <td class="edit-fields__edit">
                  <input
                    v-model="field.name"
                    class="edit-fields__input"
                    placeholder=""
                    type="text"
                  />
                </td>
                <td class="edit-fields__edit">
                  <textarea
                    v-model="field.value"
                    class="edit-fields__input"
                    placeholder=""
                  ></textarea>
                </td>
                <td style="text-align: center;">
                  <DeleteIcon @click="arrAddFields.splice(index, 1)" />
                </td>
              </tr>
            </template>
            <tr v-for="field in displayedFields" :key="field.id"
                :class="{'edit-fields__del': arrDeleteFields.includes(field)}">
              <td v-if="!arrEditFields.includes(field)">{{ field.name }}</td>
              <td v-else class="edit-fields__edit">
                <input
                  v-model="field.name"
                  class="edit-fields__input"
                  placeholder=""
                  type="text"
                />
              </td>
              <td v-if="!arrEditFields.includes(field)" style="width: 60%;">{{ field.value }}</td>
              <td v-else class="edit-fields__edit" style="width: 60%;">
                <textarea
                  v-model="field.value"
                  class="edit-fields__input"
                  placeholder=""
                ></textarea>
              </td>
              <td style="display: flex; align-items: center;">
                <DeleteIcon v-if="!arrDeleteFields.includes(field) && !arrEditFields.includes(field)"
                            @click="arrDeleteFields.unshift(field)" />
                <RestoreIcon v-else-if="!arrEditFields.includes(field)" style="height: 24px; width: 24px;"
                             @click="resetDeleteFiled(field)" />
                <EditIcon v-if="!arrDeleteFields.includes(field)"
                          style="height: 24px; width: 24px; margin-left: 16px;"
                          @click="!arrEditFields.includes(field) ? arrEditFields.unshift(field) : resetEditFiled(field)" />
              </td>
            </tr>
            </tbody>
          </template>
        </AppTable>
        <!--        <div class="fields-container">-->
        <!--          <div v-for="field in displayedFields" :key="field.name" class="field">-->
        <!--            <span class="field-name">{{ field.name }}:</span>-->
        <!--            <input :value="field.value" class="field-value"-->
        <!--                   @input="e => onChangeValue(field, (e.target as HTMLInputElement).value)" />-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
      <div class="buttons">
        <AppButton :disabled="isLoading || !arrAddFields.length && !arrDeleteFields.length && !arrEditFields.length"
                   class="defaultButtonTwo defaultButtonTwo__small" type="submit"
                   @click="onSubmit">
          {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
        </AppButton>
        <AppButton :disabled="isLoading" class="defaultButton defaultButton__small" type="submit"
                   @click="emit('close')">
          Закрыть
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
thead {
  z-index: 1;

  th {
    text-align: left;
  }
}

textarea {
  transform: translateY(2px);
}

tr {
  font-size: 16px;
  cursor: default;

  &:hover {
    background-color: transparent !important;
  }

  svg {
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  td {
    &:first-child {
      width: 30%;
    }
  }
}

.edit-fields {
  &__input {
    //border: none;
    background: transparent;
    border-radius: 0;
    outline: none;
    width: 100%;
    min-height: 55px;
    height: 55px;
    padding: 6px;
    font-size: 16px;
    resize: vertical;
  }

  &__edit {
    padding: 8px 4px !important;
  }
}

.edit-fields-modal-container {
  width: 100%;
  padding: 30px 24px;
  position: fixed;
  z-index: 300;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.4s ease;

  min-height: 400px;
  max-width: 700px;
  max-height: 600px;

  overflow: auto;

  display: flex;
  flex-direction: column;
  gap: 20px;

  &__content {
    overflow: auto;
    flex: 1;
  }

  .fields-container {
    flex: 1;

    display: flex;
    flex-direction: column;
    gap: 12px;

    .field {
      display: flex;
      flex-direction: row;
      gap: 10px;

      .field-name {
        flex: 1;
      }


      .field-value {
        flex: 2;
      }

      input {
        padding: 4px;
        outline: none;
        border: none;
      }
    }
  }

  .title {
    text-align: center;
    font-size: 20px;
    font-family: $Golos_Text_Medium;
    font-weight: 500;
    line-height: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;

    font-family: $Golos_Text_Regular;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;

    button {
      width: 100%;
      height: 40px;

      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
    }

    .edit-button {
      svg {
        transform: translate(0, -2px);
      }
    }
  }

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

  &__wrap {
    backdrop-filter: blur(4px);
    cursor: pointer;
    position: absolute;
    z-index: 11;
    right: 0;
    top: 0;
    height: 100%;
  }
}

.loading,
.error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #f44336;
}
</style>
