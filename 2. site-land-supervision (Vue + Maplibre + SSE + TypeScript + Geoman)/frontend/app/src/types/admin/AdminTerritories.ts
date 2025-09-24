export interface Territory {
  id: number
  name: string
  geojson: any
  bbox_geojson?: any
}

export interface UpdatedTerritory {
  id: number
  name?: string
  geojson?: any
}