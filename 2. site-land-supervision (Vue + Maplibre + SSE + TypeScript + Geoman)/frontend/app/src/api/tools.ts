// src/api/tools.ts
import { request } from './request'
import store from '@/store'
import { Consts } from '@/consts/index.consts.ts'
// import { notificationsActions } from '@/store/actions/notifications.ts'

export const toolsApi = {
  async forestGrowth(
    originalLayers: number[],
    overlayLayers: number[],
    nameLayer: string,
    year: number,
    vl_area_geojson_file: any = null
  ) {
    try {
      // (window as any).$notify('Слой успешно создан', true)
      const form = new FormData()
      const params: any = {
        vl_forest_id: overlayLayers[0], // '4,5'
        name_vl_pred: nameLayer,
        period: year,
        id_crs: 3
      }
      if (!vl_area_geojson_file) {
        params.vl_area_id = originalLayers[0]
      } else {
        form.append('vl_area_geojson_file', vl_area_geojson_file)
      }

      const response = await request.post(`${Consts.API_PREFIX}tools/forest_growth/`, form, {
        params
      })

      // const newEvent = response.data
      // await store.dispatch(notificationsActions.addNotificationEvent, newEvent)
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе forest_growth:', error)
      throw new Error('Не удалось выполнить запрос forestGrowth')
    }
  },
  async forestArea(originalLayers: number[], overlayLayers: number[], vl_area_geojson_file: any = null, vl_forest_geojson_file: any = null) {
    try {
      const form = new FormData()

      let params

      if (!vl_area_geojson_file) {
        params = {
          vl_area_id: originalLayers[0],
          vl_forest_id: overlayLayers[0],
          id_crs: 3
        }
      } else {
        params = {
          vl_area_id: originalLayers[0],
          vl_forest_id: overlayLayers[0],
          id_crs: 3
        }
        form.append('vl_area_geojson_file', vl_area_geojson_file)
      }
      if (vl_forest_geojson_file) {
        form.append('vl_forest_geojson_file', vl_forest_geojson_file)
      }

      const response = await request.post(
        `${Consts.API_PREFIX}tools/forest_area/`,
        form,
        {
          params
        }
      )

      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      console.error('Ошибка при запросе forest_growth:', error)
      return { success: false, data: error.response.data }
    }
  },

  async artificialAi(
    nn_model: string,
    name_layer: string,
    points: {
      point_min: { lat: number; lon: number }
      point_max: { lat: number; lon: number }
    }
  ) {
    try {
      const token = localStorage.getItem('token')

      const layers = store.getters['layersMain/layers']

      const id_tiles_working_layer: number[] = layers
        .filter((layer: any) => layer.type === 'layer-raster')
        .map((layer: any) => Number(layer.id))

      // Формирование query параметров
      const queryParams = new URLSearchParams({
        nn_model,
        name_layer
      })

      // Формирование тела запроса
      const requestBody: any = {
        ...points
      }

      // ✅ Добавляем `id_tiles_working_layer`, если он не пустой
      if (id_tiles_working_layer.length > 0) {
        requestBody.id_tiles_working_layer = id_tiles_working_layer
      }

      // Выполнение POST-запроса
      const response = await request.post(
        `${Consts.API_PREFIX}tools/nn_predict/?${queryParams.toString()}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Уведомление об успешном выполнении запроса
      if (response.status === 200) {
        // (window as any).$notify('Слой успешно создан', true)
      } else {
        console.error('Ошибка при создании слоя:', response.statusText)
        throw new Error('Ошибка при создании слоя')
      }

      return response.data
    } catch (error) {
      console.error('Ошибка при запросе artificialAi:', error)
      throw new Error('Не удалось выполнить запрос artificialAi')
    }
  },
  async mergingVector(description: string, name_layer: string, layersId: number[]) {
    const controller = new AbortController()
    const timeout = 60000

    const timeoutId = setTimeout(() => {
      controller.abort()
      ;(window as any).$notify('Ошибка при объединении слоев: превышено время ожидания', true)
      return
    }, timeout)

    try {
      const token = localStorage.getItem('token')

      // Формирование query параметров
      const queryParams = new URLSearchParams({
        description,
        name_layer
      })

      // Формирование тела запроса
      const requestBody = layersId

      // Выполнение POST-запроса
      const response = await request.post(
        `${Consts.API_PREFIX}tools/unification_vactor_layers/?${queryParams.toString()}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      )

      clearTimeout(timeoutId)

      // Уведомление об успешном выполнении запроса
      if (response.status === 200) {
        ;(window as any).$notify('Слой успешно создан', true)
      } else {
        console.error('Ошибка при создании слоя:', response.statusText)
        clearTimeout(timeoutId)
      }

      const newEvent = response.data
      console.log('newEvent', newEvent)

      return response.data
    } catch (error) {
      console.error('Ошибка при запросе artificialAi:', error)
      throw new Error('Не удалось выполнить запрос artificialAi')
    }
  },

  // Функция для получения полей выбранных векторных слоёв
  async getFieldsByVectorLayers(layerIds: number[]) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(`${Consts.API_PREFIX}vector/get_filds_by_vector_layers/`, layerIds, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        return response.data
      } else {
        return false
      }
    } catch (error) {
      console.error('Ошибка при запросе полей:', error)
      throw new Error('Не удалось получить поля')
    }
  },

  async getFieldsByFilters(layerIds: number[]) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(`${Consts.API_PREFIX}vector/get_filds_by_filters/`, layerIds, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        return response.data
      } else {
        return false
      }
    } catch (error) {
      console.error('Ошибка при запросе полей:', error)
      throw new Error('Не удалось получить поля')
    }
  },

  // Функция для отправки запроса фильтрации векторных слоёв
  async filterVectorLayers(queryParams: any, body: any) {
    try {
      const token = localStorage.getItem('token')
      const qs = new URLSearchParams(queryParams).toString()
      const response = await request.post(`${Consts.API_PREFIX}tools/filter_vector_layers/?${qs}/`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе filterVectorLayers:', error)
      throw new Error('Не удалось выполнить запрос filterVectorLayers')
    }
  }
}
