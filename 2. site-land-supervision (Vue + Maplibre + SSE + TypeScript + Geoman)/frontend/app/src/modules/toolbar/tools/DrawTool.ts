// tools/DrawTool.ts
import { Tool } from './Tool'
import maplibregl from 'maplibre-gl'
import { Geoman } from '@geoman-io/maplibre-geoman-free'
import { IDrawTools, ITypeTools } from '@/modules/toolbar/types/geoman.ts'

const errorMessage = 'Ошибка в инструменте рисования'

type MapEventHandler = (...args: any[]) => void

interface IListener {
  event: string
  handler: MapEventHandler
}

export class DrawTool extends Tool {
  type = 'draw' as ITypeTools
  name: IDrawTools

  private listeners: Array<IListener> = []

  constructor(map: maplibregl.Map, geoman: Geoman | null, name: IDrawTools, listeners: Array<IListener> = []) {
    super(map, geoman)
    this.name = name
    this.listeners = listeners
  }

  activate() {
    try {
      console.log('enableMode', this.type, this.name)
      if (this.geoman) {
        this.geoman.enableMode(this.type, this.name)
        for (const { event, handler } of this.listeners) {
          this.map.on(event, handler)
        }
      }
    } catch (error) {
      console.error(errorMessage, error)
    }
  }

  deactivate() {
    try {
      console.log('disableMode', this.type, this.name)
      if (this.geoman) {
        this.geoman.disableMode(this.type, this.name)
        for (const { event, handler } of this.listeners) {
          this.map.off(event, handler)
        }
      }
    } catch (error) {
      console.error(errorMessage, error)
    }
  }

  public isActive(): boolean {
    return Boolean(this.geoman?.isModeEnabled(this.type, this.name))
  }
}