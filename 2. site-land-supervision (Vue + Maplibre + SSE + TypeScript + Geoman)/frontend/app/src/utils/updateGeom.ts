import { createGeoJsonBlob } from '@/utils/fileBlob.ts'
import { vectorApi } from '@/api/admin.ts'
import store from '@/store'
import { configActions } from '@/store/actions/config.ts'
import { layersMainActions } from '@/store/actions/layersMain.ts'

export async function updateGeomForLayer(file: GeoJSON.FeatureCollection, id: number, id_crs: number) {
  const fileBlob = createGeoJsonBlob(file)
  const formData = new FormData()
  formData.append('geo_json_file', fileBlob, 'geometry.geojson')
  await vectorApi.addGeometryVector(Number(id), formData, id_crs)
  await store.dispatch(configActions.SET_UPDATE_LAYER, Number(id))
  const layers = store.state.layersMain?.layersMain

  for (const layer of layers) {
    if (layer.id === id) {
      (layer as any).is_edit = false
      await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, layer)
    }
  }
  return
}