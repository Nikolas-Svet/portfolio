<template>
  <EditModal
    v-if="openDescriptionModal"
    :text="selectedItem.description"
    :id_layer="selectedItem.id"
    title="Описание слоя"
    @close="
      () => {
        this.openDescriptionModal = false
        this.hideContextMenu()
      }
    "
    @save="(payload) => updateLayerDescription(payload)"
  />
  <div v-if="currentLayers.length" class="aside__search">
    <input v-model="filterName" placeholder="Поиск" type="text" />
    <search></search>
    <span v-if="filterName !== ''" class="icon-close" @click="filterName = ''"></span>
  </div>
  <div
    ref="container"
    class="aside__layers"
    style="height: 100%"
    @click="onContainerClick"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <!--    @contextmenu.prevent="onContextMenu"-->

    <ul ref="layerList" class="layer-list" style="height: fit-content">
      <tree-item
        v-for="child in filteredRootGroup.children"
        v-if="filteredRootGroup.children.length"
        :key="`${child.type}-${child.id}`"
        ref="treeItems"
        :isSelected="isSelected"
        :item="child"
        :selectedIds="selectedLayersForGrouping"
        :truncatedName="truncatedName"
        @dragEnd="onDragEnd"
        @dragLeave="onDragLeave"
        @dragOver="onDragOver"
        @dragStart="onDragStart"
        @drop="onDrop"
        @selectLayer="handleSelectLayer"
        @showContextMenu="showContextMenu"
        @updateGroupVisibility="updateGroupVisibility"
        @updateItem="updateGroupItem"
        @updateLeafVisibility="updateLeafVisibility"
      ></tree-item>
      <span v-else-if="filterName" style="width: 100%; display: flex; justify-content: center">
        Слои с таким именем не найдены
      </span>
    </ul>

    <div
      v-if="contextMenuVisible"
      ref="contextMenu"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      class="context-menu"
      @mousedown.stop
      @click.stop
    >
      <ul>
        <template v-if="selectedItem.type === 'group'">
          <li @click.stop="ungroupSelectedGroup">Разгруппировать</li>
          <li @click.stop="renameSelectedGroup">Переименовать</li>
          <!--          <li @click.stop="deleteSelectedGroup">Удалить группу</li>-->
        </template>
        <template v-else>
          <li @click.stop="groupSelectedLayers">Создать группу</li>
          <!--          <li @click.stop="editLayer(selectedItem)" v-if="selectedItem.type === 'layer-vector' ">Редактировать слой</li>-->
          <li @click.stop="flyToLayer(selectedItem)">Приблизиться к слою</li>
          <div v-if="isEditLayer(selectedItem.id)">
            <li v-if="selectedItem.type === 'layer-vector'" @click.stop="exportLayer(selectedItem)">Экспорт слоя</li>
          </div>
          <li @click.stop="deleteSelectedLayers(selectedItem)">Удалить слой</li>
          <li @click.stop="renameSelectedLayer">Переименовать</li>
          <li @click.stop="openEditDescriptionModal">Описание</li>
        </template>
      </ul>
    </div>
  </div>

  <div v-if="flagExport" class="window" style="backdrop-filter: none">
    <div class="window__edit" style="max-width: 500px">
      <p>Экспорт слоя "{{ layerToExport.name }}"?</p>
      <div class="window__edit-select">
        <span>Тип файла:</span>
        <div class="angle__container" style="width: 70%">
          <v-select v-model="exportType" :options="exportTypes" label="name" />
          <div class="angle" style="width: 10px; height: 10px"></div>
          <div class="angle" style="width: 10px; height: 10px"></div>
          <div class="angle" style="width: 10px; height: 10px"></div>
          <div class="angle" style="width: 10px; height: 10px"></div>
        </div>
      </div>
      <div class="window__edit-block">
        <button @click="confirmExport()">Эскпорт</button>
        <button class="primary-color" @click="closeExport()">Отменить</button>
      </div>
    </div>
  </div>

  <div v-if="loaderFlag" class="layer-list__loader">
    <span class="loader"></span>
    <span>Экспорт файла</span>
  </div>
  <div v-if="loaderFlag" class="layer-list__wrap"></div>
</template>

<script>
import { mapGetters } from 'vuex'
import store from '@/store'
import TreeItem from './TreeItem.vue'
import { onDragOver, onDragStart, onDrop, resetDragState } from '@/utils/AsideLayers/dragAndDropUtils.js'
import { layersMainActions } from '@/store/actions/layersMain'
import { vectorApi } from '@/api/admin'
import search from '@/components/icons/search.vue'
import EditModal from '@/components/app/EditModal.vue'
import { layersApi } from '@/api/layers'
import { isEditLayer } from '@/utils/checkAccess/isEditOrIsDelete'

let groupCounter = 1

export default {
  name: 'AsideLayers',
  components: { EditModal, search, TreeItem },
  data() {
    return {
      openDescriptionModal: false,
      currentName: '',
      loaderFlag: false,
      exportTypes: ['geojson', 'xml', 'ESRI Shapefile', 'DXF', 'CSV'],
      exportType: null,
      layerToExport: null,
      flagExport: false,
      layerOrder: [],
      draggingSelection: [],
      contextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      selectedItem: null,
      layers: [],
      rootGroup: {
        type: 'group',
        id: 'root',
        name: 'Корень',
        expanded: true,
        visible: true,
        children: []
      },
      filteredRootGroup: {
        type: 'group',
        id: 'root',
        name: 'Корень',
        expanded: true,
        visible: true,
        children: []
      },
      selectedLayersForGrouping: [],
      isSelecting: false,
      startY: 0,
      currentY: 0,
      draggedItem: null,
      dragOverTarget: null,
      dragOverPosition: null,

      initialTop: null,
      finalTop: null,
      filterName: ''
    }
  },
  computed: {
    ...mapGetters('currentDatasets', ['getLayerOrder']),
    currentLayers() {
      return store.getters['layersMain/layers'] || []
    }
  },
  mounted() {
    document.addEventListener('click', this.onDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick)
  },
  watch: {
    filterName: {
      handler(newVal) {
        // Если поиск пуст, возвращаем полное дерево
        if (!newVal) {
          this.filteredRootGroup = this.rootGroup
          return
        }
        const filterLower = newVal.toLowerCase()
        const filterItems = (items) => {
          return items.reduce((acc, item) => {
            if (item.type === 'group') {
              // Фильтруем детей рекурсивно
              const filteredChildren = filterItems(item.children || [])
              if (
                (item.name && item.name.toLowerCase().includes(filterLower)) ||
                filteredChildren.length > 0
              ) {
                acc.push({
                  ...item,
                  children: filteredChildren
                })
              }
            } else {
              // Для слоёв: если имя содержит подстроку
              if (item.name && item.name.toLowerCase().includes(filterLower)) {
                acc.push(item)
              }
            }
            return acc
          }, [])
        }
        this.filteredRootGroup = {
          ...this.rootGroup,
          children: filterItems(this.rootGroup.children)
        }
      },
      immediate: true
    },
    currentLayers: {
      handler(newLayers) {
        const groupsMap = new Map()
        const updatedChildren = []

        const layerOrder = store.state.layersMain?.layerOrderMain || []

        console.log('layerOrder', layerOrder)
        console.log('newLayers', newLayers)

        let currentGroup = null

        const processedLayers = new Set() // Контроль добавленных слоёв
        const processedGroups = new Set() // Контроль добавленных групп

        layerOrder.forEach((layerOrderItem) => {
          // Находим все слои с соответствующим ID и типом
          const layers = newLayers.filter(
            (l) => l.id === layerOrderItem.id && l.type === layerOrderItem.type
          )

          if (!layers || layers.length === 0) return

          layers.forEach((layer) => {
            if (store.state.forestArea.flagCreateLayer && layer.name) {
            }

            const uniqueLayerKey = `${layer.id}-${layer.type}` // Уникальный ключ для слоя

            if (processedLayers.has(uniqueLayerKey)) {
              // Пропускаем, если слой уже обработан
              return
            }

            if (layer.group) {
              // Если у слоя есть группа
              if (!groupsMap.has(layer.group)) {
                // Создаём новую группу, если её ещё нет
                currentGroup = {
                  type: 'group',
                  id: layer.group,
                  name: layer.group.replace('group_', ''),
                  expanded: layer.expanded,
                  visible: false, // Изначально видимость false, изменится ниже
                  children: []
                }
                groupsMap.set(layer.group, currentGroup)
              } else {
                currentGroup = groupsMap.get(layer.group)
              }

              // Добавляем слой в текущую группу
              currentGroup.children.push(layer)

              // Проверяем видимость группы: если хотя бы один элемент видим, то группа видима
              if (layer.visible) {
                currentGroup.visible = true
              }

              // Если группа ещё не была добавлена в updatedChildren
              if (!processedGroups.has(currentGroup.id)) {
                updatedChildren.push(currentGroup)
                processedGroups.add(currentGroup.id) // Помечаем группу как обработанную
              }
            } else {
              // Если у слоя нет группы
              if (currentGroup) {
                // Закрываем текущую группу, если она есть
                if (!processedGroups.has(currentGroup.id)) {
                  updatedChildren.push(currentGroup)
                  processedGroups.add(currentGroup.id) // Помечаем группу как обработанную
                }
                currentGroup = null
              }
              updatedChildren.push(layer)
            }

            processedLayers.add(uniqueLayerKey) // Помечаем слой как обработанный
          })
        })

        // Добавляем последнюю открытую группу, если она ещё не добавлена
        if (currentGroup && !processedGroups.has(currentGroup.id)) {
          updatedChildren.push(currentGroup)
          processedGroups.add(currentGroup.id) // Помечаем группу как обработанную
        }


        if (updatedChildren.length !== 0) {
          console.log('UPDATE1')
          console.log(this.rootGroup, updatedChildren[0].expanded)
          this.rootGroup.expanded = updatedChildren[0].expanded
        }

        console.log('UPDATEDCHILDREN', updatedChildren)
        console.log('layerOrder', layerOrder)

        // Обновляем rootGroup только если структура изменилась
        if (JSON.stringify(this.rootGroup.children) !== JSON.stringify(updatedChildren)) {
          this.rootGroup.children = updatedChildren
        }
      },
      immediate: true,
      deep: true
    },
    rootGroup: {
      handler(newRootGroup) {
        const previousState = this.previousRootGroup || {}
        const currentState = JSON.parse(JSON.stringify(newRootGroup))

        // console.log('currentState', currentState)
        // console.log('previousState', previousState)

        if (!this.hasOrderChangedById(previousState, currentState)) {
          // console.log('Порядок не изменился, updateLayerOrder не вызывается.')
          return
        }

        // console.log('Порядок изменился, вызываем updateLayerOrder.')
        this.updateLayerOrder()
        this.previousRootGroup = currentState
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    isEditLayer,
    openEditDescriptionModal() {
      if (
        !this.selectedItem ||
        (this.selectedItem.type !== 'layer-vector' && this.selectedItem.type !== 'layer-raster')
      ) {
        this.hideContextMenu()
        return
      }

      this.openDescriptionModal = true
      this.contextMenuVisible = false
    },

    // newDescription: string
    async updateLayerDescription(newDescription) {
      const layer = this.selectedItem
      try {
        const params = {
          id: layer.id,
          id_dataset: layer.id_dataset,
          name: layer.name,
          description: newDescription,
          url: layer.url,
          name_dir: layer.name_dir || ''
        }

        if (layer.type === 'layer-raster') {
          await layersApi.updateRasterLayer(params)
        } else {
          await layersApi.updateVectorLayer(params)
        }

        layer.description = newDescription
        this.updateItem(layer)
        console.log('Слой успешно обновлён')
      } catch (error) {
        console.error('Ошибка при обновлении слоя:', error)
      }

      // this.openDescriptionModal = false
      // this.hideContextMenu()
    },
    onContainerClick(e) {
      // Получаем ссылку на ul через ref
      const layerList = this.$refs.layerList
      // Если layerList существует и клик был вне его области
      if (layerList && !layerList.contains(e.target)) {
        this.handleClickOutside()
      }
    },
    async handleClickOutside() {
      // Здесь вызов нужной функции, например:
      await store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, {})
      store.dispatch('treeItemStore/SET_SELECTED_KEBAB', false)
      store.dispatch('treeItemStore/SET_SELECTED_LEGEND', false)
    },

    updateItem(updatedItem) {
      store
        .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, updatedItem)
        .catch((err) => console.error('Ошибка при обновлении слоя:', err))
    },

    updateGroupItem(updatedItem) {
      store
        .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, updatedItem)
        .catch((err) => console.error('Ошибка обновления группы:', err))
    },

    hasOrderChangedById(previous, current) {
      if (!previous || !current) return true

      const previousChildren = previous.children || []
      const currentChildren = current.children || []

      // Проверка на количество элементов
      if (previousChildren.length !== currentChildren.length) {
        // console.log('Количество элементов изменилось.')
        return true
      }

      // Проверка на порядок элементов по id
      for (let i = 0; i < currentChildren.length; i++) {
        const prevItem = previousChildren[i]
        const currItem = currentChildren[i]

        if (prevItem.id !== currItem.id) {
          // console.log(`Порядок изменился: prevItem.id=${prevItem.id}, currItem.id=${currItem.id}`)
          return true
        }

        // Если это группа, проверяем ее содержимое
        if (currItem.type === 'group' && this.hasOrderChangedById(prevItem, currItem)) {
          return true
        }
      }

      // Если порядок и содержимое не изменились
      return false
    },

    editLayer(layer) {
      if (!layer) {
        console.warn('Слой не выбран для приближения.')
        return
      }
      store.dispatch(`layersMain/${layersMainActions.setEditLayerMain}`, layer)
    },

    flyToLayer(layer) {
      if (!layer) {
        console.warn('Слой не выбран для приближения.')
        return
      }
      if (!layer.bbox_geojson) {
        window.$notify('У слоя отсутствует геометрия.', true)
        return
      }
      store.dispatch(`layersMain/${layersMainActions.setFlyLayerMain}`, layer)
      this.hideContextMenu()
    },

    async confirmExport() {
      this.loaderFlag = true
      await vectorApi.exportGeometry(this.exportType, this.layerToExport.id, this.currentName)
      this.currentName = ''
      this.exportType = ''
      this.layerToExport = null
      this.flagExport = false
      this.loaderFlag = false
    },

    closeExport() {
      this.flagExport = false
      this.layerToExport = null
    },

    exportLayer(layer) {
      if (!this.selectedItem.bbox_geojson) {
        window.$notify('У слоя отсутствует геометрия.', true)
        return
      }
      this.hideContextMenu()
      this.flagExport = true
      this.layerToExport = layer
      this.currentName = layer.name
    },

    onContextMenu(event) {
      const target = event.target.closest('li[data-id]')
      if (!target) {
        console.warn('Элемент с data-id не найден.')
        this.hideContextMenu()
        return
      }

      const dataId = target.getAttribute('data-id')
      if (!dataId) {
        console.warn('Атрибут data-id отсутствует.')
        this.hideContextMenu()
        return
      }
      // console.log(dataId)
      let [type, id] = dataId.split('-')
      let type2 = ''

      if (type === 'layer') {
        ;[type, type2, id] = dataId.split('-')
        type = type + '-' + type2
      }

      if (!type || !id) {
        console.warn('Некорректный формат data-id:', dataId)
        this.hideContextMenu()
        return
      }

      // console.log('Контекстное меню для:', { type, id })

      this.selectedItem = this.findItemById(this.rootGroup, { type, id })

      if (this.selectedItem) {
        this.showContextMenu(event, this.selectedItem)
      } else {
        console.warn(`Элемент с id: ${id} и type: ${type} не найден`)
        this.hideContextMenu()
      }
    },

    updateLayerOrder() {
      const collectLayersWithGroup = (group) => {
        const result = []
        group.children.forEach((child) => {
          if (child.type === 'layer-vector' || child.type === 'layer-raster') {
            result.push({
              id: child.id,
              type: child.type,
              group: group.id !== 'root' ? group.id : ''
            })
          } else if (child.type === 'group') {
            result.push(...collectLayersWithGroup(child))
          }
        })
        return result
      }

      console.log('rootGroup', this.rootGroup)

      const updatedLayerOrder = collectLayersWithGroup(this.rootGroup)

      console.log('updatedLayerOrder', updatedLayerOrder)
      store
        .dispatch(`layersMain/${layersMainActions.orderLayersMain}`, updatedLayerOrder)
        .then(() => {
        })
        .catch((err) => console.error('Ошибка обновления порядка в Vuex:', err))
    },

    onDocumentClick(e) {
      if (this.contextMenuVisible) {
        const menu = this.$refs.contextMenu
        if (menu && !menu.contains(e.target)) {
          this.hideContextMenu()
        }
      }
    },

    truncatedName(name) {
      console.log(name.length)
      return name.length > 30 ? name.substring(0, 25) + '...' : name
    },

    isSelected(item) {
      return this.selectedLayersForGrouping.includes(`${item.type}-${item.id}`)
    },

    onMouseDown(event) {
      if (event.button === 0) {
        this.clearSelection()
      }
      this.isSelecting = true
      this.startY = event.clientY
      this.currentY = event.clientY
    },

    clearSelection() {
      this.selectedLayersForGrouping = []
    },

    onMouseMove(event) {
      if (this.isSelecting) {
        this.currentY = event.clientY
        this.updateSelection()
      }
    },

    onMouseUp() {
      if (this.isSelecting) {
        this.isSelecting = false
        // //
      }
    },

    updateSelection() {
      const minY = Math.min(this.startY, this.currentY)
      const maxY = Math.max(this.startY, this.currentY)
      const listItems = this.$refs.layerList.querySelectorAll('li[data-id]')

      const tempIds = []
      listItems.forEach((li) => {
        const rect = li.getBoundingClientRect()
        if (rect.top < maxY && rect.bottom > minY) {
          const id = li.getAttribute('data-id')
          if (id && !tempIds.includes(id)) {
            tempIds.push(id)
          }
        }
      })

      this.selectedLayersForGrouping = tempIds
      //
    },

    findItemById(parentGroup, { type, id }) {
      if (!type || !id) {
        console.warn(`Некорректные параметры для поиска: type=${type}, id=${id}`)
        return null
      }

      for (const child of parentGroup.children) {
        const childId = child.id
        const childType = child.type

        if (String(childId) === String(id) && childType === type) {
          return child
        }

        if (child.type === 'group') {
          const found = this.findItemById(child, { type, id })
          if (found) return found
        }
      }

      console.warn(`Элемент с id: ${id} и type: ${type} не найден`)
      return null
    },

    findParentGroupById(parentGroup, id, type) {
      for (const child of parentGroup.children) {
        // Проверяем совпадение ID и типа
        if (String(child.id) === String(id) && child.type === type) {
          return parentGroup
        }
        if (child.type === 'group' && child.children) {
          const foundParent = this.findParentGroupById(child, id, type)
          if (foundParent) return foundParent
        }
      }

      console.warn('Родительская группа не найдена для ID:', id, 'и типа:', type)
      return null
    },

    showContextMenu(event, item) {
      if (item) {
        // Извлекаем свойства напрямую, чтобы обойти прокси
        const rawItem = {
          id: item.id,
          type: item.type,
          ...item
        }

        this.selectedItem = rawItem
        this.contextMenuVisible = true

        // Получаем границы контейнера
        const container = this.$refs.container.getBoundingClientRect()

        // Начальные координаты
        let x = event.clientX + 3
        let y = event.clientY + 3

        // // Проверяем, не выходит ли меню за правую границу
        // if (x + 200 > container.right) {
        //   x = container.right - 200 // 200 — ширина меню
        // }
        //
        // // Проверяем, не выходит ли меню за нижнюю границу
        // if (y + 100 > container.bottom) {
        //   y = container.bottom - 120 // 100 — высота меню
        // }

        // Обновляем позицию контекстного меню
        this.contextMenuPosition = { x, y }
      } else {
        console.warn('Элемент для контекстного меню не найден.')
        this.hideContextMenu()
      }
      event.preventDefault()
    },
    hideContextMenu() {
      this.contextMenuVisible = false
      store.dispatch('treeItemStore/SET_SELECTED_KEBAB', false)
      this.selectedItem = null
    },
    renameSelectedGroup() {
      if (!this.selectedItem || this.selectedItem.type !== 'group') {
        this.hideContextMenu()
        return
      }

      // Находим экземпляр TreeItem по item.id
      const treeItemComponent = this.$refs.treeItems.find(
        (treeItem) => treeItem.item.id === this.selectedItem.id
      )

      if (treeItemComponent && typeof treeItemComponent.triggerRename === 'function') {
        treeItemComponent.triggerRename() // Активируем режим редактирования
      } else {
        console.warn('Метод triggerRename не найден у TreeItem.')
      }

      this.hideContextMenu()
    },

    getAllTreeItems() {
      const collectRefs = (refs) => {
        return refs.reduce((all, ref) => {
          if (ref.$refs.treeItems) {
            // Рекурсивно собираем вложенные treeItems
            return all.concat(ref, collectRefs(ref.$refs.treeItems))
          }
          return all.concat(ref)
        }, [])
      }

      return collectRefs(this.$refs.treeItems || [])
    },

    renameSelectedLayer() {
      if (
        !this.selectedItem ||
        (this.selectedItem.type !== 'layer-vector' && this.selectedItem.type !== 'layer-raster')
      ) {
        this.hideContextMenu()
        return
      }

      const allTreeItems = this.getAllTreeItems()

      const treeItemComponent = allTreeItems.find(
        (ref) => ref.item.id === this.selectedItem.id && ref.item.type === this.selectedItem.type
      )

      if (treeItemComponent && typeof treeItemComponent.triggerRename === 'function') {
        treeItemComponent.triggerRename()
      } else {
        console.warn(`Метод triggerRename не найден у TreeItem с id: ${this.selectedItem.id}`)
      }

      this.hideContextMenu()
    },
    ungroupSelectedGroup() {
      if (!this.selectedItem || this.selectedItem.type !== 'group') {
        this.hideContextMenu()
        return
      }

      // Получаем родительскую группу
      const parentGroup =
        this.findParentGroupById(this.rootGroup, this.selectedItem.id) || this.rootGroup

      // Удаляем выбранную группу из родительской группы
      const groupIndex = parentGroup.children.findIndex(
        (child) => child.id === this.selectedItem.id && child.type === 'group'
      )

      if (groupIndex === -1) {
        console.warn('Группа не найдена для удаления.')
        this.hideContextMenu()
        return
      }

      const [removedGroup] = parentGroup.children.splice(groupIndex, 1) // Удаляем группу

      if (removedGroup && removedGroup.type === 'group') {
        // Обновляем поле group у каждого элемента в группе
        removedGroup.children.forEach((child) => {
          if (child.type === 'layer-vector' || child.type === 'layer-raster') {
            child.group = ''
            // console.log('CHILD', child)

            // Обновляем слой в Vuex
            store
              .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, {
                ...child,
                group: ''
              })
              .catch((err) => console.error('Ошибка при обновлении слоя:', err))
          }
        })

        // Вставляем элементы группы на место удалённой группы
        parentGroup.children.splice(groupIndex, 0, ...removedGroup.children)
      }

      this.hideContextMenu()
    },

    groupSelectedLayers() {
      const selectedItems = this.selectedLayersForGrouping.map((selectedId) => {
        let [type, type2, id] = selectedId.split('-')
        type = type + '-' + type2
        return this.findItemById(this.rootGroup, { type, id })
      })

      let newGroupName
      let newGroupId

      // Продолжаем нумерацию, пока не найдём уникальное имя группы
      do {
        newGroupName = `${groupCounter}`
        newGroupId = `group_${groupCounter}`
        groupCounter++
      } while (this.findExistingGroupByName(newGroupName))

      const newGroup = {
        type: 'group',
        id: newGroupId,
        name: newGroupName,
        expanded: true,
        visible: true,
        children: selectedItems
      }

      // Присваиваем group новой группы
      selectedItems.forEach((item) => {
        item.group = newGroupId
      })

      // Добавляем новую группу в rootGroup
      this.rootGroup.children.push(newGroup)
      console.log(`Создана новая группа с именем "${newGroupName}" и id "${newGroupId}"`)

      // Сбрасываем выделение
      this.selectedLayersForGrouping = []
      this.hideContextMenu()
    },

    findExistingGroupByName(groupName) {
      const findGroup = (group) => {
        for (const child of group.children) {
          if (child.type === 'group' && child.name === groupName) {
            return child
          }
          if (child.type === 'group' && child.children) {
            const found = findGroup(child)
            if (found) return found
          }
        }
        return null
      }

      return findGroup(this.rootGroup)
    },

    deleteSelectedLayers(layer = null) {
      let layersToDelete

      if (layer) {
        // Удаляем только текущий слой, если передан
        layersToDelete = [layer]
      } else {
        // Если текущий слой не передан, удаляем выделенные слои
        layersToDelete = this.selectedLayersForGrouping
          .map((selectedId) => {
            const match = selectedId.match(/^(layer-vector|layer-raster|group)-(.*)$/)
            if (!match) {
              console.warn(`Неверный формат selectedId: ${selectedId}`)
              return null
            }

            const [_, type, id] = match // Извлекаем type и id
            return this.findItemById(this.rootGroup, { type, id })
          })
          .filter(Boolean) // Исключаем null/undefined
        this.hideContextMenu()
      }

      if (layersToDelete.length === 0) {
        console.warn('Не удалось найти слои для удаления')
        return
      }

      // Отправляем слои в Vuex
      layersToDelete.forEach((layer) => {
        store
          .dispatch(`layersMain/${layersMainActions.deleteLayerMain}`, layer)
          .then(() => {
            // console.log(`Слой ${layer.type}-${layer.id} успешно удален`)
          })
          .catch((err) => {
            console.error(`Ошибка при удалении слоя ${layer.type}-${layer.id}:`, err)
          })
      })

      // Удаляем слои из rootGroup
      const idsToDelete = layersToDelete.map((l) => `${l.type}-${l.id}`)
      this.removeItemsById(this.rootGroup, idsToDelete)

      // Сбрасываем выделение, если удаляем выбранные элементы
      if (!layer) {
        this.selectedLayersForGrouping = []
      }

      this.hideContextMenu()
      this.updateLayerOrder()
      // console.log('delete')
    },

    handleSelectLayer(leaf) {
      if (leaf.type === 'layer-vector' || leaf.type === 'layer-raster') {
        // this.selectLayer({ layerId: leaf.id, layerType: 'vector', datasetId: leaf.id })
      }
    },

    updateGroupVisibility(group) {
      const isChecked = group.visible
      if (group.children && group.children.length > 0) {
        group.children.forEach((child) => {
          child.visible = isChecked
          store
            .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, {
              ...child,
              visible: isChecked
            })
            .catch((err) => console.error('Ошибка при обновлении ребенка:', err))
        })
      }

      store
        .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, {
          ...group,
          visible: isChecked
        })
        .catch((err) => console.error('Ошибка при обновлении группы:', err))

      // Пересчитать порядок
      this.updateLayerOrder()
      // console.log('Update Group Visibility:', group)
    },

    updateLeafVisibility(item) {
      if (item.type === 'layer-vector' || item.type === 'layer-raster') {
        const updatedLayer = {
          ...item,
          id: item.id
        }

        store
          .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, {
            ...updatedLayer,
            type: item.type // Указываем тип слоя
          })
          .catch((err) => console.error('Ошибка при обновлении слоя:', err))
      } else if (item.type === 'group') {
        // Рекурсивно обновляем видимость детей группы
        item.children.forEach((child) => {
          this.updateLeafVisibility(child)
        })

        // После обновления детей обновляем видимость группы
        const isGroupVisible = item.children.every((child) => child.visible)
        this.$set(item, 'visible', isGroupVisible)
      }
    },

    removeItemsById(parentGroup, idsWithTypes) {
      parentGroup.children = parentGroup.children.filter((child) => {
        const match = idsWithTypes.some(({ type, id }) => type === child.type && id === child.id)
        if (match) {
          return false // Удаляем элемент
        }
        if (child.type === 'group') {
          child.children = this.removeItemsById(child, idsWithTypes)
        }
        return true
      })

      return parentGroup.children
    },

    // Drag and drop methods
    onDragStart({ event, item }) {
      const rect = event.currentTarget.getBoundingClientRect()
      this.initialTop = rect.top

      const { draggedItem, draggingSelection } = onDragStart({
        event,
        item,
        selectedLayersForGrouping: this.selectedLayersForGrouping
      })

      this.draggedItem = draggedItem
      this.draggingSelection = draggingSelection
    },

    onDragOver({ event, item }) {
      const dropPosition = onDragOver({ event, item })
      this.dragOverPosition = dropPosition
      this.dragOverTarget = item
    },

    onDrop({ event, targetItem, dropPosition }) {
      const draggedIds = this.draggingSelection
        .map(({ id, type }) => {
          if (!id || !type) {
            console.warn(`Неверный формат объекта: { id: ${id}, type: ${type} }`)
            return null
          }
          return { id, type }
        })
        .filter(Boolean)

      if (!targetItem || !dropPosition || draggedIds.length === 0) {
        console.warn('Недостаточно данных для перемещения.')
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const offset = event.clientY - rect.top
      const height = rect.height

      this.finalTop = event.clientY

      // Вычисляем соотношение смещения
      const deltaRect = this.initialTop - this.finalTop

      const ratio = parseFloat(deltaRect) / parseFloat(height)

      // Проверка для верхней и нижней границы

      if (
        (dropPosition === 'before' && ratio < 0.5 && ratio > -1.5) ||
        (dropPosition === 'after' && ratio > -1.5 && ratio < 0.5)
      ) {
        console.warn('Элемент не сдвинулся достаточно, перемещение отменено.')
        return
      }

      const updatedGroup = onDrop({
        event,
        rootGroup: this.rootGroup,
        draggingSelection: draggedIds,
        targetItem,
        dropPosition,
        findParentGroupById: this.findParentGroupById
      })

      if (JSON.stringify(this.rootGroup) !== JSON.stringify(updatedGroup)) {
        this.rootGroup = updatedGroup
        this.updateLayerOrder()
        console.log('Update ONDROP')
      } else {
        console.warn('rootGroup не изменился после onDrop')
      }

      this.resetDragState()
    },

    resetDragState() {
      const state = resetDragState()
      this.draggedItem = state.draggedItem
      this.dragOverTarget = state.dragOverTarget
      this.dragOverPosition = state.dragOverPosition
      this.draggingSelection = state.draggingSelection
    },

    onDragEnd() {
      this.draggedItem = null
      this.dragOverTarget = null
      this.dragOverPosition = null
    },

    onDragLeave({ event, item }) {
      // Можно обработать при необходимости
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-modal-container {
  position: fixed;
  z-index: 300;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + 240px), -50%);

  max-width: 473px;
  height: 358px;
}

.aside {
  &__search {
    width: calc(100% - 20px);
    margin: 0 10px 10px 10px;
    position: relative;

    .icon-close {
      z-index: 2;
      top: calc(50%);
      transform: translateY(-50%);
    }

    input {
      position: relative;
      z-index: 1;
      padding: 7px 30px 7px 30px;
      background-color: transparent;
      border: none;
      width: 100%;
      outline: none;

      &::placeholder {
        font-size: 16px;
      }
    }

    svg {
      position: absolute;
      top: calc(50% - 2px);
      left: 0;
      height: 18px;
      width: 18px;
      transform: translateY(-50%);

      * {
        stroke: $primary-color_2 !important;
      }
    }
  }
}

.layer-list {
  &__loader {
    position: fixed;
    bottom: 64px;
    left: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__wrap {
    position: fixed;
    width: 100%;
    inset: 0;
    height: 100%;
    z-index: 111;
  }
}
</style>

<style lang="scss">
.window__edit-select {
  display: flex;
  justify-content: space-between;
  padding: 0 50px;
  margin-bottom: 24px;
}

.context-menu {
  position: fixed;
  max-width: 200px;
  width: 100%;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  ul {
    width: 100%;
    list-style: none;
    margin: 0;
  }

  li {
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 30px;
    cursor: pointer;
  }
}
</style>
<style lang="scss" scoped>
.vs__selected {
  margin: 0 !important;
  padding-top: 2px;
}

.aside {
  max-height: calc(100% - 50px);
}

.aside__layers {
  width: 100%;
  margin: 10px 0;
  display: grid;
  grid-auto-rows: 1fr auto;
  overflow: auto;
}
</style>
