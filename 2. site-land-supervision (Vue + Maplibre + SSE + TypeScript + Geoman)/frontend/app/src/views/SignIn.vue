<template>
  <div id="sign-in" class="sign-in__content">
    <div>
      <div class="sign-in__angle"></div>
      <div class="sign-in__angle"></div>
      <div class="sign-in__angle"></div>
      <div class="sign-in__angle"></div>
    </div>
    <section class="sign-in">
      <h1>Авторизация</h1>
      <div class="sign-in__container-input">
        <span>Логин</span>
        <input
          v-model="authData.login"
          :class="[{ filled: authData.login }]"
          placeholder=""
          type="text"
          @keyup.enter="login()"
        />
      </div>
      <div class="sign-in__container-input">
        <span>Пароль</span>
        <input
          v-model="authData.password"
          :class="[{ filled: authData.password, error: FlagErrorPassword }]"
          placeholder=""
          type="password"
          @keyup.enter="login()"
        />
      </div>
      <nav class="sign-in__actions">
        <router-link :to="Consts.ROUTES.AUTH_RESET_PASSWORD">Восстановление пароля</router-link>
        <router-link to="/sign-up">Регистрация</router-link>
      </nav>
      <div v-if="FlagError" class="sign-in__error-box">Неверный логин или пароль</div>
      <div v-if="FlagErrorBlock" class="sign-in__error-box">Пользователь заблокирован</div>
      <div v-if="FlagErrorPassword" class="sign-in__error-box">Введите пароль</div>
      <div>
        <button id="default-button" class="orange-button" @click="login()">Войти</button>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { Consts } from '@/consts/index.consts.ts'

const router = useRouter()
const API_URL = inject<string>('API_URL')

const authData = ref<{ login: string | null; password: string | null }>({
  login: null,
  password: null
})
const loader = ref(false)
const FlagError = ref(false)
const FlagErrorPassword = ref(false)
const FlagErrorBlock = ref(false)

const login = async () => {
  if (await auth()) {
    await router.push('/desktops/')
  }
}

const auth = async () => {
  FlagErrorBlock.value = false
  FlagError.value = false

  if (!authData.value.password) {
    FlagError.value = false
    FlagErrorPassword.value = true
    return false
  }

  try {
    loader.value = true

    const response = await fetch(`${API_URL}${Consts.API_PREFIX}auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: authData.value.login || '',
        password: authData.value.password,
        scope: '',
        client_id: '',
        client_secret: ''
      })
    })

    if (!response.ok) {
      const errorResponse = await response.json()
      FlagError.value = true
      FlagErrorPassword.value = false
      console.error(errorResponse.error || 'Failed to obtain token')
    }

    const data = await response.json()
    if (data === 'Данный пользователь заблокирован') {
      FlagErrorBlock.value = true
      return false
    }
    if (data.access_token) {
      const token = data.access_token
      localStorage.setItem('token', token)
      document.dispatchEvent(new Event('userLoggedIn'))
      // await router.push('/desktops/')
      return true
    } else {
      console.error('Token not found in response')
      return false
    }
  } catch (e) {
    console.error(e)
    return false
  } finally {
    loader.value = false
  }
}
</script>

<style lang="scss" scoped>
.sign-in {
  padding: 32px 65px 32px 65px;
  display: flex;
  flex-direction: column;


  &__container-input {
    display: flex !important;
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }

  &__angle {
    width: 18px;
    height: 18px;
    position: absolute;

    &:first-child {
      left: -1px;
      top: -1px;
      transform: rotate(90deg);
    }

    &:nth-child(2) {
      right: -1px;
      top: -1px;
      transform: rotate(-180deg);
    }

    &:nth-child(3) {
      left: -1px;
      bottom: -1px;
    }

    &:last-child {
      right: -1px;
      bottom: -1px;
      transform: rotate(-90deg);
    }
  }

  &__content {
    //background: url("@/assets/images/background.svg");
    background-size: cover;
    width: 100%;
    position: relative;

    &:after,
    &:before {
      content: '';
      display: block;
      width: 80%;
      height: 2px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    &:after {
      top: -1px;
    }

    &:before {
      bottom: -1px;
    }
  }

  &__actions {
    display: flex !important;
    align-items: flex-start !important;
    flex-direction: column;
  }

  h1 {
    font-family: $Golos_Text_Medium;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 51px;
  }

  &__error-box {
    text-align: center;
    height: 60px;
    margin-top: 20px;
    border-radius: 0;
  }

  input {
    height: 60px;
    width: 100%;
    outline: none;
    padding: 20px 16px;
    margin-bottom: 30px;
    background-color: transparent;
    font-size: 18px;

    &:focus {
      transition: all 0.1s ease;
    }
  }

  a {
    width: fit-content;
    display: inline-block;
    font-size: 14px;
    margin-bottom: 14px;
    cursor: pointer;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;

    button {
      margin-top: 18px;
      cursor: pointer;
      width: 100%;
      border: none;
      font-size: 20px;
      border-radius: 0;
      height: 60px;
      letter-spacing: 0.7px;
    }
  }
}
</style>
