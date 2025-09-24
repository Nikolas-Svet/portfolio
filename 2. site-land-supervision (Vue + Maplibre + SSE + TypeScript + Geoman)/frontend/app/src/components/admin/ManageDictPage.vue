<script lang="ts" setup>
import { dictsPages } from '@/config/dictsPages'
import { dictsApi } from '@/api/dicts'

const route = useRoute()

const deleteDelFlag = ref(false)

const flagFetchDict = ref(false)

const selected_row = ref<any>(null)

const namePage = route.params.name_page as string

const flagLoader = ref<boolean>(false)

const deleteAccessRow = async () => {
  try {
    await dictsApi.deleteDict(config!.type_dict, selected_row.value.id)

    deleteDelFlag.value = false

    ;(window as any).$notify(`Строка ${selected_row.value.name} удалена`, true)
    selected_row.value = null
    await loadItems()
  } catch (error) {
    console.error('Ошибка при удалении:', error)
  }
}

watch(
  () => route.params.name_page,
  () => {
    window.location.reload()
  }
)

const config = namePage ? dictsPages.find((cfg) => cfg.name_page === namePage) : null

const items = ref<any[]>([])

onMounted(() => {
  flagLoader.value = true
  if (config) {
    loadItems()
  }
  flagLoader.value = false
})

const loadItems = async () => {
  try {
    items.value = []

    flagFetchDict.value = true
    const responseDict = await dictsApi.getDict(config!.type_dict)
    const data = responseDict.success ? responseDict.data : []
    items.value = data.map((obj: any) => ({
      local_id: 'row-' + obj.id,
      editing: false,
      isNew: false,
      ...obj
    }))
    flagFetchDict.value = false
  } catch (err) {
    console.error('Ошибка:', err)
  }
}

const startEdit = (item: any) => {
  item.editing = true
}

const cancelEdit = (item: any) => {
  item.editing = false
  // Можно loadItems() заново или хранить "original"
}

const deleteItem = async (item: any, index: number) => {
  if (!config?.is_delete) return

  if (!item.id) {
    items.value.splice(index, 1)
    return
  }

  deleteDelFlag.value = true
  selected_row.value = item
}

const addNewItem = () => {
  if (!config) return
  const newObj: any = {
    local_id: 'row-new-' + Date.now(),
    id: 0,
    isNew: true,
    editing: true
  }
  for (const col of config.table) {
    const fieldName = col.name_variable.trim()
    newObj[fieldName] = ''
  }
  items.value.push(newObj)
}

const saveAll = async () => {
  if (!config) return
  try {
    for (const item of items.value) {
      if (!item.editing && !item.isNew) continue

      const dataToSend: Record<string, any> = {}
      for (const col of config.table) {
        const key = col.name_variable.trim()
        dataToSend[key] = item[key]
      }

      if (item.isNew) {
        console.log(config)
        if (config.type) {
          dataToSend['type'] = config.type
        }
        const resp = await dictsApi.createDict(config.type_dict, dataToSend)
        console.log('Создано:', resp)
        if (resp && resp.id) {
          item.id = resp.id
        }
        item.isNew = false
        item.editing = false
      } else {
        if (!item.id) continue
        const resp = await dictsApi.updateDict(config.type_dict, item.id, dataToSend)
        console.log('Обновлено:', resp)
        item.editing = false
      }
    }
    (window as any).$notify('Все изменения сохранены', true)
    await loadItems()
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    (window as any).$notify('Ошибка при сохранении', true)
  }
}
</script>

<template>
  <section class="form">
    <AppAdminTitle :title="config?.name" />

    <AppButton class="form__save" type="submit" @click="addNewItem"> Добавить строку</AppButton>

    <!-- Если конфигурация не найдена -->
    <div v-if="!config">
      <p>Не найдено описание страницы "{{ namePage }}"</p>
    </div>

    <div v-else style="display: flex; flex-direction: column; flex: 1; overflow: auto">
      <div style="flex: 1; position: relative">
        <AppTable>
          <template #THeader>
            <thead>
            <tr>
              <th v-for="(col, cindex) in config.table" :key="cindex">
                {{ col.name_column }}
              </th>
              <th v-if="config.is_delete">Действие</th>
            </tr>
            </thead>
          </template>

          <template #TBody>
            <tbody>
            <tr v-for="(item, index) in items" :key="item.local_id">
              <td
                v-for="(col, cindex) in config.table"
                :key="cindex"
                style="text-wrap: wrap;"
              >
                <template v-if="item.editing">
                  <input
                    v-model="item[col.name_variable]"
                    class="table__input"
                    type="text"
                  />
                </template>
                <template v-else>
                  {{ item[col.name_variable] }}
                </template>
              </td>

              <td v-if="config.is_delete">
                <delete style="margin-right: 16px" @click="deleteItem(item, index)" />
                <template v-if="!item.editing">
                  <edit @click="startEdit(item)" />
                </template>
                <template v-else>
                  <edit @click="cancelEdit(item)" />
                </template>
              </td>
            </tr>
            </tbody>
          </template>
        </AppTable>
      </div>
      <nav class="nav_">
        <AppButton class="defaultButtonTwo" type="submit" @click="saveAll"> Сохранить</AppButton>
        <AppButton class="defaultButton" type="button" @click="loadItems"> Отмена</AppButton>
      </nav>
    </div>
    <AppLoader v-if="flagLoader" styles="absolute" text="Загрузка типа данных" />
  </section>
  <div v-if="deleteDelFlag" class="window" style="z-index: 103">
    <div class="window__delete">
      <p style="padding-bottom: 0; margin-bottom: 16px">Удалить правило {{ selected_row.name }}?</p>
      <div class="window__delete-block">
        <button @click="deleteAccessRow()">Удалить</button>
        <button class="primary-color" @click="deleteDelFlag = false">Отменить</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

td {
  text-align: left;
}

.nav_ {
  width: 100%;
  padding: 16px 32px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0 1.25rem;
  justify-content: end;
  margin-top: auto;
  position: sticky;
  bottom: 0;
  right: 0;
}

.form {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  svg {
    height: 30px;
    width: 30px;
    cursor: pointer;
  }

  &__label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  &__item {
    margin-bottom: 20px;
  }

  &__save {
    border: none;
    margin-bottom: 32px;
    margin-left: 64px;
  }

  &__loader {
    flex: 1;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;

    span {
      font-family: $Golos_Text_Medium;
    }
  }
}
</style>
