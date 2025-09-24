// store/modules/toolbarDrawing.ts
import { Module } from 'vuex'
import { toolbarDrawingActions } from '@/store/actions/toolbarDrawing'

export interface IMapGeometryState {
  featureCollection: {
    type: 'FeatureCollection'
    features: any[]
  }
  featureCollectionLine: {
    type: 'FeatureCollection'
    features: any[]
  }
  featureCollectionPoint: {
    type: 'FeatureCollection'
    features: any[]
  }
}

export const mapGeometryStore: Module<IMapGeometryState, unknown> = {
  namespaced: true,

  state: {
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    featureCollectionLine: {
      type: 'FeatureCollection',
      features: []
    },
    featureCollectionPoint: {
      type: 'FeatureCollection',
      features: []
    }
  },

  mutations: {
    [toolbarDrawingActions.ADD_FEATURE](state, feature: any) {
      console.log('ADD_FEATURE', feature)
      if (!feature.properties.id) {
        feature.properties.id = Date.now().toString()
      }
      state.featureCollection.features.push(feature)
    },
    [toolbarDrawingActions.ADD_FEATURE_POINT](state, feature: any) {
      console.log('ADD_FEATURE_POINT', feature)
      if (!feature.properties.id) {
        feature.properties.id = Date.now().toString()
      }
      state.featureCollectionPoint.features.push(feature)
    },
    [toolbarDrawingActions.ADD_FEATURE_LINE](state, feature: any) {
      console.log('ADD_FEATURE_LINE', feature)
      if (!feature.properties.id) {
        feature.properties.id = Date.now().toString()
      }
      state.featureCollectionLine.features.push(feature)
    },
    [toolbarDrawingActions.REMOVE_FEATURE](state, featureId: string) {
      state.featureCollection.features = state.featureCollection.features.filter(
        (f) => f.properties.id !== featureId
      )
    },
    [toolbarDrawingActions.CLEAR_ALL](state) {
      console.log('CLEAR_ALL')
      state.featureCollection.features = []
      state.featureCollectionLine.features = []
      state.featureCollectionPoint.features = []
    },
    [toolbarDrawingActions.UPDATE_FEATURE_POSITION](
      state,
      payload: {
        featureId: string
        coordinates: [number, number]
      }
    ) {
      const feature = state.featureCollectionPoint.features.find(
        (f) => f.properties.one_point === payload.featureId
      )
      if (feature) {
        console.log('UPDATE_FEATURE_POSITION')
        feature.geometry.coordinates = payload.coordinates
      }
    }
  },

  actions: {
    [toolbarDrawingActions.ADD_FEATURE]({ commit }, feature: any) {
      commit(toolbarDrawingActions.ADD_FEATURE, feature)
    },
    [toolbarDrawingActions.ADD_FEATURE_LINE]({ commit }, feature: any) {
      commit(toolbarDrawingActions.ADD_FEATURE_LINE, feature)
    },
    [toolbarDrawingActions.ADD_FEATURE_POINT]({ commit }, feature: any) {
      commit(toolbarDrawingActions.ADD_FEATURE_POINT, feature)
    },
    [toolbarDrawingActions.CLEAR_ALL]({ commit }) {
      commit(toolbarDrawingActions.CLEAR_ALL)
    },
    [toolbarDrawingActions.REMOVE_FEATURE]({ commit }, featureId: string) {
      commit(toolbarDrawingActions.REMOVE_FEATURE, featureId)
    },
    [toolbarDrawingActions.UPDATE_FEATURE_POSITION](
      { commit },
      payload: {
        featureId: string
        coordinates: [number, number]
      }
    ) {
      commit(toolbarDrawingActions.UPDATE_FEATURE_POSITION, payload)
    }
  },

  getters: {
    featureCollection: (state) => state.featureCollection,
    featureCollectionLine: (state) => state.featureCollectionLine,
    featureCollectionPoint: (state) => state.featureCollectionPoint
  }
}
