import { Tool } from '@/modules/toolbar/tools/Tool.ts'
import { ITool } from '@/modules/toolbar/types/geoman.ts'
import { Feature } from 'geojson'
import maplibregl from 'maplibre-gl'
import { Geoman } from '@geoman-io/maplibre-geoman-free'
import { makeGmDrawBufferHandler } from '@/modules/toolbar/drawBuffer/utils/handlersDrawBuffer.ts'

type ITypeWidth = 'kilometers' | 'meters'

const errorMessage = 'Ошибка в инструменте рисования буфера'

export class DrawBufferTool extends Tool {
  private types = [
    {
      type: 'helper',
      name: 'snapping'
    },
    {
      type: 'draw',
      name: 'circle_marker',
      listeners: [{ event: 'gm:create', handler: makeGmDrawBufferHandler(this.map, this.geoman) }]
    }
  ] as ITool[]
  public width_buffer = 10
  public type_width = 'meters' as 'kilometers' | 'meters'
  public feat: Feature | null = null

  constructor(map: maplibregl.Map, geoman: Geoman | null, width_buffer: number, type_width: ITypeWidth) {
    super(map, geoman)
    this.width_buffer = width_buffer
    this.type_width = type_width
  }

  setGeom(f: Feature) {
    this.feat = f
  }

  activate() {
    try {
      if (this.geoman) {
        console.log('ACTIVATE')
        for (const t of this.types) {
          console.log(t)
          this.geoman.enableMode(t.type, t.name)

          if (t.listeners && t.listeners.length) {
            for (const { event, handler } of t.listeners) {
              this.map.on(event, handler)
            }
          }
        }
      }
    } catch (error: any) {
      console.error(errorMessage, error)
    }
  }

  deactivate() {
    try {
      if (this.geoman) {
        for (const t of this.types) {
          this.geoman.disableMode(t.type, t.name)

          if (t.listeners && t.listeners.length) {
            for (const { event, handler } of t.listeners) {
              this.map.off(event, handler)
            }
          }
        }
      }
    } catch (error) {
      console.error(errorMessage, error)
    }
  }

  public isActive(): boolean {
    return Boolean(this.geoman?.isModeEnabled(this.types[1].type, this.types[1].name))
  }
}

export default DrawBufferTool