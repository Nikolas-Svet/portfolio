<template>
  <div id="map" ref="mapContainer" class="map-container">
    <InfoBoxMain :opened-id-layer="Number(hoverLayerId?.split('-')[3]) ? Number(hoverLayerId?.split('-')[3]) : 0"
                 :opened-id-object="openedIdObject ? openedIdObject : 0"
                 :map="map as any" @closeInfoBox="closeInfoBox" />

    <MapLayouts :map="map as any" @update:updateMapLayers="updateMapLayers()" />

    <div v-if="contextMenuVisible" :style="contextMenuStyle" class="context-menu" @click.stop>
      <ul>
        <li class="coord" @click="copyCoordinates">{{ copyCursorLng }} {{ copyCursorLat }}</li>
        <div
          v-if="isEditLayer(Number(selectedLayerMainEdit.id) || Number(currentLayerId.split('-')[2])) && selectedLayerMainEdit.id">
          <li v-if="!selectObjectsFlag && !emptyContextMenu" @click="actionsFeature('edit')">
            Редактировать объект
          </li>
          <li v-if="!selectObjectsFlag && !emptyContextMenu" @click="actionsFeature('ungroup')">
            Разгруппировать объект
          </li>
          <li v-if="!selectObjectsFlag && !emptyContextMenu"
              @click="selectObjects = [{idObject: Number((clickedFeature as any).id), idLayer: (clickedFeature as any).source}]; actionsFeature('delete')">
            Удалить объект
          </li>
          <li v-if="selectObjectsFlag && !emptyContextMenu" @click="actionsFeature('cancel')">
            Отменить выделение
          </li>
          <li v-if="selectObjectsFlag && !emptyContextMenu" @click="actionsFeature('delete')">
            Удалить объекты
          </li>
        </div>
        <li v-if="!selectObjectsFlag && !emptyContextMenu"
            @click="selectObjects = [{idObject: Number((clickedFeature as any).id), idLayer: (clickedFeature as any).source}]; actionsFeature('square')">
          Площадь объекта
        </li>
        <li v-if="selectObjectsFlag && !emptyContextMenu" @click="actionsFeature('square')">
          Площадь объектов
        </li>
      </ul>
    </div>
    <div v-if="flagLoader" class="map__loader">
      <AppLoader :text="textLoader" styles="absolute" />
    </div>
  </div>

  <CoordSwitch :cursorLat="cursorLat as any" :cursorLng="cursorLng as any" :map="map as any"
               @update:coords="onCoordsUpdate" />
  <measurement-switcher v-if="$route.path === '/'" />
  <ToolbarMain
    v-if="$route.path === '/'"
    :class="{showToolbarMain: selectedLayerMainEdit.id, hideToolbarMain: !selectedLayerMainEdit.id}"
    :geoman="geoman"
    :map="map"
    @draw-bbox="draw_selector_bbox" />
  <ToolModal @update:addVectorFlag="closeVectorToolPopup" @draw-place="draw_place" />
</template>

<script lang="ts">
import { initializeMap } from '@/assets/scripts/mapLibre/mapUtils'
import { mapGetters } from 'vuex'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'
import { IRasterLayer, IVectorLayer, Layer } from '@/types/layersVector'
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Position } from 'geojson'
import MeasurementSwitcher from '@/components/app/map/measurementSwitcher.vue'
import AppPopup from '../ui/AppPopup.vue'
import LayerAttributesPopup from './map/LayerAttributesPopup.vue'
import { layersMainActions } from '@/store/actions/layersMain'
import store from '@/store'
import { layerCreationActions } from '@/store/actions/layerCreation'
import { toolsStoreActions } from '@/store/actions/tools'
import { vectorApi } from '@/api/admin.ts'
import { artificialAiActions } from '@/store/actions/artificial_ai.ts'
import { configActions } from '@/store/actions/config.ts'

// Utils
import { updateURL } from '@/utils/map/updateUrl'
import { findObjectsInsideBBox } from '@/utils/map/findObjects'
import { ungroupFeature } from '@/utils/map/actionsFeature'
import { flyToLocation, hideAndShowLayer, LayoutsMap, moveToPoint } from '@/utils/map/actionsLayers.ts'
import { addCircle, addMapLayer, addOutline, removeLayerIfExists } from '@/utils/utils.mapLibre'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete.ts'
import { Consts } from '@/consts/index.consts.ts'

interface MapGeoJSONFeature extends Feature<Geometry, GeoJsonProperties> {
  layer: any
  source: string
  sourceLayer: string
  state: { [key: string]: any }
}

export default defineComponent({
  name: 'MapMain',
  data() {
    return {
      hoverLayerOld: null as any,
      convertedCoords: { lng: 0, lat: 0 } as any,
      flagLoader: false as boolean,
      textLoader: '' as string,
      prevRectSize: { width: 0, height: 0 },
      selectObjectsKeyboard: false as boolean,
      sourceSearch: [] as string[],
      highlightObjectsModeBbox: false,
      currentHighlightsObjectBbox: [] as Array<{ idObject: number; idLayer: string }>,
      cursorLng: null as number | null,
      cursorLat: null as number | null,
      copyCursorLng: null as string | null,
      copyCursorLat: null as string | null,
      emptyContextMenu: false,
      selectObjectsFlag: false,
      selectObjects: [] as Array<{ idObject: number; idLayer: string }>,
      hoverObjId: null as number | null,
      hoverLayerId: null as string | null,
      map: undefined as maplibregl.Map | undefined,
      geoman: null as any,
      layers: [] as any[],
      currentTerritoryId: null as string | null,
      draw: undefined as MapboxDraw | undefined,
      mapLoadHandler: null as (() => void) | null,
      geojson: null as FeatureCollection | Feature | null,
      rectanglePoints: [] as any[],
      currentLayerId: '' as any,
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      clickedFeature: null as maplibregl.MapGeoJSONFeature | null,
      showEditFields: false,
      openedIdObject: null as number | null,
      objectLayers: [] as string[]
    }
  },
  inject: ['API_URL'],
  mounted() {
    document.addEventListener('keydown', this.handleEscape)
    document.addEventListener('keyup', this.handleEscapeUp)
    nextTick(() => {
      this.initializeMap()
    })
  },
  beforeUnmount() {
    store.commit(`layerCreation/${layerCreationActions.clearNewLayerData}`)
    document.removeEventListener('keydown', this.handleEscape)
    if (this.map) {
      if (this.mapLoadHandler) {
        this.map.off('load', this.mapLoadHandler)
      }
      this.map.remove()
      this.map = undefined
    }
  },
  methods: {
    isEditLayer,
    hideAndShowLayer,
    ungroupFeature,

    onCoordsUpdate(coords: { lng: string; lat: string }) {
      this.convertedCoords = coords
    },

    closeVectorToolPopup() {
      store.commit(toolsStoreActions.setDragAndDrop, false)
      store.commit(toolsStoreActions.showAddVector, false)
    },

    removeCreatedLayers() {
      this.sourceSearch.forEach((sourceId: any) => {
        if (this.map!.getLayer(sourceId)) {
          this.map!.removeLayer(sourceId)
        }
        if (this.map!.getSource(sourceId)) {
          this.map!.removeSource(sourceId)
        }
      })
      this.sourceSearch = []
    },

    handleEscape(event: KeyboardEvent) {
      if ((event.key === 'Meta' || event.key === 'Control') && !this.currentTool) {
        this.selectObjectsKeyboard = true
        this.selectObjectsFlag = true
        this.contextMenuVisible = false
        this.selectObjects = []
      }
      if (event.key)
        if (event.key === 'Escape' && this.highlightObjectsModeBbox) {
          store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
          this.closeBbox()
        }
    },

    handleEscapeUp(event: KeyboardEvent) {
      if (event.key === 'Meta' || event.key === 'Control') {
        this.selectObjectsKeyboard = false
        this.hoverLayerId = ''
        this.hoverObjId = 0
      }
    },

    updateCursorCoords(e: maplibregl.MapMouseEvent) {
      if (!this.map) return

      this.cursorLng = e.lngLat.lng
      this.cursorLat = e.lngLat.lat
    },

    handleMapMove() {
      if (!this.map) {
        console.warn('handleMapMove вызван, но this.map не инициализирован')
        return
      }

      const center = this.map.getCenter()
      const zoom = this.map.getZoom()

      updateURL(this.$router, center.lng, center.lat, zoom)
    },

    async actionsFeature(type: string) {
      switch (type) {
        case 'cancel':
          break
        case 'delete':
          try {
            this.contextMenuVisible = false
            const layersToRedraw = new Set()
            this.flagLoader = true
            this.textLoader = 'Удаление объектов'
            for (const obj of this.selectObjects) {
              try {
                const response = await vectorApi.deleteFeature(Number(obj.idObject))

                if (response.success) {
                  layersToRedraw.add(obj.idLayer)

                  if (Number(obj.idLayer.split('-')[3])) {
                    await store.dispatch(configActions.SET_UPDATE_LAYER, Number(obj.idLayer.split('-')[3]))
                  }
                } else {
                  console.error('Ошибка при удалении объекта.')
                  ;(window as any).$notify('Не удалось удалить объект.', true)
                }
              } catch (error) {
                console.error('Ошибка при удалении объекта:', error)
                ;(window as any).$notify('Ошибка при удалении объекта.', true)
              }
            }
          } catch (error) {
            ;(window as any).$notify('Ошибка при удалении объекта.', true)
          }
          break
        case 'edit':
          try {
            if (!this.clickedFeature) {
              console.error('Нет выбранного объекта для редактирования.')
              return
            }
            this.contextMenuVisible = false
            const externalId = this.clickedFeature.properties?.id
            if (!externalId) {
              console.error('ID объекта не найден в feature.properties:', this.clickedFeature)
              return
            }
            this.map.fire('gm:loaded', { currentId: externalId })
          } catch (error) {
            ;(window as any).$notify('Ошибка при редактировании объекта.', true)
          }
          break
        case 'ungroup':
          try {
            await this.ungroupFeature(this.clickedFeature)
          } catch (error) {
            ;(window as any).$notify('Ошибка при разгруппировки объекта.', true)
          }
          break
        case 'square':
          try {
            const ids = this.selectObjects.map((obj: any) => Number(obj.idObject))
            const response = await vectorApi.squareFeature(ids)

            if (!response) {
              (window as any).$notify('Не удалось получить площадь объекта.', true)
            }

            const data = [
              {
                name: this.selectObjects.length > 1 ? 'Площадь объектов' : 'Площадь объекта',
                value: `${store.getters['measurement/convert'](response * 10000).toFixed(3)} ${store.getters['measurement/selectedUnit'].name.toLowerCase()}`
              }
            ]
            await store.dispatch('infoBox/SET_DATA_INFO', data)
          } catch (error) {
            ;(window as any).$notify('Ошибка при получении площади объекта.', true)
          }
          break
      }
      this.currentLayerId = ''
      this.clickedFeature = null
      this.hideSelectObjects()
      this.flagLoader = false
      this.textLoader = ''
    },

    hideSelectObjects() {
      this.selectObjects.forEach((obj: any) => {
        this.map!.setFeatureState(
          {
            source: obj.idLayer,
            sourceLayer: 'default',
            id: String(obj.idObject)
          },
          { hover: false }
        )
      })

      this.contextMenuVisible = false
      this.selectObjects = []
      this.selectObjectsFlag = false
    },

    deleteAllDrawLayers() {
      const allDrawFeatures = this.draw!.getAll()

      allDrawFeatures.features.forEach((existingFeature: any) => {
        this.draw!.delete(existingFeature.id)
      })
    },

    async closeBbox() {
      this.selectObjects = this.currentHighlightsObjectBbox
      this.hideSelectObjects()
      if (this.highlightObjectsModeBbox) {
        await store.dispatch('toolbar/SET_ACTIVE_CURSOR', Consts.activeCursors.move_default)
      }
      this.map!.off('mousemove', this.previewRectangle)
      this.map!.off('click', this.addRectanglePoint)
      this.map!.off('custom_bbox_draw_update', this.onRectangleDrawRender)
      this.highlightObjectsModeBbox = false
      this.rectanglePoints = []
      this.currentHighlightsObjectBbox = []
      if (this.map!.hasImage('rect-preview')) {
        this.map!.removeImage('rect-preview')
      }

      if (this.map!.getLayer('rect-layer')) {
        this.map!.removeLayer('rect-layer')
      }
      if (this.map!.getSource('rect-src')) {
        this.map!.removeSource('rect-src')
      }

      if (this.draw) {
        this.draw.deleteAll()
        this.draw.changeMode('simple_select')
      }
    },

    draw_place() {
      store.commit(toolsStoreActions.showArtificialAi, false)
      this.enableRectangleDraw()
    },

    draw_selector_bbox() {
      this.highlightObjectsModeBbox = true
      this.enableRectangleDraw()
    },

    enableRectangleDraw() {
      if (!this.draw) {
        console.error('Инструмент рисования не инициализирован.')
        return
      }

      store.dispatch('toolbar/SET_ACTIVE_CURSOR', Consts.activeCursors.crosshair)

      this.rectanglePoints = []
      this.map!.on('mousemove', this.previewRectangle)
      this.map!.on('click', this.addRectanglePoint)
      if (this.highlightObjectsModeBbox) {
        this.map!.on('custom_bbox_draw_update', this.onRectangleDrawRender)
      }
    },

    onRectangleDrawRender(e: any) {
      if (!e || !e.bbox) return
      this.currentHighlightsObjectBbox = findObjectsInsideBBox(this.map! as any, e.bbox) as any
    },

    previewRectangle(event: maplibregl.MapMouseEvent) {
      if (this.rectanglePoints.length !== 1) {
        return
      }

      const [lng0, lat0] = this.rectanglePoints[0] as [number, number]
      const [lng1, lat1] = [event.lngLat.lng, event.lngLat.lat] as [number, number]

      const west = Math.min(lng0, lng1)
      const east = Math.max(lng0, lng1)
      const south = Math.min(lat0, lat1)
      const north = Math.max(lat0, lat1)

      const pNW = this.map!.project({ lng: west, lat: north })
      const pSE = this.map!.project({ lng: east, lat: south })

      const w = Math.abs(pSE.x - pNW.x) | 0
      const h = Math.abs(pSE.y - pNW.y) | 0

      if (w === 0 || h === 0) {
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'rgba(214,129,102,0.3)'
      ctx.fillRect(0, 0, w, h)
      const imgData = ctx.getImageData(0, 0, w, h)

      const imgId = 'rect-preview'
      if (this.map!.hasImage(imgId)) {
        if (
          this.prevRectSize &&
          w === this.prevRectSize.width &&
          h === this.prevRectSize.height
        ) {
          this.map!.updateImage(imgId, imgData)
        } else {
          this.map!.removeImage(imgId)
          this.map!.addImage(imgId, imgData)
          this.prevRectSize = { width: w, height: h }
        }
      } else {
        this.map!.addImage(imgId, imgData)
        this.prevRectSize = { width: w, height: h }
      }

      const srcData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [west, north] }
          }
        ]
      }

      if (!this.map!.getSource('rect-src')) {
        this.map!.addSource('rect-src', {
          type: 'geojson',
          data: srcData as any
        })

        this.map!.addLayer({
          id: 'rect-layer',
          type: 'symbol',
          source: 'rect-src',
          layout: {
            'icon-image': imgId,
            'icon-anchor': 'top-left',
            'icon-rotation-alignment': 'viewport',
            'icon-pitch-alignment': 'viewport',
            'icon-allow-overlap': true
          }
        })
      } else {
        (this.map!.getSource('rect-src') as maplibregl.GeoJSONSource).setData(
          srcData as any
        )
      }

      const bbox: [number, number, number, number] = [west, south, east, north]
      this.map!.fire('custom_bbox_draw_update', { bbox })

      this.map!.triggerRepaint()
    },

    addRectanglePoint(event: maplibregl.MapMouseEvent) {
      if (!this.rectanglePoints) this.rectanglePoints = []

      this.rectanglePoints.push([event.lngLat.lng, event.lngLat.lat])

      if (this.rectanglePoints.length === 2) {
        this.map!.off('mousemove', this.previewRectangle)

        const bbox = [
          Math.min(this.rectanglePoints[0][0], this.rectanglePoints[1][0]),
          Math.min(this.rectanglePoints[0][1], this.rectanglePoints[1][1]),
          Math.max(this.rectanglePoints[0][0], this.rectanglePoints[1][0]),
          Math.max(this.rectanglePoints[0][1], this.rectanglePoints[1][1])
        ]

        if (this.map!.getLayer('rect-layer')) {
          this.map!.removeLayer('rect-layer')
        }
        if (this.map!.getSource('rect-src')) {
          this.map!.removeSource('rect-src')
        }
        if (this.map!.hasImage('rect-preview')) {
          this.map!.removeImage('rect-preview')
        }

        const points = {
          point_min: {
            lat: bbox[3],
            lon: bbox[0]
          },
          point_max: {
            lat: bbox[1],
            lon: bbox[2]
          }
        }

        this.map!.fire('custom_bbox_draw_update', { bbox })

        store.dispatch('toolbar/SET_ACTIVE_CURSOR', Consts.activeCursors.move_default)

        if (!this.highlightObjectsModeBbox) {
          if (store.getters.filterPlace) {
            store.commit(toolsStoreActions.setFilterPlace, points)
            this.rectanglePoints = []
            this.map!.off('click', this.addRectanglePoint)
            store.commit(toolsStoreActions.showFilterPlaceFlag, false)
            return
          }

          this.rectanglePoints = []
          this.map!.off('click', this.addRectanglePoint)
          store.dispatch(`artificial_ai/${artificialAiActions.SET_PLACE}`, points)
          store.commit(toolsStoreActions.showArtificialAi, true)
        } else {
          store.dispatch('toolbar/ADD_ACTIVE_TOOL', null)
          this.highlightObjectsModeBbox = false
          this.rectanglePoints = []
          this.map!.off('click', this.addRectanglePoint)
          this.selectObjects = this.currentHighlightsObjectBbox
          this.selectObjectsFlag = true
          this.deleteAllDrawLayers()
        }
      }
    },

    copyCoordinates() {
      const str = `${this.copyCursorLng}, ${this.copyCursorLat}`
      navigator.clipboard.writeText(str)
      this.contextMenuVisible = false
    },

    handleDocumentClick(event: MouseEvent) {
      const contextMenu = document.querySelector('.context-menu') as HTMLElement | null
      if (contextMenu && !contextMenu.contains(event.target as Node)) {
        this.contextMenuVisible = false
      }
    },

    showTerritory(geojson: FeatureCollection | Feature) {
      if (!this.draw || !this.map) {
        console.error('Карта или MapboxDraw ещё не загружены')
        return
      }

      if (this.currentTerritoryId) {
        this.draw.delete(this.currentTerritoryId)
      }

      const addedFeatures = this.draw.add(geojson)
      if (addedFeatures.length > 0) {
        this.currentTerritoryId = addedFeatures[0]
        const feature = this.draw.get(this.currentTerritoryId)
        if (!feature) {
          console.error('Feature not found')
          return
        }
        const bbox = turf.bbox(feature)
        const bounds = new maplibregl.LngLatBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]])
        this.map.fitBounds(bounds, { padding: 20 })
      }
    },

    enableEditing() {
      if (this.currentTerritoryId && this.draw) {
        this.draw.changeMode('direct_select', {
          featureId: this.currentTerritoryId
        })
      }
    },

    getEditedGeometry() {
      if (this.currentTerritoryId && this.draw) {
        const feature = this.draw.get(this.currentTerritoryId)
        return feature
      }
      return null
    },

    addGeoJSONLayer(geojsonData: FeatureCollection | Feature) {
      if (this.map && geojsonData) {
        const randomStyle = this.getRandomLayerStyle

        if (this.map.getSource('geojson-layer')) {
          const source = this.map.getSource('geojson-layer') as maplibregl.GeoJSONSource
          source.setData(geojsonData)
        } else {
          this.map.addSource('geojson-layer', {
            type: 'geojson',
            data: geojsonData
          })

          this.map.addLayer({
            id: 'geojson-layer',
            type: 'fill',
            filter: ['==', '$type', 'Polygon'],
            source: 'geojson-layer',
            paint: {
              'fill-color': randomStyle.color,
              'fill-opacity': randomStyle.opacity
            }
          })
        }

        const bounds = new maplibregl.LngLatBounds()
        const features = (geojsonData as FeatureCollection).features || [geojsonData as Feature]
        features.forEach((feature: Feature) => {
          const geometry = feature.geometry
          if (geometry.type === 'Polygon') {
            ;(geometry.coordinates as Position[][])[0].forEach((coord: Position) => {
              if (coord.length >= 2) {
                bounds.extend([coord[0], coord[1]] as [number, number])
              }
            })
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: Position[][]) => {
              polygon[0].forEach((coord: Position) => {
                if (coord.length >= 2) {
                  bounds.extend([coord[0], coord[1]] as [number, number])
                }
              })
            })
          }
        })

        this.map.fitBounds(bounds, {
          padding: 20,
          maxZoom: 12,
          duration: 2000
        })
      } else {
        console.error('Карта не инициализирована или данные GeoJSON отсутствуют')
      }
    },

    initializeMap() {
      if (this.map) return

      if (!this.$refs.mapContainer) {
        console.error('mapContainer не найден')
        return
      }

      const query = this.$route.query
      let lng = 86.1081
      let lat = 55.3449
      let zoom = 11

      if (query.ll) {

        const llValue = Array.isArray(query.ll) ? query.ll[0] : query.ll
        const [lngQuery, latQuery] = (llValue || '').split(',').map(Number)
        if (!isNaN(lngQuery) && !isNaN(latQuery)) {
          lng = lngQuery
          lat = latQuery
        }
      }

      if (query.z) {
        const zoomQuery = Number(query.z)
        if (!isNaN(zoomQuery)) {
          zoom = zoomQuery
        }
      }

      const [m, g] = initializeMap(this.$refs.mapContainer as HTMLElement, lng, lat, zoom) as any
      this.map = m
      this.geoman = g


      this.mapLoadHandler = async () => {
        if (!this.map) return

        this.map.addControl(
          new maplibregl.NavigationControl({
            visualizePitch: false,
            showZoom: false,
            showCompass: true
          })
        )

        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          styles: LayoutsMap
        })

        this.map.on('draw.update', this.updateInstrumentGeoJSON)
        this.map.on('draw.modechange', this.ensureDrawingLayersOnTop)
        this.map?.on('mousemove', this.updateCursorCoords)
        this.map!.addControl(this.draw as any)

        if (this.geojson) {
          await nextTick()
          this.showTerritory(this.geojson)
        }
      }

      this.map!.on('click', this.handleMapClick)

      this.map!.on('load', () => {
        this.updateMapLayers()
        if (this.mapLoadHandler) this.mapLoadHandler()

        this.map!.jumpTo({ center: [lng, lat], zoom })

        this.map!.on('moveend', this.handleMapMove)
      })

      this.map!.on('contextmenu', async (e: maplibregl.MapMouseEvent) => {

        const allLayers = this.map!.getStyle().layers || []

        if (this.selectedLayerMainEdit.id) {
          const objectLayersGm = allLayers
            .filter((layer: any) => layer.id.startsWith('gm'))
            .map((layer: any) => layer.id)

          const featuresGm = this.map!.queryRenderedFeatures(e.point, { layers: objectLayersGm })

          if (featuresGm.length > 0) {
            return
          }
        }

        const objectLayers = allLayers
          .filter((layer: any) => layer.id.startsWith('layer-vector-'))
          .map((layer: any) => layer.id)

        const features = this.map!.queryRenderedFeatures(e.point, { layers: objectLayers })

        this.emptyContextMenu = false

        this.copyCursorLng = this.convertedCoords.lng
        this.copyCursorLat = this.convertedCoords.lat

        this.closeInfoBox()
        e.preventDefault()

        this.contextMenuVisible = false

        if (objectLayers.length === 0) {
          const { clientX, clientY } = e.originalEvent
          this.contextMenuX = clientX
          this.contextMenuY = clientY - 220
          this.emptyContextMenu = true
          this.contextMenuVisible = true
          console.warn('Не найдено слоев с объектами для редактирования.')
          return
        }

        if (this.selectObjectsFlag) {
          const { clientX, clientY } = e.originalEvent
          this.contextMenuX = clientX
          this.contextMenuY = clientY - 220
          this.contextMenuVisible = true
          return
        }

        if (features.length === 0) {
          const { clientX, clientY } = e.originalEvent
          this.contextMenuX = clientX
          this.contextMenuY = clientY - 220
          this.emptyContextMenu = true
          this.contextMenuVisible = true
          return
        }

        const feature = features[0]

        this.clickedFeature = feature as any
        this.currentLayerId = feature.layer.id

        const { clientX, clientY } = e.originalEvent
        this.contextMenuX = clientX
        this.contextMenuY = clientY - 220
        this.contextMenuVisible = true
      })

      document.addEventListener('click', this.handleDocumentClick)
    },

    ensureDrawingLayersOnTop() {
      if (!this.map) return

      const drawingLayers = [
        'gl-draw-polygon-fill-active',
        'gl-draw-line-active',
        'gl-draw-polygon-fill-inactive',
        'gl-draw-line-inactive'
      ]

      drawingLayers.forEach((layerId) => {
        if (this.map!.getLayer(layerId)) {
          this.map!.moveLayer(layerId)
        }
      })
    },

    async handleMapClick(e: maplibregl.MapMouseEvent) {
      if (this.geoman.isModeEnabled('draw', Consts.activeTools.polygon) ||
        this.geoman.isModeEnabled('draw', Consts.activeTools.line) ||
        this.geoman.isModeEnabled('draw', Consts.activeTools.circle) ||
        this.geoman.isModeEnabled('draw', Consts.activeTools.circle_marker)
      ) {
        return
      }
      if (this.currentTool) {
        return
      }
      if (this.sourceSearch.length) {
        this.removeCreatedLayers()
      }
      if (!this.selectObjectsFlag) {
        this.closeInfoBox()
      }
      if (!this.selectObjectsKeyboard && this.selectObjectsFlag) {
        await this.hideSelectObjects()
        return
      }

      const features = this.map
        .queryRenderedFeatures(e.point)
        .filter((el: any) => !el.source.startsWith('mapbox-gl'))

      if (features.length > 0) {
        const topFeature = features[0]

        if (this.hoverObjId === null && this.hoverLayerId === null) {
          this.hoverObjId = Number(topFeature.id)
          this.hoverLayerId = topFeature.source
        }

        if (!this.selectObjectsFlag) {
          await this.handleFeatureClick(topFeature as MapGeoJSONFeature)
        } else {
          this.selectObjects.push({
            idObject: Number(topFeature.id),
            idLayer: topFeature.source
          })
          this.map!.setFeatureState(
            {
              source: topFeature.source,
              sourceLayer: 'default',
              id: String(topFeature.id)
            },
            { hover: true }
          )
        }
      } else {
        if (!this.selectObjectsFlag) {
          await this.closeInfoBox()
        }
      }
    },

    async handleFeatureClick(feature: MapGeoJSONFeature) {
      const id_object = feature.properties?.id
      this.map!.setFeatureState(
        {
          source: feature.source,
          sourceLayer: 'default',
          id: feature.id
        },
        { hover: true }
      )
      this.openedIdObject = id_object
      await store.dispatch('infoBox/FETCH_DATA_INFO', Number(id_object))
    },

    getOrderedLayers(): Array<IVectorLayer | IRasterLayer> {
      const layerOrder = store.state.layersMain?.layerOrderMain || []
      const allLayers = store.state.layersMain?.layersMain || []

      return layerOrder
        .map(({ id, type }) => {
          const layer = allLayers.find((layer) => layer.id === id && layer.type === type)

          if (!layer) {
            console.warn(`Слой с id ${id} и типом ${type} не найден`)
          }
          return layer
        })
        .filter((layer): layer is IVectorLayer | IRasterLayer => layer !== undefined)
    },

    updateMapLayers() {
      if (!this.map) return

      const orderedLayers = this.getOrderedLayers()

      const currentLayerIds = this.map.getStyle().layers?.map((layer: any) => layer.id).filter((id: any) => {
        return id.startsWith('layer-vector') || id.startsWith('layer-raster')
      }) || []

      const desiredLayerIds = orderedLayers.filter((layer: any) => layer.visible).map((layer: any) => `${layer.type}-${layer.id}`)

      currentLayerIds.forEach((layerId: any) => {
        if (!desiredLayerIds.includes(layerId)) {
          const uniqueId = layerId.replace('layer-', '')
          removeLayerIfExists(this.map as any, uniqueId)
        }
      })

      let previousLayerId: string | null = null

      orderedLayers.forEach((layer: any) => {
        if (Number(layer.id) < 0) {
          return
        }
        const uniqueId = `${layer.type}-${layer.id}`
        const layerId = `${uniqueId}`

        if (layer.visible) {
          if (!this.map!.getLayer(layerId)) {
            this.updateLayer(layer, uniqueId, [], new Set())
          }

          if (this.map!.getLayer(layerId)) {
            if (layer.type === 'layer-vector') {
              if (!this.map!.getLayer(`${layerId}-outline`)) {
                addOutline(this.map as any, layerId, layer.style!)
              }
              if (!this.map!.getLayer(`${layerId}-circle`)) {
                addCircle(this.map as any, layerId, layer.style!)
              }
              this.map!.moveLayer(layerId, previousLayerId || undefined)
              this.map!.moveLayer(`${layerId}-outline`, previousLayerId || undefined)
              this.map!.moveLayer(`${layerId}-circle`, previousLayerId || undefined)
            } else {
              this.map!.moveLayer(layerId, previousLayerId || undefined)
            }
          }

          previousLayerId = layerId
        } else {
          removeLayerIfExists(this.map as any, uniqueId)
        }
      })

      this.map.triggerRepaint()
    },

    async updateLayer(
      layer: IVectorLayer | IRasterLayer,
      uniqueId: string,
      desiredLayerIds: string[],
      desiredSourceIds: Set<string>
    ) {
      if (!this.map) return

      const baseUrl = this.API_URL || ''
      const layerId = uniqueId
      const sourceId = `source-${uniqueId}`

      desiredLayerIds.push(layerId)
      desiredSourceIds.add(sourceId)

      let tileUrl = ''
      if (Number(layer.id) < 0) {
        return
      }
      if (layer.type === 'layer-vector') {
        tileUrl = `${baseUrl}${Consts.API_PREFIX}vector/get_tiles_pbf/${layer.id}/{z}/{x}/{y}/`
      } else if (layer.type === 'layer-raster') {
        tileUrl = `${baseUrl}${Consts.API_PREFIX}tiles/get_tiles_png/${layer.id}/{z}/{x}/{y}/`
      }
      if (!tileUrl) return

      if (!layer.style) {
        if (layer.type === 'layer-vector') {
          const randomStyle = this.getRandomLayerStyle
          layer.style = {
            color: randomStyle?.color || '#ff0000',
            opacity: randomStyle?.opacity || 1,
            outlineColor: '#ff0000',
            outlineWidth: 1
          }
        } else if (layer.type === 'layer-raster') {
          layer.style = {
            contrast: 0,
            opacity: 1
          }
        }
      }

      const sourceExists = !!this.map.getSource(sourceId)
      const layerExists = !!this.map.getLayer(layerId)

      if (!sourceExists) {
        this.map.addSource(sourceId, {
          type: layer.type === 'layer-vector' ? 'vector' : 'raster',
          tiles: [tileUrl]
        })

        await addMapLayer(this.map as any, layerId, layer.type, sourceId, layer.style)

        let hoveredPolygonId: number | string | null = null
        const hoverLayers = [layerId]
          .concat(
            layer.type === 'layer-vector'
              ? [`${layerId}-outline`, `${layerId}-circle`]
              : []
          )

        hoverLayers.forEach((lid) => {
          this.map!.on('mousemove', lid, async (e: any) => {
            if (this.currentTool) return
            if (this.selectObjectsFlag && !this.selectObjectsKeyboard) return

            this.map!._canvas.style.cursor = 'pointer'
            if (e.features?.length) {
              const f = this.map!.queryRenderedFeatures(e.point)[0]
              if (f.id == null && f.properties?.id) {
                f.id = f.properties.id
              }

              let flag = true
              if (this.selectObjectsFlag) {
                this.selectObjects.forEach((obj: any) => {
                  if (Number(obj.idObject) === Number(hoveredPolygonId)) flag = false
                })
              }

              const newId = f.id
              if (newId !== hoveredPolygonId) {
                if (hoveredPolygonId !== null && hoveredPolygonId !== this.hoverObjId && flag) {
                  this.map!.setFeatureState(
                    { source: sourceId, sourceLayer: 'default', id: hoveredPolygonId },
                    { hover: false }
                  )
                }
                hoveredPolygonId = newId ?? null
                if (hoveredPolygonId !== null) {
                  this.map!.setFeatureState(
                    { source: sourceId, sourceLayer: 'default', id: hoveredPolygonId },
                    { hover: true }
                  )
                }
              }
            }
          })

          this.map!.on('mouseleave', lid, async () => {
            if (this.currentTool) return
            if (this.selectObjectsFlag && !this.selectObjectsKeyboard) return

            this.map!._canvas.style.cursor = Consts.activeCursors.move_default

            let flag = true
            if (this.selectObjectsFlag) {
              this.selectObjects.forEach((obj: any) => {
                if (Number(obj.idObject) === Number(hoveredPolygonId)) flag = false
              })
            }

            if (hoveredPolygonId !== null && this.hoverObjId !== hoveredPolygonId && flag) {
              this.map!.setFeatureState(
                { source: sourceId, sourceLayer: 'default', id: hoveredPolygonId },
                { hover: false }
              )
              hoveredPolygonId = null
            }
          })
        })

        return
      }

      if (sourceExists && !layerExists) {
        await addMapLayer(this.map as any, layerId, layer.type, sourceId, layer.style)
        return
      }
    },

    async closeInfoBox() {

      if (!this.selectObjectsFlag && this.map && this.hoverLayerId && this.hoverObjId !== null) {
        if (this.map.getSource(this.hoverLayerId)) {
          this.map.setFeatureState(
            { source: this.hoverLayerId, sourceLayer: 'default', id: this.hoverObjId },
            { hover: false }
          )
        }
      }

      this.hoverObjId = null
      this.hoverLayerId = null
      // this.openedIdObject = null
      this.showEditFields = false
      await store.dispatch('infoBox/SET_DATA_INFO', null)
      await store.dispatch('treeItemStore/SET_SELECTED_LEGEND', false)
      await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMain}`, {})
    }
  },
  computed: {
    contextMenuStyle() {
      return {
        top: `${this.contextMenuY + 135}px`,
        left: `${this.contextMenuX}px`
      }
    },
    currentTool: () => store.state.toolbar.is_active_tool,
    flagUpdateLayer: () => store.getters['flagUpdateLayer'],
    suggestions: () => store.getters['suggestions'],
    flagCreateLayer: () => store.state.forestArea.flagCreateLayer,
    coord: () => store.getters['layersMain/coord'],
    currentLayerOrder: () => store.state.layersMain?.layerOrderMain || [],
    currentLayers: () => store.getters['layersMain/layers'] as Layer[],
    newLayerData: () => store.getters['layerCreation/newLayerData'],
    selectedLayerMainEdit: () => store.state.layersMain?.selectedLayerMainEdit || [],
    flyLayerMain: () => store.state.layersMain?.flyLayerMain || [],
    ...mapGetters('defaultStyleLayer', ['getRandomLayerStyle']),
    queryParams: () => store.getters['layerCreation/createQueryParams'],
    hoverLayer: () => store.state.layersMain?.hoverLayer,
    createdLayer: () => store.getters['layersVector/createdLayer'] as Layer | undefined,
    selectedObjects: () => store.state.toolbar.selectedObjects
  },
  watch: {
    selectedObjects: {
      handler(newValue) {
        if (newValue.length) {
          this.selectObjects = newValue
          this.selectObjectsFlag = true
        }
      },
      deep: true
    },
    hoverLayer: {
      handler(newValue) {
        if (newValue) {
          this.hoverLayerOld = newValue
          const layerId = `${Consts.LayerTypes.VECTOR}-${newValue.id}`
          if (this.map!.getLayer(layerId)) {
            this.map!.setPaintProperty(layerId, 'fill-color', Consts.GeometryStylesConsts.primary_color_hover)
          }
          const outlineId = layerId + '-outline'
          if (this.map!.getLayer(outlineId)) {
            this.map!.setPaintProperty(outlineId, 'line-color', Consts.GeometryStylesConsts.primary_color_hover)
          }

          const circleId = layerId + '-circle'
          if (this.map!.getLayer(circleId)) {
            this.map!.setPaintProperty(circleId, 'circle-color', Consts.GeometryStylesConsts.primary_color_hover)
          }
        } else {
          const layerId = `${Consts.LayerTypes.VECTOR}-${this.hoverLayerOld.id}`
          const outlineId = layerId + '-outline'
          const circleId = layerId + '-circle'
          const baseColor = this.hoverLayerOld.style.color

          if (this.map!.getLayer(layerId)) {
            this.map!.setPaintProperty(layerId, 'fill-color', [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              Consts.GeometryStylesConsts.primary_color_hover,
              baseColor
            ])
          }
          if (this.map!.getLayer(outlineId)) {
            this.map!.setPaintProperty(
              layerId + '-outline',
              'line-color',
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                Consts.GeometryStylesConsts.primary_color_hover,
                this.hoverLayerOld.style.outlineColor
              ]
            )
          }

          if (this.map!.getLayer(circleId)) {
            this.map!.setPaintProperty(
              layerId + '-circle',
              'circle-color',
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                Consts.GeometryStylesConsts.primary_color_hover,
                baseColor
              ]
            )
          }
        }
      },
      deep: true
    },
    flagUpdateLayer: {
      async handler(newValue) {
        if (newValue) {
          const layer = this.layers.find((layer: any) => layer.id === newValue)
          if (layer && layer.visible) {
            await this.hideAndShowLayer(this.map, newValue, this.layers)
            await store.dispatch(configActions.SET_UPDATE_LAYER, null)
          }
        }
      }
    },
    suggestions: {
      async handler(newValue) {
        if (!newValue || newValue.length === 0) return

        newValue.forEach((item: any) => {
          if (typeof item.geojson === 'string') {
            try {
              item.geojson = JSON.parse(item.geojson)
            } catch (error) {
              console.error('❌ Ошибка парсинга geojson:', error, item.geojson)
              item.geojson = null
            }
          }
        })

        const idGeoms = newValue.map((item: any) => item.id_geom).filter(Boolean)

        if (idGeoms.length === 0) {
          console.warn('⚠️ Нет id_geom для запроса GeoJSON.')
          return
        }

        try {
          const geojsonResponses = await Promise.all(
            idGeoms.map((id: any) => vectorApi.getGeojson(id))
          )

          const parsedGeojson = geojsonResponses
            .map((response, index) => {
              if (!response) {
                console.warn(`⚠️ Нет данных для id_geom: ${idGeoms[index]}`)
                return null
              }

              try {
                const geojsonData = JSON.parse(response)
                return geojsonData.features ? geojsonData.features : []
              } catch (error) {
                console.error(`❌ Ошибка парсинга GeoJSON для id_geom: ${idGeoms[index]}`, error)
                return null
              }
            })
            .flat()
            .filter(Boolean)

          if (parsedGeojson.length === 0) {
            console.warn('❌ Не удалось получить корректные объекты.')
            return
          }

          parsedGeojson.forEach((feature, index) => {
            const layerId = `geojson-layer-${index}`
            const color = `hsl(${(index * 50) % 360}, 70%, 50%)` // Разные оттенки

            if (this.map!.getSource(layerId)) {
              this.map!.removeLayer(layerId)
              this.map!.removeSource(layerId)
            }

            this.map!.addSource(layerId, {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [feature]
              }
            })

            this.map!.addLayer({
              id: layerId,
              type: 'fill',
              source: layerId,

              paint: {
                'fill-color': color,
                'fill-opacity': 0.5,
                'fill-outline-color': '#000000'
              }
            })

            this.sourceSearch.push(layerId)
          })

          const bboxGeoJSON = JSON.parse(newValue[0].geojson_bbox)

          if (bboxGeoJSON.type === 'Polygon') {
            const coordinates = bboxGeoJSON.coordinates[0]

            const bounds = coordinates.reduce(
              (b: any, coord: any) => b.extend([coord[0], coord[1]]), // Убедитесь, что передаете [longitude, latitude]
              new maplibregl.LngLatBounds(
                [coordinates[0][0], coordinates[0][1]],
                [coordinates[0][0], coordinates[0][1]]
              )
            )

            this.map!.fitBounds(bounds, {
              padding: 30,
              maxZoom: 17,
              duration: 1500,
              linear: true
            })
          }
        } catch (error) {
          console.error('❌ Ошибка при получении GeoJSON:', error)
        }
      },
      deep: true
    },
    flagCreateLayer: {
      handler(newValue) {
        if (newValue) {
          this.geoman.enableMode('draw', Consts.activeTools.polygon)
        }
      }
    },
    coord: {
      handler(newValue) {
        moveToPoint(this.map, newValue)
      },
      immediate: true,
      deep: true
    },
    currentLayerOrder: {
      handler() {
        this.updateMapLayers()
      },
      immediate: true,
      deep: true
    },
    currentLayers: {
      handler(newLayers) {
        this.layers = newLayers
        this.updateMapLayers()
      },
      immediate: true,
      deep: true
    },
    flyLayerMain: {
      handler(flyLayer) {
        if (!flyLayer || !flyLayer.bbox_geojson) {
          return
        }
        flyToLocation(this.map, JSON.parse(flyLayer.bbox_geojson).coordinates[0])
        store.dispatch(`layersMain/${layersMainActions.setFlyLayerMain}`, null)
      },
      deep: true
    }
  },
  components: {
    MeasurementSwitcher,
    AppPopup,
    LayerAttributesPopup
  }
})
</script>

<style lang="scss" scoped>
.map {
  &__loader {
    transition: all 0.4s ease;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(0, -50%);
    z-index: 11;
    height: 100%;
  }
}

.showToolbarMain {
  top: 0 !important;
}

.hideToolbarMain {
  top: -70px;
}

@media (width < 1900px) {
  .hideToolbarMain {
    top: -78px;
  }
}

.coord {
  font-size: 17px;
}

.context-menu {
  position: absolute;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

<style lang="scss">
.maplibregl-ctrl-top-right {
  z-index: 0 !important;
}

.maplibregl-ctrl-attrib.maplibregl-compact-show {
  display: none;
}

.maplibregl-ctrl-attrib-button {
  display: none;
}

.mapboxgl-ctrl {
  display: none;
}

.maplibregl-compact {
  display: none;
}

.maplibregl-ctrl-group {
  border-radius: 0;
  box-shadow: none !important;
  padding: 3px !important;
  transition: margin 0.3s ease;
  margin: v-bind('selectedLayerMainEdit.id ? "94px 30px 0 0" : "30px 30px 0 0"') !important;

  button {
    cursor: pointer !important;

    &:hover {
      background-color: transparent !important;
    }
  }
}

.maplibregl-ctrl-compass {
  span {
    background-image: url('@/assets/icons/compass.svg') !important;
  }
}

.maplibregl-ctrl-top-left {
  left: calc(100% - 80px);
  top: 10%;
  display: none;
}
</style>
