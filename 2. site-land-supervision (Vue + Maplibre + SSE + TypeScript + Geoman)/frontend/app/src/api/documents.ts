import { request } from '@/api/request.ts'
import { Consts } from '@/consts/index.consts.ts'
import { responseAPI } from '@/types/api.ts'

export const documentsApi = {
  async uploadDocument(
    description: string | null,
    id_dict_terytory: number | null,
    id_dict_type_file: number | null,
    file: File
  ) {
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
  async getDocuments(): Promise<responseAPI> {
    try {
      const response = await request.get(`${Consts.API_PREFIX}files/`)
      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        console.warn(`[documentsApi.getDocuments()] ← ${response.status}`)
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      console.error('[documentsApi.getDocuments()] Ошибка:', error)
      return { success: false, data: error.data }
    }
  },
  async downloadDocument(uuid_file: string): Promise<responseAPI> {
    try {
      const response = await request.post(`${Consts.API_PREFIX}files/dowload/?uuid_file=${uuid_file}`)
      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      return { success: false, data: error.data }
    }
  },
  async deleteDocument(uuid_file: string): Promise<responseAPI> {
    try {
      const response = await request.delete(`${Consts.API_PREFIX}files/${uuid_file}/`)
      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      return { success: false, data: error.data }
    }
  }
}