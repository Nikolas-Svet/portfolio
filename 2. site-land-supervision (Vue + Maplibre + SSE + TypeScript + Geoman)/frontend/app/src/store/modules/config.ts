// store/modules/config.ts
import { Module } from 'vuex'
import { configActions } from '@/store/actions/config'

export interface IconfigState {
  default_price_forest: number
  final_price_forest: IResponce
  square_forest: number
  flagUpdateLayer: number | null
}

interface IResponce {
  area_region: number
  area_forest: number
  forestation: number
}

export const configStore: Module<IconfigState, unknown> = {
  state: {
    default_price_forest: 70000,
    final_price_forest: {
      area_region: 0,
      area_forest: 0,
      forestation: 0
    },
    square_forest: 0,
    flagUpdateLayer: null
  },
  mutations: {
    [configActions.setDefaultPriceForest](state, payload: number) {
      state.default_price_forest = payload
    },
    [configActions.setFinalPriceForest](state, payload: IResponce) {
      console.log(payload)
      state.final_price_forest = payload
      state.final_price_forest.area_forest = state.final_price_forest.area_forest / 10000
      state.final_price_forest.area_region = state.final_price_forest.area_region / 10000
      state.square_forest = state.final_price_forest.area_forest
      console.log('final_price_forest: ', state.final_price_forest)
    },
    [configActions.setSquare](state, payload: number) {
      state.square_forest = payload
    },
    [configActions.SET_UPDATE_LAYER](state, payload: number) {
      state.flagUpdateLayer = payload
    }
  },
  actions: {
    [configActions.setDefaultPriceForest]({ commit }, payload: number) {
      commit(configActions.setDefaultPriceForest, payload)
    },
    [configActions.setFinalPriceForest]({ commit }, payload: IResponce) {
      commit(configActions.setFinalPriceForest, payload)
    },
    [configActions.setSquare]({ commit }, payload: number) {
      commit(configActions.setSquare, payload)
    },
    [configActions.SET_UPDATE_LAYER]({ commit }, payload: number) {
      commit(configActions.SET_UPDATE_LAYER, payload)
    }
  },
  getters: {
    default_price_forest: (state) => state.default_price_forest,
    final_price_forest: (state) => state.final_price_forest,
    square_forest: (state) => state.square_forest,
    flagUpdateLayer: (state) => state.flagUpdateLayer
  }
}
