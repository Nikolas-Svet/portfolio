import { defineStore } from 'pinia'
import { Feature } from 'geojson'

export const useDrawBufferStore = defineStore('drawBuffer', {
  state: () => ({
    currentLineId: null as null | string,
    geometryLine: null as null | Feature,
    startPoint: null as null | [number, number]
  }),

  actions: {}
})
