<template>
  <div id="reset-password" class="reset-password__content">
    <section class="sign-in reset-password">
      <h1>Сброс пароля</h1>

      <template v-if="!isResetStage">
        <InputField
          v-model="form.login"
          label="Логин"
          @enter="onSubmit"
        />

        <div v-if="captchaImage" class="captcha">
          <img
            :src="captchaImage"
            alt="картинка капчи"
            @click="loadCaptcha"
          />
          <input
            v-model="form.captcha"
            placeholder=""
            type="text"
            @keyup.enter="onSubmit"
          />
        </div>
      </template>

      <template v-else>
        <InputField
          v-model="form.newPassword"
          label="Новый пароль"
          type="password"
          @enter="onSubmit"
        />
        <InputField
          v-model="form.repeatPassword"
          label="Повтор пароля"
          type="password"
          @enter="onSubmit"
        />
      </template>

      <div v-if="error" class="reset-password__notification sign-in__error-box">{{ error }}</div>
      <div v-if="success" class="reset-password__notification sign-in__success-box">{{ success }}</div>

      <nav v-if="!isResetStage" class="reset-password__actions">
        <router-link :to="Consts.ROUTES.AUTH_SIGN_IN">Назад</router-link>
      </nav>

      <button class="reset-password__action orange-button" @click="onSubmit">
        Сбросить пароль
      </button>
    </section>
    <div v-for="i in 4" :key="i" class="reset-password__angle angle" />
  </div>
</template>

<script lang="ts" setup>
import { authApi } from '@/api/auth'
import { useCaptcha } from '@/composables/useCaptcha'
import { Consts } from '@/consts/index.consts'

interface Form {
  login: string
  captcha: string
  newPassword: string
  repeatPassword: string
}

const route = useRoute()
const router = useRouter()

const isResetStage = computed(() =>
  Boolean(route.query.username && route.query.reset_token)
)

const form = reactive<Form>({
  login: '',
  captcha: '',
  newPassword: '',
  repeatPassword: ''
})

const { id: captchaId, image: captchaImage, load: loadCaptcha } = useCaptcha()

const error = ref<string>('')
const success = ref<string>('')

onMounted(() => {
  if (!isResetStage.value) {
    loadCaptcha()
  }
})

async function onSubmit() {
  error.value = success.value = ''

  if (!isResetStage.value) {
    console.log(form)
    if (!form.login || !form.captcha) {
      error.value = !form.login ? 'Введите логин' : 'Введите капчу'
      return
    }

    const res = await authApi.forgotPassword(
      form.login,
      form.captcha,
      captchaId.value
    )
    if (res.success) {
      success.value = res.data
    } else {
      error.value = res.data ?? (res.error as string)
      form.captcha = ''
      await loadCaptcha()
    }

  } else {
    if (!form.newPassword || form.newPassword !== form.repeatPassword) {
      error.value = form.newPassword
        ? 'Пароли не совпадают'
        : 'Заполните все поля'
      return
    }
    const username = String(route.query.username)
    const resetToken = String(route.query.reset_token)

    const res = await authApi.resetPassword(
      resetToken,
      username,
      form.newPassword
    )
    if (res.success) {
      success.value = res.data
      setTimeout(() => {
        router.push(Consts.ROUTES.AUTH_SIGN_IN)
      }, 2000)
    } else {
      error.value = res.data ?? (res.error as string)
    }
  }
}
</script>

<style lang="scss">
.captcha {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    cursor: pointer;
    width: 60%;
  }

  input {
    height: 100%;
    margin-bottom: 0 !important;
    max-width: 40%;
  }
}

.reset-password {
  padding: 32px 65px 32px 65px;
  display: flex;
  flex-direction: column;

  &__notification {
    padding: 16px 8px;
    margin-bottom: 16px;
  }

  &__action {
    margin-top: 18px;
    cursor: pointer;
    width: 100%;
    border: none;
    font-size: 20px;
    border-radius: 0;
    height: 60px;
    letter-spacing: 0.7px;
  }

  &__angle {
    width: 18px;
    height: 18px;
    position: absolute;
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
}
</style>
