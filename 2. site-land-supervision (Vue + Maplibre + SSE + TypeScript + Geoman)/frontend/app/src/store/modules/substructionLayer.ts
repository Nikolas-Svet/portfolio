import { substractionLayerActions } from './../actions/substractionLayer'
import { Module } from 'vuex'
import { ISubstractionState } from '@/types/Store'
import { layersApi } from '@/api/layers'

export const substractionVectorState: Module<ISubstractionState, unknown> = {
  state: {
    newLayer: {
      description: '',
      name: '',
      id_dict_type_data: null,
      layers_id_1: [],
      layers_id_2: []
    }
  },
  mutations: {
    [substractionLayerActions.UPDATE_DATA_TYPE_ID](state, id_dict_type_data: number | null) {
      state.newLayer.id_dict_type_data = id_dict_type_data
    },
    [substractionLayerActions.UPDATE_LAYER_DESCRIPTION](state, description: string) {
      state.newLayer.description = description
    },
    [substractionLayerActions.UPDATE_LAYER_NAME](state, name: string) {
      state.newLayer.description = name
    },
    [substractionLayerActions.UPDATE_LAYERS_1](state, layers: number[]) {
      state.newLayer.layers_id_1 = layers
    },
    [substractionLayerActions.UPDATE_LAYERS_2](state, layers: number[]) {
      state.newLayer.layers_id_2 = layers
    },
    [substractionLayerActions.CLEAR_NEW_LAYER_DATA](state) {
      state.newLayer.description = ''
      state.newLayer.name = ''
      state.newLayer.id_dict_type_data = null
      state.newLayer.layers_id_1.length = 0
      state.newLayer.layers_id_2.length = 0
    }
  },
  actions: {
    async [substractionLayerActions.CREATE_SUBSTRACTION_LAYER]({ state }) {
      try {
        await layersApi.createSubstructionLayer(state.newLayer)
      } catch (e) {
        throw new Error((e as Error).message)
      }
    }
  },
  getters: {
    newLayer: (state) => state.newLayer
  }
}
