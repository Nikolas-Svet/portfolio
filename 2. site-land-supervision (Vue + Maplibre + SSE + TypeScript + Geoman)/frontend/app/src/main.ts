import { createApp } from 'vue'
import { router } from '@/router/router'
import App from './App.vue'
import './assets/styles/main.css'
import store from './assets/scripts/store'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import vSelect from 'vue-select'
import notification from '@/components/app/notification.vue'

const app = createApp(App)

function initNotifications() {
  const currentPath = window.location.pathname
  if (['/sign-in', '/sign-up'].includes(currentPath)) {
    console.log('Уведомления отключены на странице:', currentPath)
    return
  }

  const mainLayout = document.querySelector('.darkTheme') || document.querySelector('.lightTheme')
  if (!mainLayout) {
    console.error('Ошибка: Не найден контейнер `.darkTheme` или `.lightTheme`!')
    return
  }

  let notificationContainer = mainLayout.querySelector('.notificationContainer')
  if (notificationContainer) {
    notificationContainer.remove()
  }

  notificationContainer = document.createElement('div')
  notificationContainer.className = 'notificationContainer'
  mainLayout.appendChild(notificationContainer)

  if ((window as any).$notificationInstance) {
    delete (window as any).$notificationInstance
  }

  const notificationInstance = createApp(notification).mount(notificationContainer) as any
  ;(window as any).$notificationInstance = notificationInstance

  window.$notify = (text: string, autoClose: boolean) => {
    if (typeof notificationInstance?.showNotification === 'function') {
      notificationInstance.showNotification(text, autoClose)
    } else {
      console.warn('showNotification не найден в `notificationInstance`.')
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initNotifications, 200) // Даем 200 мс на загрузку
})

document.addEventListener('userLoggedIn', () => {
  setTimeout(initNotifications, 200) // Даем 200 мс на загрузку страницы
})

window.addEventListener('popstate', () => {
  setTimeout(initNotifications, 200)
})

app.use(store)
app.use(router)
app.provide('API_URL', import.meta.env.VITE_API_URL as string)
app.component('VueDatePicker', VueDatePicker)
app.component('ColorPicker', ColorPicker)
app.component('vSelect', vSelect as any)

function decodeToken(token: string): any {
  return JSON.parse(atob(token.split('.')[1]))
}

function checkTokenExpiration(): void {
  const token = localStorage.getItem('token')
  if (token) {
    const { exp } = decodeToken(token)
    const expirationTime = exp * 1000
    const currentTime = Date.now()

    if (expirationTime <= currentTime) {
      console.warn('Токен истек, нужно обновить')
      handleTokenExpiration()
    } else {
      const timeUntilExpiration = expirationTime - currentTime
      setTimeout(handleTokenExpiration, timeUntilExpiration)
    }
  } else {
    console.warn('Токен не найден в локальном хранилище')
  }
}

function handleTokenExpiration(): void {
  console.log('⛔️ Токен истек. Выполняем выход.')

  localStorage.removeItem('currentDesktop')
  localStorage.removeItem('token')

  // ✅ Отключаем SSE при истечении токена
  if ((window as any).$sseInstance) {
    ;(window as any).$sseInstance.disconnect()
    delete (window as any).$sseInstance
  }

  router.push('/sign-in')
}

checkTokenExpiration()

app.mount('#app')
