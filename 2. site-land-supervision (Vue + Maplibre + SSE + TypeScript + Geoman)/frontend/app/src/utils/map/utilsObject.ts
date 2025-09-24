import { vectorApi } from '@/api/admin.ts'


export async function saveGeomObj(geom: any, id: number) {
  if (!id) {
    return
  }
  const geoJson: any = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: geom.geometry,
        properties: geom.properties || {},
        id: geom.properties?.id || undefined
      }
    ]
  }
  try {
    const response = await vectorApi.updateGeojson(geoJson, String(id))
    if (response.success) {
      ;(window as any).$notify('Объект обновлен', true)
    } else {
      ;(window as any).$notify('Ошибка при обновлении объекта', true)
      console.error('Ошибка при обновлении объекта.')
    }
  } catch (error) {
    console.error('Ошибка при сохранении изменений:', error)
    ;(window as any).$notify('Не удалось сохранить изменения.', true)
  }
}