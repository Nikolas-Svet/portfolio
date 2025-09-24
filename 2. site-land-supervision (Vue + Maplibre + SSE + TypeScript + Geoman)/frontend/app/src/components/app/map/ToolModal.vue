<template>
  <MergingVector v-if="showMergingVector" />
  <subtractionVector v-if="showSubstractionPopup" />
  <ForestArea v-if="showForestAreaPopup"></ForestArea>
  <AddVector v-if="showAddVectorPopup" @update:addVectorFlag="payload => emit('update:addVectorFlag', payload)" />
  <artificial_ai v-if="showArtificialAi" @draw-place="(payload: string) => emit('draw-place', payload)" />
  <filter-vector-layers v-if="showFilterVector" @draw-place="(payload: string) => emit('draw-place', payload)" />
  <ai v-if="showAiPopup" @draw-place="(payload: string) => emit('draw-place', payload)" />
</template>

<script lang="ts" setup>
import store from '@/store'
import { substractionLayerActions } from '@/store/actions/substractionLayer'

type AddVectorFlagPayload = {
  value: boolean
  cancel: boolean
  isFile: boolean
}

const emit = defineEmits<{
  (e: 'update:addVectorFlag', payload: AddVectorFlagPayload): void
  (e: 'draw-place', payload: string): void
}>()

const showMergingVector = computed(() => {
  return store.getters.mergingVector
})

const showSubstractionPopup = computed(() => {
  return store.getters.substraction
})

watch(showSubstractionPopup, () => {
  store.commit(substractionLayerActions.CLEAR_NEW_LAYER_DATA)
})

const showForestAreaPopup = computed(() => {
  return store.getters.forestArea
})

const showAddVectorPopup = computed(() => {
  return store.getters.vector
})

const showArtificialAi = computed(() => {
  return store.getters.artificialAi
})

const showFilterVector = computed(() => {
  return store.getters.filterVector
})

const showAiPopup = computed(() => {
  return store.getters.ai
})


</script>

<style scoped>
</style>
