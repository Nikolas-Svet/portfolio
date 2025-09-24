import { Module } from 'vuex'
import { ILayersStateMain, IRasterLayer, IVectorLayer, Layer } from '@/types/layersVector'
import { layersMainActions } from '../actions/layersMain'

export const layersMainStore: Module<ILayersStateMain, unknown> = {
  namespaced: true,
  state: {
    layersMain: [],
    layerOrderMain: [],
    selectedLayerMain: {} as IVectorLayer | IRasterLayer,
    selectedLayerMainEdit: {} as IVectorLayer | IRasterLayer,
    new_geom_flag: false,
    flyLayerMain: {} as IVectorLayer | IRasterLayer | null,
    editLayerMain: {} as IVectorLayer | IRasterLayer,
    newLayerFromTool: [],
    coord: [],
    hoverLayer: null
  },
  mutations: {
    [layersMainActions.setLayersMain](state, layers: Layer[]) {
      state.layersMain = layers

      state.layerOrderMain = layers.map((layer) => ({
        id: Number(layer.id),
        type: layer.type
      }))
      console.log('MAIN: Установлены слои и порядок:', state.layerOrderMain)
    },
    [layersMainActions.addLayerMain](state, layer: Layer) {
      console.log('MAIN: Добавлен слой')
      console.log(layer)
      const exists = state.layersMain.some(
        (existingLayer) => existingLayer.id === layer.id && existingLayer.type === layer.type
      )

      if (!exists) {
        state.layersMain.unshift(layer)
        state.layerOrderMain.unshift({
          id: Number(layer.id),
          type: layer.type
        })
        console.log('MAIN: Добавлен слой и обновлён порядок:', state.layerOrderMain)
      } else {
        console.warn(`Слой с id=${layer.id} и типом=${layer.type} уже существует. MAIN`)
      }
    },
    [layersMainActions.deleteLayerMain](state, layer: Layer | number) {
      let id
      let type

      if (typeof layer === 'number') {
        id = layer
        type = 'layer-vector'
      } else {
        ;({ id, type } = layer) // Деструктуризация из объекта
      }
      state.layersMain = state.layersMain.filter(
        (existingLayer) => !(existingLayer.id === id && existingLayer.type === type)
      )

      state.layerOrderMain = state.layerOrderMain.filter(
        (orderItem) => !(orderItem.id === id && orderItem.type === type)
      )

      console.log(`MAIN: Удалён слой с id=${id} и типом=${type}.`)
      console.log('MAIN: Обновлён порядок:', state.layerOrderMain)
      console.log('MAIN:', state.layersMain)
    },
    [layersMainActions.updateLayerMain](state, updatedLayer: Layer) {
      const index = state.layersMain.findIndex(
        (layer) => Number(layer.id) === Number(updatedLayer.id) && layer.type === updatedLayer.type
      )

      if (index !== -1) {
        state.layersMain.splice(index, 1, updatedLayer)
      } else {
        console.warn(`MAIN Слой с id=${updatedLayer.id} и типом=${updatedLayer.type} не найден.`)
      }
    },
    [layersMainActions.orderLayersMain](
      state,
      layersOrder: { id: number; type: string; group?: string }[]
    ) {
      if (layersOrder.every((item) => typeof item === 'object' && 'id' in item && 'type' in item)) {
        state.layerOrderMain = layersOrder.map(({ id, type }) => ({ id, type }))
        console.log('MAIN: layerOrderMain обновлён напрямую:', state.layerOrderMain)
        return
      }
      console.warn('MAIN: Формат layersOrder некорректный.')
    },
    [layersMainActions.setSelectedLayerMain](state, layer: IVectorLayer | IRasterLayer) {
      state.selectedLayerMain = layer
      console.log('set selectedLayerMain: ', state.selectedLayerMain)
    },
    [layersMainActions.setSelectedLayerMainEdit](state, layer: IVectorLayer | IRasterLayer) {
      state.new_geom_flag = false
      console.log('set selectedLayerMainEdit: ', state.selectedLayerMainEdit)
      if (layer.id !== state.selectedLayerMainEdit.id && layer.id) {
        state.new_geom_flag = true
      }
      state.selectedLayerMainEdit = layer
    },
    [layersMainActions.setFlyLayerMain](state, layer: IVectorLayer | IRasterLayer | null) {
      state.flyLayerMain = layer
      console.log('set flyLayerMain: ', state.flyLayerMain)
    },
    [layersMainActions.setEditLayerMain](state, layer: IVectorLayer | IRasterLayer) {
      state.editLayerMain = layer
      console.log('set setEditLayerMain: ', state.editLayerMain)
    },
    [layersMainActions.setLayersAndOrderMain](
      state,
      payload: {
        layers: Layer[]
        layersOrder: { id: number; type: string; group?: string }[]
      }
    ) {
      const { layers, layersOrder } = payload


      if (layers.length === 0) {
        state.layersMain = []
        state.layerOrderMain = []
        return
      }

      state.layersMain = layers

      state.layerOrderMain = layersOrder.map(({ id, type }) => ({ id, type }))

      console.log('MAIN: Установлены слои и порядок:', {
        layersMain: state.layersMain,
        layerOrderMain: state.layerOrderMain
      })
    },
    [layersMainActions.setNewLayerFromTool](state, payload: number[]) {
      console.log('[SSE] добавляю слой', state.newLayerFromTool)
      state.newLayerFromTool = [...payload]
      console.log('[SSE] слой добавлен', state.newLayerFromTool)
    },
    [layersMainActions.addNewLayerFromTool](state, payload: number) {
      console.log('addNewLayerFromTool: ', payload)
      state.newLayerFromTool.push(payload)
      console.log('addNewLayerFromTool: ', state.newLayerFromTool)
    },
    [layersMainActions.setCoord](state, payload: number[]) {
      console.log('setCoord: ', payload)
      state.coord = [...payload]
      console.log('setCoord: ', state.coord)
    },
    [layersMainActions.SET_NEW_GEOM_FLAG](state, payload: boolean) {
      state.new_geom_flag = payload
    },
    [layersMainActions.setHoverLayer](state, payload: IVectorLayer | null) {
      console.log('setHoverLayer: ', payload)
      state.hoverLayer = payload
    }
  },
  actions: {
    [layersMainActions.setLayersMain]({ commit }, layers: Layer[]) {
      commit(layersMainActions.setLayersMain, layers)
    },
    [layersMainActions.addLayerMain]({ commit }, layer: Layer) {
      commit(layersMainActions.addLayerMain, layer)
    },
    [layersMainActions.deleteLayerMain]({ commit }, layerId: number | string) {
      commit(layersMainActions.deleteLayerMain, layerId)
    },
    [layersMainActions.updateLayerMain]({ commit }, updatedLayer: Layer) {
      commit(layersMainActions.updateLayerMain, updatedLayer)
    },
    [layersMainActions.orderLayersMain](
      { commit },
      layersOrder: { id: string | number; group?: string }[]
    ) {
      commit(layersMainActions.orderLayersMain, layersOrder)
    },
    [layersMainActions.setSelectedLayerMain]({ commit }, layer: Layer[]) {
      commit(layersMainActions.setSelectedLayerMain, layer)
    },
    [layersMainActions.setSelectedLayerMainEdit]({ commit }, layer: Layer[]) {
      commit(layersMainActions.setSelectedLayerMainEdit, layer)
    },
    [layersMainActions.setFlyLayerMain]({ commit }, layer: Layer[]) {
      commit(layersMainActions.setFlyLayerMain, layer)
    },
    [layersMainActions.setEditLayerMain]({ commit }, layer: Layer[]) {
      commit(layersMainActions.setEditLayerMain, layer)
    },
    [layersMainActions.setLayersAndOrderMain](
      { commit },
      payload: {
        layers: Layer[]
        layersOrder: { id: number; type: string; group?: string }[]
      }
    ) {
      commit(layersMainActions.setLayersAndOrderMain, payload)
    },
    [layersMainActions.setNewLayerFromTool]({ commit }, payload: number[]) {
      commit(layersMainActions.setNewLayerFromTool, payload)
    },
    [layersMainActions.addNewLayerFromTool]({ commit }, payload: number) {
      commit(layersMainActions.addNewLayerFromTool, payload)
    },
    [layersMainActions.setCoord]({ commit }, payload: number[]) {
      commit(layersMainActions.setCoord, payload)
    },
    [layersMainActions.SET_NEW_GEOM_FLAG]({ commit }, payload: boolean) {
      commit(layersMainActions.SET_NEW_GEOM_FLAG, payload)
    },
    [layersMainActions.setHoverLayer]({ commit }, payload: IVectorLayer | null) {
      commit(layersMainActions.setHoverLayer, payload)
    }

  },
  getters: {
    layers: (state) => state.layersMain,
    layerOrderMain: (state) => state.layerOrderMain,
    newLayerFromTool: (state) => state.newLayerFromTool,
    coord: (state) => state.coord,
    hoverLayer: (state) => state.hoverLayer

  }
}
