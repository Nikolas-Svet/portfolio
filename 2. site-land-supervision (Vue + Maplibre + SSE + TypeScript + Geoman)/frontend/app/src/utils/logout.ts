import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain.ts'

export async function clearAllDataUser() {
  await store.commit(`layersMain/${layersMainActions.setLayersMain}`, [])
  localStorage.removeItem('name')
  localStorage.removeItem('currentDesktop')
  localStorage.removeItem('description')
  await store.dispatch('toolbarDrawing/CLEAR_ALL')
  await store.dispatch('toolbar/CLEAR_ALL')
  await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, {})
  return
}