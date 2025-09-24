import { Module } from 'vuex'
import { ILayersState, Layer } from '@/types/layersVector'
import { layersVectorActions } from '../actions/layersVector'
import { toRaw } from 'vue'
import { vectorApi } from '@/api/admin'
import { layersApi } from '@/api/layers'
import { ILayerSettings } from '@/types/layers'
import { Consts } from '@/consts/index.consts.ts'

export const layersVectorStore: Module<ILayersState, unknown> = {
  namespaced: true,
  state: {
    layers: [],
    layerOrder: [],
    forSubstractionLayers: [],
    createdLayer: undefined
  },
  mutations: {
    [layersVectorActions.setLayers](state, layers: Layer[]) {
      state.layers = layers

      state.layerOrder = layers.map((layer) =>
        layer.type === 'layer-raster' ? String(layer.id) : layer.id
      )
      console.log('Вызвано SET_LAYERS:', toRaw(state.layers))
    },
    [layersVectorActions.addLayer](state, layer: Layer) {
      console.log('AFTER:', state.layerOrder)
      const exists = state.layers.some(
        (existingLayer) => existingLayer.id === layer.id && existingLayer.type === layer.type
      )
      if (!exists) {
        state.layers.push(layer)

        // Если слой имеет тип 'layer-raster', сохраняем его ID как строку в layerOrder
        if (layer.type === 'layer-raster') {
          state.layerOrder.push(String(layer.id))
        } else {
          state.layerOrder.push(layer.id)
        }

        console.log('Добавлен слой:', toRaw(layer))
        console.log('Новый порядок:', toRaw(state.layerOrder))
      } else {
        console.warn(`Слой с id=${layer.id} уже существует.`)
      }
    },
    [layersVectorActions.deleteLayer](state, layer: Layer) {
      const { id, type } = layer

      console.log('LAYER:', layer)

      // Удаляем слой из массива layers
      state.layers = state.layers.filter(
        (existingLayer) => !(existingLayer.id === Number(id) && existingLayer.type === type)
      )

      // Удаляем id из layerOrder, сохраняя тип данных
      console.log('AFTER', state.layerOrder)
      state.layerOrder = state.layerOrder.filter((existingId) => {
        if (type === 'layer-raster') {
          // Сравниваем id как строку для растровых слоёв
          return existingId !== String(id)
        } else {
          // Сравниваем id как число для остальных типов
          return existingId !== Number(id)
        }
      })

      console.log(`Удалён слой с id=${id} и типом=${type}`)
      console.log('Текущий порядок:', toRaw(state.layerOrder))
    },
    [layersVectorActions.updateLayer](state, updatedLayer: Layer) {
      // Ищем слой по id и type
      const index = state.layers.findIndex(
        (layer) => Number(layer.id) === Number(updatedLayer.id) && layer.type === updatedLayer.type
      )

      if (index !== -1) {
        // Обновляем слой, если он найден
        state.layers.splice(index, 1, updatedLayer)
        console.log(
          `Слой с id=${updatedLayer.id} и типом=${updatedLayer.type} обновлён.`,
          toRaw(state.layers)
        )
      } else {
        console.warn(`Слой с id=${updatedLayer.id} и типом=${updatedLayer.type} не найден.`)
      }
    },
    [layersVectorActions.orderLayers](
      state,
      layersOrder: { id: string | number; group?: string }[]
    ) {
      // Обновляем порядок и группы
      state.layerOrder = layersOrder.map((item) => item.id)

      layersOrder.forEach(({ id, group }) => {
        const layer = state.layers.find((layer) => layer.id === id)
        if (layer) {
          layer.group = group || ''
        } else {
          console.warn(`Слой/группа с id=${id} не найдена.`)
        }
      })

      console.log('VUEX: Обновленный порядок слоев и групп:', toRaw(state.layerOrder))
    },
    [layersVectorActions.setSubstractionLayers](state, layers) {
      state.forSubstractionLayers = layers
    },
    [layersVectorActions.updateCreatedLayer](
      state,
      settings: Partial<ILayerSettings> = {
        visible: true
      }
    ) {
      let created = settings.layer

      if (created) {
        const layer = settings.layer
        delete settings.layer
        created = Object.assign({}, layer, settings)
      }

      state.createdLayer = created
    }
  },
  actions: {
    [layersVectorActions.setLayers]({ commit }, layers: Layer[]) {
      commit(layersVectorActions.setLayers, layers)
    },
    [layersVectorActions.addLayer]({ commit }, layer: Layer) {
      commit(layersVectorActions.addLayer, layer)
    },
    [layersVectorActions.deleteLayer]({ commit }, layerId: number | string) {
      commit(layersVectorActions.deleteLayer, layerId)
    },
    [layersVectorActions.updateLayer]({ commit }, updatedLayer: Layer) {
      commit(layersVectorActions.updateLayer, updatedLayer)
    },
    [layersVectorActions.orderLayers](
      { commit },
      layersOrder: { id: string | number; group?: string }[]
    ) {
      commit(layersVectorActions.orderLayers, layersOrder)
    },
    async [layersVectorActions.createLayer]({ commit }, { query, payload, settings }) {
      try {
        console.log('formData', payload)
        const layer = await vectorApi.createVectorLayer(query, payload)
        if (layer.error) throw new Error('Layer not created!')

        commit(layersVectorActions.updateCreatedLayer, {
          layer,
          type: Consts.LayerTypes.VECTOR,
          visible: settings?.visible ?? true
        })
      } catch (e) {
        throw new Error((e as Error).message)
      }
    },
    async [layersVectorActions.fecthVectorLayers]({ commit }) {
      try {
        const layers = await layersApi.getVectorLayers({})

        console.log('До фильтрации:', layers) // Лог до фильтрации

        // Фильтруем слои, оставляя только те, у которых есть bbox_geojson
        const filteredLayers = (layers as any).filter((layer: any) => layer.bbox_geojson)

        console.log('После фильтрации:', filteredLayers) // Лог после фильтрации

        commit(layersVectorActions.setSubstractionLayers, filteredLayers)
      } catch (e) {
        console.error('Ошибка при получении слоёв:', e)
        throw new Error((e as Error).message)
      }
    }
  },
  getters: {
    layers: (state) => state.layers,
    layerOrder: (state) => state.layerOrder,
    forSubstractionLayers: (state) => state.forSubstractionLayers,
    createdLayer: (state) => state.createdLayer
  }
}
