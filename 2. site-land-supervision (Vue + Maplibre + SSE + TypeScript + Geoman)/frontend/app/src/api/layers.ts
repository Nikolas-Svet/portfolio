import { IRasterLayer, IVectorApiLayer } from '@/types/layersVector'
import { request } from './request'
import { INewSubstractionLayer } from '@/types/Store'
import { IField } from '@/types/Vector'
import { Consts } from '@/consts/index.consts.ts'

export const layersApi = {
  async getVectorLayers(filters: { name?: string; id_dict_type_data?: number[] }) {
    const payload: Record<string, any> = {}
    if (filters.name) {
      payload.name = filters.name
    }
    if (filters.id_dict_type_data && filters.id_dict_type_data.length > 0) {
      payload.id_dict_type_data = filters.id_dict_type_data
    }
    try {
      const response = await request.post(`${Consts.API_PREFIX}vector/`, payload)
      return response.data as IVectorApiLayer[]
    } catch (error: any) {
      console.error('Не удалось получить векторные слои:', error)
      return []
    }
  },

  async getRasterLayers(filters: { name?: string; id_dict_type_data?: number[] }) {
    const payload: Record<string, any> = {}
    if (filters.name) {
      payload.name = filters.name
    }
    if (filters.id_dict_type_data && filters.id_dict_type_data.length > 0) {
      payload.id_dict_type_data = filters.id_dict_type_data
    }

    try {
      const response = await request.post(`${Consts.API_PREFIX}tiles/`, payload)
      return response.data as IRasterLayer[]
    } catch (error) {
      console.error('Не удалось получить векторные слои:', error)
      return []
    }
  },

  async updateRasterLayer({
                            id,
                            id_dict_type_data,
                            name,
                            description,
                            name_dir
                          }: {
    id: number
    id_dict_type_data: number[]
    name: string
    description: string
    url?: string
    name_dir?: string
  }) {
    try {
      const response = await request.patch(
        `${Consts.API_PREFIX}tiles/update_raster_leyer/?id=${id}&name=${name}&description=${description}&name_dir=${name_dir}}`,
        id_dict_type_data ? id_dict_type_data : []
      )
      return response.data
    } catch (error) {
      console.error('Не удалось обновить растровый слой:', error)
      throw new Error('Не удалось обновить растровый слой')
    }
  },

  async deleteRasterLayer(id_raster_leyer: number) {
    try {
      const response = await request.post(
        `${Consts.API_PREFIX}tiles/delete_raster_leyer/`,
        {},
        {
          params: {
            id_raster_leyer
          }
        }
      )
      return response
    } catch (error) {
      console.error('Не удалось удалить растровый слой:', error)
      throw new Error('Не удалось удалить растровый слой')
    }
  },

  async updateVectorLayer(params: {
    id: number
    name?: string
    description?: string
    id_dict_type_data: number[]

    id_dataset?: number
    url?: string
  }) {
    try {
      const response = await request.post(
        `${Consts.API_PREFIX}vector/update_vector_leyer/?id_vector_leyer=${params.id}`,
        params
      )
      return response.data
    } catch (error) {
      console.error('Не удалось обновить векторный слой:', error)
      throw new Error('Не удалось обновить векторный слой')
    }
  },

  async deleteVectorLayer(id_vector_leyer: number): Promise<any | false> {
    const controller = new AbortController()
    const timeout = 30000

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeout)

    try {
      const response = await request.delete(`${Consts.API_PREFIX}vector/delete_vector_leyer/`, {
        params: {
          id_vector_leyer
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Запрос был прерван: превышено время ожидания')
        return false
      }
      console.error('Не удалось удалить векторный слой:', error)
      return false
    }
  },

  async createSubstructionLayer(body: INewSubstractionLayer) {
    try {
      const response = await request.post(`${Consts.API_PREFIX}tools/tools/`, body)

      if (response.status === 200) {
        // (window as any).$notify('Слой успешно создан', true)
        // const newEvent = response.data
        // await store.dispatch(notificationsActions.addNotificationEvent, newEvent)
      } else {
        ;(window as any).$notify('Ошибка при создании слоя', true)
      }
    } catch (e) {
      const errorMessage = (e as Error).message
      console.error('Ошибка при создании слоя:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  async getFildsByObjectId({ id_object }: { id_object: number }) {
    try {
      const response = await request.get<IField[]>(`${Consts.API_PREFIX}vector/get_filds/${id_object}/`)
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе fetchFeatureData:', error)
    }
  },

  async updateFields(fields: any[]) {
    try {
      const response = await request.post<IField[]>(`${Consts.API_PREFIX}vector/update_filds/`, fields
      )
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе updateFields:', error)
    }
  },

  async addFields(fields: any[]) {
    try {
      const response = await request.post<IField[]>(`${Consts.API_PREFIX}vector/create_filds/`, fields
      )
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе addFields:', error)
    }
  },

  async deleteFields(fields: any[]) {
    try {
      const response = await request.delete(
        `${Consts.API_PREFIX}vector/delete_filds/`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: fields
        }
      )
      return response.data
    } catch (error) {
      console.error('Ошибка при запросе addFields:', error)
    }
  }


}
