import { decodeJwt } from '@/utils/loadUser.ts'

export async function checkAdminAccess() {
  const userData = decodeJwt()
  if (userData.success) {
    if (userData.data.is_admin && userData.data.is_sys_admin) {
      return true
    }
  }
  return false
}