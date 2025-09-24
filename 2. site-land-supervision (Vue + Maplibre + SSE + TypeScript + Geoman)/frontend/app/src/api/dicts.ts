import { request } from './request'
import { Consts } from '@/consts/index.consts.ts'
import { responseAPI } from '@/types/api.ts'

export const dictsApi = {
  async getDict(type_dict: string): Promise<responseAPI> {
    try {
      const response = await request.get(`${Consts.API_PREFIX}dicts/get_gict`, {
        params: {
          type_dict
        }
      })
      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      return { success: false, data: error.data }
    }
  },
  // Раз сервер требует data в query → придётся так:
  async updateDict(type_dict: string, id: number | null, data: Record<string, any>) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(
        `${Consts.API_PREFIX}dicts/update_gict`,
        null, // тело запроса пустое,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            type_dict,
            id,
            data: JSON.stringify(data) // <-- кладём JSON-строку в query
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(`Не удалось обновить словарь ${type_dict}`)
    }
  },
  async updateDictTerritories(type_dict: string, id: number | null, data: Record<string, any>) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(
        `${Consts.API_PREFIX}dicts/update_gict/territories`,
        null, // тело запроса пустое,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id,
            data: JSON.stringify(data)
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(`Не удалось обновить словарь ${type_dict}`)
    }
  },

  async createDict(type_dict: string, data: Record<string, any>) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(
        `${Consts.API_PREFIX}dicts/create_gict`,
        null, // тело запроса пустое,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            type_dict,
            data: JSON.stringify(data)
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(`Не удалось обновить словарь ${type_dict}`)
    }
  },

  async deleteDict(type_dict: string, id: number) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.delete(`${Consts.API_PREFIX}dicts/delete_gict`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          type_dict,
          id
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Не удалось удалить территорию с id ${id}`)
    }
  }
}
