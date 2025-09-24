import { mount } from '@vue/test-utils'
import SignIn from '@/views/SignIn.vue'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

const USER_TEST_NOT_VALID = {
  login: 'user-test',
  password: 'user-test'
}
const USER_TEST_VALID = {
  login: 'nikita',
  password: 'nikita2004'
}

describe('SignIn.vue — поэтапный лог: авторизоваться', () => {
  it('Сценарий: введен неправильный пароль', async () => {
    const wrapper = mount(SignIn, {
      global: {
        provide: { API_URL: import.meta.env.VITE_API_URL }
      }
    })

    await nextTick()
    await nextTick()

    const vm = wrapper.vm as any

    const signIn = wrapper.find('.sign-in')
    expect(signIn.exists()).toBe(true)

    console.log('Компонент SignIn найден')

    const login = wrapper.find('input[type="text"]')
    expect(login.exists()).toBe(true)
    console.log('Форма для логина найдена')

    const password = wrapper.find('input[type="password"]')
    expect(password.exists()).toBe(true)
    console.log('Форма для пароля найдена')

    await login.setValue(USER_TEST_NOT_VALID.login)
    expect(vm.authData.login).toBe(USER_TEST_NOT_VALID.login)

    await password.setValue(USER_TEST_NOT_VALID.password)
    expect(vm.authData.password).toBe(USER_TEST_NOT_VALID.password)
    console.log('Форма заполнена')

    const sendButton = wrapper.find('#default-button')
    expect(sendButton.exists()).toBe(true)
    console.log('Кнопка найдена')

    const responseAuth = await vm.auth()
    await nextTick()
    console.log('Проверка не валидного пользователя', responseAuth)
    expect(responseAuth).toBe(false)


    await login.setValue(USER_TEST_VALID.login)
    expect(vm.authData.login).toBe(USER_TEST_VALID.login)

    await password.setValue(USER_TEST_VALID.password)
    expect(vm.authData.password).toBe(USER_TEST_VALID.password)
    console.log('Форма заполнена')

    const responseAuthValid = await vm.auth()
    await nextTick()
    console.log('Проверка валидного пользователя', responseAuthValid)
    expect(responseAuthValid).toBe(true)

    // expect(responseAuth).toBe(true)
  })
})