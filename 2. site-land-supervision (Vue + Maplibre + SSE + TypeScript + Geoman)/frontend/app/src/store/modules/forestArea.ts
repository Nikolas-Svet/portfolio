// store/modules/forestArea.ts
import { Module } from 'vuex'
import { forestAreaActions } from '@/store/actions/forestArea'
import store from '@/store'
import { toolsApi } from '@/api/tools.ts'
import { toolsStoreActions } from '@/store/actions/tools.ts' // <-- файл, где сделан запрос на /api/v1/tools/forest_growth/

export interface IforestAreaState {
  originalLayers: number[]
  overlayLayers: number[]
  flagCreateLayer: boolean
  currentID: number
}

export const forestAreaStore: Module<IforestAreaState, unknown> = {
  namespaced: true,
  state: {
    originalLayers: [],
    overlayLayers: [],
    flagCreateLayer: false,
    currentID: 0
  },
  mutations: {
    [forestAreaActions.SET_ORIGINAL_LAYERS](state, payload: number[]) {
      console.log('SET_ORIGINAL_LAYERS', payload)
      state.originalLayers = [...new Set(payload)]
    },
    [forestAreaActions.SET_OVERLAY_LAYERS](state, payload: number[]) {
      state.overlayLayers = payload
    },
    [forestAreaActions.CLEAR_STORE](state) {
      state.originalLayers = []
      state.overlayLayers = []
    },
    [forestAreaActions.SET_FLAG_CREATE_LAYER](state, payload: boolean) {
      state.flagCreateLayer = payload
    },
    [forestAreaActions.SET_CURRENT_ID](state, payload: number) {
      state.currentID = payload
    }
  },
  actions: {
    // Каждый экшен вызывает свою мутацию
    [forestAreaActions.SET_ORIGINAL_LAYERS]({ commit }, payload: number[]) {
      commit(forestAreaActions.SET_ORIGINAL_LAYERS, payload)
    },
    [forestAreaActions.SET_OVERLAY_LAYERS]({ commit }, payload: number[]) {
      commit(forestAreaActions.SET_OVERLAY_LAYERS, payload)
    },
    [forestAreaActions.CLEAR_STORE]({ commit }) {
      commit(forestAreaActions.CLEAR_STORE)
    },
    [forestAreaActions.SET_FLAG_CREATE_LAYER]({ commit }, payload: boolean) {
      commit(forestAreaActions.SET_FLAG_CREATE_LAYER, payload)
    },
    [forestAreaActions.SET_CURRENT_ID]({ commit }, payload: number) {
      commit(forestAreaActions.SET_CURRENT_ID, payload)
    },

    async [forestAreaActions.ADD_NEW_LAYER]({ state, commit }) {
      try {

        const toolGeom = store.getters.toolGeom
        console.log(toolGeom)
        let areaFile: File | null = null

        if (toolGeom) {
          const blob = new Blob(
            [JSON.stringify(toolGeom)],
            { type: 'application/geo+json' }
          )
          areaFile = new File(
            [blob],
            'area.geojson',
            { type: 'application/geo+json' }
          )
        }

        const response = await toolsApi.forestArea(state.originalLayers, state.overlayLayers, areaFile)
        store.commit(toolsStoreActions.setToolGeom, null)
        commit(forestAreaActions.CLEAR_STORE)
        return response
      } catch (error) {
        console.error('Ошибка при ADD_NEW_LAYER:', error)
      }
    }
  },
  getters: {
    originalLayers: (state) => state.originalLayers,
    overlayLayers: (state) => state.overlayLayers,
    flagCreateLayer: (state) => state.flagCreateLayer,
    currentID: (state) => state.currentID
  }
}
