import type { Map } from 'maplibre-gl'
import store from '@/store'
import { Consts } from '@/consts/index.consts.ts'

// using in updateLayer
export async function addMapLayer(map: Map, layerId: string, layerType: string, sourceId: string, layerStyle: any, sourceLayer: string = 'default') {
  if (layerType === 'layer-vector') {
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      'source-layer': sourceLayer,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#D68166', layerStyle?.color!],
        'fill-opacity': layerStyle?.opacity!
      }
    })

    map.addLayer({
      id: `${layerId}-circle`,
      type: 'circle',
      source: sourceId,
      'source-layer': sourceLayer,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 4,
        'circle-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#D68166', layerStyle?.color!],
        'circle-stroke-color': layerStyle?.outlineColor!,
        'circle-stroke-width': layerStyle?.outlineWidth!
      }
    })

    map.addLayer({
      id: `${layerId}-outline`,
      type: 'line',
      source: sourceId,
      'source-layer': sourceLayer,
      filter: ['in', '$type', 'LineString', 'Polygon'],
      paint: {
        'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#D68166', layerStyle?.outlineColor!],
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], layerStyle?.outlineWidth! * 1.4, layerStyle?.outlineWidth!],
        'line-opacity': 1
      }
    })
  } else if (layerType === 'layer-raster') {
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': layerStyle?.opacity!,
        'raster-contrast': layerStyle?.contrast!
      }
    })
  }

  return
}

export async function addCircle(map: Map, layerId: string, layerStyle: any) {
  map!.addLayer(
    {
      id: `${layerId}-circle`,
      type: 'circle',
      source: `source-${layerId}`,
      'source-layer': 'default',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 4,
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#D68166',
          layerStyle!.color || '#ffffff'
        ],
        'circle-stroke-color': layerStyle!.outlineColor || '#C83202',
        'circle-stroke-width': layerStyle!.outlineWidth || 1
      }
    },
    layerId
  )

}

export async function addOutline(map: Map, layerId: string, layerStyle: any) {
  map!.addLayer(
    {
      id: `${layerId}-outline`,
      type: 'line',
      filter: ['in', '$type', 'LineString', 'Polygon'],
      source: `source-${layerId}`,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#D68166',
          layerStyle!.outlineColor || '#ffffff'
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          layerStyle!.outlineWidth * 1.4 || 3,
          layerStyle!.outlineWidth || 1
        ],
        'line-opacity': 1
      }
    },
    layerId
  )
}

export async function removeLayerIfExists(map: Map, uniqueId: string) {
  const layerId = `layer-${uniqueId}`
  const sourceId = `source-${uniqueId}`

  if (map?.getLayer(layerId)) {
    map.removeLayer(layerId)
  }

  if (map?.getSource(sourceId)) {
    map.removeSource(sourceId)
  }
}

export function checkCursor() {
  const currentCursor = store.state.toolbar.activeCursor
  if (
    currentCursor === Consts.activeCursors.move ||
    currentCursor === Consts.activeCursors.crosshair ||
    currentCursor === Consts.activeCursors.message
  ) {
    return false
  }
  return true
}
