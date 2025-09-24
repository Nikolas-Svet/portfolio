// store/index.ts
import { createStore, Store } from 'vuex'

import { userStore } from './modules/user'
import { adminUsersStore } from './modules/adminUsers'
import { ILayerCreationState, layerCreationStore } from './modules/layerCreation'
import { layersVectorStore } from './modules/layersVector'
import { layersMainStore } from './modules/layersMain'
import { substractionVectorState } from './modules/substructionLayer'
import { toolStore } from './modules/tools'
import { aiStore, IaiState } from './modules/ai'
import { forestAreaStore, IforestAreaState } from './modules/forestArea'
import { INotificationsState, notificationsStore } from './modules/notifications'
import { configStore, IconfigState } from './modules/config'
import { artificialAiStore, IArtificialAiState } from './modules/artificial_ai'
import { IsearchState, searchStore } from './modules/search'
import { ITreeItemState, treeItemStore } from './modules/TreeItem'

import type { IUserState } from '@/types/user'
import type { IAdminUsersState } from '@/types/adminUsers'
import type { IEditObjects, ISubstractionState, IToolsStore } from '@/types/Store'
import { ILayersState, ILayersStateMain } from '@/types/layersVector'
import { IMeasurementStore, measurementStore } from './modules/measurement'
import { IToolbarState, toolbarStore } from '@/store/modules/toolbar'
import { IMapGeometryState, mapGeometryStore } from '@/store/modules/toolbarDrawing'
import { IInfoBoxState, infoBoxStore } from '@/store/modules/InfoBox.ts'
import { editObjectsStore } from '@/store/modules/editObjects.ts'
import {
  GeometryMarkersDistanceStore,
  IGeometryMarkersDistanceActionsState
} from '@/store/modules/GeometryMarkersDistance.ts'

interface StateProps {
  user: IUserState
  adminUsers: IAdminUsersState
  layerCreation: ILayerCreationState
  layersVector: ILayersState
  layersMain: ILayersStateMain
  substractionVector: ISubstractionState
  notifications: INotificationsState
  config: IconfigState
  artificial_ai: IArtificialAiState
  searchState: IsearchState
  measurementStore: IMeasurementStore
  tools: IToolsStore
  ai: IaiState
  forestArea: IforestAreaState
  TreeItem: ITreeItemState
  toolbar: IToolbarState
  GeometryMarkersDistance: IGeometryMarkersDistanceActionsState
  toolbarDrawing: IMapGeometryState
  infoBox: IInfoBoxState
  editObjects: IEditObjects
}

type RootState = StateProps

const store = createStore<RootState>({
  modules: {
    user: userStore,
    adminUsers: adminUsersStore,
    layerCreation: layerCreationStore,
    layersVector: layersVectorStore,
    substractionVector: substractionVectorState,
    layersMain: layersMainStore,
    tools: toolStore,
    ai: aiStore,
    notifications: notificationsStore,
    forestArea: forestAreaStore,
    config: configStore,
    artificial_ai: artificialAiStore,
    searchStore: searchStore,
    measurement: measurementStore,
    treeItemStore: treeItemStore,
    toolbar: toolbarStore,
    GeometryMarkersDistance: GeometryMarkersDistanceStore,
    toolbarDrawing: mapGeometryStore,
    infoBox: infoBoxStore,
    editObjects: editObjectsStore
  }
}) as Store<RootState>

export default store
