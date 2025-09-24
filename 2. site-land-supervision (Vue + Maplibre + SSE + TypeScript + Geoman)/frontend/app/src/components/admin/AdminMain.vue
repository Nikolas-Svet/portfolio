<script lang="ts" setup>
import store from '@/store'
import { user } from '@/store/actions/user'
import type { IUserFormData } from '@/types/user'
import { Consts } from '@/consts/index.consts.ts'

const sections = computed(() => [
  {
    title: 'Основная информация',
    listTag: 'div',
    fields: userData.map(f => ({
      id: f.name,
      label: f.title,
      value: f.value,
      type: 'text',
      onInput: (e: { value: any }) => {
        f.value = e.value
      }
    }))
  },
  {
    title: 'Пароль',
    listTag: 'div',
    fields: [
      {
        id: 'new-password',
        label: 'Новый пароль',
        value: newPass.value,
        type: 'password',
        onInput: (e: { value: any }) => {
          newPass.value = String(e.value)
        }
      },
      {
        id: 'confirm-password',
        label: 'Подтверждение пароля',
        value: confirmPass.value,
        type: 'password',
        onInput: (e: { value: any }) => {
          confirmPass.value = String(e.value)
        }
      }
    ]
  },
  {
    title: 'Введите пароль для изменения данных',
    listTag: 'div',
    fields: [
      {
        id: 'password',
        label: 'Текущий пароль',
        value: password.value,
        type: 'password',
        onInput: (e: { value: any }) => {
          password.value = String(e.value)
        }
      }
    ]
  }
])

const userData = reactive<IUserFormData['userData']>([])
const password = ref<string>('')
const newPass = ref<string>('')
const confirmPass = ref<string>('')

function initForm() {
  const u = store.state.user.user
  userData.splice(0, userData.length,
    { title: 'Фамилия', value: u.last_name, name: 'last_name' },
    { title: 'Имя', value: u.first_name, name: 'first_name' },
    { title: 'Отчество', value: u.father_name, name: 'father_name' },
    { title: 'Электронная почта', value: u.email, name: 'email' },
    { title: 'Username', value: u.username, name: 'username' }
  )
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  store.commit(user.decode, token)
  initForm()
})

async function saveSettings() {
  if (!password.value) {
    window.$notify(Consts.ErrorMessages.AdminEnterPassword, true)
    return
  }
  if (newPass.value && !confirmPass.value) {
    window.$notify(Consts.ErrorMessages.AdminAcceptPassword, true)
    return
  }
  if (newPass.value !== confirmPass.value) {
    window.$notify(Consts.ErrorMessages.AdminNotValidatePassword, true)
    return
  }
  for (const el of userData) {
    if (el.name !== 'father_name' && el.value === '') {
      window.$notify(Consts.ErrorMessages.AdminNotValidate, true)
      return
    }
  }
  const body: Partial<Record<string, any>> = {}
  userData.forEach(el => {
    body[el.name] = el.value
  })
  body.old_password = password.value
  if (newPass.value && confirmPass.value) body.new_password = newPass.value
  await store.dispatch(user.updateSettings, body)
  newPass.value = ''
  confirmPass.value = ''
  password.value = ''
}
</script>

<template>
  <AdminFormEditUser @submit="saveSettings">
    <AdminAvatar />

    <template v-for="section in sections" :key="section.title">
      <AdminFormSection :title="section.title" :listTag="section.listTag as any">
        <div
          v-for="field in section.fields"
          :key="field.id"
          class="input-box"
        >
          <label
            :for="field.id"
            class="form__label"
          >
            {{ field.label }}
          </label>
          <AppInput
            :id="field.id"
            :name="field.id"
            :value="field.value"
            :type="field.type"
            @input="field.onInput"
          />
        </div>
      </AdminFormSection>
    </template>

    <template #buttons>
      <AppButton class="defaultButtonTwo" type="submit">
        Сохранить
      </AppButton>
    </template>

  </AdminFormEditUser>
</template>

<style scoped lang="scss">
.form {
  .input-box {
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__label {
    font-family: $Golos_Text_Medium;
    font-size: 1rem;
  }
}
</style>
