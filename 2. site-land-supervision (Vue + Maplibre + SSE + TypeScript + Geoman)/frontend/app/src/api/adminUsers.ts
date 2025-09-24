import { request } from './request'
import { IAdminUser } from '@/types/adminUsers'
import { Consts } from '@/consts/index.consts.ts'

export const adminUsersApi = {
  async getUsers() {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post<IAdminUser[]>(
        `${Consts.API_PREFIX}administration/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error('Не удалось получить список пользователей')
    }
  },
  async updateUser(user: IAdminUser, id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token')

      // Создаем копию объекта без `id`
      const { id: _, ...userData } = user

      const response = await request.put(`${Consts.API_PREFIX}administration/?user_id=${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (user.reset_password && response.status >= 200 && response.status < 300) {
        localStorage.setItem(
          'password',
          JSON.stringify(
            `Новый пароль для пользователя ${response.data.last_name + ' ' + response.data.first_name[0] + '. ' + response.data.father_name[0] + '.'} : ${response.data.password}`
          )
        )
      }

      return response.status >= 200 && response.status < 300
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error)
      return false
    }
  },
  async deleteUser(userId: number) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.delete(`${Consts.API_PREFIX}administration/?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.status >= 200 && response.status < 300
    } catch (error) {
      throw new Error('Не удалось удалить пользователя')
      return false
    }
  }
}
