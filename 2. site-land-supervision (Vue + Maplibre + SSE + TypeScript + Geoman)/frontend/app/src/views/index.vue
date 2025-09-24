<template>
  <div class="index">
    <div class="index__content">
      <div class="panel">
        <div
          :class="{ 'panel__item--active': showLayersFlag }"
          class="panel__item"
          @click="showLayers()"
        >
          <layers></layers>
        </div>
        <div
          :class="{ 'panel__item--active': showToolsFlag }"
          class="panel__item"
          @click="showTools()"
        >
          <tools_v2></tools_v2>
        </div>
        <div
          :class="{ 'active-svg': flagNotifications, 'panel__item--active': flagNotifications }"
          class="notifications panel__item"
          @click="popupNotifications"
        >
          <notification></notification>
          <div v-if="notificationNumber > 0" class="icon-number">
            {{ notificationNumber }}
          </div>
        </div>
      </div>
      <notifications-block
        :active="flagNotifications"
        :events="notificationEvents"
      />
      <transition name="slide">
        <div
          v-if="showLayersFlag"
          :style="{ height: flagHeight ? 'calc(100% - 265px)' : '100%' }"
          class="index__content-left"
        >
          <aside class="aside">
            <div class="aside__header">
              <h3>Слои</h3>
              <div class="aside__header--actions">
                <button
                  v-if="isCurrentDesktopSet"
                  :title="'Сохранить изменения в рабочую область ' + nameDesktop"
                  class="aside__header--save"
                  @click="saveChanges()"
                >
                  <p>{{ nameDesktop }}</p>
                  <save></save>
                  <span>Сохранить изменения</span>
                </button>
                <button
                  class="aside__header--add"
                  title="Включить слой"
                  @click="addLayer()"
                ></button>
              </div>
            </div>
            <AsideLayers />
          </aside>
        </div>
        <div
          v-else-if="showToolsFlag"
          :style="{ height: flagHeight ? 'calc(100% - 265px)' : '100%' }"
          class="panel__tools"
        >
          <h3 class="panel__title">Инструменты</h3>
          <div class="panel__content">
            <div
              v-for="(tool, index) in toolActions"
              :key="index"
              class="panel__block"
              @click="toggleToolAction(tool.index)"
            >
              <span>{{ tool.label }}</span>
            </div>
          </div>
        </div>
      </transition>
      <div class="index__map">
        <mapLibre ref="mapComponent"></mapLibre>
      </div>
    </div>
  </div>
  <AddLayer :addFlag="addFlag" @toggle-add-layer="addLayer" />
  <div :class="['panel-info', { 'panel-info__show': flagPanelInfo }]" class="info_panel">
    <span>{{ message }}</span>
    <div class="angle"></div>
    <div class="angle"></div>
    <div class="angle"></div>
    <div class="angle"></div>
  </div>

  <add-desktop
    :isVisible="addDesktopFlag"
    @close="addDesktopFlag = false"
    @setDesktop="isCurrentDesktopSet = true"
  ></add-desktop>

  <section v-if="is_not_save_layer" class="popup__saveChanges">
    <div class="popup__content">
      <p>Есть не сохраненные слои, дествительно хотите сохранить рабочую область?</p>
      <div class="popup__actions">
        <button @click="saveChanges()">Cохранить</button>
        <button @click="is_not_save_layer = false">Отменить</button>
      </div>
    </div>
  </section>

  <div v-if="loaderFlag" class="layer-list__loader">
    <span class="loader"></span>
    <span>Сохранение рабочей области</span>
  </div>
  <div v-if="loaderFlag" class="layer-list__wrap"></div>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, toRaw } from 'vue'
import mapLibre from '@/components/app/mapLibre.vue'
import AsideLayers from '@/components/app/menuLayers/AsideLayers.vue'
import AddLayer from '@/components/app/menuLayers/AddLayer.vue'
import notification from '@/components/icons/notification.vue'
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain'
import { notificationsActions } from '@/store/actions/notifications.ts'

import layers from '@/components/icons/layers.vue'
import tools_v2 from '@/components/icons/tools_v2.vue'
import { toolsStoreActions } from '@/store/actions/tools.ts'
import { forestAreaActions } from '@/store/actions/forestArea.ts'
import AddDesktop from '@/components/app/desktop/addDesktop.vue'
import Save from '@/components/icons/save.vue'
import { desktopApi } from '@/api/desktop.ts'
import NotificationsBlock from '@/components/app/notificationsBlock.vue'
import { Consts } from '@/consts/index.consts.ts'
import { loadRasterLayers, loadVectorLayers } from '@/utils/fetchLayers.ts'
import { ManualSSE } from '@/api/manualSse.ts'

const toolActions = [
  { index: 4, label: 'Анализ ИИ' },
  { index: 2, label: 'Загрузить векторный слой' },
  { index: 3, label: 'Площадь леса в области' },
  { index: 1, label: 'Прогноз залесенности участка' },
  { index: 0, label: 'Вычитание векторов' },
  { index: 5, label: 'Объединение слоев' },
  { index: 6, label: 'Фильтрация векторных слоев' }
]

const is_not_save_layer = ref(false)

const addFlag = ref(false)
const flagNotifications = ref(false)
const addDesktopFlag = ref(false)

const message = ref('')
const flagPanelInfo = ref(false)
const showLayersFlag = ref(true)
const showToolsFlag = ref(false)
const flagHeight = ref(false)
const loaderFlag = ref(false)

const isCurrentDesktopSet = ref(!!localStorage.getItem('currentDesktop'))

const nameDesktop = localStorage.getItem('name')

const toggleActions = [
  toolsStoreActions.showSubstractionVectors,
  toolsStoreActions.showAi,
  toolsStoreActions.showAddVector,
  toolsStoreActions.showForestArea,
  toolsStoreActions.showArtificialAi,
  toolsStoreActions.showMergingVector,
  toolsStoreActions.showFilterVector,
  toolsStoreActions.setDragAndDrop
]

const toggleToolAction = async (activeIndex: number | null) => {
  if (activeIndex === 3) {
    await store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
    await store.dispatch(`forestArea/${forestAreaActions.SET_CURRENT_ID}`, 0)
  }
  toggleActions.forEach((action, index) => {
    store.commit(action, index === activeIndex)
  })
  await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, {})
}

const notificationEvents = computed(() => {
  return store.getters['events']! || []
})

const notificationNumber = computed(() => {
  console.log('NEW2', store.getters['number_events'])
  return store.getters['number_events']
})

const downloadDesktop = async () => {
  const currentDesktop = localStorage.getItem('currentDesktop') as string | null
  if (currentDesktop !== null) {
    const selectedDesktopId = JSON.parse(currentDesktop)
    const response = await desktopApi.getDesktopById(selectedDesktopId)

    if (!response) {
      console.error(Consts.ErrorMessages.DesktopGetById)
      return
    }

    const selectedDesktop = response as any

    // await store.dispatch('currentDatasets/setSelectedDesktopInfo', {
    //   name: selectedDesktop.name,
    //   description: selectedDesktop.description
    // })

    let parsedLayers: any[] = []
    let parsedStyle: any = []

    parsedLayers = JSON.parse(selectedDesktop.layers)
    parsedStyle = JSON.parse(selectedDesktop.style)

    const layers = [...await loadVectorLayers({}), ...await loadRasterLayers({})]

    const checkedLayers = []

    for (const parsedLayer of parsedLayers) {
      for (const layer of layers) {
        if (Number(layer.id) === Number(parsedLayer.id)) {
          parsedLayer.update = layer.update
          parsedLayer.add = layer.add
          parsedLayer.delete = layer.delete
          checkedLayers.push(parsedLayer)
        }
      }
    }

    console.log('new data: ', toRaw(parsedLayers))
    console.log('new data: ', layers)
    console.log('new data: ', checkedLayers)

    await store.dispatch(`layersMain/${layersMainActions.setLayersAndOrderMain}`, {
      layers: checkedLayers, // parsedLayers передаётся как layers
      layersOrder: parsedStyle.orderLayer // parsedStyle передаётся как layersOrder
    })

    if (parsedStyle.messages) {
      parsedStyle.messages.forEach(async (message: any) => {
        await store.dispatch('toolbar/ADD_MESSAGE', message)
      })
    }
    // await store.dispatch(`layersMain/${layersMainActions.setLayersMain}`, parsedLayers)
    // await store.dispatch(`layersMain/${layersMainActions.orderLayersMain}`, parsedStyle)
  }
}

const popupNotifications = () => {
  store.dispatch(notificationsActions.setNumberEvents, 0)
  if (!flagNotifications.value) {
    flagNotifications.value = !flagNotifications.value
    setTimeout(() => {
      flagHeight.value = !flagHeight.value
    }, 300)
  } else {
    flagHeight.value = !flagHeight.value
    flagNotifications.value = !flagNotifications.value
  }
}

const loadDesktop = () => {
  downloadDesktop()
}

const saveAllChanges = computed(() => store.state.toolbar.saveAllChanges)

watch(saveAllChanges, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    const idDesktop = localStorage.getItem('currentDesktop')
    const name = localStorage.getItem('name')
    const description = localStorage.getItem('description')

    if (!idDesktop) {
      return
    }
    const style = JSON.stringify({
      orderLayer: store.state.layersMain?.layerOrderMain || [],
      messages: store.state.toolbar.messages || []
    })
    const layers2 = JSON.stringify(store.state.layersMain?.layersMain || [])
    const body = {
      name: name || '',
      description: description || '',
      style: style,
      layers: layers2
    }
    await updateDesktop(body, Number(idDesktop))
    loaderFlag.value = false
    await store.dispatch('toolbar/SET_GEOM_NOT_SAVED', [])
  }
})

const saveChanges = async () => {

  loaderFlag.value = true

  await store.dispatch('toolbar/SET_SAVE_ALL', true)

  return
}

const updateDesktop = async (body: any, idDesktop: number) => {

  console.log('store.state.layersMain?.layersMain')

  try {
    const response = await desktopApi.updateDesktop(body, Number(idDesktop))

    if (!response) {
      return
    }
  } catch (error) {
    console.error(Consts.ErrorMessages.DesktopsUpdate, error)
  }
}

const showLayers = () => {
  if (showToolsFlag.value) {
    showToolsFlag.value = false
    setTimeout(() => {
      showLayersFlag.value = !showLayersFlag.value
    }, 400)
  } else {
    showToolsFlag.value = false
    showLayersFlag.value = !showLayersFlag.value
  }
}

const showTools = () => {
  if (showLayersFlag.value) {
    showLayersFlag.value = false
    setTimeout(() => {
      showToolsFlag.value = !showToolsFlag.value
    }, 400)
  } else {
    showLayersFlag.value = false
    showToolsFlag.value = !showToolsFlag.value
  }
}

const addLayer = () => {
  addFlag.value = !addFlag.value
}

const API_URL = inject<string>('API_URL')

const sse = new ManualSSE()

const connectSSE = async () => {
  console.log('Подключение к SSE по URL:', `${API_URL}${Consts.API_PREFIX}sse`)
  sse.connect(
    `${API_URL}`,
    `${Consts.API_PREFIX}sse`,
    async (msg) => {
      if (msg !== 'connected') {
        try {
          console.log('[SSE] Получено сообщение от SSE:', msg)

          if (typeof msg.result === 'string') {
            msg.result = JSON.parse(msg.result)
          }

          const data = msg as any

          await store.dispatch(notificationsActions.addNotificationEvent, data)

          ;(window as any).$notify('Получены обновленные данные.', true)

          if (data.result.id_vector_layer > 0) {
            console.log('[SSE] пришел id слоя, начинаю добавлять в левую панель')
            await store.dispatch(`layersMain/${layersMainActions.setNewLayerFromTool}`, [Number(data.result.id_vector_layer)])
          }

          console.log(
            '********************************************************************************'
          )
        } catch (e) {
          console.error('Ошибка разбора сообщения SSE:', e, msg)
        }
      }
    },
    (err) => {
      console.error('Ошибка подключения к SSE:', err)
    },
    true // withReconnect
  )
}

onMounted(() => {
  loadDesktop()
  connectSSE()
})

onBeforeUnmount(() => {
  sse.disconnect()
})
</script>

<style lang="scss">

@keyframes waveText {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.info-box {
  left: v-bind(
      'showLayersFlag || showToolsFlag ? "calc(493px + clamp(0px, 5%, 90px))" : "calc(20px + clamp(0px, 6%, 90px))"'
  ) !important;
  transition: width 0.4s ease;
}

.edit-fields-modal-container__wrap {
  width: v-bind(
      'showLayersFlag || showToolsFlag ? "calc(100% - 473px - clamp(0px, 5%, 90px))" : "calc(100% - clamp(0px, 5%, 90px))"'
  ) !important;
  transition: left 0.4s ease;
}

.toolbar, .map__loader {
  width: v-bind(
      'showLayersFlag || showToolsFlag ? "calc(100% - 473px - clamp(0px, 5%, 90px))" : "calc(100% - clamp(0px, 5%, 90px))"'
  ) !important;
}

.wrap {
  transition: v-bind(
      'showLayersFlag || showToolsFlag ? "width 0.4s ease" : "width 0.4s ease"'
  ) !important;
  width: v-bind(
      'showLayersFlag || showToolsFlag ? "calc(100% - 473px - clamp(0px, 5%, 90px))" : "calc(100% - clamp(0px, 5%, 90px))"'
  ) !important;
}
</style>
<style lang="scss" scoped>

.layer-list {
  &__loader {
    z-index: 112;
    position: fixed;
    bottom: 64px;
    left: 64px;
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
    backdrop-filter: blur(2px);
  }
}

$radius-popup: 5px;
.popup {

  &__saveChanges {
    z-index: 111;
    transition: all 0.3s ease;
    position: fixed;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(5px);
    background-color: transparent !important;
  }

  &__content {
    padding: 32px;
    width: 470px;
    border-radius: $radius-popup;

    p {
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      font-size: 18px;
      text-align: center;
      margin-bottom: 24px;
    }
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      border-radius: $radius-popup;
      height: 39px;
      width: 47%;
      font-family: $Golos_Text_Medium;
      font-size: 16px;
    }
  }
}

.aside__header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 28px;
  }

  &--actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: right;
  }

  &--save {

    height: 34px;
    padding: 0 6px;
    border-radius: 6px;
    outline: none;
    border: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    overflow: hidden;
    max-width: 200px;
    width: 100%;

    p {
      text-align: left;
      transition: all 0.3s ease !important;
      text-wrap: nowrap;
      overflow: hidden;
      width: calc(100% - 25px);
      clip-path: inset(0 0% 0 0);
    }

    svg {
      min-width: 25px;
    }

    span {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-250%);
      transition: all 0.3s ease !important;
    }

    &:hover {
      opacity: 0.8;

      p {
        transform: translateY(200%);
      }

      span {
        transform: translateY(-50%);
      }
    }
  }

  &--add {
    height: 34px;
    width: 34px;
    border-radius: 50%;
    outline: none;
    border: none;
    position: relative;
    background-color: $primary-color_2;

    &:hover {
      opacity: 0.8;
    }

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 2px;
      height: 16px;
      border-radius: 1px;
      background-color: $primary-white;
    }

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(90deg);
      width: 2px;
      height: 16px;
      border-radius: 1px;
      background-color: $primary-white;
    }
  }
}

.icon-number {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  height: 16px;
  width: 16px;
  font-size: 13px;
  background-color: red;
  border-radius: 50%;
  left: 60%;
  top: 40%;
  transform: translate(-50%, -50%);
}

@keyframes slideIn {
  from {
    margin-left: -473px;
  }
  to {
    margin-left: 0;
  }
}

@keyframes slideOut {
  from {
    margin-left: 0;
  }
  to {
    margin-left: -473px;
  }
}

.slide-enter-active {
  animation: slideIn 0.4s ease forwards;
}

.slide-leave-active {
  animation: slideOut 0.4s ease forwards;
}

$bg-color: rgba(19, 19, 19, 0.63);
$highlight-color: #d68166;
$text-color: #ffffff;
$border-color: rgb(104, 104, 104);
$hover-bg-color: rgba(255, 255, 255, 0.1);
$active-bg-color: rgba(255, 255, 255, 0.2);

@mixin button-style(
  $bg-color: transparent,
  $border: 1px solid $highlight-color,
  $color: $highlight-color
) {
  background-color: $bg-color;
  border: $border;
  color: $color;

  &:hover {
    background-color: $highlight-color;
    color: #2b2b2b;
  }
}

.panel-info {
  position: absolute;
  bottom: 64px;
  right: -300px;
  width: 300px;
  height: 100px;
  transition: right 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 20px;
    text-align: center;
  }

  &__show {
    right: 64px;
  }
}

.angle {
  height: 10px;
  width: 10px;
}

.nav-container {
  border-left: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  height: 64px;
  display: flex;
  background-color: $background-color;
  position: relative;
  z-index: 9;
  width: 100%;

  svg {
    margin-right: 10px;

    * {
      fill: $text-color;
    }
  }

  a {
    text-decoration: none;
  }

  .desktops,
  .tools,
  .documents {
    cursor: pointer;
    padding: 0 30px;
    display: flex;
    align-items: center;
    height: 100%;
    border-right: 1px solid $border-color;

    &:hover {
      background-color: $hover-bg-color;
    }

    &:active {
      background-color: $active-bg-color;
    }

    svg {
      min-width: 24px;

      path {
        fill: $text-color;
      }
    }
  }

  .desktops {
    width: 17%;

    svg {
      height: 26px;
    }
  }

  .documents {
    width: 21%;
  }

  .tools {
    width: 17%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto 1fr;
    place-items: center;

    svg {
      height: 24px;
    }
  }

  .documents svg {
    height: 24px;
  }

  .search {
    position: relative;
    width: calc(45% - 63px);
    display: flex;
    align-items: center;

    input {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      height: 64px;
    }

    &:hover {
      background-color: $hover-bg-color;
    }

    &:active {
      background-color: $active-bg-color;
    }
  }

  .icon-search {
    margin-left: 10px;
  }
}

.notifications {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute !important;
  bottom: 0 !important;

  svg {
    height: 22px;
    width: 22px;
    margin-right: 0;
  }
}

.active-svg {
  svg {
    * {
      transition: all 0.3s ease;
      fill: $primary-color_2 !important;
    }
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

  &::placeholder {
    font-family: $Golos_Text_Medium;
    font-size: 16px;
  }
}

.checkbox {
  all: unset;
}

.aside {
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;

  &__title {
    background-color: #201f22f2;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgb(104, 104, 104);
    min-width: 473px;

    section {
      &:hover {
        opacity: 0.8;
      }

      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;

      div {
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          margin-left: 30px;
          margin-right: 20px;
        }
      }
    }

    p {
      font-size: 16px;
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      line-height: 1.5;
      max-width: 300px;
    }

    span {
      background-color: transparent;
      margin-right: 20px;
      width: 45px;
      height: 45px;

      &:before {
        background-color: #ffffff;
        height: 16px;
        width: 2px;
      }

      &:after {
        background-color: #ffffff;
        height: 16px;
        width: 2px;
      }
    }
  }
}

.index {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: left;

  &__filters {
    position: relative;
    width: 100%;
    display: grid;
    grid-auto-columns: auto 1fr;
    grid-auto-flow: column;
  }

  &__content {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;

    &-left {
      transition: background-color 0.3s ease !important;
      position: absolute;
      top: 0;
      left: $width-panel;
      max-width: 473px;
      width: 100%;
      height: 100%;
      background-color: $primary-background-two;
      background-size: cover;
      z-index: 102;
      display: flex;
      flex-direction: column;

      &__buttons {
        transform: translateY(-1px);
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        cursor: pointer;

        button {
          width: 50%;
          height: 50px;

          &:first-child {
            background-color: transparent;
          }

          &:last-child {
            border: none;

            &:hover {
              opacity: 0.9;
            }
          }
        }
      }
    }
  }

  &__map {
    width: 100%;
    height: 100%;
    transition: width 0.3s ease;
  }
}

.burger {
  left: -1px;
  display: block;
  position: relative;
  border: none;
  background: transparent;
  width: 26px;
  height: 21px;
  margin: 30px auto;

  &__wrap {
    height: 63px;
    min-width: 63px;
    background-color: $highlight-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__click-place {
    position: absolute;
    cursor: pointer;
    inset: 0;
    width: 63px;
    height: 100%;
    z-index: 10;
  }

  &:after,
  &:before {
    content: '';
    left: 0;
    position: absolute;
    display: block;
    width: 100%;
    height: 3px;
    border-radius: 10px;
    background: $text-color;
  }

  &:before {
    top: 0;
    box-shadow: 0 9px 0 $text-color;
    transition: box-shadow 0.3s 0.15s,
    top 0.3s 0.15s,
    transform 0.3s;
  }

  &:after {
    bottom: 0;
    transition: bottom 0.3s 0.15s,
    transform 0.3s;
  }

  &-checkbox {
    position: absolute;
    visibility: hidden;
  }
}

.burger-checkbox:checked + .burger::before {
  top: 10px;
  transform: rotate(45deg);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0) !important;
  transition: box-shadow 0.15s,
  top 0.3s,
  transform 0.3s 0.15s;
}

.burger-checkbox:checked + .burger::after {
  bottom: 8px;
  transform: rotate(-45deg);
}

.burger-checkbox:checked + .burger::before {
  top: 10px;
  transform: rotate(45deg);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0) !important;
  transition: box-shadow 0.15s,
  top 0.3s,
  transform 0.3s 0.15s;
}

.burger-checkbox:checked + .burger::after {
  bottom: 8px;
  transform: rotate(-45deg);
}

.panel {
  position: absolute;
  left: 0;
  z-index: 104;
  height: 100%;
  width: 100%;
  max-width: $width-panel;

  &:after {
    content: '';
    top: 0;
    right: 0;
    z-index: 1;
    height: 100%;
    width: 1px;
    position: absolute;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1 / 1;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:after {
      position: absolute;
      content: '';
      left: 0;
      height: 70%;
      width: 4px;
      transition: all 0.3s ease;
      border-radius: 0 5px 5px 0;
    }

    svg {
      height: 35%;
      width: 35%;

      * {
        transition: all 0.3s ease;
      }
    }

    &--active {
      transition: all 0.3s ease;

      &:after {
        transition: all 0.3s ease;
      }

      svg {
        * {
          transition: all 0.3s ease;
        }
      }
    }
  }

  &__tools {
    transition: background-color 0.3s ease !important;
    position: absolute;
    z-index: 11;
    left: $width-panel;
    max-width: 473px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__layers {
    background-color: $primary-background-two;
    border-right: 1px solid $primary-color-border;
  }

  &__title {
    padding: 30px 30px 0 30px;
    font-size: 28px;
    margin-bottom: 24px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  &__block {
    padding: 16px;
    width: 100%;
    cursor: pointer;
  }
}
</style>
