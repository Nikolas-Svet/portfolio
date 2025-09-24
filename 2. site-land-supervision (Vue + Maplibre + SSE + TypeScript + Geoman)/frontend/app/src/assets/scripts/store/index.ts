import { createStore } from 'vuex'
import currentDatasets from './currentDatasets'
import defaultStyleLayer from './defaultStyleLayer'

const store = createStore({
  modules: {
    currentDatasets,
    defaultStyleLayer
  }
})
export default store
