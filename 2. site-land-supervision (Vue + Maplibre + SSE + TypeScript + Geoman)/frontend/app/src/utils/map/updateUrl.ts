export function updateURL(router: any, lng: number, lat: number, zoom: number) {
  if (!router) {
    console.error('Router не передан')
    return
  }

  router
    .replace({
      query: {
        ll: `${lng.toFixed(6)},${lat.toFixed(6)}`,
        z: zoom.toFixed(2)
      }
    })
    .catch((err: Error) => console.error('Ошибка при обновлении URL:', err))
}
