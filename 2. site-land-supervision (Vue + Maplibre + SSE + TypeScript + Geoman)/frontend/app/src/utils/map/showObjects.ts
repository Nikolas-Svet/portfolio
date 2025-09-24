import store from '@/store'
import { Feature } from 'geojson'

export function showPolygons(map: maplibregl.Map, polygons: any[]) {
  console.log('CALL: Отображаем полигоны...')

  if (!map || typeof map.getLayer !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен.', map)
    return
  }

  if (!Array.isArray(polygons) || polygons.length === 0) {
    console.error('❌ Ошибка: передан некорректный массив полигонов.', polygons)
    return
  }

  console.log('📌 Отображение новых полигонов...')

  polygons.forEach((polygon, index) => {
    if (!polygon || !polygon.geometry || polygon.geometry.type !== 'Polygon') {
      console.error('❌ Ошибка: передан некорректный полигон.', polygon)
      return
    }

    const polygonId = `test-polygon-${index}` // Генерируем уникальный ID

    map.addSource(polygonId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [polygon]
      }
    })

    map.addLayer({
      id: polygonId,
      type: 'fill',
      source: polygonId,
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.5
      }
    })

    map.addLayer({
      id: `${polygonId}-outline`,
      type: 'line',
      source: polygonId,
      paint: {
        'line-color': '#000000',
        'line-width': 2
      }
    })
  })
}

export function showSinglePolygon(map: maplibregl.Map, polygon: any) {
  console.log('CALL')
  if (!map || typeof map.getLayer !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен.', map)
    return
  }

  if (!polygon || !polygon.geometry || polygon.geometry.type !== 'Polygon') {
    console.error('❌ Ошибка: передан некорректный полигон.', polygon)
    return
  }

  console.log('📌 Отображение нового полигона...')

  const polygonId = 'test-polygon'

  map.addSource(polygonId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [polygon]
    }
  })

  map.addLayer({
    id: polygonId,
    type: 'fill',
    source: polygonId,
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.5
    }
  })

  map.addLayer({
    id: `${polygonId}-outline`,
    type: 'line',
    source: polygonId,
    paint: {
      'line-color': '#000000',
      'line-width': 2
    }
  })
}

const addedLayerIds: string[] = []

export async function showAllLayers(map: maplibregl.Map, layersData: any) {
  if (!map || typeof map.addSource !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен.', map)
    return
  }

  // очищаем список перед новым добавлением (если нужно)
  addedLayerIds.length = 0

  layersData.forEach((layer: any) => {
    const idLayer = layer.id_layer

    if (Number(idLayer) === Number(store.state.layersMain?.selectedLayerMainEdit.id)) {
      return
    }

    // 1) Полигоны
    layer.featureCollection.forEach((feature: any, idx: number) => {
      const srcId = `layer-${idLayer}-polygon-${idx}`
      map.addSource(srcId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [feature] }
      })
      map.addLayer({
        id: srcId,
        type: 'fill',
        source: srcId,
        paint: { 'fill-color': '#afafaf', 'fill-opacity': 0.5 }
      })
      map.addLayer({
        id: `${srcId}-outline`,
        type: 'line',
        source: srcId,
        paint: { 'line-color': '#6c6c6c', 'line-width': 2 }
      })
      addedLayerIds.push(srcId, `${srcId}-outline`)
    })

    // 2) Линии
    layer.featureCollectionLine.forEach((feature: any, idx: number) => {
      const srcId = `layer-${idLayer}-line-${idx}`
      map.addSource(srcId, { type: 'geojson', data: feature })
      map.addLayer({
        id: srcId,
        type: 'line',
        source: srcId,
        paint: { 'line-color': '#6c6c6c', 'line-width': 3 }
      })
      addedLayerIds.push(srcId)
    })

    // 3) Точки
    layer.featureCollectionPoint.forEach((feature: any, idx: number) => {
      const srcId = `layer-${idLayer}-point-${idx}`
      map.addSource(srcId, { type: 'geojson', data: feature })
      map.addLayer({
        id: srcId,
        type: 'circle',
        source: srcId,
        paint: {
          'circle-radius': 4,
          'circle-color': '#ffffff',
          'circle-stroke-width': 4,
          'circle-stroke-color': '#6c6c6c'
        }
      })
      addedLayerIds.push(srcId)
    })
  })

  // навесили один раз (если уже навешено — проверку можно добавить)
  map.on('styledata', () => {
    for (const id of addedLayerIds) {
      if (map.getLayer(id)) {
        map.moveLayer(id)
      }
    }
  })
}

export async function showAllLayers2(map: maplibregl.Map, geoms: Feature[]) {
  if (!map || typeof map.addSource !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен.', map)
    return
  }

  addedLayerIds.length = 0

  geoms.forEach((feature) => {
    const geomType = feature.geometry.type
    const srcId = feature.id as string

    switch (geomType) {
      case 'Polygon':
      case 'MultiPolygon':
        map.addSource(srcId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [feature] }
        })
        map.addLayer({
          id: `${srcId}-fill`,
          type: 'fill',
          source: srcId,
          paint: { 'fill-color': '#afafaf', 'fill-opacity': 0.5 }
        })
        map.addLayer({
          id: `${srcId}-outline`,
          type: 'line',
          source: srcId,
          paint: { 'line-color': '#6c6c6c', 'line-width': 2 }
        })
        addedLayerIds.push(`${srcId}-fill`, `${srcId}-outline`)
        break

      case 'LineString':
      case 'MultiLineString':
        map.addSource(srcId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [feature] }
        })
        map.addLayer({
          id: srcId,
          type: 'line',
          source: srcId,
          paint: { 'line-color': '#6c6c6c', 'line-width': 3 }
        })
        addedLayerIds.push(srcId)
        break

      case 'Point':
      case 'MultiPoint':
        map.addSource(srcId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [feature] }
        })
        map.addLayer({
          id: srcId,
          type: 'circle',
          source: srcId,
          paint: {
            'circle-radius': 6,
            'circle-color': '#fff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#6c6c6c'
          }
        })
        addedLayerIds.push(srcId)
        break

      default:
        console.warn('Неизвестный geometry.type:', geomType)
    }
  })

  // При обновлении стиля — всегда перемещаем наши слои наверх
  map.on('styledata', () => {
    for (const id of addedLayerIds) {
      if (map.getLayer(id)) map.moveLayer(id)
    }
  })
}

/**
 * Удаляет слои и источники для переданных GeoJSON-фич, построенных по схеме showAllLayers2
 */
export async function removeAllLayers2(
  map: maplibregl.Map,
  geoms: Feature[]
) {
  if (!map || typeof map.removeSource !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен.', map)
    return
  }

  geoms.forEach((feature) => {
    const geomType = feature.geometry.type
    const srcId = feature.id as string

    // Для каждого типа геометрии строим список layerId, которые надо удалить
    const layerIds: string[] = []
    switch (geomType) {
      case 'Polygon':
      case 'MultiPolygon':
        // fill + outline
        layerIds.push(`${srcId}-fill`, `${srcId}-outline`)
        break

      case 'LineString':
      case 'MultiLineString':
        // single line layer
        layerIds.push(srcId)
        break

      case 'Point':
      case 'MultiPoint':
        // single circle layer
        layerIds.push(srcId)
        break

      default:
        console.warn('Неизвестный geometry.type при удалении:', geomType)
    }

    // сначала удаляем слои
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        try {
          map.removeLayer(layerId)
        } catch (e) {
          console.warn(`Не удалось удалить слой ${layerId}:`, e)
        }
      }
    })

    // затем удаляем источник
    if (map.getSource(srcId)) {
      try {
        map.removeSource(srcId)
      } catch (e) {
        console.warn(`Не удалось удалить источник ${srcId}:`, e)
      }
    }
  })
}


export async function removeAllLayers(map: any, layersData: any) {
  if (!map || typeof map.removeLayer !== 'function') {
    console.error('❌ Ошибка: переданный объект карты недействителен для удаления.', map)
    return
  }

  console.log('removeAllLayers')

  layersData.forEach((layer: any) => {
    const idLayer = layer.id_layer

    // Полигоны
    layer.featureCollection.forEach((_: any, idx: any) => {
      const srcId = `layer-${idLayer}-polygon-${idx}`
      const outlineId = `${srcId}-outline`
      if (map.getLayer(outlineId)) map.removeLayer(outlineId)
      if (map.getLayer(srcId)) map.removeLayer(srcId)
      if (map.getSource(srcId)) map.removeSource(srcId)
    })

    // Линии
    layer.featureCollectionLine.forEach((_: any, idx: any) => {
      const srcId = `layer-${idLayer}-line-${idx}`
      if (map.getLayer(srcId)) map.removeLayer(srcId)
      if (map.getSource(srcId)) map.removeSource(srcId)
    })

    // Точки
    layer.featureCollectionPoint.forEach((_: any, idx: any) => {
      const srcId = `layer-${idLayer}-point-${idx}`
      if (map.getLayer(srcId)) map.removeLayer(srcId)
      if (map.getSource(srcId)) map.removeSource(srcId)
    })
  })

  return
}

