import { Module } from 'vuex'
import { GeometryMarkersDistanceActions } from '@/store/actions/GeometryMarkersDistance.ts'
import { Marker } from 'maplibre-gl'
import { clearMarkers } from '@/utils/map/toolbar/polygonDistanceMeasure.ts'

interface ILayerMarker {
  id: string
  markers: Marker[]
}

export interface IGeometryMarkersDistanceActionsState {
  layersMarkers: Set<ILayerMarker>
}

export const GeometryMarkersDistanceStore: Module<IGeometryMarkersDistanceActionsState, unknown> = {
  namespaced: true,

  state: {
    layersMarkers: new Set<ILayerMarker>()
  },

  mutations: {
    [GeometryMarkersDistanceActions.ADD_LAYER](state, payload: ILayerMarker) {
      // console.log('[GeometryMarkersDistanceActions.ADD_LAYER]', payload)
      state.layersMarkers.add(payload)
    },

    [GeometryMarkersDistanceActions.DELETE_LAYER](state, payload: string) {
      // console.log('[GeometryMarkersDistanceActions.DELETE_LAYER]', payload)
      if (!payload) return
      for (const layer of state.layersMarkers) {
        if (layer.id === payload) {
          clearMarkers(layer.markers)
          state.layersMarkers.delete(layer)
          return
        }
      }
      console.warn(`Слой с id=${payload} не найден`)
    },

    [GeometryMarkersDistanceActions.UPDATE_LAYER](state, payload: ILayerMarker) {
      // console.log('[GeometryMarkersDistanceActions.UPDATE_LAYER]', payload)
      if (!payload) return
      for (const layer of state.layersMarkers) {
        if (layer.id === payload.id) {
          clearMarkers(layer.markers)
          state.layersMarkers.delete(layer)
          state.layersMarkers.add(payload)
          return
        }
      }
      console.warn(`Слой с id=${payload.id} не найден`)
    },

    [GeometryMarkersDistanceActions.SET_LAYERS](state, payload: ILayerMarker[]) {
      // console.log('[GeometryMarkersDistanceActions.SET_LAYERS]', payload)
      state.layersMarkers = new Set(payload)
    }
  },

  actions: {
    [GeometryMarkersDistanceActions.ADD_LAYER]({ commit }, payload: ILayerMarker) {
      commit(GeometryMarkersDistanceActions.ADD_LAYER, payload)
    },
    [GeometryMarkersDistanceActions.DELETE_LAYER]({ commit }, payload: string) {
      commit(GeometryMarkersDistanceActions.DELETE_LAYER, payload)
    },
    [GeometryMarkersDistanceActions.UPDATE_LAYER]({ commit }, payload: ILayerMarker) {
      commit(GeometryMarkersDistanceActions.UPDATE_LAYER, payload)
    },
    [GeometryMarkersDistanceActions.SET_LAYERS]({ commit }, payload: ILayerMarker[] | []) {
      commit(GeometryMarkersDistanceActions.SET_LAYERS, payload)
    }
  },

  getters: {
    layersMarkers: (state) => state.layersMarkers
  }
}
