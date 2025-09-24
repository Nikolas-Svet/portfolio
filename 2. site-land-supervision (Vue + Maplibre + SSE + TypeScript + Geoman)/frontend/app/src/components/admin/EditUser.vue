<script lang="ts" setup>
import store from '@/store'
import { adminUsersApi } from '@/api/adminUsers'
import { dictsApi } from '@/api/dicts'
import type { IAdminUser, IRole, ITerritory } from '@/types/adminUsers'
import { Consts } from '@/consts/index.consts.ts'

const router = useRouter()

const userData = reactive(Array<{ title: string; name: string; value: any }>([] as any))
const user = ref<Partial<IAdminUser>>({})
const originalUser = ref<Partial<IAdminUser>>({})

const territoriesOptions = ref<ITerritory[]>([])
const rolesOptions = ref<IRole[]>([])
const reset_password = ref(false)

const selects = computed(() => [
  {
    id: 'teritories',
    label: 'Территории',
    options: territoriesOptions.value,
    model: user.value.teritories,
    multiple: true
  },
  { id: 'role', label: 'Роль', options: rolesOptions.value, model: user.value.role }
])

const sections = [
  { key: 'main', title: 'Основная информация' },
  { key: 'additional', title: 'Дополнительно' }
]

onMounted(async () => {
  const storeUser = store.getters['adminUsers/currentUser'] as IAdminUser
  if (storeUser) {
    user.value = { ...storeUser }
    originalUser.value = JSON.parse(JSON.stringify(storeUser))
    userData.splice(0, userData.length,
      { title: 'Фамилия', name: 'last_name', value: storeUser.last_name },
      { title: 'Имя', name: 'first_name', value: storeUser.first_name },
      { title: 'Отчество', name: 'father_name', value: storeUser.father_name },
      { title: 'Email', name: 'email', value: storeUser.email },
      { title: 'Username', name: 'username', value: storeUser.username }
    )
  }
  try {
    const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTerritories)
    const responseDictRoles = await dictsApi.getDict(Consts.DictsPrefixAPI.DictRoles)
    const ter = [...(responseDict.success ? responseDict.data : [])]
    const rol = [...(responseDictRoles.success ? responseDictRoles.data : [])]
    territoriesOptions.value = ter
    rolesOptions.value = rol
  } catch (e) {
    console.error('Ошибка загрузки словарей', e)
  }
})

function updateField({ id, value }: { id: string; value: any }) {
  const f = userData.find(x => x.name === id)
  if (f) f.value = value
  (user.value as any)[id] = value
}

function deepEquals(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function saveUser() {
  const changes: Partial<IAdminUser> = {}
  if (originalUser.value) {
    for (const key in user.value) {
      const newVal = (user.value as any)[key]
      const oldVal = (originalUser.value as any)[key]
      if (!deepEquals(newVal, oldVal)) {
        if (key === 'role') changes.id_role = newVal?.id
        else if (key === 'teritories') changes.teritories = newVal?.map((t: any) => t.id)
        else (changes as any)[key] = newVal
      }
    }
  }
  if (reset_password.value) changes.reset_password = true

  if (!/\S+@\S+\.\S+/.test(user.value.email || '')) {
    window.$notify('Некорректный формат email', true)
    return
  }

  if (user.value?.is_admin !== originalUser.value?.is_admin) changes.is_admin = user.value!.is_admin
  if (user.value?.is_sys_admin !== originalUser.value?.is_sys_admin) changes.is_sys_admin = user.value!.is_sys_admin

  const ok = await adminUsersApi.updateUser(changes as any, user.value.id!)
  if (ok) router.back()
  else window.$notify('Ошибка при сохранении', true)
}

function cancelEdit() {
  router.back()
}
</script>

<template>
  <AdminFormEditUser>
    <template v-for="section in sections" :key="section.key">
      <AdminFormSection :listTag="'div'" :title="section.title">

        <!-- Основная информация -->
        <div
          v-for="field in userData"
          v-if="section.key === 'main'"
          :key="field.name"
          class="input-box"
        >
          <label :for="field.name" class="form__label">{{ field.title }}</label>
          <AppInput
            :id="field.name"
            :name="field.name"
            :placeholder="field.title"
            :value="field.value"
            @input="updateField as any"
          />
        </div>

        <div
          v-for="sel in selects"
          v-else-if="section.key === 'additional'"
          :key="sel.id"
          class="input-box"
        >
          <label :for="sel.id" class="form__label">{{ sel.label }}</label>
          <div :style="sel.id === 'role' ? 'max-height:56px' : ''" class="angle__container">
            <v-select
              :id="sel.id"
              v-model="sel.model"
              :multiple="sel.multiple || false"
              :options="sel.options"
              class="select-multy"
              label="name"
            />
            <div v-for="n in 4" :key="n" class="angle"></div>
          </div>
        </div>
      </AdminFormSection>
    </template>
    <!-- Чекбоксы -->
    <div class="form__checkbox">
      <label class="form__label" for="reset_password">Сброс пароля</label>
      <div class="checkbox">
        <input id="reset_password" v-model="reset_password" type="checkbox" />
        <label for="reset_password"></label>
      </div>
    </div>
    <div class="form__checkbox">
      <label class="form__label" for="is_admin">Администратор</label>
      <div class="checkbox">
        <input id="is_admin" v-model="user.is_admin" type="checkbox" />
        <label for="is_admin"></label>
      </div>
    </div>
    <div class="form__checkbox">
      <label class="form__label" for="is_sys_admin">Системный администратор</label>
      <div class="checkbox">
        <input id="is_sys_admin" v-model="user.is_sys_admin" type="checkbox" />
        <label for="is_sys_admin"></label>
      </div>
    </div>

    <template #buttons>
      <AppButton class="defaultButtonTwo" @click="saveUser()">Сохранить</AppButton>
      <AppButton class="defaultButton" type="button" @click="cancelEdit">Отмена</AppButton>
    </template>
  </AdminFormEditUser>
</template>


<style lang="scss" scoped>
.angle {
  height: 7px;
  width: 7px;

  &__container {
    #vs1__combobox {
      width: 100% !important;
    }
  }
}

.form {
  .input-box {
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  --vs-line-height: 2.8 !important;

  &__label {
    font-family: $Golos_Text_Medium;
    font-size: 1rem;
  }

  &__checkbox {
    padding-left: 64px;
    display: flex;
    max-width: 244px;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
