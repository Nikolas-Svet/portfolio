export interface ICoorSystem {
  id: number
  name: string
  description: null | string
  proj4text: string
}

export interface IDictType {
  id: number
  name: string
  description: string
  is_seeders: boolean
}

export interface IDictTypesFiles {
  id: number
  name: string
  description: string
}

export interface IDictTerritories {
  bbox_geojson: any,
  geojson: any,
  id: number,
  name: string
}
