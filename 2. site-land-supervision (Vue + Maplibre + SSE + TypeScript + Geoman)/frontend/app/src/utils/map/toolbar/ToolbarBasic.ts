// ----------------------------------------------------------------------------
// Вспомогательные функции
// ----------------------------------------------------------------------------
export function svgToDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ----------------------------------------------------------------------------
// Получить координаты на экране, чтобы отобразить блок input там, где кликнули
// ----------------------------------------------------------------------------
export function getScreenCoordsFromLngLat(lngLat: [number, number], map: any) {
  if (!map) return { x: 0, y: 0 }
  const point = map.project({ lng: lngLat[0], lat: lngLat[1] })
  return { x: point.x, y: point.y }
}

export function disableZoomControls(map: any) {
  map.scrollZoom.disable()
  map.doubleClickZoom.disable()
  map.boxZoom.disable()
  map.touchZoomRotate.disable()
}

export function enableZoomControls(map: any) {
  console.log('enableZoomControls')
  map.scrollZoom.enable()
  map.doubleClickZoom.enable()
  map.boxZoom.enable()
  map.touchZoomRotate.enable()
}
