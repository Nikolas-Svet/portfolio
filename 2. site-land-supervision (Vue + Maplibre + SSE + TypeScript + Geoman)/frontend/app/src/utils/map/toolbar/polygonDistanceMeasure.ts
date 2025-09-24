// polygonDistanceMeasure.ts

import { Marker } from 'maplibre-gl'
import { removeEdgeDistances } from './distanceUtils'

export interface PolygonMarkersState {
  activeMarkers: Marker[]
  closedMarkersMap: Record<string, Marker[]>
}

/**
 * Удаляет массив маркеров (упрощённая обёртка над removeEdgeDistances)
 */
export function clearMarkers(markers: Marker[]): void {
  removeEdgeDistances(markers)
}
