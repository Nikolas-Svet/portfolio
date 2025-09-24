// src/utils/mapUtils.ts
import maplibregl, { Marker } from 'maplibre-gl'
import { Geoman, type GmOptionsPartial } from '@geoman-io/maplibre-geoman-free'

// Import CSS for MapLibre and Geoman
import 'maplibre-gl/dist/maplibre-gl.css'
import '@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css'
import { vectorApi } from '@/api/admin.ts'
import { Feature, FeatureCollection } from 'geojson'
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain.ts'
import { Consts } from '@/consts/index.consts.ts'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'
import { clearMarkers } from '@/utils/map/toolbar/polygonDistanceMeasure.ts'
import { deleteMarkersForLayer } from '@/utils/map/toolbar/measureDistance.ts'
import { isPolygonIntersectingAnyObject } from '@/utils/map/findObjects.ts'
import { toolsStoreActions } from '@/store/actions/tools.ts'


let markers: Marker[] = []

let allMarker: any = []

let selectedObject: any = []

const mapLibreStyle: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

export function initializeMap(
  container: HTMLElement,
  lng = 0,
  lat = 51,
  zoom = 5
) {
  const map = new maplibregl.Map({
    container,
    style: mapLibreStyle,
    center: [lng, lat],
    zoom
  })

  const gmOptions: GmOptionsPartial = {
    // settings: {
    //   eventPrefix: 'gm'
    // },
    // geoman options here
    // controls: {
    //   edit: {
    //     drag: {
    //       uiEnabled: true
    //     },
    //     edit: {
    //       uiEnabled: true
    //     }
    //   }
    // },
    layerStyles: {
      marker: {
        gm_main: [
          {
            type: 'symbol',
            layout: {
              'icon-image': 'default-marker',
              'icon-size': 0.25,
              'icon-allow-overlap': true,
              'icon-anchor': 'bottom'
            }
          }
        ],
        gm_temporary: [
          {
            type: 'symbol',
            layout: {
              'icon-image': 'temp-marker',
              'icon-size': 0.25
            }
          }
        ]
      },
      line: {
        gm_main: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          }
        ],
        gm_temporary: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            }
          }
        ]
      },
      polygon: {
        gm_main: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          },
          {
            type: 'fill',
            paint: {
              'fill-color': Consts.GeometryStylesConsts.primary_color,
              'fill-opacity': 0.3
            }
          }
        ],
        gm_temporary: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          },
          {
            type: 'fill',
            paint: {
              'fill-color': Consts.GeometryStylesConsts.primary_color,
              'fill-opacity': 0.3
            }
          }
        ]
      },
      circle: {
        gm_main: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          },
          {
            type: 'fill',
            paint: {
              'fill-color': Consts.GeometryStylesConsts.primary_color,
              'fill-opacity': 0.3
            }
          }
        ],
        gm_temporary: [
          {
            type: 'line',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          },
          {
            type: 'fill',
            paint: {
              'fill-color': Consts.GeometryStylesConsts.primary_color,
              'fill-opacity': 0.3
            }
          }
        ]
      },
      circle_marker: {
        gm_main: [
          {
            type: 'circle',
            paint: {
              'circle-radius': 4,
              'circle-color': Consts.GeometryStylesConsts.primary_color_2,
              'circle-stroke-width': 4,
              'circle-stroke-color': Consts.GeometryStylesConsts.primary_color
            }
          }
        ],
        gm_temporary: [
          {
            type: 'circle',
            paint: {
              'circle-radius': 4,
              'circle-color': Consts.GeometryStylesConsts.primary_color_2,
              'circle-opacity': 0.9,
              'circle-stroke-width': 4,
              'circle-stroke-color': Consts.GeometryStylesConsts.primary_color_hover
            }
          }
        ]
      }
    }
  }

  // Initialize Geoman with default options
  const geoman = new Geoman(map, gmOptions)

  // Add control panel on the right side
  // geoman.addControls({
  //   position: 'top-right',
  //   draw: { uiEnabled: true },
  //   edit: { uiEnabled: true },
  //   drawMarker: true,
  //   drawLine: true,
  //   drawPolygon: true,
  //   drawRectangle: true,
  //   drawCircle: true,
  //   editMode: true,
  //   dragMode: true,
  //   removeMode: true,
  //   rotateMode: true,
  //   cutMode: true,
  //   snappingMode: true
  // } as any)

  function bringGeomanLayersToTop() {
    const style = map.getStyle()
    style.layers?.forEach(layer => {
      if (layer.id.startsWith('gm_')) {
        try {
          map.moveLayer(layer.id)
        } catch (e) {
          // ignore
        }
      }
    })
  }

  // Once Geoman is ready
  map.on('gm:loaded', async (event) => {
    console.log('Geoman fully loaded')

    console.log('event.currentId', event.currentId)

    if (event.geoms) {

      for (const feature of event.geoms) {
        geoman.features.importGeoJsonFeature(feature as any)
      }
    }

    if (event.currentId) {
      const geojsonResponse = await vectorApi.getGeojson(event.currentId)
      const geojson: FeatureCollection =
        typeof geojsonResponse === 'string'
          ? JSON.parse(geojsonResponse)
          : geojsonResponse

      if (geojson.type !== 'FeatureCollection') {
        console.error('Ответ не является FeatureCollection:', geojson)
        return
      }
      if (!geojson.features.length) {
        console.warn('Пустой массив features в ответе.')
        return
      }


      console.log('geojson', toRaw(geojson))
      geojson.features[0].id = 'edit-object-' + String(event.currentId)

      const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []

      current_geoms_ids.push(geojson.features[0].id)

      await store.dispatch('toolbar/SET_CURRENT_GEOMS_IDS', current_geoms_ids)

      // GEOMAN
      geojson.features.forEach((feature: Feature) => {
        geoman.features.importGeoJsonFeature(feature as any)
      })
    }

    if (geoman.isModeEnabled('edit', 'change')) {
      geoman.disableMode('edit', 'change')
      await nextTick()
      geoman.toggleMode('edit', 'change')
    } else if (geoman.isModeEnabled('edit', 'rotate')) {
      geoman.disableMode('edit', 'rotate')
      await nextTick()
      geoman.toggleMode('edit', 'rotate')
    }
  })

  map.on('styledata', bringGeomanLayersToTop)
  map.on('render', () => {
    bringGeomanLayersToTop()
  })

  map.on('error', (e: any) => {
    if (
      e.error &&
      e.error.name === 'InvalidStateError' &&
      e.error.message.includes('source image could not be decoded')
    ) {
      return
    }

    console.error(e.error)
  })

  map.on('gm:create', async (e) => {
    if (e.shape && store.state.forestArea.flagCreateLayer) {
      const geojson = e.feature.getGeoJson()
      geoman.features.delete(geojson.id)
      geoman.disableMode('draw', 'polygon')
      // geojson.id = 'for_delete' + '-' + e.shape + '-' + geojson.id
      store.commit(toolsStoreActions.setToolGeom, geojson)
      return
    }
    if (e.shape && !geoman.isModeEnabled('edit', 'cut')) {
      const geojson = e.feature.getGeoJson()

      const isMeasureDistance = store.state.toolbar.measure_distance

      const currentLayer = store.state.layersMain?.selectedLayerMainEdit

      geoman.features.delete(geojson.id)

      geojson.id = String(currentLayer.id) + '-' + e.shape + '-' + geojson.id

      if (isMeasureDistance && await checkIsUpdateGeom(e.shape)) {

        const m = addEdgeDistances(map, geojson.geometry, {
          cssClass: 'distance-icon',
          rotatePerpendicular: true,
          collisionPx: 20,
          dynamic: true,
          isCreate: true
        })
        await store.dispatch('GeometryMarkersDistance/ADD_LAYER', { id: geojson.id, markers: m })
      }

      geoman.features.importGeoJsonFeature(geojson)

      const current_geoms_ids = store.state.toolbar.current_geoms_ids ? store.state.toolbar.current_geoms_ids : []

      current_geoms_ids.push(geojson.id)

      await store.dispatch('toolbar/SET_CURRENT_GEOMS_IDS', current_geoms_ids)

      if (currentLayer) {
        (currentLayer as any).is_edit = true
        await store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, currentLayer)
      }
    }
  })

  map.on('dblclick', async () => {
    const currentTool = store.state.toolbar.is_active_tool
    if (currentTool === Consts.activeTools.highlight_polygon) {
      if (geoman.isModeEnabled('draw', Consts.activeTools.polygon)) {
        geoman.disableMode('draw', Consts.activeTools.polygon)
        if (map.getLayer('last-edge-line')) {
          map.removeLayer('last-edge-line')
        }
        if (map.getSource('last-edge')) {
          map.removeSource('last-edge')
        }
        await store.dispatch('toolbar/SET_SELECTED_OBJECTS', selectedObject)
        selectedObject = []
        await store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
      }
    }
  })

  map.on('_gm:draw', async (event) => {
    if (!await checkIsUpdateGeom(event.mode)) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    const currentTool = store.state.toolbar.is_active_tool
    if (currentTool === Consts.activeTools.highlight_polygon) {
      if (!event.featureData) {
        return
      }
      const allMarkers = Array.from(event.featureData.markers.values())
      const picked: Array<[number, number]> = []

      allMarkers.forEach(m => {
        if ((m as any).type === 'dom') {
          picked.push((m as any).position.coordinate)
        }
      })

      if (picked.length > 0) {
        picked.push(event.markerData.position.coordinate)
        picked.push(picked[0])
      }

      if (picked.length >= 2) {
        const lastEdgeCoords: [[number, number], [number, number]] = [
          picked[picked.length - 2],
          picked[picked.length - 1]
        ]
        const lastEdgeFeature: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lastEdgeCoords
          },
          properties: {}
        }

        const src = map.getSource('last-edge') as mapboxgl.GeoJSONSource | undefined
        if (src) {
          src.setData(lastEdgeFeature)
        } else {
          map.addSource('last-edge', {
            type: 'geojson',
            data: lastEdgeFeature
          })
          map.addLayer({
            id: 'last-edge-line',
            type: 'line',
            source: 'last-edge',
            paint: {
              'line-color': Consts.GeometryStylesConsts.primary_color,
              'line-width': 3,
              'line-opacity': 1
            }
          })
        }
      }

      selectedObject = await isPolygonIntersectingAnyObject(
        map,
        [{ geometry: { coordinates: [picked], type: 'Polygon' } }]
      )
      return
    }

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
  })

  map.on('gm:drawend', async () => {
    if (map.getLayer('last-edge-line')) {
      map.removeLayer('last-edge-line')
    }
    if (map.getSource('last-edge')) {
      map.removeSource('last-edge')
    }
  })

  map.on('gm:globalcutmodetoggled', async (event) => {
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance && event.enabled) {
      await store.dispatch('toolbar/SET_MEASURE_DISTANCE', false)
    }
  })

  map.on('gm:remove', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      await deleteMarkersForLayer(event.feature.id)
    }
  })

  map.on('gm:edit', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      const allMarkers = Array.from(event.feature.markers.values())
      const geomId = event.feature.id
      await updateMarkersCoord(map, allMarkers, geomId, event.shape)
    }
  })

  // geoman.setGlobalEventsListener((event: GlobalEventsListenerParemeters) => {
  //   console.log('eeeevent', event)
  // })

  map.on('gm:editend', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      markers = []
      allMarker = []
    }
  })

  map.on('gm:drag', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      const allMarkers = Array.from(event.feature.markers.values())
      const geomId = event.feature.id
      await updateMarkersCoord(map, allMarkers, geomId, event.shape)
    }
  })

  map.on('gm:dragend', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    if (event.mode === 'circle') {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      markers = []
      allMarker = []
    }
  })

  map.on('gm:rotate', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      const allMarkers = Array.from(event.feature.markers.values())
      const geomId = event.feature.id
      await updateMarkersCoord(map, allMarkers, geomId, event.shape)
    }
  })

  map.on('gm:rotateend', async (event) => {
    if (event.feature.id.includes('circle-feature')) {
      return
    }
    const isMeasureDistance = store.state.toolbar.measure_distance
    if (isMeasureDistance) {
      markers = []
      allMarker = []
    }
  })

  return [map, geoman] as any
}

async function checkIsUpdateGeom(shape: string): Promise<boolean> {
  if (shape === 'circle') {
    return false
  }
  return true
}

async function updateMarkersCoord(map: any, allMarkers: any, geomId: string, shape: string) {
  const allPicked: any = []
  let picked: typeof allMarkers = []
  let current_polygon = -1
  let count_polygon = new Set<number>
  for (let i = 0; i < allMarkers.length; i += 1) {
    if (allMarkers[i].type === 'vertex') {
      if (current_polygon !== allMarkers[i].position.path[allMarkers[i].position.path.length - 2]) {
        count_polygon.add(allMarkers[i].position.path[allMarkers[i].position.path.length - 2])
        current_polygon = allMarkers[i].position.path[allMarkers[i].position.path.length - 2]
      }
    }
  }

  clearMarkers(allMarker)

  allMarker = []

  for (const count of count_polygon) {
    for (let i = 0; i < allMarkers.length; i += 1) {
      if (allMarkers[i].type === 'vertex' && count === allMarkers[i].position.path[allMarkers[i].position.path.length - 2]) {
        picked[allMarkers[i].position.path[allMarkers[i].position.path.length - 1]] = allMarkers[i].position.coordinate
      }
    }
    if (picked.length > 0 && shape === 'polygon') {
      picked.push(picked[0])
    }

    allMarker = [...allMarker, ...addEdgeDistances(map, { type: 'Polygon', coordinates: [picked] }, {
      cssClass: 'distance-icon',
      rotatePerpendicular: true,
      collisionPx: 20,
      dynamic: true,
      isCreate: true
    })]

    allPicked[count] = picked
    picked = []
  }

  await store.dispatch('GeometryMarkersDistance/UPDATE_LAYER', { id: geomId, markers: allMarker })
}
