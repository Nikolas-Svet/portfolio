// @/store/modules/measurement.ts
import { Module } from 'vuex'
import { measurementStoreActions } from '@/store/actions/measurement'

export interface IMeasurementStore {
  unitOptions: Array<{ name: string; value: string; conversionFactor: number }>
  currentIndex: number
  selectedUnit: { name: string; value: string; conversionFactor: number }
}

export const measurementStore: Module<IMeasurementStore, unknown> = {
  namespaced: true,
  state: {
    // Опции единиц измерения:
    // - Метры квадратные: коэффициент 1
    // - Километры квадратные: коэффициент 1e-6
    // - Гиктары: коэффициент 1/10000
    unitOptions: [
      { name: 'га', value: 'HECTARES', conversionFactor: 1 / 10000 },
      { name: 'м²', value: 'SQM', conversionFactor: 1 },
      { name: 'км²', value: 'SQKM', conversionFactor: 1 / 1000000 }
    ],
    currentIndex: 0,
    selectedUnit: { name: 'га', value: 'HECTARES', conversionFactor: 1 / 10000 }
  },
  mutations: {
    [measurementStoreActions.NEXT_UNIT](state) {
      state.currentIndex = (state.currentIndex + 1) % state.unitOptions.length
      state.selectedUnit = state.unitOptions[state.currentIndex]
    },
    [measurementStoreActions.PREV_UNIT](state) {
      state.currentIndex =
        (state.currentIndex - 1 + state.unitOptions.length) % state.unitOptions.length
      state.selectedUnit = state.unitOptions[state.currentIndex]
    }
  },
  actions: {
    nextUnit({ commit }) {
      commit(measurementStoreActions.NEXT_UNIT)
    },
    prevUnit({ commit }) {
      commit(measurementStoreActions.PREV_UNIT)
    }
  },
  getters: {
    selectedUnit(state) {
      return state.selectedUnit
    },
    // Функция для конвертации из м² в выбранную единицу
    convert:
      (state) =>
        (valueInSqm: number): number => {
          console.log(valueInSqm, state.selectedUnit.conversionFactor)
          return valueInSqm * state.selectedUnit.conversionFactor
        }
  }
}
