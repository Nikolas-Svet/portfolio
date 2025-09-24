<script setup lang="ts">
import { layersApi } from '@/api/layers'
import deleteIcon from '@/assets/icons/delete.svg'
import restoreIcon from '@/assets/icons/restore.svg'
import SelectionAllLayers from '@/components/app/admin/AdminEditGroupForLayers/selectionAllLayers.vue'

const props = defineProps<{
  currentIdGroup: number
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:currentIdGroupUpdate', val: number): void
}>()


const layers = ref<any[]>([])
const layers_for_selection = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const deleteLayersInGroup = ref(<any[]>([]))

async function fetchLayers(groupId: number) {
  if (!groupId) {
    layers.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    const data = await layersApi.getVectorLayers({ id_dict_type_data: [groupId] })
    const data2 = await layersApi.getRasterLayers({ id_dict_type_data: [groupId] })
    layers.value = [
      ...data,
      ...data2
    ]
    console.log(layers.value)
  } catch (err: any) {
    console.error('Ошибка при загрузке слоёв:', err)
    error.value = 'Не удалось загрузить слои'
  } finally {
    loading.value = false
  }
}

const resetDeleteLayer = (layer: any): void => {
  const idx = deleteLayersInGroup.value.indexOf(layer)
  if (idx !== -1) {
    deleteLayersInGroup.value.splice(idx, 1)
  }
}

watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await fetchData()
  }
}, { deep: true })

const addMode = ref(false)
const selectedToAdd = ref<number[]>([])
const selecteNameToAdd = ref<any[]>([])

async function addLayersMode() {
  addMode.value = true
}

function onSelectLayers(ids: number[]) {
  selectedToAdd.value = ids
  addMode.value = false
  selecteNameToAdd.value = layers_for_selection.value
    .filter(l => selectedToAdd.value.some(id => id === l.id))
}

function cancelAdd() {
  selectedToAdd.value = []
  deleteLayersInGroup.value = []
  addMode.value = false
  emit('update:currentIdGroupUpdate', -1)
}

async function confirmAdd() {
  if (deleteLayersInGroup.value.length > 0) {
    for (let i = 0; i < deleteLayersInGroup.value.length; i++) {
      let id_dict_type = deleteLayersInGroup.value[i].id_dict_types_data?.filter((id: any) => id !== props.currentIdGroup)
      const params = {
        id: deleteLayersInGroup.value[i].id,
        id_dict_type_data: id_dict_type
      }
      await layersApi.updateVectorLayer(params)
      continue
    }
    deleteLayersInGroup.value = []
  }

  if (selecteNameToAdd.value.length > 0) {
    for (let i = 0; i < selecteNameToAdd.value.length; i++) {
      selecteNameToAdd.value[i].id_dict_types_data.push(props.currentIdGroup)
      const params = {
        id: selecteNameToAdd.value[i].id,
        id_dict_type_data: selecteNameToAdd.value[i].id_dict_types_data
      }
      await layersApi.updateVectorLayer(params)
      continue
    }
    selecteNameToAdd.value = []
    selectedToAdd.value = []
  }

  await fetchData()
}

async function fetchData() {
  await fetchLayers(props.currentIdGroup)

  const response = await layersApi.getVectorLayers({})
  const response2 = await layersApi.getRasterLayers({})
  layers_for_selection.value = [...response, ...response2]
  layers_for_selection.value = layers_for_selection.value
    .filter(l => !layers.value.some(layer => layer.id === l.id))
  return
}
</script>

<template>
  <div class="add-layer-in-group">
    <div class="add-layer-in-group__left">
      <AppTable class="w-full">
        <template #THeader>
          <thead>
          <tr>
            <th>Название слоя</th>
            <th>Действие</th>
          </tr>
          </thead>
        </template>

        <template #TBody>
          <tbody>
          <tr v-if="loading">
            <td colspan="2">Загрузка слоёв…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="2">{{ error }}</td>
          </tr>
          <tr v-else-if="layers.length === 0">
            <td colspan="2">Слои не найдены</td>
          </tr>
          <tr v-else v-for="layer in layers" :key="layer.id"
              :class="{'add-layer-in-group__inactive': deleteLayersInGroup.includes(layer)}">
            <td>{{ layer.name }}</td>
            <td>
              <deleteIcon v-if="!deleteLayersInGroup.includes(layer)" @click="deleteLayersInGroup.push(layer)" />
              <restoreIcon @click="resetDeleteLayer(layer)" style="height: 24px; width: 24px" v-else />
            </td>
          </tr>
          </tbody>
        </template>
      </AppTable>
    </div>
    <div class="add-layer-in-group__right">
      <AppButton
        class="defaultButton"
        v-if="!addMode"
        @click="addLayersMode">
        Добавить слои
      </AppButton>

      <selection-all-layers
        v-if="addMode"
        :layers="layers_for_selection"
        @select-layers="onSelectLayers"
        @close="addMode = false"
        @update:selectionLayerFlag="addMode = false"
      />

      <div class="selected-preview">
        <h4 v-if="!addMode && selectedToAdd.length">К добавлению:</h4>
        <ul :style="{opacity: (!addMode && selectedToAdd.length) ? '1' : '0'}">
          <li v-for="l in selecteNameToAdd" :key="l.id">
            {{ l.name }}
          </li>
        </ul>
        <div>
          <AppButton
            @click="cancelAdd"
            style="margin-right: 16px;"
            class="defaultButton"
          >Отменить
          </AppButton>
          <AppButton
            @click="confirmAdd"
            class="defaultButtonTwo"
            :disabled="!selectedToAdd.length && !deleteLayersInGroup.length"
          >Сохранить
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.selected-preview {
  padding: 16px 0 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  h4 {
    font-size: 18px;
    font-family: $Golos_Text_Medium;
    margin-bottom: 8px;
  }

  ul {
    list-style-type: none;
    padding: 16px;
    flex: 1;
    margin-bottom: 16px;

    li {
      font-family: $Golos_Text_Regular;
      margin-bottom: 8px;
    }
  }
}

td {
  text-wrap: wrap;
  text-align: left;
}

.add-layer-in-group {
  width: 100%;
  display: flex;
  height: 100%;
  max-height: 500px;

  &__inactive {
  }

  &__left {
    width: 50%;
    overflow: auto;

    tr {
      background-color: transparent !important;
      transition: all 0.3s ease;
    }

    th {
      &:last-child {
        width: 20%;
      }
    }

    td {
      &:last-child {
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 24px;
          height: 24px;
          cursor: pointer;
          transition: opacity 0.3s ease;

          &:hover {
            opacity: 0.7;
          }
        }
      }
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    padding: 16px;
    width: 50%;
  }
}
</style>