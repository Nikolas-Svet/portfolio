import { Module } from 'vuex'
import { searchActions } from '@/store/actions/search.ts'

// ✅ Исправленный интерфейс (suggestions — массив объектов)
export interface IsearchState {
  suggestions: Array<{
    id_geom: number
    num_egrn: string
    geojson: {
      type: string
      coordinates: number[]
    }
  }> | null
}

export const searchStore: Module<IsearchState, unknown> = {
  state: {
    suggestions: null
  },
  mutations: {
    [searchActions.setSuggestions](state, payload: IsearchState['suggestions']) {
      console.log(12121321321213)
      state.suggestions = payload
    }
  },
  actions: {
    [searchActions.setSuggestions]({ commit }, payload: IsearchState['suggestions']) {
      commit(searchActions.setSuggestions, payload)
    }
  },
  getters: {
    suggestions: (state) => state.suggestions
  }
}
