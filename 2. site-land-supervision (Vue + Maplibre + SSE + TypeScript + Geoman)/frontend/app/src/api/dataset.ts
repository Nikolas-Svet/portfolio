import { request } from './request'
import { Consts } from '@/consts/index.consts.ts'

export const datasetApi = {
  // async getDatasets() {
  //   try {
  //     const token = localStorage.getItem('token')
  //     const response = await request.get(
  //       '/api/v1/datasets/',
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     )
  //     return response.data
  //   } catch (error) {
  //     console.error('Не удалось получить датасеты:', error)
  //     throw new Error('Не удалось получить датасеты')
  //   }
  // }
  async getDatasets() {
    try {
      const token = localStorage.getItem('token')
      const response = await request.post(
        `${Consts.API_PREFIX}datasets/`, // URL
        {}, // Тело запроса, если оно пустое
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Не удалось получить датасеты:', error)
      throw new Error('Не удалось получить датасеты')
    }
  }
}
