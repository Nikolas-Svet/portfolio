// store/modules/editObjects.ts
import { Module } from 'vuex'
import { IEditObjects } from '@/types/Store'
import { editObjectsActions } from '@/store/actions/editObjects'

export const editObjectsStore: Module<IEditObjects, any> = {
  namespaced: true,

  state: (): IEditObjects => ({
    objects: []
  }),

  mutations: {
    [editObjectsActions.setObjects](state, payload: any[]) {
      state.objects = payload
    }
  },

  actions: {
    [editObjectsActions.setObjects]({ commit }, payload: any[]) {
      commit(editObjectsActions.setObjects, payload)
    }

    // теперь payload — объект с { point, map }
    // async [editObjectsActions.fetchObjects](
    //   { commit },
    //   payload: { point: [number, number]; map: any }
    // ) {
    //   const { point, map } = payload
    //
    //   const layerInfos = map.getStyle().layers
    //     .filter((l: any) =>
    //       l.id.startsWith('layer-vector-') &&
    //       ['fill', 'line', 'circle', 'symbol'].includes(l.type)
    //     )
    //     .map((l: any) => ({
    //       layerId: l.id,
    //       source: l.source,
    //       sourceLayer: l['source-layer'] || 'default'
    //     }))
    //
    //   const [lon, lat] = point
    //   const center = turf.point([lon, lat])
    //   const buffered = turf.buffer(center, 0.1, { units: 'kilometers' })
    //   const [minLon, minLat, maxLon, maxLat] = turf.bbox(buffered)
    //
    //   const sw = map.project([minLon, minLat])
    //   const ne = map.project([maxLon, maxLat])
    //   const layerIds = layerInfos.map(li => li.layerId)
    //
    //   const hits =
    //     map.queryRenderedFeatures(
    //       [
    //         [sw.x, sw.y],
    //         [ne.x, ne.y]
    //       ],
    //       { layers: layerIds }
    //     ) || []
    //
    //   const ids = new Set(hits.map((h: any) => h.id))
    //
    //   // console.log('[fetchObjects] hits', hits)
    //   console.log('[fetchObjects] ids', ids)
    //
    //   // здесь, при необходимости, закоммитьте найденные объекты:
    //   // commit(editObjectsActions.setObjects, hits)
    // }
  },

  getters: {
    objects: (state) => state.objects
  }
}
