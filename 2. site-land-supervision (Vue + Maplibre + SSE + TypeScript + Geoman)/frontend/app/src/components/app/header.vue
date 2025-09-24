<template>
  <header class="header">
    <div class="header__container">
      <router-link class="header__logo" to="/">
        <logo style="min-width: 60px"></logo>
        <h1>
          Система управления мониторингом состояния объектов жилищно-коммунального хозяйства
          (теплотрасс, благоустройства (газоны, парки, городские леса), зданий (кровля, фасады), в
          части модуля земельного надзора
        </h1>
      </router-link>
      <router-link :class="{header__desktopsActive: $route.path === '/desktops/'}" class="header__link header__desktops"
                   to="/desktops/">
        <desktops style="margin-right: 9px"></desktops>
        <span class="transition-span"> Рабочие области </span>
      </router-link>
      <router-link :class="{header__documentsActive: $route.path === '/documents/'}" class="header__link"
                   to="/documents/">
        <documents></documents>
        <span class="transition-span"> Мои документы </span>
      </router-link>
      <div
        :style="{ 'pointer-events': $route.path === '/' ? 'auto' : 'none' }"
        class="header__link header__search"
        style="overflow: visible"
      >
        <input
          v-if="$route.path === '/'"
          ref="searchInput"
          v-model="cityName"
          class="search-input"
          placeholder="Поиск по карте"
          @click="flagSearchUl = true"
          @input="fetchCitySuggestions"
        />
        <span
          v-if="cityName !== '' && $route.path === '/'"
          class="icon-close"
          @click="clearCityName()"
        ></span>
        <search v-if="$route.path === '/'"></search>
        <ul v-if="flagSearchUl && cityName !== '' && $route.path === '/'" class="suggestions-list">
          <li :class="{ 'suggestions-list__active': flagSearch }" @click="flagSearch = !flagSearch">
            Поиск по кадастровому номеру
          </li>

          <li
            v-for="(suggestion, index) in filteredSuggestions"
            v-if="flagSearch"
            :key="index"
            :class="{ active: index === activeIndex }"
            @click="selectSuggestionFiltered(suggestion)"
          >
            {{ suggestion.num_egrn }}
          </li>

          <div v-if="flagSearch && flagLoader" class="layer-list__loader">
            <span class="loader"></span>
          </div>

          <li
            v-for="(suggestion, index) in suggestions"
            v-if="!flagSearch"
            :key="index"
            :class="{ active: index === activeIndex }"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion.name }}
          </li>

          <p v-if="filteredSuggestions.length === 0 && flagSearch && !flagLoader"
             style="text-align: center; padding: 16px 0; font-size: 16px">Ничего
            не найдено</p>
        </ul>

      </div>
      <div class="header__navBlock__right">
        <div class="header__navBlock__user">
          <router-link style="margin-right: 16px" :to="Consts.ROUTES.ADMIN">
            <img class="header__img" v-if="iconUrl" :src="iconUrl" alt="">
            <user v-else></user>
          </router-link>
          <div style="text-transform: none">
            {{
              userData.last_name +
              ' ' +
              userData.first_name[0] +
              '. ' +
              userData.father_name[0] +
              '.'
            }}

            <span v-if="userData.is_sys_admin">Суперпользователь</span>
            <span v-else-if="userData.is_admin">Администратор</span>
          </div>
        </div>
        <div class="header__navBlock__logos">
          <div class="header__navBlock__right-logo" @click="logoutUser()">
            <logout></logout>
          </div>
          <div class="header__navBlock__right-logo" @click="toggleTheme">
            <theme></theme>
          </div>
        </div>
      </div>
    </div>
  </header>

  <tools :flag-tools="flagTools" @show_tools="showTools"></tools>
  <work_area :flag-work-area="flagWorkArea" @show_work_area="showWorkArea"></work_area>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import tools from '@/components/app/tools/tools.vue'
import work_area from '@/components/app/work_area.vue'
import { jwtDecode } from 'jwt-decode'
import { useDark, useToggle } from '@vueuse/core'
import logo from '@/components/icons/logo.vue'
import theme from '@/components/icons/theme.vue'
import desktops from '@/components/icons/desktops.vue'
import Documents from '@/components/icons/documents.vue'
import search from '@/components/icons/search.vue'
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import User from '@/components/icons/user.vue'
import Logout from '@/components/icons/logout.vue'
import { defaultApi } from '@/api/default.ts'
import { ISearch } from '@/types/default.ts'
import { searchActions } from '@/store/actions/search.ts'
import { user } from '@/store/actions/user.ts'
import { userApi } from '@/api/user.ts'
import { Consts } from '@/consts/index.consts.ts'

interface UserData {
  first_name: string
  last_name: string
  father_name: string
  is_admin: boolean
  is_sys_admin: boolean
}


const flagSearch = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const suggestionsSearch = ref<ISearch[]>([])

const cityName = ref('')
const suggestions = ref<Array<{ name: string; coordinates: [number, number] }>>([])

const flagSearchUl = ref(true)
const flagLoader = ref(false)

const handleClickOutside = (event: any) => {
  const dropdown = document.querySelector('.header__search')
  if (dropdown && !dropdown.contains(event.target)) {
    flagSearchUl.value = false
  }
}

watch(
  () => store.state.user.user,
  () => {
    updateUserData()
  },
  { deep: true }
)

const iconUrl = ref<string>('')

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  try {
    const blob = await userApi.getIcon()
    console.log('blob', blob)
    iconUrl.value = URL.createObjectURL(blob)
  } catch {
    // можно уведомить об ошибке
  }
  updateUserData()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const userData = ref<UserData>({
  first_name: '',
  last_name: '',
  father_name: '',
  is_admin: false,
  is_sys_admin: false
})
const flagTools = ref(false)
const flagWorkArea = ref(false)
const authUser = ref<boolean | null>(null)

const updateUserData = async () => {
  console.log('updateUserData')
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = jwtDecode<{ sub: string }>(token)
    const parsedUserData = JSON.parse(decodedToken.sub) as UserData
    const rawUserData = toRaw(parsedUserData)
    console.log('rawUserData', rawUserData)

    function capitalizeFirstLetter(str: string) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    }

    nextTick(() => {
      userData.value = {
        first_name: capitalizeFirstLetter(rawUserData.first_name),
        last_name: capitalizeFirstLetter(rawUserData.last_name),
        father_name: capitalizeFirstLetter(rawUserData.father_name),
        is_admin: rawUserData.is_admin,
        is_sys_admin: rawUserData.is_sys_admin
      }
    })
    authUser.value = true
  } else {
    authUser.value = false
  }
}

const clearCityName = () => {
  cityName.value = ''
}

const toggleTheme = () => {
  toggleDark()
}

const filteredSuggestions = computed(() => {
  const uniqueNumEgrn = new Set()
  return suggestionsSearch.value.filter((suggestion) => {
    if (uniqueNumEgrn.has(suggestion.num_egrn)) {
      return false
    } else {
      uniqueNumEgrn.add(suggestion.num_egrn)
      return true
    }
  })
})

const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('currentDesktop')
  router.push('/sign-in')
}

const showTools = (value: boolean) => {
  flagTools.value = value
}

const showWorkArea = () => {
  flagWorkArea.value = !flagWorkArea.value
}

const fetchCitySuggestions = async () => {

  suggestionsSearch.value = []

  if (
    cityName.value.split(':').length > 1
  ) {
    if (cityName.value.split(':').length > 2) {
      flagSearch.value = true
    }
    flagLoader.value = true
    const response = await defaultApi.search(cityName.value)
    suggestionsSearch.value = response.map((search: any) => ({
      geojson: JSON.stringify(search.geojson),
      ...search
    }))
    flagLoader.value = false
  }

  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  debounceTimeout.value = setTimeout(async () => {
    if (!cityName.value) {
      suggestions.value = []
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName.value)}&format=json&limit=5&accept-language=ru`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your.email@example.com)'
          }
        }
      )

      if (!response.ok) {
        console.error(`Ошибка HTTP: ${response.status}`)
        suggestions.value = []
        return
      }

      const data = await response.json()
      suggestions.value = data.map((item: any) => ({
        name: item.display_name || '',
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number]
      }))
    } catch (error) {
      console.error('Ошибка при получении предложений городов:', error)
      suggestions.value = []
    }
  }, 300)
}

const selectSuggestionFiltered = (suggestion: any) => {
  const matchingSuggestions = suggestionsSearch.value.filter(
    (item) => item.num_egrn === suggestion.num_egrn
  )

  store.dispatch(searchActions.setSuggestions, matchingSuggestions)
}

const selectSuggestion = (suggestion: any) => {
  cityName.value = suggestion.name
  suggestions.value = []
  store.dispatch(`layersMain/${layersMainActions.setCoord}`, suggestion.coordinates)
}

const activeIndex = ref(-1) // Индекс активного элемента
const searchInput = ref<HTMLInputElement | null>(null) // Ссылка на input

// Обработчик нажатий клавиш (Enter, стрелки)
const handleKeydown = (event: KeyboardEvent) => {
  if (!flagSearchUl.value) return

  const currentList = flagSearch.value ? filteredSuggestions.value : suggestions.value

  if (event.key === 'ArrowDown') {
    // Перемещаемся вниз по списку
    activeIndex.value = (activeIndex.value + 1) % currentList.length
    event.preventDefault()
  } else if (event.key === 'ArrowUp') {
    // Перемещаемся вверх по списку
    activeIndex.value = (activeIndex.value - 1 + currentList.length) % currentList.length
    event.preventDefault()
  } else if (event.key === 'Enter') {
    // Выбираем текущий элемент, если он есть
    if (activeIndex.value !== -1 && currentList.length > 0) {
      if (flagSearch.value) {
        selectSuggestionFiltered(currentList[activeIndex.value])
      } else {
        selectSuggestion(currentList[activeIndex.value])
      }
      flagSearchUl.value = false // Закрываем список после выбора
      activeIndex.value = -1 // Сбрасываем активный индекс
    }
  }
}

watch(
  () => store.state.user.flag_update,
  async () => {
    try {
      const blob = await userApi.getIcon()
      console.log('blob', blob)
      iconUrl.value = URL.createObjectURL(blob)
      await store.dispatch(user.updatePhoto, false)
    } catch {
      // можно уведомить об ошибке
    }
  },
  { deep: true }
)

// Добавляем обработчик событий клавиатуры на input
onMounted(() => {
  searchInput.value?.addEventListener('keydown', handleKeydown)
})

// Убираем обработчик при размонтировании компонента
onBeforeUnmount(() => {
  searchInput.value?.removeEventListener('keydown', handleKeydown)
})

</script>

<style lang="scss" scoped>
.suggestions-list li.active {
  background-color: #e3e3e3;
}

.layer-list {
  thead {
    transform: translateY(-0.1px);
  }

  tbody {
    tr {
      cursor: pointer;
    }
  }

  &__loader {
    margin-top: 8px;
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__wrap {
    position: fixed;
    width: 100%;
    inset: 0;
    height: 100%;
    z-index: 111;
  }
}

.icon-close {
  right: 24px !important;
}

.suggestions-list {
  margin: 0;
  padding: 0;
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  width: 100%;
  list-style: none;
  background: #212121;
  border-left: 1px solid rgb(104, 104, 104);
  border-right: 1px solid rgb(104, 104, 104);
  border-bottom: 1px solid rgb(104, 104, 104);
  max-height: 200px;
  overflow-y: auto;
}

.suggestions-list li {
  padding: 5px;
  cursor: pointer;
}

.suggestions-list li:hover {
  opacity: 0.8;
}

#search {
  * {
    fill: transparent !important;
  }
}

.search-input {
  padding-right: 32px;
  padding-left: 45px;
  background-color: transparent;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  outline: none;
  border: none;
  font-size: 20px;

  &::placeholder {
    font-family: $Golos_Text_Medium;
    font-size: 20px;
  }
}

.inactive {
  justify-content: right !important;

  span {
    display: none;
  }

  a {
    &:last-child {
      margin-left: 50px;
    }
  }
}

.active {
  color: #d68166;
}

#search {
  position: absolute;
  left: 24px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 102;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__img {
    height: 45px;
    width: 45px;
    border-radius: 50%;

    &:hover {
      opacity: 0.8;
    }
  }

  &__search {
    flex: 1 !important;

    * {
      transition: all 0.3s ease !important;
    }

    input {
      padding-left: 37px;

      &::placeholder {
        transition: all 0.3s ease !important;
        font-size: 20px;
        line-height: 1.2;
      }
    }

    &:hover {
      * {
        transition: all 0.3s ease;
      }
    }
  }

  &__logo {
    max-width: calc(473px + $width-panel);
    width: 100%;
    padding: 0 21px;

    text-align: left;
    display: flex;
    font-size: 36px !important;
    font-weight: 400;
    cursor: pointer;
    text-decoration: none;
    justify-content: space-between;
    align-items: center;

    svg {
      width: 60px;
    }

    h1 {
      font-family: 'PTSansCaption', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.2;
      max-width: 825px;
      margin-left: 16px;
    }

    &:hover {
      opacity: 0.9;
    }
  }

  &__container {
    width: 100%;
    display: flex;

    a,
    span {
      cursor: pointer;
      font-size: 20px;
      font-weight: 300;
      text-decoration: none;
    }
  }

  &__navBlock {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;

    &__left {
      max-width: 550px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      a,
      span {
        cursor: pointer;
        font-size: 20px;
        font-weight: 300;
        text-decoration: none;

        &:hover {
          opacity: 0.8;
          transition: all 0.3s ease;
        }
      }
    }

    &__logos {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 120px;
      width: 100%;
    }

    &__user {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 150px;
      width: 100%;

      div {
        text-transform: lowercase;
        display: flex;
        flex-direction: column;
        cursor: default;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        span {
          margin-top: 2px;
          font-size: 14px;
        }
      }
    }

    &__right {
      justify-content: space-between;
      width: 25%;
      max-width: 450px;
      display: flex;
      align-items: center;
      justify-self: end;
      padding: 0 21px;

      span {
        &:hover {
          opacity: 1 !important;
        }
      }

      #user {
        cursor: pointer;
        transition: all 0.3s ease;

        * {
          transition: all 0.3s ease;
          stroke: #afafaf;
        }

        &:hover {
          * {
            transition: all 0.3s ease;
            stroke: $primary-color_2 !important;
          }
        }
      }

      &-logo {
        cursor: pointer;
        display: flex;
        height: 40px;
        width: 45px;
        border-radius: 50%;
        align-items: center;
        justify-content: center;

        &:hover {
          transition: all 0.3s ease;
          opacity: 0.9;

          svg {
            * {
              transition: all 0.3s ease;
              fill: $primary-color_2 !important;
            }
          }
        }

        svg {
          height: 20px;
          width: 20px;

          * {
            transition: all 0.3s ease;
            fill: #afafaf !important;
          }
        }
      }
    }
  }

  &__link {
    position: relative;
    width: 13%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-right: none !important;

    &:hover {
      transition: all 0.3s ease;
      background-color: $primary-hover;

      span {
        transition: all 0.3s ease;
        color: $primary-color_2;
      }

      svg {
        * {
          transition: all 0.3s ease;
          fill: $primary-color_2;
        }
      }
    }

    span {
      font-size: 20px;
      line-height: 1.2;
      transition: all 0.3s ease;
    }

    svg {
      min-width: 16px;
      margin-right: 12px;
      transition: all 0.3s ease;

      * {
        fill: $primary-white;
      }
    }
  }
}

@media (width < 1900px) {
  .header {
    height: 80px;

    &__link {
      span {
        font-size: 17px;
      }
    }

    &__container {
      height: 79px;
    }

    &__search {
      input {
        &::placeholder {
          transform: translateY(0);
          font-size: 17px;
        }
      }
    }

    &__navBlock {
      &__right {
        width: 20%;
      }

      &__user {
        span,
        div {
          font-size: 15px;
        }
      }

      &__logos {
        max-width: 100px;
      }
    }
  }
}

@media (width < 1705px) {
  .header {
    &__desktopsActive {
      width: 245px !important;

      span {
        clip-path: inset(0 0 0 0) !important;
        transition: none !important;
      }

      svg {
        margin-right: 12px !important;
      }

      .icon-documents {
        min-width: 30px;
        transition: transform 0.3s ease !important;
        left: 40px;
      }

      .transition-span {
        transform: translateY(2px);
        transition: none !important;
      }
    }

    &__documentsActive {
      width: 230px !important;

      span {
        clip-path: inset(0 0 0 0) !important;
        transition: none !important;
      }

      svg {
        margin-right: 12px !important;
      }

      .icon-desktop {
        min-width: 30px;
        transition: transform 0.3s ease !important;
        left: 40px;
      }

      .transition-span {
        transform: translateY(2px);
        transition: none !important;
      }
    }

    &__desktops {
      &:hover {
        width: 245px !important;
      }
    }

    &__link {
      width: 80px;
      display: flex;
      align-items: center;
      justify-content: right;
      padding: 0 30px;
      transition: width 0.3s ease !important;
      overflow: hidden;
      position: relative;

      &:hover {
        transition: width 0.3s ease !important;

        span {
          clip-path: inset(0 0 0 0);
        }

        svg {
          margin-right: 12px !important;
        }

        .icon-desktop {
          min-width: 30px;
          transition: transform 0.3s ease !important;
          left: 40px;
        }

        .icon-documents {
          min-width: 30px;
          transition: transform 0.3s ease !important;
          left: 40px;
        }

        .transition-span {
          transform: translateY(2px);
          transition: clip-path 0.3s ease 0.15s,
          opacity 0.3s ease !important;
        }

        width: 230px;
      }

      span {
        text-wrap: nowrap;
        clip-path: inset(0 100% 0 0);
      }

      .transition-span {
        transition: clip-path 0.05s ease !important;
      }

      .icon-desktop {
        position: absolute;
        top: 50%;
        left: 40px;
        transform: translate(-50%, -50%);
        min-width: 30px;
      }

      .icon-documents {
        position: absolute;
        top: 50%;
        left: 40px;
        transform: translate(-50%, -50%);
        min-width: 30px;
      }

      svg {
        margin-right: 0 !important;
      }
    }

    &__navBlock {
      &__right {
        width: 23%;
      }
    }
  }
}
</style>
