import { request } from '@/api/request.ts'
import { ISignUpData } from '@/types/auth.ts'
import { Consts } from '@/consts/index.consts.ts'

const AUTH_PREFIX = 'auth/'

export const authApi = {
  async resetPassword(reset_token: string, username: string, password: string) {
    try {
      const body = new URLSearchParams()
      body.append('reset_token', reset_token)
      body.append('username', username)
      body.append('password', password)
      const response = await request.post(
        `${Consts.API_PREFIX}${AUTH_PREFIX}reset_password/`,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      if (response.status >= 200 && response.status < 300) {
        return { success: true, data: response.data }
      }

      return { success: false, data: response.data }
    } catch (error: any) {
      if (error.response && error.response.data) {
        return { success: false, error: error.response.data }
      }
      return { success: false, error: 'Не удалось сбросить пароль' }
    }
  },
  async forgotPassword(username: string, captcha_input: string, captcha_id: string | number) {
    try {

      const response = await request.post(
        `${Consts.API_PREFIX}${AUTH_PREFIX}forgot_password/`,
        {
          username,
          captcha_input,
          captcha_id: String(captcha_id)
        }
      )

      if (response.status > 200 && response.status < 300) {
        return { success: true, data: response.data }
      }

      return { success: false, data: response.data }
    } catch (error: any) {
      if (error.response && error.response.data) {
        return { success: false, error: error.response.data }
      }
      return { success: false, error: 'Не удалось сбросить пароль' }
    }
  },
  async signUp(signUpData: ISignUpData) {
    try {
      const response = await request.post(`${Consts.API_PREFIX}${AUTH_PREFIX}create_user/`, signUpData)
      console.log(response)
      switch (response.status) {
        case 200:
          return { success: true, data: response.data, captcha_id: response.headers['captcha_id'] }
        default:
          return { success: false, error: response.data }
      }
    } catch (error: any) {
      console.log(error)
      switch (error.response.status) {
        case 400:
          return { success: false, message: error.response.data }
      }
      return { success: false, error: error }
    }
  },
  async loadCaptcha() {
    try {
      const response = await request.get(`${Consts.API_PREFIX}auth/captcha/`, {
        responseType: 'blob'
      })
      const captcha_id = Number(response.headers['content-disposition'].split('filename=')[1].split('"')[1])
      switch (response.status) {
        case 200:
          return {
            success: true,
            data: response.data,
            captcha_id: captcha_id
          }
        default:
          return { success: false, error: response.data }
      }
    } catch (error: any) {
      switch (error.response.status) {
        case 400:
          return { success: false, message: error.response.data }
      }
      return { success: false, error: error }
    }
  }
}