<template>
  <div v-if="authFlag" id="sign-up" class="sign-up__content">
    <div>
      <div class="sign-up__angle"></div>
      <div class="sign-up__angle"></div>
      <div class="sign-up__angle"></div>
      <div class="sign-up__angle"></div>
    </div>
    <section class="sign-up">
      <h1>Регистрация</h1>
      <div class="sign-up__steps">
        <div style="cursor: pointer" @click="first_stage = true; second_stage = false"
             :class="{'sign-up__fill': !first_stage, 'sign-up__hover': first_stage}" class="sign-up__step">
          Шаг 1
          <checkIcon />
        </div>
        <div :class="{'sign-up__inactive': !second_stage, 'sign-up__hover': second_stage}" class="sign-up__step">
          Шаг 2
          <checkIcon />
        </div>
      </div>
      <div v-if="second_stage" class="sign-up__container-input">
        <span>Логин</span>
        <input
          v-model="signUpData.username"
          :class="{ filled: signUpData.username, invalid: flags.username }"
          placeholder=""
          type="text"
        />
      </div>
      <div v-if="second_stage" class="sign-up__container-input">
        <span>Пароль</span>
        <input
          v-model="signUpData.password"
          :class="{ filled: signUpData.password, invalid: flags.password }"
          placeholder=""
          type="password"
        />
      </div>
      <div v-if="second_stage" class="sign-up__container-input">
        <span>Повторите пароль</span>
        <input
          v-model="repeatPassword"
          :class="{ filled: repeatPassword, invalid: !repeatPassword && flags.password }"
          placeholder=""
          type="password"
        />
      </div>
      <div v-if="first_stage" class="sign-up__container-input">
        <span>Фамилия</span>
        <input
          v-model="signUpData.first_name"
          :class="{ filled: signUpData.first_name, invalid: flags.first_name }"
          placeholder=""
          type="text"
        />
      </div>
      <div v-if="first_stage" class="sign-up__container-input">
        <span>Имя</span>
        <input
          v-model="signUpData.last_name"
          :class="{ filled: signUpData.last_name, invalid: flags.last_name }"
          placeholder=""
          type="text"
        />
      </div>
      <div v-if="first_stage" class="sign-up__container-input">
        <span>Отчество</span>
        <input
          v-model="signUpData.father_name"
          :class="{ filled: signUpData.father_name, invalid: flags.father_name }"
          placeholder=""
          type="text"
        />
      </div>
      <div v-if="second_stage" class="sign-up__container-input">
        <span>Почта</span>
        <input
          v-model="signUpData.email"
          :class="{ filled: signUpData.email, invalid: flags.email }"
          placeholder=""
          type="text"
        />
      </div>

      <router-link v-if="first_stage" to="/sign-in/">Назад</router-link>

      <div v-if="FlagError" class="sign-up__error-box">{{ textError }}</div>
      <div>
        <button v-if="first_stage" id="default-button" class="sign-up--next"
                @click="nextStage()">
          Следующий шаг
          <arrowIcon />
        </button>
        <button v-if="second_stage" id="default-button" class="orange-button sign-up--accept" @click="register()">
          Регистрация
        </button>
      </div>
    </section>
  </div>
  <section v-else :class="['notification', { exit: authFlag }]">
    <check></check>
    <p>Вы успешно зарегистрировались</p>
  </section>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import check from '@/components/icons/check.vue'
import checkIcon from '@/assets/icons/check.svg'
import arrowIcon from '@/assets/icons/arrow.svg'
import { authApi } from '@/api/auth.ts'
import { ISignUpData } from '@/types/auth.ts'

const router = useRouter()

const first_stage = ref(true)
const second_stage = ref(false)

const repeatPassword = ref<string | null>(null)
const signUpData = reactive(<ISignUpData>{
  username: null as string | null,
  email: null as string | null,
  last_name: null as string | null,
  first_name: null as string | null,
  father_name: null as string | null,
  password: null as string | null
})
const flags = reactive({
  username: false,
  email: false,
  last_name: false,
  first_name: false,
  father_name: false,
  password: false
})
const FlagError = ref(false)
const textError = ref('')
const authFlag = ref(true)

const nextStage = () => {
  FlagError.value = false
  textError.value = ''

  flags.first_name = !signUpData.first_name
  flags.last_name = !signUpData.last_name
  flags.father_name = !signUpData.father_name

  if (flags.first_name || flags.last_name || flags.father_name) {
    FlagError.value = true
    textError.value = 'Заполните все поля'
    return
  }

  first_stage.value = false
  second_stage.value = true
}


const register = async () => {
  try {
    Object.keys(flags).forEach((key) => {
      flags[key as keyof typeof flags] = !signUpData[key as keyof typeof signUpData]
    })

    if (Object.values(flags).includes(true)) {
      FlagError.value = true
      textError.value = 'Заполните все поля'
      return
    }

    if (repeatPassword.value !== signUpData.password) {
      textError.value = 'Пароли не совпадают'
      FlagError.value = true
      return
    }

    const responseSignup = await authApi.signUp(signUpData)

    if (responseSignup.success) {
      authFlag.value = false
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
    } else if (responseSignup.message) {
      textError.value = responseSignup.message
      FlagError.value = true
    } else {
      textError.value = 'Ошибка при попытке зарегистрироваться'
      FlagError.value = true
    }
  } catch (e) {
    console.error('Ошибка запроса:', e)
  }
}
</script>

<style lang="scss" scoped>
.exit {
  display: none !important;
}

.notification {
  max-width: 1074px;
  width: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  svg {
    width: 40%;
  }

  p {
    margin-top: 32px;
    font-size: 64px;
    font-weight: 800;
  }
}

.filled {
  background-color: transparent !important;
}

.sign-up {
  padding: 32px 58px;
  display: flex;
  flex-direction: column;

  &__steps {
    display: flex;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 12px;
    margin-bottom: 32px;
  }

  &__step {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 32px;
    font-family: $Golos_Text_Medium;
    font-weight: 500;
    font-size: 20px;

    svg {
      width: 20px;
      height: 20px;
      margin-bottom: -10px;
      margin-left: 8px;
    }
  }

  a {
    width: fit-content;
    display: inline-block;
    font-size: 14px;
    margin-bottom: 14px;
    cursor: pointer;
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


  &__container-input {
    display: flex !important;
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }

  &__content {
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

  h1 {
    font-family: $Golos_Text_Medium;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 20px;
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
    margin-bottom: 25px;
    background-color: transparent;
    font-size: 18px;

    &:focus {
      transition: all 0.1s ease;
    }
  }

  &--next {
    svg {
      width: 30px;
      height: 16px;
      margin-left: 8px;
      margin-bottom: -1px;
    }
  }

  a {
    display: inline-block;
    font-size: 14px;
    margin-bottom: 14px;
    cursor: pointer;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      text-align: center;
    }

    button {
      margin-top: 17px;
      cursor: pointer;
      width: 100%;
      font-size: 20px;
      border: none;
      border-radius: 0;
      height: 60px;
    }
  }
}
</style>
