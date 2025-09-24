import maplibregl from 'maplibre-gl'
import { Consts } from '@/consts/index.consts.ts'
import * as turf from '@turf/turf'

export const LayoutsMap: any = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': (Consts.GeometryStylesConsts as any).primary_color_hover || '#ff0000',
      'fill-opacity': 0.5
    }
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': (Consts.GeometryStylesConsts as any).primary_color || '#ff0000',
      'fill-opacity': (Consts.GeometryStylesConsts as any).primary_fill_opacity
    }
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': (Consts.GeometryStylesConsts as any).primary_circle_radius || 4,
      'circle-color': (Consts.GeometryStylesConsts as any).primary_color_2 || '#ff0000',
      'circle-stroke-width': (Consts.GeometryStylesConsts as any).primary_circle_stroke_width || 4,
      'circle-stroke-color': (Consts.GeometryStylesConsts as any).primary_color_hover
    }
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': (Consts.GeometryStylesConsts as any).primary_color || '#ff0000',
      'line-width': (Consts.GeometryStylesConsts as any).primary_line_width | 2
    }
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': (Consts.GeometryStylesConsts as any).primary_color || '#ff0000',
      'line-width': (Consts.GeometryStylesConsts as any).primary_line_width | 2
    }
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': (Consts.GeometryStylesConsts as any).primary_color || '#ff0000',
      'line-width': (Consts.GeometryStylesConsts as any).primary_line_width | 2
      // 'line-dasharray': ['literal', [2, 4]] // Исправление
    }
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['==', 'active', 'false']
    ],
    paint: {
      'circle-radius': (Consts.GeometryStylesConsts as any).primary_circle_radius || 4,
      'circle-color': (Consts.GeometryStylesConsts as any).primary_color_2 || '#ff0000',
      'circle-stroke-width': (Consts.GeometryStylesConsts as any).primary_circle_stroke_width || 4,
      'circle-stroke-color': (Consts.GeometryStylesConsts as any).primary_color_hover
    }
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['==', 'active', 'true']
    ],
    paint: {
      'circle-radius': (Consts.GeometryStylesConsts as any).primary_circle_radius || 4,
      'circle-color': (Consts.GeometryStylesConsts as any).primary_color_2 || '#ff0000'
    }
  }
]

const { VITE_API_URL } = import.meta.env

export async function getPolygonCoordinates(
  input: any
) {
  const geom: any =
    'geometry' in input
      ? (input as any).geometry
      : (input as any)

  if (geom.type === 'Polygon') {
    return [turf.polygon(geom.coordinates)]
  } else if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((coords: any) => turf.polygon(coords))
  } else {
    console.error('❌ Неподдерживаемый тип геометрии:', geom.type)
    return []
  }
}

export async function hideAndShowLayer(map: any, currentLayerId: any, layers: any) {
  console.log('actionsLayers.hideAndShowLayer')

  const sourceId = `source-${Consts.LayerTypes.VECTOR}-${currentLayerId}`
  const outlineLayerId = `${Consts.LayerTypes.VECTOR}-${currentLayerId}-outline`
  const circleLayerId = `${Consts.LayerTypes.VECTOR}-${currentLayerId}-circle`

  await forceRemoveLayerAndSource(map, sourceId)

  const layer = layers.find((layer: any) => layer.id === currentLayerId)

  if (!layer.visible) {
    console.log('Слой не отображен на карте')
    return
  }

  console.log(1)
  if (map!.getLayer(outlineLayerId)) {
    map!.removeLayer(outlineLayerId)
  }

  if (map!.getLayer(circleLayerId)) {
    map!.removeLayer(circleLayerId)
  }

  console.log(2)
  // ❗️ Удаляем основной слой
  if (map!.getLayer(currentLayerId)) {
    map!.removeLayer(currentLayerId)
  }

  console.log(3)
  // ❗️ Удаляем источник, если он есть
  if (map!.getSource(sourceId)) {
    map!.removeSource(sourceId)
  }

  if (currentLayerId !== null) {
    if (layer) {
      const style = { ...layer.style }
      const tileUrl = `${VITE_API_URL}${Consts.API_PREFIX}vector/get_tiles_pbf/${layer.id}/{z}/{x}/{y}/`

      // ✅ Сначала добавляем источник
      map!.addSource(sourceId, {
        type: 'vector',
        tiles: [tileUrl]
      })

      // ✅ Затем добавляем основной слой
      map!.addLayer({
        id: `${Consts.LayerTypes.VECTOR}-${currentLayerId}`,
        type: 'fill',
        source: sourceId,
        'source-layer': 'default',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#D68166', // цвет заливки при hover
            style.color || '#ffffff'
          ],
          'fill-opacity': style.opacity || 1
        }
      })

      map!.addLayer({
        id: circleLayerId,
        type: 'circle',
        source: sourceId,
        'source-layer': 'default',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4,
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#D68166',
            style!.color || '#ffffff'
          ],
          'circle-stroke-color': style!.outlineColor || '#C83202',
          'circle-stroke-width': style!.outlineWidth || 1
        }
      })

      // ✅ Добавляем слой окантовки
      map!.addLayer({
        id: outlineLayerId,
        type: 'line',
        source: sourceId,
        'source-layer': 'default',
        filter: ['in', '$type', 'LineString', 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#D68166',
            style!.outlineColor || '#ff0000'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            style!.outlineWidth * 1.4 || 3,
            style!.outlineWidth || 1
          ],
          'line-opacity': 1
        }
      })
    } else {
      console.error('Слой с указанным ID не найден.')
    }
  }
}

async function forceRemoveLayerAndSource(map: any, sourceId: string) {
  // 🔥 Получаем все слои, использующие этот source
  const layers = map.getStyle().layers.filter((layer: any) => layer.source === sourceId)

  // 🛑 Сначала удаляем все слои, использующие этот source
  layers.forEach((layer: any) => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
      console.log(`✅ Удалён слой: ${layer.id}`)
    }
  })

  // ✅ Теперь можно безопасно удалить источник
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
    console.log(`✅ Удалён источник: ${sourceId}`)
  }
}

export async function displayLayerGeometry(map: any, geometry: any, id: number) {
  if (!map) {
    console.error('❌ Ошибка: Карта не передана!')
    return false
  }

  const rawGeometry = Array.isArray(geometry) ? geometry : [geometry]

  if (!rawGeometry || rawGeometry.length === 0) {
    console.error('❌ Ошибка: Некорректная геометрия слоя!', rawGeometry)
    return false
  }

  let hasValidCoords = false
  let bounds: maplibregl.LngLatBounds | null = null

  rawGeometry.forEach((layer) => {
    if (
      !layer ||
      !layer.type ||
      !layer.coordinates ||
      !Array.isArray(layer.coordinates) ||
      layer.coordinates.length === 0
    ) {
      console.warn(`⚠️ Пропущен слой ${id} (некорректная геометрия)`)
      return false
    }

    const sourceId = `source-${Consts.LayerTypes.VECTOR}-${id}`
    const layerId = `${Consts.LayerTypes.VECTOR}-${id}`
    const outlineLayerId = `${Consts.LayerTypes.VECTOR}-${id}-outline`

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
    if (map.getLayer(outlineLayerId)) {
      map.removeLayer(outlineLayerId)
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: layer.type,
          coordinates: layer.coordinates
        }
      }
    })

    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#4A90E2',
        'fill-opacity': 0.5
      }
    })

    map.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#0056b3',
        'line-width': 2
      }
    })

    console.log(`✅ Слой ${id} добавлен на карту`)

    // 📌 Фильтруем только валидные координаты (должны быть массивом из двух чисел)
    const allCoords = layer.coordinates
      .flat(3)
      .filter(
        (coord: any) =>
          Array.isArray(coord) &&
          coord.length === 2 &&
          typeof coord[0] === 'number' &&
          typeof coord[1] === 'number'
      )

    if (allCoords.length > 0) {
      hasValidCoords = true
      if (!bounds) {
        bounds = new (maplibregl as any).LngLatBounds(allCoords[0], allCoords[0])
      }
      allCoords.forEach((coord: any) => bounds!.extend(coord))
    }
  })

  // 📌 Центрируем карту только если есть валидные координаты
  if (hasValidCoords && bounds && (bounds as any).isValid()) {
    map.fitBounds(bounds, { padding: 20 })
  } else {
    console.warn(
      '⚠️ Невозможно центрировать карту: геометрия пуста или содержит некорректные координаты'
    )
  }

  return true
}

export async function flyToLocation(map: any, coordinates: [number, number][]) {
  if (!map) {
    // console.error('Карта ещё не инициализирована.')
    return
  }

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
    console.error('Недостаточно координат для перемещения.', coordinates)
    return
  }

  try {
    const bounds = coordinates.reduce(
      (b: any, coord: any) => b.extend(coord),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
    )

    map.fitBounds(bounds, {
      padding: 30,
      duration: 1500,
      linear: true
    })
  } catch (error) {
    console.error('Ошибка в flyToLocation:', error)
  }
}

export function moveToPoint(map: any, coordinate: [number, number]) {
  if (!map) {
    // console.error('Карта ещё не инициализирована.')
    return
  }

  if (
    !coordinate ||
    !Array.isArray(coordinate) ||
    coordinate.length !== 2 ||
    typeof coordinate[0] !== 'number' ||
    typeof coordinate[1] !== 'number'
  ) {
    console.error('Неверный формат координат для перемещения:', coordinate)
    return
  }

  try {
    map.flyTo({
      center: coordinate,
      essential: true
    })
  } catch (error) {
    console.error('Ошибка в moveToPoint:', error)
  }
}

export function removeVertexFromFeature(draw: any, vertexFeature: any) {
  const selectedIds = draw!.getSelectedIds()
  if (!selectedIds.length) {
    console.warn('Нет выбранной фичи в режиме direct_select. Отмена удаления вершины.')
    return
  }

  const oldId = selectedIds[0]
  const drawFeature = draw!.get(oldId)
  if (!drawFeature) {
    console.warn(`Фича с ID='${oldId}' не найдена в Draw. Отмена удаления вершины.`)
    return
  }

  const coordPath = vertexFeature.properties.coord_path
  if (!coordPath) {
    console.warn('Нет coord_path в vertexFeature, не можем удалить вершину.')
    return
  }
  const pathIndices = coordPath.split('.').map((str: string) => parseInt(str, 10))

  const geometry = drawFeature.geometry
  if (!geometry || !('coordinates' in geometry)) {
    console.error('Геометрия не содержит coordinates.')
    return
  }

  const { type, coordinates } = geometry as {
    type: 'Polygon' | 'LineString'
    coordinates: any[]
  }

  if (type === 'Polygon') {
    const ringIndex = pathIndices[0]
    const vertexIndex = pathIndices[1]

    if (coordinates[ringIndex] && coordinates[ringIndex][vertexIndex]) {
      coordinates[ringIndex].splice(vertexIndex, 1)
    } else {
      console.warn('Не найдена такая вершина в polygon, пропускаем splice.')
    }

    if (ringIndex === 0 && coordinates[ringIndex].length > 2) {
      const first = coordinates[ringIndex][0]
      const last = coordinates[ringIndex][coordinates[ringIndex].length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordinates[ringIndex].push([...first])
      }
    }
  } else if (type === 'LineString') {
    const index = pathIndices[0]
    if (coordinates[index]) {
      coordinates.splice(index, 1)
    } else {
      console.warn('Не найдена такая вершина в lineString, пропускаем splice.')
    }
  } else {
    console.warn(`Тип '${type}' не поддерживается для удаления вершины.`)
    return
  }

  const newGeometry = { ...geometry, coordinates }

  draw!.delete([oldId.toString()])

  const newId = draw!.add({
    ...drawFeature,
    geometry: newGeometry
  })

  draw!.changeMode('simple_select', { featureIds: [newId.toString()] })
}

