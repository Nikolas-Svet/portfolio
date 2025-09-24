import { Module } from 'vuex'
import { toolbarActions } from '@/store/actions/toolbar'
import { INotSavedGeoms, TActiveTool } from '@/types/toolbar'

// ВАЖНО: Экспортируем, чтобы импортировать в компоненте
export interface IMessage {
  id: string
  lngLat: [number, number]
  text: string
}

export interface IToolbarState {
  activeCursor: 'default' | 'move' | 'message' | 'crosshair' | ''
  messages: IMessage[]
  is_active_tool: TActiveTool
  measure_distance: boolean
  markers: any[]
  current_delete_point: any
  layers_geoms: any[],
  geoms_for_layer_not_saved: any[]
  current_geoms_ids: string[] | []
  geoms_for_not_saved: INotSavedGeoms[] | []
  saveAllChanges: boolean
  selectedObjects: any[]
}

export const toolbarStore: Module<IToolbarState, unknown> = {
  namespaced: true,

  state: {
    activeCursor: 'default',
    messages: [],
    is_active_tool: null,
    measure_distance: false,
    markers: [],
    current_delete_point: null,
    layers_geoms: [],
    geoms_for_layer_not_saved: [],
    current_geoms_ids: [],
    geoms_for_not_saved: [],
    saveAllChanges: false,
    selectedObjects: []
  },

  mutations: {
    [toolbarActions.SET_SELECTED_OBJECTS](state, payload: any[]) {
      state.selectedObjects = payload
    },
    [toolbarActions.SET_SAVE_ALL](state, payload: boolean) {
      state.saveAllChanges = payload
    },
    [toolbarActions.SET_ACTIVE_CURSOR](state, payload: IToolbarState['activeCursor']) {
      state.activeCursor = payload
    },
    [toolbarActions.ADD_MESSAGE](state, payload: IMessage) {
      state.messages.push(payload)
    },
    [toolbarActions.ADD_LAYER_GEOM](state, payload: any) {
      console.log('ADD_LAYER_GEOM', payload)
      state.layers_geoms.push(payload)
    },
    [toolbarActions.SET_MESSAGE](state, payload: any) {
      console.log('SET_MESSAGE')
      state.messages = payload
      return true
    },
    [toolbarActions.UPDATE_MESSAGE_TEXT](state, payload: { id: string; newText: string }) {
      const msg = state.messages.find((m) => m.id === payload.id)
      if (msg) {
        msg.text = payload.newText
      }
    },
    [toolbarActions.DELETE_MESSAGE](state, id: string) {
      state.messages = state.messages.filter((m) => m.id !== id)
    },
    [toolbarActions.ADD_ACTIVE_TOOL](state, activities: TActiveTool) {
      state.is_active_tool = activities
    },
    [toolbarActions.SET_MEASURE_DISTANCE](state, activities: boolean) {
      console.log('SET_MEASURE_DISTANCE')
      state.measure_distance = activities
    },
    [toolbarActions.SET_MARKERS](state, payload: any[]) {
      console.log('SET_MARKERS')
      state.markers = payload
    },
    [toolbarActions.SET_CURRENT_DELETE_POINT](state, payload: any) {
      console.log('SET_CURRENT_DELETE_POINT')
      state.current_delete_point = payload
    },
    [toolbarActions.ADD_GEOMS_FOR_LAYER](state, payload: any) {
      console.log('ADD_GEOMS_FOR_LAYER')
      const id = Number(payload.id_layer)
      const idx = state.geoms_for_layer_not_saved.findIndex(item => Number(item.id_layer) === id)

      if (idx !== -1) {
        state.geoms_for_layer_not_saved.splice(idx, 1, payload)
        console.log('🔄 Обновлена геометрия слоя', id)
      } else {
        state.geoms_for_layer_not_saved.push(payload)
        console.log('✅ Добавлена новая геометрия слоя', id)
      }
    },
    [toolbarActions.SET_GEOM_NOT_SAVED](state, payload: any) {
      // console.log('SET_GEOM_NOT_SAVED')
      state.geoms_for_layer_not_saved = payload
    },
    [toolbarActions.CLEAR_ALL](state) {
      // console.log('CLEAR_ALL2')
      state.current_delete_point = null
      state.markers = []
      state.is_active_tool = null
    },
    [toolbarActions.SET_CURRENT_GEOMS_IDS](state, payload: string[]) {
      // console.log('SET_CURRENT_GEOMS_IDS', payload)
      state.current_geoms_ids = payload
    },
    [toolbarActions.SET_GEOMS_FOR_NOT_SAVED](state, payload: INotSavedGeoms[] | []) {
      // console.log('SET_GEOMS_FOR_NOT_SAVED', payload)
      state.geoms_for_not_saved = payload
    }
  },

  actions: {
    [toolbarActions.SET_SELECTED_OBJECTS]({ commit }, payload: any[]) {
      commit(toolbarActions.SET_SELECTED_OBJECTS, payload)
    },
    [toolbarActions.SET_ACTIVE_CURSOR]({ commit }, payload: IToolbarState['activeCursor']) {
      commit(toolbarActions.SET_ACTIVE_CURSOR, payload)
    },
    [toolbarActions.SET_SAVE_ALL]({ commit }, payload: boolean) {
      commit(toolbarActions.SET_SAVE_ALL, payload)
    },

    [toolbarActions.ADD_MESSAGE]({ commit }, payload: Omit<IMessage, 'id'>) {
      const newId = Date.now().toString()
      console.log('NEW MESSAGE', payload.lngLat, payload.text, newId)
      commit(toolbarActions.ADD_MESSAGE, {
        id: newId,
        lngLat: payload.lngLat,
        text: payload.text
      })
      // Возвращаем newId, если нужно
      return newId
    },

    [toolbarActions.SET_MESSAGE]({ commit }, payload: any) {
      commit(toolbarActions.ADD_MESSAGE, payload)
    },

    [toolbarActions.ADD_LAYER_GEOM]({ commit }, payload: any) {
      commit(toolbarActions.ADD_LAYER_GEOM, payload)
    },

    [toolbarActions.UPDATE_MESSAGE_TEXT]({ commit }, payload: { id: string; newText: string }) {
      commit(toolbarActions.UPDATE_MESSAGE_TEXT, payload)
    },

    [toolbarActions.DELETE_MESSAGE]({ commit }, id: string) {
      commit(toolbarActions.DELETE_MESSAGE, id)
    },

    [toolbarActions.ADD_ACTIVE_TOOL]({ commit }, activities: TActiveTool) {
      commit(toolbarActions.ADD_ACTIVE_TOOL, activities)
    },
    [toolbarActions.SET_MEASURE_DISTANCE]({ commit }, activities: boolean) {
      commit(toolbarActions.SET_MEASURE_DISTANCE, activities)
    },
    [toolbarActions.SET_MARKERS]({ commit }, payload: any[]) {
      commit(toolbarActions.SET_MARKERS, payload)
    },
    [toolbarActions.SET_CURRENT_DELETE_POINT]({ commit }, payload: any) {
      commit(toolbarActions.SET_CURRENT_DELETE_POINT, payload)
    },
    [toolbarActions.ADD_GEOMS_FOR_LAYER]({ commit }, payload: any[]) {
      commit(toolbarActions.ADD_GEOMS_FOR_LAYER, payload)
    },
    [toolbarActions.SET_GEOM_NOT_SAVED]({ commit }, payload: any[]) {
      commit(toolbarActions.SET_GEOM_NOT_SAVED, payload)
    },
    [toolbarActions.CLEAR_ALL]({ commit }) {
      commit(toolbarActions.CLEAR_ALL)
    },
    [toolbarActions.SET_CURRENT_GEOMS_IDS]({ commit }, payload: string[]) {
      commit(toolbarActions.SET_CURRENT_GEOMS_IDS, payload)
    },
    [toolbarActions.SET_GEOMS_FOR_NOT_SAVED]({ commit }, payload: INotSavedGeoms[] | []) {
      commit(toolbarActions.SET_GEOMS_FOR_NOT_SAVED, payload)
    }

  },

  getters: {
    activeCursor: (state) => state.activeCursor,
    messages: (state) => state.messages,
    is_active_tool: (state) => state.is_active_tool,
    measure_distance: (state) => state.measure_distance,
    current_delete_point: (state) => state.current_delete_point,
    layers_geoms: (state) => state.layers_geoms,
    geoms_for_layer_not_saved: (state) => state.geoms_for_layer_not_saved,
    current_geoms_ids: (state) => state.current_geoms_ids,
    selectedObjects: (state) => state.selectedObjects,
    saveAllChanges: (state) => state.saveAllChanges,
    geoms_for_not_saved: (state) => state.geoms_for_not_saved
  }
}
