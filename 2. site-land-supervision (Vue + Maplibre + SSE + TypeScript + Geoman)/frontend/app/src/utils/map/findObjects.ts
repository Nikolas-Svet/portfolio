import * as turf from '@turf/turf'
import store from '@/store'

let prevKeys = new Set()

export async function isPolygonIntersectingAnyObject(map: any, polygons: any) {
  if (!map) {
    console.warn('⚠️ Карта не инициализирована.')
    return []
  }
  if (!Array.isArray(polygons) || polygons.length === 0) {
    console.error('❌ Передан некорректный массив полигонов:', polygons)
    return []
  }

  const startTime = performance.now()

  // 1) Собираем слои для поиска
  // Вместо жёсткого «type === 'fill'» можно отбирать сразу несколько типов:
  const layerInfos = map.getStyle().layers
    .filter((l: any) =>
      l.id.startsWith('layer-vector-') &&
      (l.type === 'fill' || l.type === 'line' || l.type === 'circle' || l.type === 'symbol')
    )
    .map((l: any) => ({
      layerId: l.id,
      source: l.source,
      sourceLayer: l['source-layer'] || 'default'
    }))

  // const layerIds = layerInfos.map((li: any) => li.layerId)

  const layerIds = [`layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}`, `layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}-outline`, `layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}-circle`]

  // 2) Вычисляем общий bbox всех тайлов
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const poly of polygons) {
    const coords = poly.geometry?.coordinates?.[0]
    if (!coords || coords.length < 4) continue
    for (const [lng, lat] of coords) {
      minX = Math.min(minX, lng)
      maxX = Math.max(maxX, lng)
      minY = Math.min(minY, lat)
      maxY = Math.max(maxY, lat)
    }
  }
  if (minX === Infinity) {
    console.log(`[Intersect] нет полигонов, ${(performance.now() - startTime).toFixed(1)} ms`)
    return []
  }

  // 3) Один вызов queryRenderedFeatures по пиксельному bbox
  const sw = map.project([minX, minY])
  const ne = map.project([maxX, maxY])
  const hits = map.queryRenderedFeatures([[sw.x, sw.y], [ne.x, ne.y]], { layers: layerIds }) || []

  const turfPolys = polygons
    .filter(p => p.geometry?.type === 'Polygon')
    .map(p => turf.polygon([p.geometry.coordinates[0]]))

  // 5) Сборка списков для установки/сброса hover
  const newKeys = new Set()
  const toHover: any[] = []
  const toUnhover: any[] = []

  // Находим, кого включить
  for (const f of hits) {
    const featureId = f.id ?? f.properties?.id
    if (featureId == null) continue

    const layerId = f.layer.id
    const key = `${featureId}|${layerId}`
    if (newKeys.has(key)) continue

    const feat = turf.feature(f.geometry)
    for (const tp of turfPolys) {
      try {
        if (turf.booleanIntersects(feat, tp)) {
          newKeys.add(key)
          toHover.push({
            source: f.source,
            sourceLayer: f.sourceLayer,
            id: featureId
          })

          break
        }
      } catch (err) {
        console.error(`Ошибка пересечения ${featureId}:`, err)
      }
    }
  }

  // Находим, кого выключить
  prevKeys.forEach(key => {
    if (!newKeys.has(key)) {
      const [featureId, layerId] = (key as any).split('|')
      const info = layerInfos.find((li: any) => li.layerId === layerId)
      if (info) {
        toUnhover.push({
          source: info.source,
          sourceLayer: info.sourceLayer,
          id: featureId
        })
      }
    }
  })

  // 6) Применяем сразу все setFeatureState в одном кадре
  requestAnimationFrame(() => {
    for (const { source, sourceLayer, id } of toUnhover as any) {
      map.setFeatureState({ source, sourceLayer, id }, { hover: false })
    }
    for (const { source, sourceLayer, id } of toHover as any) {
      map.setFeatureState({ source, sourceLayer, id }, { hover: true })
    }
  })

  prevKeys = newKeys

  const duration = (performance.now() - startTime).toFixed(1)
  console.log(`[Intersect] завершено за ${duration} ms; toHover=${toHover.length}, toUnhover=${toUnhover.length}`)

  return Array.from(newKeys).map(key => {
    const [idObject, layerId] = (key as any).split('|')
    return { idObject, idLayer: 'source-' + layerId }
  })
}

let prevBBoxKeys = new Set<string>()

export function findObjectsInsideBBox(
  map: mapboxgl.Map,
  bbox: [number, number, number, number]
): { idObject: number | string; idLayer: string }[] {
  if (!map) {
    console.warn('⚠️ Карта не инициализирована.')
    return []
  }

  const start = performance.now()

  const [minX, minY, maxX, maxY] = bbox
  const bboxPoly = turf.bboxPolygon(bbox)

  const layerInfos = (map! as any).getStyle().layers.filter((l: any) =>
    l.id.startsWith('layer-vector-') &&
    (l.type === 'fill' || l.type === 'line' || l.type === 'circle' || l.type === 'symbol')
  )
    .map((l: any) => ({
      layerId: l.id,
      source: l.source,
      sourceLayer: l['source-layer'] || 'default'
    }))
  const layerIds = [`layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}`, `layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}-outline`, `layer-vector-${store.state.layersMain?.selectedLayerMainEdit.id}-circle`]

  const sw = map.project([minX, minY])
  const ne = map.project([maxX, maxY])
  const hits = map.queryRenderedFeatures(
    [[sw.x, sw.y], [ne.x, ne.y]],
    { layers: layerIds }
  ) || []

  const newKeys = new Set<string>()
  const toHover: Array<{ source: string, sourceLayer: string, id: string | number }> = []
  const toUnhover: Array<{ source: string, sourceLayer: string, id: string | number }> = []

  for (const f of hits) {
    const featureId = f.id ?? f.properties?.id
    if (featureId == null) continue

    const layerId = (f as any).layer.id
    const key = `${featureId}|${layerId}`
    if (newKeys.has(key)) continue

    // точная проверка через turf
    try {
      if (turf.booleanIntersects(turf.feature(f.geometry), bboxPoly)) {
        (newKeys as any).add(key)
        toHover.push({
          source: f.source as any,
          sourceLayer: f.sourceLayer as any,
          id: featureId
        })
      }
    } catch (err) {
      console.error(`Ошибка пересечения ${featureId} в ${layerId}:`, err)
    }
  }

  prevBBoxKeys.forEach(key => {
    if (!newKeys.has(key)) {
      const [featureId, layerId] = key.split('|')
      const info = layerInfos.find((li: any) => li.layerId === layerId)
      if (info) {
        toUnhover.push({
          source: info.source,
          sourceLayer: info.sourceLayer,
          id: isNaN(+featureId) ? featureId : +featureId
        })
      }
    }
  })

  requestAnimationFrame(() => {
    for (const { source, sourceLayer, id } of toUnhover) {
      map.setFeatureState({ source, sourceLayer, id }, { hover: false })
    }
    for (const { source, sourceLayer, id } of toHover) {
      map.setFeatureState({ source, sourceLayer, id }, { hover: true })
    }
  })

  prevBBoxKeys = newKeys

  const result = Array.from(newKeys).map(key => {
    const [idObject, layerId] = key.split('|')
    return { idObject: isNaN(+idObject) ? idObject : +idObject, idLayer: 'source-' + layerId }
  })

  console.log(
    `[BBox] выполнено за ${(performance.now() - start).toFixed(1)} ms; ` +
    `найдено ${toHover.length}`
  )

  return result
}
