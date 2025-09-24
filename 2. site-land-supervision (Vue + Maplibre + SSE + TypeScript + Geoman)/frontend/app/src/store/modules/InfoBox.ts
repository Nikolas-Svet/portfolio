import { Module } from 'vuex'
import { infoBoxActions } from '@/store/actions/InfoBox.ts'
import { IDataInfo } from '@/types/InfoBox.ts'
import { layersApi } from '@/api/layers.ts'
import store from '@/store'
import { Consts } from '@/consts/index.consts.ts'

// ВАЖНО: Экспортируем, чтобы импортировать в компоненте

export interface IInfoBoxState {
  data_info: IDataInfo[] | [] | null
  title_info_box: string | null
}

export const infoBoxStore: Module<IInfoBoxState, unknown> = {
  namespaced: true,

  state: {
    data_info: null,
    title_info_box: 'Свойства'
  },

  mutations: {
    [infoBoxActions.SET_DATA_INFO](state, payload: IInfoBoxState['data_info']) {
      console.log('[VUEX/InfoBox] SET_DATA_INFO', payload)
      state.data_info = payload
    },
    [infoBoxActions.SET_TITLE_INFO_BOX](state, payload: IInfoBoxState['title_info_box']) {
      console.log('[VUEX/InfoBox] SET_TITLE_INFO_BOX', payload)
      state.title_info_box = payload
    },
    [infoBoxActions.FETCH_DATA_INFO]() {
      console.log('[VUEX/InfoBox] FETCH_DATA_INFO')
    }

  },

  actions: {
    [infoBoxActions.SET_DATA_INFO]({ commit }, payload: IInfoBoxState['data_info']) {
      commit(infoBoxActions.SET_DATA_INFO, payload)
    },
    [infoBoxActions.SET_TITLE_INFO_BOX]({ commit }, payload: IInfoBoxState['title_info_box']) {
      commit(infoBoxActions.SET_TITLE_INFO_BOX, payload)
    },
    async [infoBoxActions.FETCH_DATA_INFO](_context: unknown, payload: number) {
      const objectFields = await layersApi.getFildsByObjectId({ id_object: payload }) as any

      // if (!objectFields || objectFields.length === 0) {
      //   return
      // }

      const data = objectFields.map((field: any) => {
        if (field.name === 'Площадь') {
          return {
            ...field,
            value: `${store.getters['measurement/convert'](field.value).toFixed(3)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
          }
        }
        return field
      })

      await store.dispatch('infoBox/SET_DATA_INFO', data)
      await store.dispatch('infoBox/SET_TITLE_INFO_BOX', Consts.rowName.title_default)
    }
  },

  getters: {
    data_info: (state) => state.data_info,
    title_info_box: (state) => state.title_info_box
  }
}
