import { IToolsStore } from '@/types/Store'
import { toolsStoreActions } from '../actions/tools'

export const toolStore = {
  state: {
    vector: false,
    substraction: false,
    ai: false,
    forestArea: false,
    artificialAi: false,
    mergingVector: false,
    filterVector: false,
    place: {
      point_min: { lat: 0, lon: 0 },
      point_max: { lat: 0, lon: 0 }
    },
    dragAndDrop: false,
    filterPlace: false,
    toolGeom: null
  },
  mutations: {
    [toolsStoreActions.showAddVector](state: IToolsStore, value: boolean) {
      state.vector = value
    },
    [toolsStoreActions.showSubstractionVectors](state: IToolsStore, value: boolean) {
      state.substraction = value
    },
    [toolsStoreActions.showAi](state: IToolsStore, value: boolean) {
      state.ai = value
    },
    [toolsStoreActions.showForestArea](state: IToolsStore, value: boolean) {
      state.forestArea = value
    },
    [toolsStoreActions.showArtificialAi](state: IToolsStore, value: boolean) {
      state.artificialAi = value
    },
    [toolsStoreActions.showMergingVector](state: IToolsStore, value: boolean) {
      state.mergingVector = value
    },
    [toolsStoreActions.showFilterVector](state: IToolsStore, value: boolean) {
      state.filterVector = value
    },
    [toolsStoreActions.setDragAndDrop](state: IToolsStore, value: boolean) {
      state.dragAndDrop = value
    },
    [toolsStoreActions.showFilterPlaceFlag](state: IToolsStore, value: boolean) {
      state.filterPlace = value
    },
    [toolsStoreActions.setToolGeom](state: IToolsStore, payload: any) {
      console.log('toolsStoreActions.setToolGeom', payload)
      state.toolGeom = payload
    },
    [toolsStoreActions.setFilterPlace](
      state: IToolsStore,
      value: {
        point_min: { lat: number; lon: number }
        point_max: { lat: number; lon: number }
        crop: boolean
      }
    ) {
      state.place = value
    }
  },
  actions: {
    [toolsStoreActions.setFilterPlace](
      { commit }: any,
      payload: {
        point_min: { lat: number; lon: number }
        point_max: { lat: number; lon: number }
        crop: boolean
      }
    ) {
      commit(toolsStoreActions.setFilterPlace, payload)
    },
    [toolsStoreActions.setToolGeom]({ commit }: any, payload: any) {
      commit(toolsStoreActions.setToolGeom, payload)
    }
  },
  getters: {
    vector: (state: IToolsStore) => state.vector,
    substraction: (state: IToolsStore) => state.substraction,
    ai: (state: IToolsStore) => state.ai,
    forestArea: (state: IToolsStore) => state.forestArea,
    artificialAi: (state: IToolsStore) => state.artificialAi,
    mergingVector: (state: IToolsStore) => state.mergingVector,
    filterVector: (state: IToolsStore) => state.filterVector,
    dragAndDrop: (state: IToolsStore) => state.dragAndDrop,
    filterPlace: (state: IToolsStore) => state.filterPlace,
    place: (state: IToolsStore) => state.place,
    toolGeom: (state: IToolsStore) => state.toolGeom
  }
}
