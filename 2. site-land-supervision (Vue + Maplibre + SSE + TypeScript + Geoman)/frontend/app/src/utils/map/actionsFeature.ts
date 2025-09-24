import { vectorApi } from '@/api/admin.ts'

export async function ungroupFeature(clickedFeature: any) {

  if (clickedFeature && 'geometry' in clickedFeature) {
    try {
      await vectorApi.ungroupFeature(Number(clickedFeature.id))
    } catch (error) {
      console.error('Ошибка при разгруппировании объекта:', error)
      ;(window as any).$notify('Ошибка при разгруппировании объекта.', true)
    }
  } else {
    console.error('clickedFeature не соответствует maplibregl.MapGeoJSONFeature')
  }
}

export async function getFeatureCoordinates(feature: any) {
  if (feature.geometry.type === 'Polygon') {
    return feature.geometry.coordinates[0]
  } else if (feature.geometry.type === 'MultiPolygon') {
    return feature.geometry.coordinates.flat(2)
  } else {
    console.error('❌ Неподдерживаемый тип геометрии объекта:', feature.geometry.type)
    return []
  }
}
