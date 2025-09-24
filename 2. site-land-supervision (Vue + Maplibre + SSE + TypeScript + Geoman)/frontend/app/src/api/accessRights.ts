import { request } from '@/api/request'
import { Consts } from '@/consts/index.consts.ts' // как у вас организован request?
// import type { IAccessRightPayload, IAccessRightResponse } from '@/types/accessRights' // если захотите типизировать

interface IAccessRightBody {
  id_group: number
  access_r: boolean
  access_w: boolean
  access_a: boolean
}

export const accessRightsApi = {
  /**
   * Получение всех прав доступа
   * @param filter Фильтр вида { id_role?: number[], id_group?: number[] }
   * Пример вызова: getAllAccessRights({ id_role: [1], id_group: [2,3] })
   */
  async getAllAccessRights(filter?: Record<string, number[]>) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(
        `${Consts.API_PREFIX}administration/get_all_access_rights/`,
        filter || {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    } catch (error) {
      throw new Error('Не удалось получить список прав доступа')
    }
  },

  /**
   * Обновление прав доступа
   * @param id_role — по какой роли обновляем
   * @param accessData — массив [{id_group, access_r, access_w, access_a}, ...]
   */
  async updateAccessRights(id_role: number, accessData: IAccessRightBody[]) {
    try {
      const token = localStorage.getItem('token')

      // Пример: /api/v1/administration/update_access_rights/?id_role=...
      const response = await request.put(
        `${Consts.API_PREFIX}administration/update_access_rights/`,
        accessData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { id_role } // query ?id_role=...
        }
      )

      return response.data
    } catch (error) {
      throw new Error('Не удалось обновить права доступа')
    }
  }
}
