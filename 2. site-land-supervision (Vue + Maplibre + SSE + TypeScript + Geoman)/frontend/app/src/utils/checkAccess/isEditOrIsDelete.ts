// Проверка доступа пользователю на редактирование слоя или удаления
import store from '@/store'

export function isEditLayer(id_layer: number): boolean {
  // console.log(id_layer)
  // return true
  // console.log('isEditLayer', id_layer)
  if (id_layer === null || id_layer === undefined) {
    return false
  }
  const layers = store.state.layersMain?.layersMain
  if (!Array.isArray(layers)) {
    return false
  }

  // console.log('isEditLayer', layers)

  const layer = layers.find(l => Number(l.id) === id_layer)
  // console.log('isEditLayer', layer)
  return layer ? Boolean((layer as any).update) : false
}