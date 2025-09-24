<script lang="ts" setup>
import { dictsApi } from '@/api/dicts'
import { accessRightsApi } from '@/api/accessRights'
import { Consts } from '@/consts/index.consts.ts'

const roles = ref<any[]>([])
const groups = ref<any[]>([])
const current = ref<any>(null)
const deleteDelFlag = ref<boolean>(false)
const flagFetchUsers = ref<boolean>(false)
const selectedRoleFilter = ref<any | null>(null)
const selectedGroupsFilter = ref<any[]>([])
const localAccessRights = ref<any[]>([])

onMounted(async () => {
  try {
    flagFetchUsers.value = true
    const rolesData = await dictsApi.getDict(Consts.DictsPrefixAPI.DictRoles)
    roles.value = rolesData.success ? rolesData.data : []

    const groupsData = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTypesData)
    groups.value = groupsData.success ? groupsData.data : []

    await fetchAllAccessRights()
  } catch (error) {
    console.error('Ошибка при загрузке ролей/групп:', error)
  }
})

watch([selectedRoleFilter, selectedGroupsFilter], () => {
  fetchAllAccessRights()
})

const fetchAllAccessRights = async () => {
  try {
    localAccessRights.value = []
    flagFetchUsers.value = true
    const filter: Record<string, number[]> = {}

    if (selectedRoleFilter.value) {
      filter.id_role = [selectedRoleFilter.value.id]
    }
    if (selectedGroupsFilter.value.length) {
      filter.id_group = selectedGroupsFilter.value.map((g: any) => g.id)
    }

    const response = await accessRightsApi.getAllAccessRights(filter)
    const flattened: any[] = []
    response.forEach((roleItem: any) => {
      const rId = roleItem.id_role
      const arr = roleItem.access_right || []
      arr.forEach((acc: any) => {
        flattened.push({
          id_role: rId,
          id_group: acc.id_group,
          access_r: acc.access_r,
          access_w: acc.access_w,
          access_a: acc.access_a
        })
      })
    })

    localAccessRights.value = flattened
    flagFetchUsers.value = false
  } catch (error) {
    console.error('Ошибка при получении прав доступа:', error)
    localAccessRights.value = []
  }
}

const addAccessRow = () => {
  localAccessRights.value.unshift({
    isNew: true,
    _selectedRoleObj: null,
    _selectedGroupObj: null,
    access_r: false,
    access_w: false,
    access_a: false
  })
}

const deleteAccessRow = () => {
  localAccessRights.value.splice(current.value, 1)
  deleteDelFlag.value = false
}

const saveAccessRights = async () => {
  try {
    for (const item of localAccessRights.value) {
      if (item.isNew) {
        if (!item._selectedRoleObj || !item._selectedGroupObj) {
          ;(window as any).$notify(
            'Есть новая строка без роли или группы. Удалите её или заполните.',
            true
          )
          return
        }
        item.id_role = item._selectedRoleObj.id
        item.id_group = item._selectedGroupObj.id
        // isNew убираем
        delete item.isNew
        delete item._selectedRoleObj
        delete item._selectedGroupObj
      }
    }

    const mapByRole: Record<number, any[]> = {} // {roleId: [ {id_group, ...}, ... ], ...}
    for (const row of localAccessRights.value) {
      const roleId = row.id_role
      if (!mapByRole[roleId]) mapByRole[roleId] = []
      mapByRole[roleId].push({
        id_group: row.id_group,
        access_r: row.access_r,
        access_w: row.access_w,
        access_a: row.access_a
      })
    }

    const roleIds = Object.keys(mapByRole).map(Number) // массив ролей
    let hasError = false

    for (const roleId of roleIds) {
      const body = mapByRole[roleId]
      const response = await accessRightsApi.updateAccessRights(roleId, body)
      if (!response) {
        hasError = true
        console.error(`Ошибка при обновлении роли #${roleId}`)
      }
    }

    if (!hasError) {
      ;(window as any).$notify('Все права доступа успешно сохранены', true)
      await fetchAllAccessRights()
    } else {
      ;(window as any).$notify('Не все права удалось сохранить', true)
    }
  } catch (error) {
    console.error('Ошибка при сохранении прав доступа:', error)
    ;(window as any).$notify('Ошибка при сохранении прав доступа', true)
  }
}

const getGroupName = (id_group: number) => {
  const found = groups.value.find((g) => g.id === id_group)
  return found ? found.name : `Группа #${id_group}`
}

const getRoleName = (id_role: number) => {
  const found = roles.value.find((r) => r.id === id_role)
  return found ? found.name : `Роль #${id_role}`
}
</script>

<template>
  <div class="form">
    <AppAdminTitle title="Настройка прав доступа" />

    <!-- Фильтры -->
    <div
      class="form__item"
      style="
        padding: 0 64px;
        max-width: 750px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      "
    >
      <label class="form__label" for="roleFilter">Роль (фильтр, необязательно)</label>
      <div class="angle__container select__container" style="width: 100%; max-width: 420px">
        <v-select
          id="roleFilter"
          v-model="selectedRoleFilter"
          :options="roles"
          :placeholder="'Роли'"
          label="name"
        />
        <div class="angle"></div>
        <div class="angle"></div>
        <div class="angle"></div>
        <div class="angle"></div>
        <div v-if="selectedRoleFilter" class="icon-close" @click="selectedRoleFilter = null"></div>
      </div>
    </div>

    <div
      class="form__item"
      style="
        padding: 0 64px;
        max-width: 750px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      "
    >
      <label class="form__label" for="groupFilter"> Группа (фильтр, необязательно) </label>
      <div class="angle__container select__container" style="width: 100%; max-width: 420px">
        <v-select
          id="groupFilter"
          v-model="selectedGroupsFilter"
          :options="groups"
          :placeholder="'Группы'"
          label="name"
          multiple
        />
        <div class="angle"></div>
        <div class="angle"></div>
        <div class="angle"></div>
        <div class="angle"></div>
      </div>
    </div>
    <!-- Добавить правило -->
    <div style="padding: 0 64px; display: flex; gap: 16px; margin-bottom: 20px">
      <AppButton class="defaultButtonTwo" type="submit" @click="addAccessRow">
        Добавить правило
      </AppButton>
    </div>

    <!-- Таблица: Роль, Группа, (R/W/A), и кнопка удалить -->
    <div class="form__item" style="flex: 1; position: relative; margin-bottom: 0; overflow: auto">
      <table class="table">
        <thead>
        <tr>
          <th style="width: 50%">Роль</th>
          <th style="width: 50%">Группа</th>
          <th style="width: 100px">Чтение</th>
          <th style="width: 100px">Запись</th>
          <th style="width: 100px">Добавление</th>
          <th style="width: 100px">Действие</th>
          <!-- для кнопки Удалить -->
        </tr>
        </thead>
        <tbody>
        <!-- localAccessRights: [{id_role, id_group, access_r, access_w, access_a, isNew?}, ...] -->
        <tr v-for="(acc, idx) in localAccessRights" :key="acc.uid">
          <!-- Если это новое правило, даём возможность выбрать роль v-select -->
          <td v-if="acc.isNew">
            <div style="display: flex; justify-content: center">
              <v-select
                v-model="acc._selectedRoleObj"
                :options="roles"
                :placeholder="'Выберите роль'"
                class="select-new"
                label="name"
                style="width: 300px"
              />
            </div>
          </td>
          <td v-else>
            {{ getRoleName(acc.id_role) }}
          </td>

          <!-- Группа -->
          <td v-if="acc.isNew">
            <div style="display: flex; justify-content: center">
              <v-select
                v-model="acc._selectedGroupObj"
                :options="groups"
                :placeholder="'Выберите группу'"
                class="select-new"
                label="name"
                style="max-width: 700px"
              />
            </div>
          </td>
          <td v-else>
            {{ getGroupName(acc.id_group) }}
          </td>

          <!-- Чтение (R) -->
          <td>
            <div style="display: flex; justify-content: center">
              <div class="checkbox">
                <input :id="'access_r-' + idx" v-model="acc.access_r" type="checkbox" />
                <label :for="'access_r-' + idx"></label>
              </div>
            </div>
          </td>

          <!-- Запись (W) -->
          <td>
            <div style="display: flex; justify-content: center">
              <div class="checkbox">
                <input :id="'access_w-' + idx" v-model="acc.access_w" type="checkbox" />
                <label :for="'access_w-' + idx"></label>
              </div>
            </div>
          </td>

          <!-- Добавление (A) -->
          <td>
            <div style="display: flex; justify-content: center">
              <div class="checkbox">
                <input :id="'access_a-' + idx" v-model="acc.access_a" type="checkbox" />
                <label :for="'access_a-' + idx"></label>
              </div>
            </div>
          </td>

          <!-- Кнопка "Удалить" -->
          <td>
            <delete
              @click="current = idx; deleteDelFlag = true"
            ></delete>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <nav class="nav_">
      <AppButton
        class="defaultButtonTwo"
        type="submit"
        @click="saveAccessRights">
        Cохранить
      </AppButton>
      <AppButton class="defaultButton" type="button" @click="fetchAllAccessRights()">
        Отмена
      </AppButton>
    </nav>
    <AppLoader v-if="flagFetchUsers" styles="absolute" text="Загрузка прав доступа" />
  </div>
  <div v-if="deleteDelFlag" class="window" style="z-index: 103">
    <div class="window__delete">
      <p style="padding-bottom: 0; margin-bottom: 16px">Удалить правило?</p>
      <p style="padding: 0 50px; margin-bottom: 16px; font-size: 18px">
        Роль: <br />
        <span style="display: contents; font-size: 16px">{{
            getRoleName(localAccessRights[current].id_role)
          }}</span>
      </p>
      <p style="padding: 0 50px; margin-bottom: 16px; font-size: 18px">
        Группа: <br />
        <span style="display: contents; font-size: 16px">{{
            getGroupName(localAccessRights[current].id_group)
          }}</span>
      </p>
      <div class="window__delete-block">
        <button @click="deleteAccessRow()">Удалить</button>
        <button class="primary-color" @click="deleteDelFlag = false">Отменить</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.select-new {
  width: calc(100% - 64px);
}

td {
  text-wrap: wrap;
  text-align: left;
}

.angle {
  width: 7px;
  height: 7px;
}

.icon-close {
  z-index: 100;
  cursor: pointer;
  position: absolute;
  right: 20px;
  height: 30px;
  width: 30px;
  top: 50%;
  transform: translateY(-50%);
}

thead {
  z-index: 10;
}

tr {
  &:hover {
    background-color: transparent !important;
  }
}

.table th,
.table td {
  svg {
    height: 30px;
    width: 30px;
    cursor: pointer;
  }

  padding: 8px;
}

.form__item {
  margin-bottom: 20px;
}

.form__label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.nav_ {
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0 1.25rem;
  justify-content: end;
  margin-top: auto;
}

.form {
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__save {
    border: none;
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
