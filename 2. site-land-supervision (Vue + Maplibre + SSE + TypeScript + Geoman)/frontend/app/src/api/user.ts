import { IUser } from '@/types/user'
import { request } from './request'
import { Consts } from '@/consts/index.consts.ts'

export const userApi = {
  async update(body: IUser) {
    try {
      const token = localStorage.getItem('token')
      const response = await request.put(`${Consts.API_PREFIX}auth/`, body, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response

    } catch (error: any) {
      if (error.response.status === 400) {
        (window as any).$notify(error.response.data, true)
      }
      throw new Error('Failed to update user')
    }
  },
  async getIcon(): Promise<Blob> {
    const token = localStorage.getItem('token')
    const response = await request.put(
      `${Consts.API_PREFIX}auth/get_photo_user`,
      null,               // <- здесь тело (null или {}), если сервер не ждёт JSON-body
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'  // <- важный флаг, чтобы axios вернул вам Blob
      }
    )
    return response.data  // Blob
  },
  async loadIcon(blob: Blob) {
    const form = new FormData()
    // 1) Ключ «photo», как требует ваш API:
    form.append('photo', blob, 'avatar.png')

    const token = localStorage.getItem('token')
    return await request.put(
      // 2) Правильный путь с /auth/:
      `${Consts.API_PREFIX}auth/update_photo_user`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`
          // 3) НЕ указывайте Content-Type — axios подставит multipart/form-data с нужным boundary
        }
      }
    )
  }

}
