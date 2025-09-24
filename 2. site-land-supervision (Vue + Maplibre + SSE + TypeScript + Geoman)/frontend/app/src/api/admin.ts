import { request } from './request'
import store from '@/store'
import { forestAreaActions } from '@/store/actions/forestArea'
import { aiActions } from '@/store/actions/ai.ts'
import { Consts } from '@/consts/index.consts.ts'
import { responseAPI } from '@/types/api.ts'

const { VITE_API_URL } = import.meta.env

export const vectorApi = {

  async uploadDocument(
    description: string | null,
    id_dict_terytory: number | null,
    id_dict_type_file: number | null,
    file: File
  ) {
    console.log(`[documentsApi.uploadDocument()] → POST ${request.defaults.baseURL}`)
    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}files/upload/`

      const queryParams = new URLSearchParams()

      if (description && description !== '') queryParams.append('description', description)
      if (id_dict_terytory !== null)
        queryParams.append('id_dict_terytory', String(id_dict_terytory))
      if (id_dict_type_file !== null)
        queryParams.append('id_dict_type_file', String(id_dict_type_file))
      // Формируем query параметры

      // Создаем FormData для отправки файла
      const formData = new FormData()
      formData.append('file', file)

      // Делаем запрос
      const response = await request.post(`${url}?${queryParams.toString()}`, formData, {
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      })

      if (response.status === 200) {
        // ;(window as any).$notify('Документ успешно загружен', true)
      } else {
        // ;(window as any).$notify('Ошибка при загрузке документа', true)
      }

      return response.data
    } catch (error) {
      console.error('Ошибка при создании документа:', error)
      throw new Error('Не удалось создать документ')
    }
  },
  async createVectorLayer(queryParams: string, formData: FormData | null) {
    try {
      console.log('formData', formData)
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}vector/create_vector_leyer/?${queryParams}`

      const response = await request.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (store.state.forestArea.flagCreateLayer) {
        if (store.state.ai.createLayerFlag) {
          await store.dispatch(`ai/${aiActions.SET_CREATE_FLAG_LAYER}`, false)
          await store.dispatch(`ai/${aiActions.SET_ORIGINAL_LAYERS}`, [Number(response.data.id)])
        }
        await store.dispatch(
          `forestArea/${forestAreaActions.SET_CURRENT_ID}`,
          Number(response.data.id)
        )
        // store.commit(toolsStoreActions.showForestArea, true)
        await store.dispatch(`forestArea/${forestAreaActions.SET_FLAG_CREATE_LAYER}`, false)
        console.log('ID:', response.data.id)
      } else if (response.status) {
        ;(window as any).$notify('Векторный слой создан', true)
      } else if (!store.state.forestArea.flagCreateLayer) {
        ;(window as any).$notify('Ошибка при создании слоя', true)
      }

      return response.data
    } catch (error: any) {
      console.error('Ошибка при запросе:', error)

      let errorMessage = ''

      if (error.response && error.response.data) {
        errorMessage =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data)
      } else if (error.message) {
        errorMessage = error.message
      }

      ;(window as any).$notify(errorMessage, true)

      return { error: errorMessage }
    }
  },

  async addGeometryVector(id_layer: number, formData: FormData, id_crs: number) {
    try {
      const token = localStorage.getItem('token')

      // Предположим, нужно отправить запрос на:
      // POST /api/v1/vector/create_vector_layer/?id_vector_layer=X&id_crs=Y
      // с multipart/form-data
      const url = `${Consts.API_PREFIX}vector/create_vector_leyer/?id_vector_layer=${id_layer}&id_crs=${id_crs}`

      const response = await request.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 200) {
        (window as any).$notify('Векторный слой обновлен', true)
      }

      return response.data
    } catch (error: any) {
      console.error('Ошибка при запросе:', error)

      let errorMessage = ''

      if (error.response && error.response.data) {
        errorMessage =
          typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data)
      } else if (error.message) {
        errorMessage = error.message
      }

      ;(window as any).$notify(errorMessage, true)

      return { error: errorMessage }
    }
  },

  async getGeojson(id_geom: number) {
    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}vector/get_geojson/${id_geom}/`

      const response = await request.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data
    } catch (error: any) {
      console.error(
        '❌ Ошибка при создании векторного слоя:',
        error.response?.data || error.message
      )

      // return error.response ? error.response.data : { error: 'Не удалось создать векторный слой' };
    }
  },

  async updateGeojson(geoJson: File, id_geom: string): Promise<responseAPI> {
    try {
      const url = `${Consts.API_PREFIX}vector/update_geom/` // Убедитесь, что URL корректный

      const queryParams = new URLSearchParams({ id_geom })

      const geoJsonString = JSON.stringify(geoJson)

      const file = new File([geoJsonString], 'updatedFeature.geojson', {
        type: 'application/json'
      })

      const formData = new FormData()
      formData.append('geo_json_file', file)

      const response = await request.post(`${url}?${queryParams.toString()}`, formData, {})

      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      console.error('Ошибка при обновлении GeoJSON:', error)
      return { success: false, data: error.data }
    }
  },
  async exportGeometry(
    type_export: string,
    id_vector_leyer: string,
    name_file: string
  ): Promise<void> {
    const controller = new AbortController()
    const timeout = 30000

    const timeoutId = setTimeout(() => {
      controller.abort()
      ;(window as any).$notify('Ошибка при экспорте файла: превышено время ожидания', true)
      return
    }, timeout)

    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}vector/export_vector_leyer/`

      const queryParams = new URLSearchParams({
        id_vector_leyer,
        type_export: type_export
      })

      // Отправляем запрос
      const response = await fetch(`${VITE_API_URL}${url}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`
        },
        signal: controller.signal // Передаем сигнал для возможности прерывания
      })

      clearTimeout(timeoutId) // Очищаем таймер, если запрос завершился успешно

      if (!response.ok) {
        ;(window as any).$notify('Ошибка при экспорте файла', true)
        return
      }

      // Определяем Content-Type
      const contentType = response.headers.get('Content-Type') || ''

      // Получаем имя файла из Content-Disposition
      let filename = `${name_file}.${type_export.toLowerCase()}`
      const contentDisposition = response.headers.get('Content-Disposition')

      if (contentDisposition) {
        const utf8FilenameRegex = /filename\*=UTF-8''(.+)/ // Если имя файла передано в UTF-8
        const normalFilenameRegex = /filename="?([^"]+)"?/ // Обычный формат

        if (utf8FilenameRegex.test(contentDisposition)) {
          filename = decodeURIComponent(contentDisposition.match(utf8FilenameRegex)![1])
        } else if (normalFilenameRegex.test(contentDisposition)) {
          filename = contentDisposition.match(normalFilenameRegex)![1]
        }
      }

      // Если экспортируем GeoJSON, корректно обрабатываем JSON
      if (contentType.includes('application/json')) {
        const text = await response.text()
        const jsonData = JSON.stringify(JSON.parse(text), null, 2) // Форматируем JSON

        const blob = new Blob([jsonData], { type: 'application/json' })
        const downloadUrl = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename.endsWith('.geojson') ? filename : `${filename}.geojson` // Гарантируем правильное расширение
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)

        return
      }

      // Обрабатываем бинарные файлы (ZIP, DXF и т. д.)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        ;(window as any).$notify('Ошибка при экспорте файла: превышено время ожидания', true)
      } else {
        console.error('Ошибка при экспорте геометрии:', error)
        ;(window as any).$notify('Ошибка при экспорте файла', true)
      }
    }
  },
  async deleteFeature(id_geom: number): Promise<responseAPI> {
    try {
      const data = [id_geom]
      const response = await request.delete(`${Consts.API_PREFIX}vector/delete_object_geom/`, {
        data: data
      })

      if (response.status === 200 || response.status === 204) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      console.error('Ошибка при удалении GeoJSON:', error)
      return { success: false, data: error.data }
    }
  },
  async squareFeature(id_geom: number | number[]) {
    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}tools/get_about_object/`
      let data
      if (Array.isArray(id_geom)) {
        data = id_geom
      } else {
        data = [id_geom]
      }

      const response = await request.post(url, data, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
      } else {
        ;(window as any).$notify('Ошибка при получении площади объекта', true)
      }

      return response.data.area
    } catch (error) {
      console.error('Ошибка при удалении GeoJSON:', error)
      throw new Error('Не удалось удалить GeoJSON')
    }
  },

  async ungroupFeature(id_geom: number | number[]) {
    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}tools/ungroup_geoms/`
      let data
      if (Array.isArray(id_geom)) {
        data = id_geom
      } else {
        data = [id_geom]
      }

      const response = await request.post(url, data, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
      } else {
        ;(window as any).$notify('Ошибка при разгруппировании объекта', true)
      }

      return response.data.area
    } catch (error) {
      console.error('Ошибка при разгруппировании объекта:', error)
      throw new Error('Ошибка при разгруппировать объект')
    }
  }
}
