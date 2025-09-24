import axios from 'axios'

const { VITE_API_URL } = import.meta.env

export const request = axios.create({
  baseURL: VITE_API_URL,
  timeout: 30_000,
  validateStatus: function(status) {
    console.log('status', status)
    switch (status) {
      case 500:
        console.error('[INTERNAL SERVER ERROR]')
        break
    }
    return status <= 400
  }
})

request.interceptors.request.use(
  (config) => {
    console.log(
      `%c[API Request] %c${config.method?.toUpperCase()} %c${config.baseURL}${config.url}`,
      'color: #888',
      'color: #4caf50; font-weight: bold;',
      'color: #2196f3;'
    )
    const token = localStorage.getItem('token')
    config.headers['Authorization'] = 'Bearer ' + token
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      (window as any).$notify('Превышено время ожидания', true)
    }
    return Promise.reject(error)
  }
)
