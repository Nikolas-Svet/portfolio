<template>
  <div
    class="container"
    style="height: 100%; width: 100%"
    @click="closeContextMenu"
  >
    <div class="filters-container">
      <button class="filters__link" @click="goLastPage">
        <arrowIcon />
        Назад
      </button>
      <AppInput
        v-if="desktops.length > 1"
        id="title-filter"
        :can-clear="titleFilter !== ''"
        :value="titleFilter"
        :with-angles="false"
        :with-border="false"
        class="filters__search"
        name="title-filter"
        placeholder="Поиск"
        @clear="titleFilter = ''"
        @input="(e: IUpdateInput) => (titleFilter = String(e.value))"
      />
      <div v-if="desktops.length > 1" class="filters__sorted">
        <span>
          {{ createdDateSort ? 'Сортировка по дате создания' : null }}
          {{ updatedDateSort ? 'Сортировка по дате обновления' : null }}
          {{ nameSort ? 'Сортировка по имени' : null }}
          <span
            :class="{ active_add: createdDateSort == 'asc' || updatedDateSort == 'asc' || nameSort == 'asc' }"
            class="icon-arrow"
          ></span>
        </span>
        <ul class="filters__sorted--container">
          <li :class="{'filters--active': createdDateSort}">
            <button @click="sortByCreateDate">
              Сортировка по дате создания
              <span
                :class="{ active_add: createdDateSort == 'asc' }"
                class="icon-arrow"
              ></span>
            </button>
          </li>
          <li :class="{'filters--active': updatedDateSort}">
            <button @click="sortByUpdateDate">
              Сортировка по дате обновления
              <span
                :class="{ active_add: updatedDateSort == 'asc' }"
                class="icon-arrow"
              ></span>
            </button>
          </li>
          <li :class="{'filters--active': nameSort}">
            <button @click="sortByName">
              Сортировка по имени
              <span
                :class="{ active_add: nameSort == 'asc' }"
                class="icon-arrow"
              ></span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="desktops.length > 1" :class="{ 'filters__star--active': showFavorites }" class="filters__star"
           @click.stop="showFavorites = !showFavorites">
        <star
          :class="{ desktop__active: showFavorites }"
          class="star-icon"
        />
      </div>
    </div>
    <section class="desktops">
      <div class="desktops__title">
        <h2>Мои рабочие области {{ showFavorites ? ' (избранное)' : null }}</h2>
      </div>

      <div class="desktops__main">
        <div v-if="pages.length" class="desktops__content">
          <Carousel
            ref="carouselRef"
            v-model="currentPage"
            :itemsToShow="1"
            :transition="0.5"
            :wrapAround="false"
            class="desktops__carousel"
          >
            <Slide
              v-for="(page, pageIndex) in pages"
              :key="pageIndex"
            >
              <div class="desktops__page">
                <template v-for="item in page">
                  <div
                    v-if="item.type === 'add'"
                    :key="`add_${pageIndex}`"
                    class="desktops__block"
                    @click.stop="add_desktop"
                  >
                    <p class="desktops__block--empty">
                      <span class="icon-add"></span>
                      Создать новую рабочую область
                    </p>
                    <div
                      v-for="n in 4"
                      :key="`angle_add_${n}`"
                      class="angle"
                    ></div>
                  </div>
                  <!-- Обычный блок рабочего стола -->
                  <div
                    v-else
                    :key="`desktop_${item.data.id}`"
                    class="desktops__block"
                    @click.stop="saveSelectedDesktop(item.data.id)"
                  >
                    <p class="desktops__block--title">
                      <template v-if="item.data.isEditing">
                        <input
                          ref="editInput"
                          v-model="item.data.name"
                          class="rename-input"
                          @click.stop
                          @keyup.enter="confirmRename(item.data)"
                        />
                      </template>
                      <template v-else>
                        <span
                          class="title-text"
                        >
                          {{ item.data.name }}
                        </span>
                      </template>
                      <star
                        v-if="desktops.length > 1"
                        :class="{ desktop__active: favorites.includes(item.data.id) }"
                        @click.stop="toggleFavorite(item.data.id)"
                      />
                    </p>
                    <div
                      v-for="n in 4"
                      :key="`angle_${item.data.id}_${n}`"
                      class="angle"
                    ></div>
                    <img
                      alt=""
                      class="desktops__block--image"
                      src="@/assets/images/desktop.webp"
                    />
                    <div class="desktops__block--actions">
                      <div class="desktops__block--date">
                        <clock class="clock-icon" />
                        {{
                          item.data.updated_date
                            ? `Последние изменения ${formatTimeAgo(item.data.updated_date)}`
                            : 'Нет изменений'
                        }}
                      </div>
                      <div class="action-wrapper">
                        <div
                          class="action-wrapper__kebab-menu"
                          style="
                            height: 30px;
                            width: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: right;
                            margin-right: -10px;
                          "
                          @click.stop="openContextMenu($event, item.data)"
                        >
                          <kebab_menu
                            :class="{
                              'icon-kebab_menu__active': contextMenuDesktopId === item.data.id
                            }"
                            style="transform: translateX(-12px) rotate(-90deg)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Slide>
          </Carousel>
        </div>

        <div
          v-if="pages.length > 1"
          class="pagination-dots"
        >
          <span
            v-for="(_, idx) in pages"
            :key="idx"
            :class="{ active: idx === currentPage }"
            @click="goToPage(idx)"
          />
          <!-- Индикатор диапазона видимых элементов -->
          <div
            v-if="pages.length > 1"
            class="range-indicator"
          >
            {{ pageRange }}
          </div>
        </div>
      </div>
      <p class="authors">Правообладатель ПО: ФГБОУ ВО «Кемеровский государственный университет»</p>
    </section>

    <!-- Диалог удаления -->
    <div
      v-if="deleteDesktopFlag"
      class="window"
    >
      <div class="window__delete">
        <p>Удалить рабочую область "{{ desktopToDelete?.name }}"?</p>
        <div class="window__delete-block">
          <button @click="deleteSelectedDesktop()">Удалить</button>
          <button
            class="primary-color"
            @click="cancelDelete()"
          >
            Отменить
          </button>
        </div>
      </div>
    </div>

    <addDesktop
      :isVisible="addDesktopFlag"
      @close="addDesktopFlag = false"
      @desktop-added="handleDesktopAdded"
    />

    <!-- Контекстное меню -->
    <div
      v-if="contextMenuDesktopId"
      :style="contextMenuStyle"
      class="context-menu"
      @click.stop
    >
      <button
        class="context-menu__button"
        @click="startRename(currentDesktop)"
      >
        Переименовать
      </button>
      <button
        class="context-menu__button"
        @click="confirmDeleteDesktop(currentDesktop)"
      >
        Удалить
      </button>
      <button
        class="context-menu__button"
        @click="openEditDescriptionModal()"
      >
        Описание
      </button>
    </div>
  </div>
  <div
    v-if="openDescriptionModal"
    class="wrap"
  >
    <EditModal
      :id_layer="null"
      :text="currentDesktop.description"
      title="Описание рабочей области"
      @close="
        () => {
          openDescriptionModal = false
          closeContextMenu()
        }
      "
      @save="(payload) => updateLayerDescription(payload)"
    />
  </div>
</template>

<script lang="ts" setup>
import { Carousel, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

import clock from '@/assets/icons/clock.svg'
import star from '@/assets/icons/star.svg'
import arrowIcon from '@/assets/icons/arrow.svg'

import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain'

import { desktopApi } from '@/api/desktop.ts'
import { IUpdateInput } from '@/types/admin.ts'

const router = useRouter()
const carouselRef = ref<any>(null)
const desktops = ref<any[]>([])
const favorites = ref<number[]>([])
const addDesktopFlag = ref(false)
const deleteDesktopFlag = ref(false)
const desktopToDelete = ref<any | null>(null)
const currentDesktop = ref<any>(null)
const contextMenuDesktopId = ref<number | null>(null)
const contextMenuStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })
const openDescriptionModal = ref<boolean>(false)
const windowWidth = ref(window.innerWidth)
const currentPage = ref(0)
const ROWS = 2

// Sort
const createdDateSort = ref<'asc' | 'desc' | null>(null)
const updatedDateSort = ref<'asc' | 'desc' | null>('asc')
const nameSort = ref<'asc' | 'desc' | null>(null)
const titleFilter = ref<string>('')
const showFavorites = ref<boolean>(false)

onMounted(async () => {
  await loadWorkArea()
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('resize', closeContextMenu)
  window.addEventListener('keydown', handleKeydown)
  sortByUpdateDate()
})

const handleKeydown = (event: any) => {
  if (event.key === 'Escape' && deleteDesktopFlag.value) {
    cancelDelete()
  }
  if (event.key === 'Enter' && deleteDesktopFlag.value) {
    deleteSelectedDesktop()
  }
}

onBeforeUnmount(() => {
  window.addEventListener('resize', onWindowResize)
  window.removeEventListener('resize', closeContextMenu)
  window.removeEventListener('keydown', handleKeydown)
})

const sortByCreateDate = () => {
  updatedDateSort.value = null
  nameSort.value = null
  createdDateSort.value = createdDateSort.value === 'asc' ? 'desc' : 'asc'

  desktops.value.sort((a, b) => {
    const result = +new Date(a.created_date as any) - +new Date(b.created_date as any)
    return createdDateSort.value === 'asc' ? result : -result // Меняем направление
  })
}

const sortByUpdateDate = () => {
  createdDateSort.value = null
  nameSort.value = null
  updatedDateSort.value = updatedDateSort.value === 'asc' ? 'desc' : 'asc'

  desktops.value.sort((a, b) => {
    const result = +new Date(a.updated_date as any) - +new Date(b.updated_date as any)
    return updatedDateSort.value === 'asc' ? result : -result // Меняем направление
  })
}

const sortByName = () => {
  createdDateSort.value = null
  updatedDateSort.value = null
  nameSort.value = nameSort.value === 'asc' ? 'desc' : 'asc'

  desktops.value.sort((a, b) => {
    const collator = new Intl.Collator('ru', { sensitivity: 'base' })
    const isRussianA = /^[А-Яа-я]/
    const isRussianB = /^[А-Яа-я]/

    if (isRussianA && !isRussianB) return nameSort.value === 'asc' ? -1 : 1 // Русский идет первым
    if (!isRussianA && isRussianB) return nameSort.value === 'asc' ? 1 : -1 // Английский идет вторым

    // Сравнение в пределах одного языка
    const result = collator.compare(a.name, b.name)
    return nameSort.value === 'asc' ? result : -result
  })
}

const goLastPage = () => {
  router.go(-1)
}

const onWindowResize = () => {
  windowWidth.value = window.innerWidth
  if (carouselRef.value?.refresh) {
    carouselRef.value.refresh()
  }
}

// Загрузка данных
const loadWorkArea = async () => {
  try {
    const res = await desktopApi.getDesktops()
    if (!res) {
      return
    }
    desktops.value = res
  } catch (e) {
    console.error(e)
  }
  const fav = localStorage.getItem('favDesktops')
  favorites.value = fav ? JSON.parse(fav) : []
  desktops.value = desktops.value.slice().reverse()
  reorderDesktops()
  return
}
const reorderDesktops = () => {
  desktops.value.sort(
    (a, b) => (favorites.value.includes(a.id) ? 0 : 1) - (favorites.value.includes(b.id) ? 0 : 1)
  )
}

const items = computed(() => {
  let desktopItems = desktops.value
  if (titleFilter.value) {
    desktopItems = desktopItems.filter((desktop) => desktop.name.includes(titleFilter.value))
  }
  if (showFavorites.value) {
    desktopItems = desktopItems.filter((desktop) =>
      showFavorites.value ? favorites.value.includes(desktop.id) : true
    )
  }
  return [{ type: 'add' }, ...desktopItems.map((d) => ({ type: 'desk', data: d }))]
})
const perRow = computed(() => {
  const w = windowWidth.value
  if (w >= 2400) return 5
  if (w >= 1700) return 4
  return 3
})
const perPage = computed(() => perRow.value * ROWS)

const pages = computed(() => {
  const arr: any[][] = []
  for (let i = 0; i < items.value.length; i += perPage.value) {
    arr.push(items.value.slice(i, i + perPage.value))
  }
  if (currentPage.value >= arr.length) currentPage.value = arr.length - 1
  return arr
})

const goToPage = (idx: number) => {
  currentPage.value = idx
  // Переходим на слайд через API vue3-carousel
  if (carouselRef.value && typeof carouselRef.value.goToSlide === 'function') {
    carouselRef.value.goToSlide(idx)
  }
}

const pageRange = computed(() => {
  const total = items.value.length
  const start = currentPage.value * perPage.value + 1
  const end = Math.min(start + perPage.value - 1, total)
  return `${start}–${end} из ${total}`
})

const add_desktop = () => (addDesktopFlag.value = true)
const saveSelectedDesktop = async (desktopId: number) => {
  const sel = desktops.value.find((d) => d.id === desktopId)
  localStorage.setItem('name', sel.name || '')
  localStorage.setItem('description', sel.description || '')
  localStorage.setItem('currentDesktop', JSON.stringify(desktopId))
  await store.dispatch(`layersMain/${layersMainActions.setLayersAndOrderMain}`, {
    layers: [],
    layersOrder: []
  })
  await router.push('/')
}
const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m >= 60 * 24 * 30) return `${Math.floor(m / (60 * 24 * 30))}м назад`
  if (m >= 60 * 24) return `${Math.floor(m / (60 * 24))}д назад`
  if (m >= 60) return `${Math.floor(m / 60)}ч назад`
  if (m === 0) return 'только что'
  return `${m}мин назад`
}
const toggleFavorite = (id: number) => {
  const idx = favorites.value.indexOf(id)
  idx >= 0 ? favorites.value.splice(idx, 1) : favorites.value.push(id)
  localStorage.setItem('favDesktops', JSON.stringify(favorites.value))
  reorderDesktops()
}
const openContextMenu = (e: MouseEvent, d: any) => {
  e.preventDefault()
  currentDesktop.value = d
  contextMenuDesktopId.value = d.id
  contextMenuStyle.value = { top: `${e.clientY - 80}px`, left: `${e.clientX}px` }
}
const closeContextMenu = () => (contextMenuDesktopId.value = null)
const startRename = (d: any) => {
  currentDesktop.value = d
  d.originalName = d.name
  d.isEditing = true
  nextTick(() => {
    const inp = document.querySelector('.rename-input') as HTMLInputElement
    inp?.focus()
    const onClickOut = (ev: MouseEvent) => {
      if (!(ev.target as HTMLElement).closest('.rename-input')) {
        confirmRename(d)
        document.removeEventListener('click', onClickOut)
      }
    }
    document.addEventListener('click', onClickOut)
  })
  closeContextMenu()
}
const confirmRename = async (d: any) => {
  d.isEditing = false
  localStorage.setItem('name', d.name)
  await saveChanges()
}
const openEditDescriptionModal = () => {
  if (!currentDesktop.value) {
    closeContextMenu()
    return
  }
  closeContextMenu()
  openDescriptionModal.value = true
}
const updateLayerDescription = async (newDescription: string) => {
  localStorage.setItem('description', newDescription)
  await saveChanges()
}
const saveChanges = async () => {
  const id = currentDesktop.value.id
  const name = localStorage.getItem('name') || ''
  const description = localStorage.getItem('description') || ''
  const body = {
    name,
    description,
    style: JSON.stringify({ orderLayer: store.state.layersMain.layerOrderMain || [] }),
    layers: JSON.stringify(store.state.layersMain.layersMain || [])
  }
  try {
    await desktopApi.updateDesktop(body, id)
    const res = await desktopApi.getDesktops()
    if (res) {
      desktops.value = res
    }

    currentDesktop.value = res.find((desktop: any) => desktop.id === id)
  } catch (err) {
    console.error(err)
  }
}
const confirmDeleteDesktop = (d: any) => {
  desktopToDelete.value = d
  deleteDesktopFlag.value = true
  closeContextMenu()
}
const deleteSelectedDesktop = async () => {
  if (!desktopToDelete.value) return
  const idToDel = desktopToDelete.value.id
  if (Number(localStorage.getItem('currentDesktop')) === idToDel) {
    localStorage.removeItem('currentDesktop')
    localStorage.removeItem('name')
    localStorage.removeItem('description')
    await store.dispatch(`layersMain/${layersMainActions.setLayersAndOrderMain}`, {
      layers: [],
      layersOrder: []
    })
  }
  try {
    const responce = await desktopApi.deleteDesktop(idToDel)
    if (!responce) return
    await loadWorkArea()
  } catch (err) {
    console.error(err)
  } finally {
    deleteDesktopFlag.value = false
    desktopToDelete.value = null
  }
}
const cancelDelete = () => {
  deleteDesktopFlag.value = false
  desktopToDelete.value = null
}
const handleDesktopAdded = async () => {
  addDesktopFlag.value = false
  await loadWorkArea()
}

</script>

<style>
.carousel__track {
  transition: all 0.6s ease !important;
}
</style>

<style lang="scss" scoped>

.authors {
  position: absolute;
  bottom: -30px;
  font-size: 15px;
  left: 0;
}

.filters {

  &__search {
    flex: 1;
  }

  &__link {
    height: 56px;
    width: 100%;
    padding: 0 16px;
    max-width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 16px;
    transition: all 0.3s ease !important;

    svg {
      transform: rotate(180deg);
      margin-right: 8px;

      * {
        transition: all 0.3s ease !important;
      }
    }

  }

  &__star {
    width: 84px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease !important;
    cursor: pointer;
  }

  &__sorted {
    padding: 0 16px;
    width: 30%;
    max-width: 400px;
    height: 56px;
    position: relative;
    align-content: center;
    cursor: pointer;

    span {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
    }

    &:hover {
      ul {
        clip-path: inset(0 0 0 0) !important;
      }
    }

    &--container {
      position: absolute;
      width: calc(100% + 2px);
      bottom: -168px;
      left: -1px;
      list-style-type: none;
      clip-path: inset(0 0 100% 0);
      transition: all 0.3s ease !important;
      z-index: 10;

      button {
        width: 100%;
        height: 56px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }

    &--active {
      clip-path: inset(0 0 100% 0);
    }
  }
}

.filters-container {

  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100dvw;
    height: 1px;
  }

  button {
    background: transparent;
    outline: none;
    border: none;

    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .active_add {
    transform: rotate(180deg);
  }

  .icon-arrow {
    margin-left: 5px;
    height: 20px;
    width: 16px;
    position: relative;

    &::after {
      position: absolute;
      content: '';
      right: 0;
      top: 50%;
      transform: rotate(-45deg);
      height: 2px;
      border-radius: 1px;
      width: 10px;
    }

    &::before {
      position: absolute;
      content: '';
      left: 0;
      top: 50%;
      transform: rotate(45deg);
      height: 2px;
      border-radius: 1px;
      width: 10px;
    }
  }
}

.wrap {
  backdrop-filter: blur(4px);
  cursor: pointer;
  position: absolute;
  z-index: 1040;
  inset: 0;
  width: 100% !important;
  height: 100%;
}

.star-icon {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.desktop__active {
  * {
    stroke: gold !important;
    fill: gold !important;
  }
}

.edit-modal-container {
  position: fixed;
  z-index: 300;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  max-width: 473px;
  height: 358px;

  border: 2px solid gray;
  box-shadow: 0 0 20px rgba(147, 147, 147, 0.5);
}

.context-menu {
  position: absolute;
  flex-direction: column;
  border-radius: 4px;
  z-index: 1000;

  button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    text-align: left;
    background: none;
    border: none;
  }
}

.rename-input {
  width: calc(100% - 32px);
  height: 22px;
  font-size: 16px;
  padding: 0 4px;

  &::placeholder {
    font-size: 16px;
  }
}

.title-text {
  display: inline-block;
  max-width: calc(100% - 24px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.pagination-dots {
  position: relative;
  align-items: center;
  width: 100%;
  margin-top: 32px;
  display: flex;
  justify-content: center;

  span {
    transition: all 0.3s ease !important;
    width: 80px;
    height: 10px;
    margin: 0 4px;
    background: transparent;
    cursor: pointer;
  }
}

.range-indicator {
  position: absolute;
  margin-top: 12px;
  text-align: right;
  font-size: 14px;
  right: 0;
  bottom: 0;
}

thead {
  left: 0;
  position: absolute;
  width: 100%;
  border: none !important;
}

tbody {
  transform: translateY(61px);
}

input {
  border-radius: 0;
  background-color: transparent;
  outline: none;
  border: none;
  height: 40px;
}

.checkbox {
  margin-right: 20px;

  label {
    border-radius: 50% !important;

    &:after {
      border-radius: 50% !important;
    }
  }
}

.desktops {
  position: relative;
  margin-bottom: 64px;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__page {
    padding: 0 10px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  &__carousel {
    width: 100%;
  }

  &__main {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex: 1;
  }

  &__block {
    //min-height: 280px;
    //height: calc(50% - 12px);
    box-shadow: 0 4px 20.1px 0 #00000012;
    //box-shadow: 0 4px 20.1px 0 rgba(255, 252, 255, 0.07);
    position: relative;
    width: calc(25% - 18px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    padding: 16px;
    aspect-ratio: 8 / 6;

    * {
      transition: all 0.3s ease !important;
    }

    .angle {
      height: 22px;
      width: 22px;
      opacity: 0.4;
    }

    &--empty {
      opacity: 0.4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-width: 203px;
      font-size: 24px;
      text-align: center;
      gap: 16px;

      .icon-add {
        &:after,
        &:before {
          transition: all 0.3s ease !important;
          height: 2px;
          width: 22px;
        }
      }
    }

    &--title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      margin-bottom: 16px;
      width: 100%;
    }

    &--image {
      opacity: 0.9;
      width: 100%;
    }

    .icon-kebab_menu {
      transform: rotate(90deg);
    }

    &--actions {
      margin-top: 10px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 10px;
    }

    &--date {
      font-size: 14px;
      max-width: 280px;
      display: flex;
      align-items: center;
      justify-content: left;
      width: 100%;

      opacity: 0.4;

      svg {
        margin-right: 12px;
        width: 17px;
        height: 17px;
      }
    }
  }

  &__title {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    h2 {
      font-size: 24px;
      font-family: $Golos_Text_Medium;
    }
  }

  &__content {
    overflow: hidden;
    justify-content: center;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;

    table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;

      svg {
        cursor: pointer;
        height: 30px;
        width: 30px;

        &:hover {
          opacity: 0.8;
        }

        &:last-child {
          margin-right: 23px;
          margin-left: 20px;
        }
      }

      thead {
        tr {
          border: none;
        }
      }

      tr {
        display: flex;
      }

      th {
        font-family: $Golos_Text_Medium;
        height: 59px;
      }

      td {
        background-color: transparent;
      }

      & th,
      td {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        padding: 8px 0;
        width: 33.3%;
        font-weight: 400;

        &:first-child {
          padding-left: 50px;
          justify-content: left;
        }

        &:last-child {
          justify-content: end;
          padding-right: 67px;
        }
      }
    }
  }

  &__block_buttons {
    margin-top: 70px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;

    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 455px;
      width: 100%;
      border-radius: 0;
      outline: none;

      button {
        width: 49%;
        height: 50px;

        &:first-child {
          background-color: transparent;
        }

        &:last-child {
          border: none;
        }
      }
    }
  }
}

.empty_desktops {
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  border-bottom: none !important;
}

@media (width > 2400px) {
  .desktops {
    &__block {
      width: calc(20% - 20px);
    }
  }
}

@media (width < 1700px) {
  .desktops {
    &__block {
      max-height: 33dvh;
      width: calc(33% - 12px);
    }
  }
}
</style>
