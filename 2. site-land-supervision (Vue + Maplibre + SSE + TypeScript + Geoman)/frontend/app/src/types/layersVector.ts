// types/layers.ts

export interface IVectorLayer extends IVectorApiLayer {
  group?: string
  visible: boolean
  selected?: boolean
  type: 'layer-vector'
  style?: {
    color: string
    opacity: number
    outlineColor: string
    outlineWidth: number
  }
}

export interface IVectorApiLayer {
  id: number
  id_dict_type_data?: null | number
  id_dict_types_data: number[]
  name: string
  description: null | string
  name_file: string
  id_crs?: number
  bbox_geojson: null | string
  created_date: string
  delete?: boolean
  update?: boolean
  add?: boolean
  is_edit?: boolean
  visible?: boolean
}

export interface IRasterLayer {
  id: number | string
  id_user?: number
  id_dict_type_data?: string
  id_dict_types_data?: number[]
  name: string
  id_crs?: number
  description?: string
  name_dir?: string
  bbox_geojson?: string
  created_date?: string
  group?: string
  visible?: boolean
  type: 'layer-raster'
  style?: {
    contrast: number
    opacity: number
  }
  update?: boolean
  add?: boolean
  delete?: boolean
}

export type Layer = IVectorLayer | IRasterLayer

export interface ILayersState {
  layers: Layer[]
  layerOrder: (string | number)[]
  forSubstractionLayers: Layer[]
  createdLayer?: Layer
}

export interface LayerOrderItem {
  id: number
  type: string
}

export interface ILayersStateMain {
  layersMain: Layer[]
  layerOrderMain: LayerOrderItem[]
  selectedLayerMain: IVectorLayer | IRasterLayer
  selectedLayerMainEdit: IVectorLayer | IRasterLayer
  new_geom_flag: boolean
  flyLayerMain: IVectorLayer | IRasterLayer | null
  editLayerMain: IVectorLayer | IRasterLayer
  newLayerFromTool: number[]
  coord: number[]
  hoverLayer: IVectorLayer | null
}

export interface Attribute {
  name: string
  value?: string
  type?: string
}

export interface ICloseAddVectorPopup {
  value: boolean
  cancel: boolean
  isFile: boolean
}
