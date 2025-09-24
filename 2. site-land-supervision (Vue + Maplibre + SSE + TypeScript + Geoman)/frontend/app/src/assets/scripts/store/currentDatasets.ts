import { toRaw } from 'vue'
import { CurrentDatasetsState } from '@/types/Store'
import { ActionContext } from 'vuex'

export default {
  namespaced: true,
  state: (): CurrentDatasetsState => ({
    currentLayers: [],
    selectedLayerId: null,
    selectedFeatureId: null,
    selectedLayerType: null,
    selectedDatasetId: null,
    layerOrder: [],
    selectedDesktopName: '',
    selectedDesktopDescription: ''
  }),
  mutations: {
    updateCurrentLayers(state: CurrentDatasetsState, layers: any[]) {
      state.currentLayers = layers
    },
    addLayer(state: CurrentDatasetsState, layer: any) {
      state.currentLayers.push(layer)
      console.log('New currentLayer', toRaw(state.currentLayers))
    },
    setSelectedLayerId(
      state: CurrentDatasetsState,
      { layerId, layerType }: { layerId: number; layerType: string }
    ) {
      state.selectedLayerId = layerId
      state.selectedLayerType = layerType
    },
    setSelectedFeatureId(state: CurrentDatasetsState, featureId: number) {
      state.selectedFeatureId = featureId
    },
    updateLayerOrder(state: CurrentDatasetsState, order: any[]) {
      state.layerOrder = order
      console.log(toRaw(state.layerOrder))
    },
    setSelectedDesktopInfo(
      state: CurrentDatasetsState,
      { name, description }: { name: string; description: string }
    ) {
      state.selectedDesktopName = name
      state.selectedDesktopDescription = description
    }
  },
  actions: {
    addOrUpdateLayer(
      { commit, state }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      layer: any
    ) {
      const existingLayerIndex = state.currentLayers.findIndex(
        (existing: any) => existing.name_type === layer.name_type
      )

      if (existingLayerIndex !== -1) {
        const existingLayer = state.currentLayers[existingLayerIndex]

        const updatedDataset = [...existingLayer.dataset]

        layer.dataset.forEach((newDataset: any) => {
          const isDatasetAlreadyAdded = updatedDataset.some(
            (existingDataset: any) => existingDataset.id === newDataset.id
          )

          if (!isDatasetAlreadyAdded) {
            updatedDataset.push(newDataset)
          }
        })

        const updatedLayer = {
          ...existingLayer,
          dataset: updatedDataset
        }

        commit('updateCurrentLayers', [
          ...state.currentLayers.slice(0, existingLayerIndex),
          updatedLayer,
          ...state.currentLayers.slice(existingLayerIndex + 1)
        ])
      } else {
        commit('addLayer', layer)
      }
    },
    setCurrentLayers(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      layers: any[]
    ) {
      commit('updateCurrentLayers', layers)
      console.log('Обновлен currentLayers:', toRaw(layers))
    },
    addCurrentLayer(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      layer: any
    ) {
      console.log('Добавлен новый слой', layer)
      commit('addLayer', layer)
    },
    selectLayer(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      { layerId, layerType }: { layerId: number; layerType: string }
    ) {
      commit('setSelectedLayerId', { layerId, layerType })
    },
    selectFeature(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      featureId: number
    ) {
      commit('setSelectedFeatureId', featureId)
    },
    updateLayerOrder(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      order: any[]
    ) {
      commit('updateLayerOrder', order)
    },
    setSelectedDesktopInfo(
      { commit }: ActionContext<CurrentDatasetsState, CurrentDatasetsState>,
      { name, description }: { name: string; description: string }
    ) {
      commit('setSelectedDesktopInfo', { name, description })
    }
  },
  getters: {
    getCurrentLayers(state: CurrentDatasetsState) {
      return state.currentLayers
    },
    getSelectedLayerId(state: CurrentDatasetsState) {
      return state.selectedLayerId
    },
    getSelectedLayerType(state: CurrentDatasetsState) {
      return state.selectedLayerType
    },
    getSelectedDatasetId(state: CurrentDatasetsState) {
      return state.selectedDatasetId
    },
    getSelectedFeatureId(state: CurrentDatasetsState) {
      return state.selectedFeatureId
    },
    getLayerOrder(state: CurrentDatasetsState) {
      return state.layerOrder
    },
    getSelectedDesktopName(state: CurrentDatasetsState) {
      return state.selectedDesktopName
    },
    getSelectedDesktopDescription(state: CurrentDatasetsState) {
      return state.selectedDesktopDescription
    }
  }
}
