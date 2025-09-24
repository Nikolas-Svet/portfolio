export interface CurrentDatasetsState {
  currentLayers: any[]
  selectedLayerId: number | null
  selectedFeatureId: number | null
  selectedLayerType: string | null
  selectedDatasetId: number | null
  layerOrder: any[]
  selectedDesktopName: string
  selectedDesktopDescription: string
}

export interface LayerStyle {
  color: string
  opacity: number
}

export interface DefaultStyleLayerState {
  defaultStylesLayers: Record<string, LayerStyle>
  previousRandomLayer: string | null
  remainingLayers: string[]
}

export interface INewSubstractionLayer {
  description: string
  name: string
  id_dict_type_data: number | null
  layers_id_1: number[]
  layers_id_2: number[]
}

export interface ISubstractionState {
  newLayer: INewSubstractionLayer
}

export interface IToolsStore {
  vector: boolean
  substraction: boolean
  ai: boolean
  forestArea: boolean
  artificialAi: boolean
  mergingVector: boolean
  filterVector: boolean
  filterPlace: boolean
  dragAndDrop: boolean
  place: {
    point_min: { lat: number; lon: number }
    point_max: { lat: number; lon: number }
    crop: boolean
  }
  toolGeom: any
}

export interface IEditObjects {
  objects: any[]
}
