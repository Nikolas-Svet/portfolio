// store/modules/aiStore.ts
import { Module } from 'vuex'
import { aiActions } from '@/store/actions/ai'
import { toolsApi } from '@/api/tools'
import store from '@/store'
import { toolsStoreActions } from '@/store/actions/tools.ts' // <-- файл, где сделан запрос на /api/v1/tools/forest_growth/

export interface IaiState {
  originalLayers: number[]
  overlayLayers: number[]
  year: number | null
  nameLayer: string
  createLayerFlag: boolean
}

export const aiStore: Module<IaiState, unknown> = {
  namespaced: true,
  state: {
    originalLayers: [],
    overlayLayers: [],
    year: null,
    nameLayer: '',
    createLayerFlag: false
  },
  mutations: {
    [aiActions.SET_ORIGINAL_LAYERS](state, payload: number[]) {
      state.originalLayers = payload
    },
    [aiActions.SET_OVERLAY_LAYERS](state, payload: number[]) {
      state.overlayLayers = payload
    },
    [aiActions.SET_YEAR](state, payload: number) {
      state.year = payload
    },
    [aiActions.CLEAR_STORE](state) {
      state.originalLayers = []
      state.overlayLayers = []
      state.year = null
      state.nameLayer = ''
    },
    [aiActions.SET_NAME_LAYER](state, payload: string) {
      state.nameLayer = payload
    },
    [aiActions.SET_CREATE_FLAG_LAYER](state, payload: boolean) {
      state.createLayerFlag = payload
    }
  },
  actions: {
    // Каждый экшен вызывает свою мутацию
    [aiActions.SET_ORIGINAL_LAYERS]({ commit }, payload: number[]) {
      commit(aiActions.SET_ORIGINAL_LAYERS, payload)
    },
    [aiActions.SET_OVERLAY_LAYERS]({ commit }, payload: number[]) {
      commit(aiActions.SET_OVERLAY_LAYERS, payload)
    },
    [aiActions.SET_YEAR]({ commit }, payload: number) {
      commit(aiActions.SET_YEAR, payload)
    },
    [aiActions.CLEAR_STORE]({ commit }) {
      commit(aiActions.CLEAR_STORE)
    },
    [aiActions.SET_NAME_LAYER]({ commit }, payload: string) {
      commit(aiActions.SET_NAME_LAYER, payload)
    },
    [aiActions.SET_CREATE_FLAG_LAYER]({ commit }, payload: boolean) {
      commit(aiActions.SET_CREATE_FLAG_LAYER, payload)
    },

    // Экшен для создания нового слоя (вызываем запрос на /api/v1/tools/forest_growth/)
    async [aiActions.ADD_NEW_LAYER]({ state, commit }) {
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

        if (toolGeom) {
          await toolsApi.forestGrowth(
            state.originalLayers,
            state.overlayLayers,
            state.nameLayer,
            state.year ?? 0,
            areaFile
          )
        } else {
          await toolsApi.forestGrowth(
            state.originalLayers,
            state.overlayLayers,
            state.nameLayer,
            state.year ?? 0
          )
        }
        store.commit(toolsStoreActions.setToolGeom, null)
        commit(aiActions.CLEAR_STORE)
      } catch (error) {
        console.error('Ошибка при ADD_NEW_LAYER:', error)
        // обработка ошибки или уведомление
      }
    }
  },
  getters: {
    originalLayers: (state) => state.originalLayers,
    overlayLayers: (state) => state.overlayLayers,
    year: (state) => state.year,
    createLayerFlag: (state) => state.createLayerFlag
  }
}
