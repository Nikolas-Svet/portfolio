import type { Map } from 'maplibre-gl'
import { Marker } from 'maplibre-gl'
import type { Geometry } from 'geojson'
import * as turf from '@turf/turf'

/** Возвращает метрическое расстояние между [lon, lat]. */
function getDistanceMeters(coord1: [number, number], coord2: [number, number]): any {
  const R = 6371000 // радиус Земли в метрах
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(coord2[1] - coord1[1])
  const dLon = toRad(coord2[0] - coord1[0])
  const lat1 = toRad(coord1[1])
  const lat2 = toRad(coord2[1])

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(0)
}

/** Возвращает midpoint [lon, lat]. */
function getSegmentMidpoint(c1: [number, number], c2: [number, number]): [number, number] {
  return [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2]
}

/** Создаёт элемент (DIV) с текстом + поворотом (bearing), если нужно. */
function createDistanceElement(text: string, bearing?: number, cssClass?: string): HTMLDivElement {
  const div = document.createElement('div')
  div.className = cssClass ?? 'distance-icon'
  div.textContent = text

  if (bearing != null) {
    div.style.transform = `rotate(${bearing}deg)`
  }
  return div
}

export interface AddEdgeDistancesOptions {
  cssClass?: string
  rotatePerpendicular?: boolean
  // Порог «слишком близкого» расстояния в пикселях — если маркеры ближе, чем это, скрываем один
  collisionPx?: number
  // Нужно ли автоматически подписываться на `map.on('moveend')`?
  dynamic?: boolean
  isCreate?: boolean
}

export function addEdgeDistances(
  map: Map,
  geometry: Geometry,
  options: AddEdgeDistancesOptions = {}
): Marker[] {
  const { cssClass, rotatePerpendicular, collisionPx = 40, dynamic = true } = options

  const markers: Marker[] = []

  function createMarker(c1: [number, number], c2: [number, number]) {
    const dist = getDistanceMeters(c1, c2)
    if (Number(dist) === 0) {
      return
    }
    const distStr = `${Math.round(dist)} м`
    const mid = getSegmentMidpoint(c1, c2)

    let bearing: number | undefined
    if (rotatePerpendicular) {
      const b = turf.bearing(turf.point(c1), turf.point(c2))
      bearing = b - 90
    }

    const el = createDistanceElement(distStr, bearing, cssClass)
    const marker = new Marker({ element: el }).setLngLat(mid).addTo(map)
    markers.push(marker)
  }

  // Создаём маркеры для каждой пары координат
  if (geometry.type === 'LineString') {
    const coords = geometry.coordinates as [number, number][]
    for (let i = 0; i < coords.length - 1; i++) {
      createMarker(coords[i], coords[i + 1])
    }
  } else if (geometry.type === 'Polygon') {
    if (geometry.coordinates.length > 1) {
      for (let i1 = 0; i1 < geometry.coordinates.length; i1++) {
        const ring = geometry.coordinates[i1]
        for (let i = 0; i < ring.length - 1; i++) {
          createMarker(ring[i] as any, ring[i + 1] as any)
        }
      }
    } else {
      const ring = (geometry.coordinates as [number, number][][])[0]
      for (let i = 0; i < ring.length - 1; i++) {
        createMarker(ring[i], ring[i + 1])
      }
    }
  } else if (geometry.type === 'MultiPolygon') {
    if (geometry.coordinates.length > 1) {
      for (let i1 = 0; i1 < geometry.coordinates.length; i1++) {
        const ring = geometry.coordinates[i1][0]
        for (let i = 0; i < ring.length - 1; i++) {
          createMarker(ring[i] as any, ring[i + 1] as any)
        }
      }
    } else {
      const ring = (geometry.coordinates as any)[0][0]
      for (let i = 0; i < ring.length - 1; i++) {
        createMarker(ring[i] as any, ring[i + 1])
      }
    }
  }

  // После создания — сразу проверить «толкучку»
  if (!options.isCreate) {
    hideOverlappingMarkers(map, markers, collisionPx)
  }

  // Если dynamic=true, подписываемся на событие,
  // чтобы пересчитывать коллизии при каждом перемещении/зуме
  if (dynamic) {
    map.on('moveend', () => {
      hideOverlappingMarkers(map, markers, collisionPx)
    })
  }

  return markers
}

/**
 * Скрывает маркеры, которые слишком близко друг к другу (перекрываются)
 * на экране (в пикселях). collisionPx задаёт, насколько близко можно находиться
 * по осям x,y. Чем больше collisionPx, тем агрессивнее скрытие.
 *
 * Логику, какой именно маркер скрывать, можно менять:
 * - скрыть один из двух
 * - или показывать только первый
 * - или показывать тот, у которого больше расстояние
 * - и т.д.
 */
function hideOverlappingMarkers(map: Map, markers: Marker[], collisionPx: number): void {
  // Сначала показываем все (а потом скроем лишние)
  for (const m of markers) {
    m.getElement().style.display = ''
  }

  // Храним позиции маркеров в массиве
  const positions = markers.map((m) => {
    const { x, y } = map.project(m.getLngLat())
    const el = m.getElement() as HTMLDivElement
    // ширину/высоту берем из actual DOM
    const w = el.offsetWidth || 0
    const h = el.offsetHeight || 0

    return {
      marker: m,
      x,
      y,
      w,
      h
    }
  })

  // Простейший алгоритм O(n^2): сравнить каждую пару
  for (let i = 0; i < positions.length; i++) {
    const a = positions[i]
    for (let j = i + 1; j < positions.length; j++) {
      const b = positions[j]
      // Проверим, пересекаются ли bounding-box (с учётом w/ h)
      // Допустим, центр маркера = (x, y). Будем считать,
      // что box ~ [x - w/2, x + w/2] x [y - h/2, y + h/2]
      if (isOverlapping(a, b, collisionPx)) {
        // Здесь простая логика: скрыть "второй" маркер
        // Вы можете усложнить логику.
        b.marker.getElement().style.display = 'none'
      }
    }
  }
}

/** Проверяем, пересекаются ли два маркера (a, b) с учётом их размера и collisionPx. */
function isOverlapping(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  collisionPx: number
): boolean {
  // Полуширина и полувысота
  const aw = a.w / 2
  const ah = a.h / 2
  const bw = b.w / 2
  const bh = b.h / 2

  // Координаты для a
  const aLeft = a.x - aw - collisionPx
  const aRight = a.x + aw + collisionPx
  const aTop = a.y - ah - collisionPx
  const aBottom = a.y + ah + collisionPx

  // Координаты для b
  const bLeft = b.x - bw
  const bRight = b.x + bw
  const bTop = b.y - bh
  const bBottom = b.y + bh

  // Простой AABB overlap
  if (aLeft > bRight || aRight < bLeft) return false
  if (aTop > bBottom || aBottom < bTop) return false
  return true
}

/** Удаляем массив маркеров. */
export function removeEdgeDistances(markers: Marker[]): void {
  for (const m of markers) {
    m.remove()
  }
}
