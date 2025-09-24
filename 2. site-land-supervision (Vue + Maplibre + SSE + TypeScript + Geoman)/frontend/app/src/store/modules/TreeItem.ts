import { Module } from 'vuex'
import { treeItemActions } from '@/store/actions/TreeItem'

export interface ITreeItemState {
  currentItem: string | null // Сохраняем item.id выбранного элемента
  isSelectedKebab: boolean
  isSelectedLegend: boolean
}

export const treeItemStore: Module<ITreeItemState, unknown> = {
  namespaced: true,
  state: {
    currentItem: null,
    isSelectedKebab: false,
    isSelectedLegend: false
  },
  mutations: {
    [treeItemActions.SET_CURRENT_ITEM](state, payload: string | null) {
      state.currentItem = payload
    },
    [treeItemActions.SET_SELECTED_KEBAB](state, payload: boolean) {
      state.isSelectedKebab = payload
    },
    [treeItemActions.SET_SELECTED_LEGEND](state, payload: boolean) {
      state.isSelectedLegend = payload
    },
    [treeItemActions.CLEAR_SELECTION](state) {
      state.currentItem = null
      state.isSelectedKebab = false
      state.isSelectedLegend = false
    }
  },
  actions: {
    [treeItemActions.SET_CURRENT_ITEM]({ commit }, payload: string | null) {
      commit(treeItemActions.SET_CURRENT_ITEM, payload)
    },
    [treeItemActions.SET_SELECTED_KEBAB]({ commit }, payload: boolean) {
      commit(treeItemActions.SET_SELECTED_KEBAB, payload)
    },
    [treeItemActions.SET_SELECTED_LEGEND]({ commit }, payload: boolean) {
      commit(treeItemActions.SET_SELECTED_LEGEND, payload)
    },
    [treeItemActions.CLEAR_SELECTION]({ commit }) {
      commit(treeItemActions.CLEAR_SELECTION)
    }
  },
  getters: {
    currentItem: (state) => state.currentItem,
    isSelectedKebab: (state) => state.isSelectedKebab,
    isSelectedLegend: (state) => state.isSelectedLegend
  }
}
