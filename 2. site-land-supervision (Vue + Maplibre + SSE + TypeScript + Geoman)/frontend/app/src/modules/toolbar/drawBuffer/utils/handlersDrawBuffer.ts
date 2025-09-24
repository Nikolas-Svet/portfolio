import maplibregl from 'maplibre-gl'
import { Geoman } from '@geoman-io/maplibre-geoman-free'
import * as turf from '@turf/turf'
import { showPolygons } from '@/utils/map/showObjects.ts'
import { useDrawBufferStore } from '@/modules/toolbar/drawBuffer/store/DrawBuffer.ts'
import { Feature } from 'geojson'

const drawBufferStore = useDrawBufferStore()

export function makeGmDrawBufferHandler(
  map: maplibregl.Map,
  geoman: Geoman
): (event: any) => Promise<void> {
  return async (event) => {
    await setHandlerBufferDraw(event, map, geoman)
  }
}

async function setHandlerBufferDraw(event: any, map: maplibregl.Map, geoman: Geoman): Promise<void> {

  if (!geoman || !map) {
    console.error('Geoman или map не инициализированы', geoman, map)
    return
  }

  const geojson = event.feature.getGeoJson() as Feature
  console.log('Новая точка', geojson)

  console.log(drawBufferStore.startPoint)

  if (!drawBufferStore.startPoint) {
    const isPointOnLine = turf.booleanPointOnLine(geojson, drawBufferStore.geometryLine)
    console.log('Добавляем здесь точку', geojson, isPointOnLine)
    if (isPointOnLine) {
      drawBufferStore.startPoint = geojson.geometry.coordinates
    }
    return
  } else {
    console.log('Точка уже есть, здесь должны проверять, попадает ли точка на линию', geojson)
    const isPointOnLine = turf.booleanPointOnLine(geojson, drawBufferStore.geometryLine)
    console.log('Добавляем здесь точку два', geojson, isPointOnLine)
    if (isPointOnLine) {
      const start = turf.point(drawBufferStore.startPoint)
      const stop = turf.point(geojson.geometry.coordinates)
      const sliced = turf.lineSlice(start, stop, drawBufferStore.geometryLine)
      const distance = 20

      let buffered = turf.buffer(sliced, distance, { units: 'meters', steps: 16 })
      showPolygons(map, [buffered])
    }
    //   Если точка попадает, то создаем буфер

    // Также, если одна точка на буфере, а другая вне, это не нужно обрабатывать,
    // уведомлять пользователя, что так не нельзя сделать

    //   Когда создали буфер, нужно проверять, есть ли рядом буфер
    //   Если присутствует, то вычесть у нового буфера часть, которая наезжает на другой буфер
  }

  return

  if (!event.featureData || !event.markerData) return

  const picked = []

  const allMarkers = Array.from(event.featureData.markers.values())
  for (let i = 0; i < allMarkers.length; i += 1) {
    picked[i] = (allMarkers as any)[i].position.coordinate
  }
  if (event.markerData.position.coordinate) {
    picked.push(event.markerData.position.coordinate)
  }

  const line = turf.lineString(picked)

  const distance = 20

  let buffered = turf.buffer(line, distance, { units: 'meters', steps: 16 })

  // const ring = buffered.geometry.coordinates[0]

  // ring.splice(1, 1)
  // ring.splice(ring.length - 3, 1)

  // buffered.geometry.coordinates[0] = ring


  showPolygons(map, [buffered])
}
