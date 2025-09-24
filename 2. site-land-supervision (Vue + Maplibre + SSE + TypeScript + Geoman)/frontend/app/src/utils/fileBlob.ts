export function createGeoJsonBlob(fc: GeoJSON.FeatureCollection): Blob {
  const json = JSON.stringify(fc)
  return new Blob([json], { type: 'application/json' })
}

export function combineFeatureCollections(
  fc1: GeoJSON.FeatureCollection,
  fc2: GeoJSON.FeatureCollection,
  fc3: any
): GeoJSON.FeatureCollection {
  console.log(fc1.features, fc2.features, fc3.features)
  return {
    type: 'FeatureCollection',
    features: [...fc1.features, ...fc2.features, ...fc3.features]
  }
}

export function removeProperties(obj: any) {
  if (obj.features && Array.isArray(obj.features)) {
    obj.features.forEach((feature: any) => {
      delete feature.properties
    })
  }
  return obj
}