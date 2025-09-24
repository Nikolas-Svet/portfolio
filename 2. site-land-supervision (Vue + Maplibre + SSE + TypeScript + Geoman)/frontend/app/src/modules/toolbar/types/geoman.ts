export type IDrawTools = 'polygon' | 'circle_marker' | 'circle' | 'line'
export type IEditTools = 'cut'
export type IHelperTools = 'snapping'
export type IAllTools = IDrawTools | IEditTools | IHelperTools
export type ITypeTools = 'edit' | 'draw' | 'helper'

type MapEventHandler = (...args: any[]) => void

export interface ITool {
  name: IAllTools
  type: ITypeTools
  listeners?: IListener[]
}

interface IListener {
  event: string
  handler: MapEventHandler
}
