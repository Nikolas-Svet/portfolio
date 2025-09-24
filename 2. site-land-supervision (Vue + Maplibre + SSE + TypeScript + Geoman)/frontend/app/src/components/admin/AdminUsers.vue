<script lang="ts" setup>
import deleteIcon from '@/assets/icons/delete.svg'
import restoreIcon from '@/assets/icons/restore.svg'
import { adminUsersApi } from '@/api/adminUsers'
import type { IAdminUser } from '@/types/adminUsers'
import store from '@/store'
import { dictsApi } from '@/api/dicts'
import { Consts } from '@/consts/index.consts'

const blockUsers = ref<IAdminUser[]>([])
const restoreUsers = ref<IAdminUser[]>([])

const formattedBlockUsers = computed(() =>
  blockUsers.value
    .map(user =>
      user.last_name + ' ' + user.first_name[0] + '. ' + user.father_name[0] + '.  '
    )
    .join(', ')
)

const formattedRestoreUsers = computed(() =>
  restoreUsers.value
    .map(user =>
      user.last_name + ' ' + user.first_name[0] + '. ' + user.father_name[0] + '.  '
    )
    .join(', ')
)

function addBlockUser(user: IAdminUser) {
  const idx = users.value.indexOf(user)
  if (idx !== -1) {
    users.value[idx].is_active = false
  }
  blockUsers.value = [...blockUsers.value, user]
}

function addRestoreUser(user: IAdminUser) {
  const idx = users.value.indexOf(user)
  if (idx !== -1) {
    users.value[idx].is_active = true
  }
  restoreUsers.value = [...restoreUsers.value, user]
}

function resetBlockUser(user: IAdminUser) {
  const idx2 = users.value.indexOf(user)
  if (idx2 !== -1) {
    users.value[idx2].is_active = true
  }
  const idx = blockUsers.value.indexOf(user)
  if (idx !== -1) {
    blockUsers.value.splice(idx, 1)
  }
}

function resetRestoreUser(user: IAdminUser) {
  const idx2 = users.value.indexOf(user)
  if (idx2 !== -1) {
    users.value[idx2].is_active = false
  }
  const idx = restoreUsers.value.indexOf(user)
  if (idx !== -1) {
    restoreUsers.value.splice(idx, 1)
  }
}

const users = ref<IAdminUser[]>([])
const tableThead = {
  status: 'Статус',
  last_name: 'Фамилия',
  first_name: 'Имя',
  father_name: 'Отчество',
  email: 'Электронная почта',
  teritories: 'Территории',
  is_role: 'Роль',
  actions: 'Действие'
}

const flagFetchUsers = ref(false)

interface Filters {
  name: string
  is_admin: boolean
  is_sys_admin: boolean
  selectedRole: any | null
  selectedTerritory: any | null
}

const filters = ref<Filters>({
  name: '',
  is_admin: false,
  is_sys_admin: false,
  selectedRole: null,
  selectedTerritory: null
})

const sortedAndFilteredUsers = computed<IAdminUser[]>(() => {
  let list = filterUsers(users.value, filters.value)
  if (sortBy.value) list.sort(compareUsers)
  return list
})

const rolesOptions = ref<any[]>([])
const territoriesOptions = ref<any[]>([])

const sortableColumns = ['status', 'last_name', 'first_name', 'father_name', 'email']
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const selectedIndex = ref<number>(-1)

const router = useRouter()

const fetchUsers = async () => {
  flagFetchUsers.value = true
  restoreUsers.value = []
  blockUsers.value = []
  users.value = await adminUsersApi.getUsers()
  flagFetchUsers.value = false
  return
}

const fetchRestoreUsers = async () => {
  flagFetchUsers.value = true
  if (blockUsers.value.length > 0) {
    for (const user of blockUsers.value) {
      const res = await adminUsersApi.updateUser({ is_active: user.is_active } as any, user.id)
      if (res) {
        const msg = user.is_active ? 'разблокирован' : 'заблокирован'
        ;(window as any).$notify(`Пользователь ${user.last_name} ${msg}`, true)
      } else {
        (window as any).$notify(`Ошибка при изменении статуса пользователя ${user.last_name}`, true)
      }
    }
  }
  if (restoreUsers.value.length > 0) {
    for (const user of restoreUsers.value) {
      const res = await adminUsersApi.updateUser({ is_active: user.is_active } as any, user.id)
      if (res) {
        const msg2 = user.is_active ? 'разблокирован' : 'заблокирован'
        ;(window as any).$notify(`Пользователь ${user.last_name} ${msg2}`, true)
      } else {
        (window as any).$notify(`Ошибка при изменении статуса пользователя ${user.last_name}`, true)
      }
    }
  }
  await fetchUsers()
  return
}

const width = ref(window.innerWidth)

function updateWidth() {
  width.value = window.innerWidth
}

onMounted(async () => {
  window.addEventListener('resize', updateWidth)
  window.addEventListener('keydown', handleKeydown)
  try {
    await fetchUsers()

    const stored = localStorage.getItem('password')
    if (stored) {
      setTimeout(() => {
        const pass = JSON.parse(stored)
        ;(window as any).$notify(pass, false)
        setTimeout(() => localStorage.removeItem('password'), 100)
      }, 100)
    }
    const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTerritories)
    const responseDictRole = await dictsApi.getDict(Consts.DictsPrefixAPI.DictRoles)

    const roles = [...(responseDictRole.success ? responseDictRole.data : [])]
    const territories = [...(responseDict.success ? responseDict.data : [])]
    rolesOptions.value = roles
    territoriesOptions.value = territories
    flagFetchUsers.value = false
  } catch (e) {
    console.error('Ошибка при загрузке пользователей:', e)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
  window.removeEventListener('keydown', handleKeydown)
})

function onRowClick(index: number, user: IAdminUser) {
  selectedIndex.value = index
  goToEditUser(user)
}

async function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (blockUsers.value.length > 0 || restoreUsers.value.length > 0) {
      await fetchRestoreUsers()
    }
    return
  } else if (e.key === 'Escape') {
    e.preventDefault()
    if (blockUsers.value.length > 0 || restoreUsers.value.length > 0) {
      await fetchUsers()
    }
    return
  }

  const total = sortedAndFilteredUsers.value.length
  if (!total) return

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = selectedIndex.value < 0 ? total - 1 : (selectedIndex.value - 1 + total) % total
      scrollToSelected()
      break

    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = selectedIndex.value < 0 ? 0 : (selectedIndex.value + 1) % total
      scrollToSelected()
      break
    //
    // case 'Delete':
    // case 'Backspace':
    //   if (selectedIndex.value >= 0) {
    //     e.preventDefault()
    //     currentUser.value = sortedAndFilteredUsers.value[selectedIndex.value]
    //     deleteDelFlag.value = true
    //     action.value = !currentUser.value!.is_active
    //   }
    //   break
  }
}

function scrollToSelected() {
  nextTick(() => {
    const vm = getCurrentInstance()?.proxy as any
    const rows = vm.$refs.userRows as HTMLElement[] | HTMLElement | undefined
    if (Array.isArray(rows) && rows[selectedIndex.value]) {
      rows[selectedIndex.value].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else if (rows instanceof HTMLElement) {
      rows.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

function filterUsers(list: IAdminUser[], f: Filters): IAdminUser[] {
  let res = [...list]
  if (f.name.trim()) {
    const s = f.name.toLowerCase()
    res = res.filter(u => (`${u.last_name} ${u.first_name} ${u.father_name}`.toLowerCase()).includes(s))
  }
  if (f.is_admin) res = res.filter(u => u.is_admin)
  if (f.is_sys_admin) res = res.filter(u => u.is_sys_admin)
  if (f.selectedRole) res = res.filter(u => u.id_role === f.selectedRole.id)
  if (f.selectedTerritory) res = res.filter(u => u.teritories?.some(t => t.id === f.selectedTerritory.id))
  return res
}

function setSort(column: string) {
  if (!sortableColumns.includes(column)) return
  if (sortBy.value === column) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

function compareUsers(a: IAdminUser, b: IAdminUser): number {
  let valA: any, valB: any
  switch (sortBy.value) {
    case 'status':
      valA = a.is_active ? 1 : 0
      valB = b.is_active ? 1 : 0
      break
    case 'last_name':
      valA = a.last_name || ''
      valB = b.last_name || ''
      break
    case 'first_name':
      valA = a.first_name || ''
      valB = b.first_name || ''
      break
    case 'father_name':
      valA = a.father_name || ''
      valB = b.father_name || ''
      break
    case 'email':
      valA = a.email || ''
      valB = b.email || ''
      break
    default:
      return 0
  }
  if (typeof valA === 'string') {
    valA = valA.toLowerCase()
    valB = valB.toLowerCase()
  }
  return valA < valB ? (sortOrder.value === 'asc' ? -1 : 1) : valA > valB ? (sortOrder.value === 'asc' ? 1 : -1) : 0
}

function goToEditUser(user: IAdminUser) {
  store.dispatch('adminUsers/SET_CURRENT_USER', user)
  router.push({ path: Consts.ROUTES.ADMIN_USER_EDIT + user.id })
}
</script>

<template>
  <section class="users">
    <AppAdminTitle title="Пользователи" />

    <UserFilters
      :model-value="filters"
      @update:modelValue="newVal => Object.assign(filters, newVal)"
      :roles-options="rolesOptions"
      :territories-options="territoriesOptions"
    />

    <div class="outer-wrapper">
      <div :style="{marginBottom: (blockUsers.length > 0 || restoreUsers.length > 0) ? '83px' : '0'}"
           class="table-wrapper">
        <table v-if="sortedAndFilteredUsers.length" class="table">
          <thead>
          <tr>
            <th @click="setSort('status')">
              {{ tableThead.status }}
              <span v-if="sortBy === 'status'" :class="sortOrder" class="arrow"></span>
            </th>
            <th v-if="width <= 1660" @click="setSort('last_name')">
              ФИО
            </th>
            <th v-if="width > 1660" @click="setSort('last_name')">
              {{ tableThead.last_name }}
              <span v-if="sortBy === 'last_name'" :class="sortOrder" class="arrow"></span>
            </th>
            <th v-if="width > 1660" @click="setSort('first_name')">
              {{ tableThead.first_name }}
              <span v-if="sortBy === 'first_name'" :class="sortOrder" class="arrow"></span>
            </th>
            <th v-if="width > 1660" @click="setSort('father_name')">
              {{ tableThead.father_name }}
              <span v-if="sortBy === 'father_name'" :class="sortOrder" class="arrow"></span>
            </th>
            <th @click="setSort('email')">
              {{ tableThead.email }}
              <span v-if="sortBy === 'email'" :class="sortOrder" class="arrow"></span>
            </th>
            <th>{{ tableThead.teritories }}</th>
            <th>{{ tableThead.is_role }}</th>
            <th>{{ tableThead.actions }}</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(user, index) in sortedAndFilteredUsers"
            :key="user.id"
            ref="userRows"
            :class="[
                { users__blocked: !user.is_active },
                { 'row-selected': index === selectedIndex },
                {'add-layer-in-group__inactive': blockUsers.includes(user) || restoreUsers.includes(user)}
              ]"
            @click="onRowClick(index, user)"
          >
            <td>{{ user.is_active ? 'Активен' : 'Заблокирован' }}</td>
            <td v-if="width <= 1660">
              {{ user.last_name + ' ' + user.first_name[0] + '. ' + user.father_name[0] + '.' }}
            </td>
            <td v-if="width > 1660">{{ user.last_name }}</td>
            <td v-if="width > 1660">{{ user.first_name }}</td>
            <td v-if="width > 1660">{{ user.father_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              {{ user.teritories ? user.teritories.map((t) => t.name).join(', ') : '' }}
            </td>
            <td>
              {{ user.is_sys_admin ? 'Суперпользователь' : '' }}
              {{ user.is_admin && user.is_sys_admin ? ', ' : '' }}
              {{ user.is_admin ? 'Администратор' : '' }}
              {{
                user.is_admin && rolesOptions.find((role) => role.id === user.id_role)?.name
                  ? ', '
                  : ''
              }}
              {{ rolesOptions.find((role) => role.id === user.id_role)?.name || '' }}
            </td>
            <td>
              <deleteIcon v-if="!restoreUsers.includes(user) && user.is_active"
                          @click.stop="addBlockUser(user)" />
              <deleteIcon v-else-if="restoreUsers.includes(user) && user.is_active"
                          @click.stop="resetRestoreUser(user)" />
              <restoreIcon v-else-if="!blockUsers.includes(user) && !user.is_active" style="height: 24px; width: 24px"
                           @click.stop="addRestoreUser(user)" />
              <restoreIcon v-else-if="blockUsers.includes(user) && !user.is_active" style="height: 24px; width: 24px"
                           @click.stop="resetBlockUser(user)" />
            </td>
          </tr>
          </tbody>
        </table>
        <div v-else class="empty-users">
          <p>Нет пользователей по заданным критериям</p>
        </div>

        <AppLoader v-if="flagFetchUsers" styles="absolute" text="Загрузка пользователей" />
      </div>
    </div>

    <div :class="{nav__active: blockUsers.length > 0 || restoreUsers.length > 0}" class="nav_">
      <div :style="{opacity: blockUsers.length > 0 ? '1' : '0'}" class="numbers">
        <span>Заблокированные пользователи:</span>
        {{ formattedBlockUsers }}
      </div>
      <div :style="{opacity: restoreUsers.length > 0 ? '1' : '0'}" class="numbers">
        <span>Разблокированные пользователи:</span>
        {{ formattedRestoreUsers }}
      </div>
      <AppButton :disabled="blockUsers.length === 0 && restoreUsers.length === 0" class="defaultButtonTwo"
                 @click="fetchRestoreUsers()">Применить
      </AppButton>
      <AppButton :disabled="blockUsers.length === 0 && restoreUsers.length === 0" class="defaultButton"
                 @click="fetchUsers()">Отменить
      </AppButton>
    </div>
  </section>
</template>

<style scoped lang="scss">

.outer-wrapper {
  overflow: auto;

  thead {
    z-index: 1;
  }
}

.numbers {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  span {
    text-wrap: nowrap;
    margin-right: 8px;
  }
}

td {
  cursor: pointer;
  transition: all 0.3s ease;
  text-wrap: wrap;
  white-space: wrap !important;

  svg {
    width: 20px;
    height: 20px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.nav_ {
  grid-template-columns: 1fr 1fr;
  width: calc(100% - 400px);
  position: fixed;
  opacity: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease,
  opacity 0.3s ease 0s !important;
}

.nav__active {
  opacity: 1;
  transform: translateY(0) !important;
}

.row-selected {
  transition: background-color 0.15s ease;
}

.arrow {
  display: inline-block;
  margin-left: 6px;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);

  .asc {
    transform: rotate(225deg);
  }

  .desc {
    transform: rotate(45deg);
  }
}

.users {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  --vs-line-height: 1.90 !important;
}

.empty-users {
  text-align: center;
  margin-top: 20px;
  font-size: 18px;
  opacity: 0.8;
}

.users__blocked {
  opacity: 0.8;
  pointer-events: none;

  td:last-child {
    pointer-events: auto;
  }
}
</style>
