import store from '@/store'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'

export async function deleteAllMarkers() {
  const layersSet: Set<any> = store.state.GeometryMarkersDistance.layersMarkers

  const ids = Array.from(layersSet, layer => layer.id)

  for (const id of ids) {
    await store.dispatch('GeometryMarkersDistance/DELETE_LAYER', id)
  }

  await store.dispatch('GeometryMarkersDistance/SET_LAYERS', [])
}

export async function deleteMarkersForLayer(layerId: string) {
  if (!layerId) return

  await store.dispatch('GeometryMarkersDistance/DELETE_LAYER', layerId)
}

export async function addAllMarkers(geoman: any, map: any) {
  if (geoman.isModeEnabled('edit', 'cut')) {
    geoman.disableMode('edit', 'cut')
    await store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
  }
  const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []
  const geojsonData = geoman.features.getAll()
  console.log('geojsonData', geojsonData)
  const geoDataFinal = new Set()
  console.log(1)
  for (const geoms_id of current_geoms_ids) {
    for (const geoData of geojsonData.features) {
      if (geoms_id === geoData.id && !geoms_id.includes('circle-feature')) {
        geoDataFinal.add(geoData)
      }
    }
  }

  for (const geom of geoDataFinal) {
    const markers = addEdgeDistances(map, (geom as any).geometry, {
      cssClass: 'distance-icon',
      rotatePerpendicular: true,
      collisionPx: 20,
      dynamic: true,
      isCreate: true
    })

    await store.dispatch('GeometryMarkersDistance/ADD_LAYER', { id: (geom as any).id, markers: markers })
  }
}