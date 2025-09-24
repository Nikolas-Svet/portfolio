import { afterEach, beforeAll, vi } from 'vitest'
import { config } from '@vue/test-utils'

const originalFetch = globalThis.fetch

beforeAll(() => {
  globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
    const response = await originalFetch(input, init)
    console.log(`[Test fetch] ${input.toString()} → ${response.status} ${response.statusText}`)
    return response
  }
})

config.global.components = {
  'v-select': {
    template: '<div></div>'
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})
