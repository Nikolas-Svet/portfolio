<script lang="ts" setup>
import ModalContainer from '@/components/app/map/ModalContainer.vue'
import InfoBoxFields from '@/components/app/map/InfoBox/InfoBoxFields.vue'
import InfoBoxStyles from '@/components/app/map/InfoBox/InfoBoxStyles.vue'
import store from '@/store'
import { Consts } from '@/consts/index.consts.ts'
import InfoBoxContent from '@/components/app/map/InfoBoxContent.vue'

const props = defineProps<{
  map: maplibregl.Map | null
  openedIdObject: number
  openedIdLayer: number
}>()

const emit = defineEmits<{
  (e: 'closeInfoBox'): void
}>()

const final_price_forest = computed(() => {
  return store.getters['final_price_forest']
})

watch(final_price_forest, async (newValue) => {
  if (newValue.area_forest === 0) {
    return
  }
  const default_price_forest = store.getters['default_price_forest']
  const square_forest = store.getters['square_forest']
  let value = 10000 * store.getters['measurement/selectedUnit'].conversionFactor
  const info2 = {
    name: 'Стоимость расчистки полей с помощью мульчера',
    value: `${default_price_forest / value} руб/${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
  }

  const info3 = {
    name: 'Площадь леса в области',
    value: `${store.getters['measurement/convert'](square_forest * 10000).toFixed(3)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
  }
  const info4 = {
    name: 'Площадь участка',
    value: `${store.getters['measurement/convert'](newValue.area_region * 10000).toFixed(3)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
  }
  const info5 = {
    name: 'Процент залесенности участка',
    value: `${newValue.forestation}%`
  }
  const info = {
    name: 'Расчетная стоимость ввода земельного участка в оборот составляет',
    value: `${(store.getters['measurement/convert'](square_forest * 10000) * (default_price_forest / value)).toFixed(2)} рублей`
  }
  await store.dispatch('infoBox/SET_TITLE_INFO_BOX', Consts.rowName.title)
  const data_info = [info, info2, info3, info4, info5]
  await store.dispatch('infoBox/SET_DATA_INFO', data_info)
}, { deep: true, immediate: true })

const selectedLayerMain = computed(() => {
  return store.state.layersMain?.selectedLayerMain || []
})

const isSelectedLegend = computed(() => {
  return store.getters['treeItemStore/isSelectedLegend']
})

const data_info = computed(() => {
  return store.state.infoBox.data_info
})

const modalContainer = ref<InstanceType<typeof ModalContainer> | null>(null)

const title_info_box = computed(() => {
  return store.state.infoBox.title_info_box
})

const showEditFields = ref<boolean>(false)


const openInfoBoxModal = () => {
  // Получаем ссылку на локальный ModalContainer через ref
  if (!modalContainer.value) {
    console.error('Modal container not found!')
    return
  }
  const infoBox = document.querySelector('.info-box') as HTMLElement

  if (!infoBox) {
    console.error('infoBox не найден в DOM!')
    return
  }

  const rect = infoBox.getBoundingClientRect()
  const top = `${rect.top - 50}px`
  const left = `${rect.left}px`

  modalContainer.value.openModal({
    title: title_info_box.value ? title_info_box.value : '',
    component: InfoBoxContent,
    props: {
      title: title_info_box?.value,
      data_info: data_info.value,
      currentOpacity: 1,
      selectedLayerType: selectedLayerMain.value.type === Consts.LayerTypes.VECTOR ? 'vector' : 'raster',
      currentColor: '',
      currentSaturation: 0
    },
    style: { top, left }
  })
}

</script>

<template>
  <EditFieldsModal v-if="showEditFields" :objectId="props.openedIdObject" @close="showEditFields = false" />
  <section
    v-if="data_info || (Object.keys(selectedLayerMain).length !== 0 && isSelectedLegend)"
    class="info-box">
    <InfoBoxFields @closeInfoBox="emit('closeInfoBox')" v-if="data_info" @update:openModal='openInfoBoxModal'
                   @openFieldsModal="showEditFields = true;"
                   :opened-id-object="props.openedIdObject as any"
                   :opened-id-layer="props.openedIdLayer as any" />
    <InfoBoxStyles
      :map="props.map"
      v-else-if="(selectedLayerMain.type === Consts.LayerTypes.VECTOR && isSelectedLegend) || selectedLayerMain.type === Consts.LayerTypes.RASTER" />
  </section>
  <ModalContainer :map="props.map" ref="modalContainer"></ModalContainer>
</template>

<style lang="scss">
.info-box {
  max-height: calc(100vh - 263px);
  margin: 10px;
  position: absolute;
  right: 20px;
  bottom: 20px;
  max-width: 480px;
  min-width: 270px;
  padding: 30px;
  width: 20%;
  display: flex;
  flex-direction: column;
  z-index: 10;
  clip-path: inset(2px);
  backdrop-filter: blur(8px);

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.8;
  }

  label {
    span {
      display: block;
    }
  }

  &:after {
    content: '';
    z-index: -1;
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    filter: blur(3px);
  }

  p {
    font-size: 16px;
    letter-spacing: 1px;

    &:first-child {
      position: relative;
      text-align: left;
      font-family: $Golos_Text_Medium;
      font-weight: 500;
      font-size: 20px;
      margin-bottom: 20px;
    }
  }

  ul {
    list-style-type: none;

    span {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    li {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }

      span {
        margin-right: 5px;
      }
    }
  }
}
</style>