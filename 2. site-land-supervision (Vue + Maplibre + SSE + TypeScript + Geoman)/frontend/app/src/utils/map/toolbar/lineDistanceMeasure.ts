// lineDistanceMeasure.ts
import type { Map } from 'maplibre-gl'
import { Marker } from 'maplibre-gl'
import type { Feature, LineString } from 'geojson'
import { addEdgeDistances } from '@/utils/map/toolbar/distanceUtils.ts'

/**
 * Создаём маркеры вдоль «активной» линии:
 * coords + (ephemeralCoord?), если она есть, но линия ещё не «закрыта».
 */
export function updateActiveLineEdgeDistances(
  map: Map,
  coords: [number, number][],
  ephemeralCoord: [number, number] | null,
  measureDistance: boolean
): Marker[] {
  if (!measureDistance) {
    return []
  }

  // Если меньше двух точек, нечего мерять
  if (coords.length < 1) {
    return []
  }

  // Собираем все сегменты
  const lineCoords = [...coords]
  if (ephemeralCoord) {
    lineCoords.push(ephemeralCoord)
  }
  if (lineCoords.length < 2) {
    return []
  }

  const geometry = {
    type: 'LineString',
    coordinates: lineCoords
  }

  const markers = addEdgeDistances(map, geometry as any, {
    cssClass: 'distance-icon',
    rotatePerpendicular: true,
    collisionPx: 20,
    dynamic: true
  })

  return markers
}

/**
 * Создаём маркеры для уже «закрытой» линии (LineString).
 * @param map
 * @param feature   Feature<LineString>
 * @param measureDistance
 */
export function updateClosedLineEdgeDistances(
  map: Map,
  feature: Feature<LineString>,
  measureDistance: boolean
): Marker[] {
  if (!measureDistance) {
    return []
  }

  // Вызываем addEdgeDistances
  const markers = addEdgeDistances(map, feature.geometry, {
    cssClass: 'distance-icon',
    rotatePerpendicular: true,
    collisionPx: 20,
    dynamic: true,
    isCreate: false
  })
  return markers
}

/** Удаляем все маркеры */
export function clearMarkers(markers: Marker[]): void {
  markers.forEach((m) => m.remove())
}
