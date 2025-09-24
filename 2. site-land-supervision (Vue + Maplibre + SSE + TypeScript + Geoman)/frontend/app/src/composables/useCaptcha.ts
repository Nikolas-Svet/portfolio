// src/composables/useCaptcha.ts
import { ref } from 'vue'
import { authApi } from '@/api/auth'

export function useCaptcha() {
  const id = ref<number>(0)
  const image = ref<string>('')

  const load = async () => {
    const res = await authApi.loadCaptcha()
    if (res.success && res.data && res.captcha_id) {
      id.value = res.captcha_id
      image.value = URL.createObjectURL(res.data)
    }
  }

  return { id, image, load }
}
