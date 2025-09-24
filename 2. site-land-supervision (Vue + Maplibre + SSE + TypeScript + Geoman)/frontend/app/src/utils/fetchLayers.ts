import { layersApi } from '@/api/layers.ts'
import { IRasterLayer, IVectorLayer } from '@/types/layersVector.ts'
import { Consts } from '@/consts/index.consts.ts'

export async function loadVectorLayers(filters: any): Promise<IVectorLayer[]> {
  try {
    const data = await layersApi.getVectorLayers(filters)
    console.log('[SSE]', data)
    return (data as any).map((layer: any) => ({
      id: layer.id,
      id_dict_types_data: layer.id_dict_types_data,
      name: layer.name,
      description: layer.description,
      name_file: layer.name_file,
      bbox_geojson: layer.bbox_geojson,
      created_date: layer.created_date,
      type: Consts.LayerTypes.VECTOR,
      delete: layer.delete,
      update: layer.update,
      add: layer.add
    }))
  } catch (error) {
    console.error('Ошибка загрузки векторных данных:', error)
    return []
  }
}

export async function loadRasterLayers(filters: any): Promise<IRasterLayer[]> {
  const data = await layersApi.getRasterLayers(filters)
  return data.map((layer: any) => ({
    id: layer.id,
    id_user: layer.id_user,
    id_dict_types_data: layer.id_dict_types_data,
    name: layer.name,
    description: layer.description,
    name_dir: layer.name_dir,
    created_date: layer.created_date,
    bbox_geojson: layer.bbox_geojson,
    type: Consts.LayerTypes.RASTER
  }))
}
