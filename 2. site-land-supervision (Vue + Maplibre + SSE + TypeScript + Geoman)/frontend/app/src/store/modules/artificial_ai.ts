// store/modules/artificial_ai.ts
import { Module } from 'vuex'
import { artificialAiActions } from '@/store/actions/artificial_ai'
import { toolsApi } from '@/api/tools'

export interface IArtificialAiState {
  place: {
    point_min: { lat: number; lon: number }
    point_max: { lat: number; lon: number }
  }
  ai: string
  nameLayer: string
}

export const artificialAiStore: Module<IArtificialAiState, unknown> = {
  namespaced: true,
  state: {
    place: {
      point_min: { lat: 0, lon: 0 },
      point_max: { lat: 0, lon: 0 }
    },
    ai: '',
    nameLayer: ''
  },
  mutations: {
    [artificialAiActions.SET_NAME_LAYER](state, payload: string) {
      state.nameLayer = payload
    },
    [artificialAiActions.SET_PLACE](
      state,
      payload: {
        point_min: { lat: number; lon: number }
        point_max: { lat: number; lon: number }
      }
    ) {
      state.place = payload
    },
    [artificialAiActions.SET_AI](state, payload: string) {
      state.ai = payload
    },
    [artificialAiActions.CLEAR_STORE](state) {
      state.place = {
        point_min: { lat: 0, lon: 0 },
        point_max: { lat: 0, lon: 0 }
      }
      state.ai = ''
      state.nameLayer = ''
    }
  },
  actions: {
    [artificialAiActions.SET_AI]({ commit }, payload: string) {
      commit(artificialAiActions.SET_AI, payload)
    },
    [artificialAiActions.SET_PLACE](
      { commit },
      payload: {
        point_min: { lat: number; lon: number }
        point_max: { lat: number; lon: number }
      }
    ) {
      commit(artificialAiActions.SET_PLACE, payload)
    },
    [artificialAiActions.CLEAR_STORE]({ commit }) {
      commit(artificialAiActions.CLEAR_STORE)
    },
    [artificialAiActions.SET_NAME_LAYER]({ commit }, payload: string) {
      commit(artificialAiActions.SET_NAME_LAYER, payload)
    },

    // Экшен для создания нового слоя (вызываем запрос на /api/v1/tools/forest_growth/)
    async [artificialAiActions.ADD_NEW_LAYER]({ state, commit }) {
      try {
        if (
          state.nameLayer === '' ||
          state.ai === '' ||
          state.place.point_min.lat === 0 ||
          state.place.point_min.lon === 0 ||
          state.place.point_max.lat === 0 ||
          state.place.point_max.lon === 0
        ) {
          ;(window as any).$notify('Не все данные указаны.', true)
          return false
        }

        // вызываем API-модуль toolsApi
        await toolsApi.artificialAi(state.ai, state.nameLayer, state.place)
        commit(artificialAiActions.CLEAR_STORE)
      } catch (error) {
        console.error('Ошибка при ADD_NEW_LAYER:', error)
        // обработка ошибки или уведомление
      }
    }
  },
  getters: {
    place: (state) => state.place,
    ai: (state) => state.ai,
    nameLayer: (state) => state.nameLayer
  }
}
