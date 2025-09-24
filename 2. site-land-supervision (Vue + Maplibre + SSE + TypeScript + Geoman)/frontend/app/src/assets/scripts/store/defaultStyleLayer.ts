import { DefaultStyleLayerState, LayerStyle } from '@/types/Store'

export default {
  namespaced: true,
  state: (): DefaultStyleLayerState => ({
    defaultStylesLayers: {
      '1': { color: 'rgba(211,29,43,0.7)', opacity: 1 },
      '2': { color: 'rgba(255,122,51,0.7)', opacity: 1 },
      '3': { color: 'rgba(255,164,2,0.7)', opacity: 1 },
      '4': { color: 'rgba(123,123,57,0.7)', opacity: 1 },
      '5': { color: 'rgba(160,153,153,0.7)', opacity: 1 },
      '6': { color: 'rgba(121,68,135,0.7)', opacity: 1 },
      '7': { color: 'rgba(235,166,153,0.7)', opacity: 1 },
      '8': { color: 'rgba(242,224,194,0.7)', opacity: 1 },
      '9': { color: 'rgba(13,76,127,0.7)', opacity: 1 },
      '10': { color: 'rgba(84,195,172,0.7)', opacity: 1 }
    },
    previousRandomLayer: null,
    remainingLayers: []
  }),
  getters: {
    getLayerStyle:
      (state: DefaultStyleLayerState) =>
      (id: string): LayerStyle | undefined => {
        return state.defaultStylesLayers[id]
      },
    getRandomLayerStyle(state: DefaultStyleLayerState): LayerStyle | null {
      const layerKeys = Object.keys(state.defaultStylesLayers)

      if (state.remainingLayers.length === 0) {
        state.remainingLayers = [...layerKeys]
      }

      const totalRemaining = state.remainingLayers.length

      if (totalRemaining === 0) {
        return null
      }

      const randomIndex = Math.floor(Math.random() * totalRemaining)
      const selectedLayerKey = state.remainingLayers[randomIndex]

      state.remainingLayers.splice(randomIndex, 1)

      return state.defaultStylesLayers[selectedLayerKey]
    },
    getAllLayerStyle(state: DefaultStyleLayerState): Record<string, LayerStyle> {
      return state.defaultStylesLayers
    }
  }
}
