import { request } from './request'
import { Consts } from '@/consts/index.consts.ts'

export const defaultApi = {
  async search(search: string): Promise<any> {
    try {
      const token = localStorage.getItem('token')
      const url = `${Consts.API_PREFIX}search/${search}`

      const response = await request.get(`${url}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      })

      if (response.status === 200) {
        return response.data
      } else {
        (window as any).$notify(Consts.ErrorMessages.Search, true)
      }

      return response.data
    } catch (error) {
      console.error(Consts.ErrorMessages.Search, error)
      return false
    }
  }
}
