import store from '@/store'
import { clearMarkers } from '@/utils/map/toolbar/polygonDistanceMeasure.ts'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'
import { checkIsUpdateGeom } from '@/assets/scripts/mapLibre/mapUtils.ts'
import maplibregl, { Marker } from 'maplibre-gl'
import { Geoman } from '@geoman-io/maplibre-geoman-free'

let markers: Marker[] = []

export function makeGmDrawHandler(
  map: maplibregl.Map,
  geoman: Geoman
): (event: any) => Promise<void> {
  return async (event) => {
    await setHandlerDraw(event, map, geoman)
  }
}

async function setHandlerDraw(event: any, map: maplibregl.Map, geoman: Geoman): Promise<void> {
  if (!await checkIsUpdateGeom(event.mode)) {
    return
  }
  const isMeasureDistance = store.state.toolbar.measure_distance

  if (isMeasureDistance && event.featureData && !geoman.isModeEnabled('edit', 'cut')) {
    const allMarkers = Array.from(event.featureData.markers.values())
    const picked: typeof allMarkers = []
    for (let i = 0; i < allMarkers.length; i += 1) {
      if ((allMarkers as any)[i].type === 'dom') {
        picked[i] = (allMarkers as any)[i].position.coordinate
      }
    }

    if (picked.length > 0) {
      picked.push(event.markerData.position.coordinate)
    }

    clearMarkers(markers)

    markers = addEdgeDistances(map, { type: 'Polygon', coordinates: [picked as any] }, {
      cssClass: 'distance-icon',
      rotatePerpendicular: true,
      collisionPx: 20,
      dynamic: true,
      isCreate: true
    })

    // store.dispatch('GeometryMarkersDistance/UPDATE_LAYER', { id: event.feature.id, markers: markers })
  }
}
