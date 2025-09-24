import { request } from '@/api/request.ts'
import { Consts } from '@/consts/index.consts.ts'

// **************
// CRUD desktops
// **************

export const desktopApi = {
  async updateDesktop(body: any, id: number | string) {
    try {
      const token = localStorage.getItem('token')

      const url = `${Consts.API_PREFIX}desktop/?id_desktop=${id}`

      const response = await request.put(url, body, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        (window as any).$notify(Consts.ErrorMessages.DesktopsUpdateSuccessful, true)
        return response.data
      } else {
        (window as any).$notify(Consts.ErrorMessages.DesktopsUpdate, true)
        return false
      }
    } catch (error) {
      console.error(Consts.ErrorMessages.DesktopsUpdate, error)
      return false
    }
  },
  async getDesktopById(id: number | string) {
    try {
      const token = localStorage.getItem('token')

      const url = `${Consts.API_PREFIX}desktop/${id}/`

      const response = await request.get(url, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        console.log(response)
        return response.data
      } else {
        (window as any).$notify(Consts.ErrorMessages.DesktopGetById, true)
        return false
      }
    } catch (error) {
      console.error(Consts.ErrorMessages.DesktopGetById, error)
      return false
    }
  },
  async getDesktops() {
    try {
      const token = localStorage.getItem('token')

      const url = `${Consts.API_PREFIX}desktop/`

      const response = await request.get(url, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        return response.data
      } else {
        (window as any).$notify(Consts.ErrorMessages.DesktopsGet, true)
        return false
      }
    } catch (error) {
      console.error(Consts.ErrorMessages.DesktopsGet, error)
      return false
    }
  },
  async deleteDesktop(id: number | string) {
    try {
      const token = localStorage.getItem('token')

      const url = `${Consts.API_PREFIX}desktop/?id_desktop=${id}`

      const response = await request.delete(url, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200 || response.status === 204) {
        (window as any).$notify(Consts.ErrorMessages.DesktopDeleteSuccessful, true)
        return true
      } else {
        (window as any).$notify(Consts.ErrorMessages.DesktopDelete, true)
        return false
      }
    } catch (error) {
      console.error(Consts.ErrorMessages.DesktopDelete, error)
      return false
    }
  },
  async createDesktop(body: any) {
    try {
      const token = localStorage.getItem('token')

      const url = `${Consts.API_PREFIX}desktop/`

      const response = await request.post(url, body, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200 || response.status === 204) {
        (window as any).$notify(Consts.ErrorMessages.DesktopCreateSuccessful, true)
        return true
      } else {
        (window as any).$notify(Consts.ErrorMessages.DesktopCreate, true)
        return false
      }
    } catch (error: any) {
      console.error(error)
    }
  }
}
