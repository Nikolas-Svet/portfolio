import { Geoman } from '@geoman-io/maplibre-geoman-free'
import type maplibregl from 'maplibre-gl'

export abstract class Tool {
  protected map: maplibregl.Map
  protected geoman: Geoman | null

  abstract name: string
  abstract type: string

  constructor(map: maplibregl.Map, geoman: Geoman | null) {
    this.map = map
    this.geoman = geoman
  }

  abstract activate(): void

  abstract deactivate(): void
}
