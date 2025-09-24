import { IVectorApiLayer, IVectorLayer } from '@/types/layersVector'

export function layerToMapLayers(layer: IVectorApiLayer) {
  const mapLayer: IVectorLayer = {
    ...layer,
    visible: true,
    type: 'layer-vector',
    selected: false
  }

  return mapLayer
}
