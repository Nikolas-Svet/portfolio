import { ActionContext, Module } from 'vuex'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { dictsApi } from '@/api/dicts'
import { ICoorSystem, IDictType } from '@/types/dicts'
import { Attribute } from '@/types/layersVector'
import { Consts } from '@/consts/index.consts.ts'

export interface INewLayerData {
  layerName: string
  geometryType: string
  id_crs: number
  id_dict_type_data: number
  description: string
  attributes: Attribute[]
  file?: File
}

export interface ILayerCreationState {
  newLayerData: INewLayerData | null
  coordinates: ICoorSystem[]
  dicts: IDictType[]
}

export const layerCreationStore: Module<ILayerCreationState, unknown> = {
  namespaced: true,
  state: {
    newLayerData: null,
    coordinates: [],
    dicts: []
  },
  mutations: {
    [layerCreationActions.setNewLayerData](state: ILayerCreationState, payload: INewLayerData) {
      console.log('Mutation: SET_NEW_LAYER_DATA', payload)
      state.newLayerData = payload
    },
    [layerCreationActions.clearNewLayerData](state: ILayerCreationState) {
      console.log('Mutation: CLEAR_NEW_LAYER_DATA')
      state.newLayerData = null
    },
    [layerCreationActions.setCoordinates](state, coordinates: ICoorSystem[]) {
      state.coordinates = coordinates
    },
    [layerCreationActions.setDictTypeData](state, dicts: IDictType[]) {
      state.dicts = dicts
    }
  },
  actions: {
    [layerCreationActions.setNewLayerData](
      { commit }: ActionContext<ILayerCreationState, unknown>,
      data: INewLayerData
    ) {
      console.log('Action: setNewLayerData', data)
      commit(layerCreationActions.setNewLayerData, data)
    },
    [layerCreationActions.clearNewLayerData]({
                                               commit
                                             }: ActionContext<ILayerCreationState, unknown>) {
      console.log('Action: clearNewLayerData')
      commit(layerCreationActions.clearNewLayerData)
    },
    async [layerCreationActions.fetchCoordinates]({ commit }) {
      try {
        const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictUserSpatialRefSys)
        const coordinates = responseDict.success ? responseDict.data : []

        commit(layerCreationActions.setCoordinates, coordinates)
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    async [layerCreationActions.fetchDictTypeData]({ commit }) {
      try {
        const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTypesData)
        const dicts = responseDict.success ? responseDict.data : []

        commit(layerCreationActions.setDictTypeData, dicts)
      } catch (e) {
        throw new Error((e as Error).message)
      }
    }
  },
  getters: {
    newLayerData: (state: ILayerCreationState) => state.newLayerData,
    coordinates: (state: ILayerCreationState) => state.coordinates,
    dicts: (state: ILayerCreationState) => state.dicts,
    createQueryParams: (state: ILayerCreationState) => {
      if (!state.newLayerData) return ''

      let queryParams = `name=${encodeURIComponent(state.newLayerData.layerName)}&id_crs=${state.newLayerData.id_crs}`

      if (state.newLayerData.id_dict_type_data) {
        queryParams += `&id_dict_type_data=${state.newLayerData.id_dict_type_data}`
      }

      if (state.newLayerData.description) {
        queryParams += `&description=${state.newLayerData.description}`
      }

      return queryParams
    }
  }
}
