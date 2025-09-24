import { jwtDecode } from 'jwt-decode'
import { toRaw } from 'vue'

export function decodeJwt() {
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = jwtDecode<{ sub: string }>(token)
    const parsedUserData = JSON.parse(decodedToken.sub) as any
    const rawUserData = toRaw(parsedUserData)
    return { success: true, data: rawUserData }
  } else {
    return { success: false }
  }
}
