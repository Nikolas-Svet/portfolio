import { Feature } from 'geojson'

export type TActiveTool =
  | 'message'
  | 'geometry_polygon'
  | 'geometry_point'
  | 'geometry_line'
  | 'delete_point'
  | 'ruler'
  | 'highlight_polygon'
  | 'highlight_bbox'
  | 'cut'
  | 'delete'
  | 'change'
  | 'rotate'
  | null

export interface INotSavedGeoms {
  id_layer: number
  geoms: Feature[]
}