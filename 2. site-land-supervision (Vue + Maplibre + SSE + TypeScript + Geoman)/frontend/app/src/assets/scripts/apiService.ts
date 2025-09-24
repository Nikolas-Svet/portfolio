import { Consts } from '@/consts/index.consts.ts'

export async function fetchDatasets(
  apiUrl: string,
  token: string,
  filters: {
    name?: string
    data_start?: string
    data_end?: string
    type_datasets?: number[]
  } = {}
) {
  try {
    const requestBody: { [key: string]: any } = {}
    if (filters.name) requestBody.name = filters.name
    if (filters.data_start) requestBody.data_start = filters.data_start
    if (filters.data_end) requestBody.data_end = filters.data_end
    if (filters.type_datasets) requestBody.type_datasets = filters.type_datasets

    const response = await fetch(`${apiUrl}${Consts.API_PREFIX}datasets/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : null
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
