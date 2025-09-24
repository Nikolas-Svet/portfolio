<template>
  <li
    :class="[
      { 'selected-for-group': isSelected(item) },
      dropPosition === 'before' ? 'drag-over-before' : '',
      dropPosition === 'after' ? 'drag-over-after' : '',
      dropPosition === 'inside' ? 'drag-over-inside' : '',
      { active_li: currentItemId === item.id || selectedLayerMainEdit.id === item.id },
    ]"
    :data-id="item.type + '-' + item.id"
    :style="{ display: item.name.startsWith('for_delete_layer') ? 'none' : 'flex' }"
    draggable="true"
    @dragend="handleDragEnd"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @dragstart="handleDragStart"
    @drop="handleDrop"
  >
    <!-- Группа -->
    <div
      v-if="item.type === 'group'"
      class="layer-header"
      style="cursor: pointer !important"
      @contextmenu.prevent="contextMenu($event, item)"
    >
      <toggle
        :style="{ transform: item.expanded ? 'rotate(0)' : 'rotate(180deg)' }"
        style="height: 24px; width: 24px; padding: 8px 5px; margin-right: 4px"
        @click.stop="toggle"
      ></toggle>
      <!--      <span-->
      <!--        class="toggle"-->
      <!--        :class="item.expanded ? '' : 'cancel'"-->
      <!--        @click.stop="toggle"-->
      <!--      ></span>-->
      <div class="checkbox">
        <input
          :id="'group-visible-' + item.type + '-' + item.id"
          :checked="item.visible"
          type="checkbox"
          @change="toggleGroupVisibility($event)"
        />
        <label :for="'group-visible-' + item.type + '-' + item.id"></label>
      </div>
      <template v-if="isEditing">
        <input
          ref="editInput"
          v-model="editableName"
          class="group-edit-input"
          type="text"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
        />
      </template>
      <template v-else>
        <p @dblclick="startEditing">{{ truncatedName(item.name) }}</p>
      </template>
    </div>

    <!-- Слой -->
    <div
      v-else-if="
        item.type === 'layer-vector' ||
        item.type === 'layer-raster' ||
        !item.name.startsWith('for_delete_laye')
      "
      :class="{ 'disabled-layer': !item.bbox_geojson }"
      class="layer-header"
      style="cursor: pointer !important"
      @mouseleave="hideItem(item)"
      @mousemove="hoverItem(item)"
    >
      <!--      @contextmenu.prevent="contextMenu($event, item)"-->
      <div class="checkbox">
        <input
          :id="'layer-visible-' + item.type + '-' + item.id"
          :checked="item.visible"
          type="checkbox"
          @change="toggleLayerVisibility"
        />
        <label :for="'layer-visible-' + item.type + '-' + item.id"></label>
      </div>
      <template v-if="isEditing">
        <input
          ref="editInput"
          v-model="editableName"
          class="layer-edit-input"
          type="text"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
        />
      </template>
      <template v-else style="position: relative">
        <div
          class="layer-item"
          style="width: 100%; cursor: pointer !important"
          @click="item.type === Consts.LayerTypes.VECTOR ? selectEdit(item) : (select(item), handleLegendClick($event, item))"
          @mouseenter="showTooltip(item.id, item.name)"
          @mouseleave="hideTooltip"
        >
          <span
            v-if="hoveredLayerId === item.id"
            class="tooltip-text"
            style="cursor: pointer"
            title="Скопировать имя слоя"
            @click="copyToClipboard(item.name)"
          >
            {{ item.name }}
          </span>
          <p :style="{ opacity: hoveredLayerId ? '0' : '1' }" style="cursor: pointer !important">
            {{ truncatedName(item.name) }}
            <warning
              v-if="item.is_edit || item.id < 0"
              :style="{
                marginRight: item.id < 0 ? '45px' : '20px'
              }"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
            >
            </warning>
          </p>
        </div>
      </template>
      <span
        :class="{ legend__active: isSelectedLegend && item.id === selectedLayerMain.id }"
        :disabled="item.id < 0"
        :style="{
          backgroundColor: item.style?.color || 'transparent',
          border: `2px solid ${item.style?.outlineColor}` || '2px solid #ff0000',
          display: item.id < 0 ? 'none' : 'flex',
        }"
        class="legend"
        @click="select(item);handleLegendClick($event, item)"
      ></span>
      <kebab_menu
        :class="{ 'icon-kebab_menu__active': isSelectedKebab && item.id === selectedLayerMain.id }"
        style="min-width: 24px; margin-left: 8px"
        @click.stop="select(item); handleKebabClick($event, item)"
      ></kebab_menu>
    </div>

    <!-- Дочерние элементы группы -->
    <ul
      v-if="item.type === 'group' && item.children && item.children.length > 0 && item.expanded"
      class="sub-layers"
    >
      <tree-item
        v-for="child in item.children"
        :key="child.type + '-' + child.id"
        ref="treeItems"
        :isSelected="isSelected"
        :item="child"
        :selectedIds="selectedIds"
        :truncatedName="truncatedName"
        @dragEnd="$emit('dragEnd', $event)"
        @dragLeave="$emit('dragLeave', $event)"
        @dragOver="$emit('dragOver', $event)"
        @dragStart="$emit('dragStart', $event)"
        @drop="$emit('drop', $event)"
        @showContextMenu="(...args) => $emit('showContextMenu', ...args)"
      ></tree-item>
    </ul>
  </li>
  <div
    v-if="isTooltipVisible"
    :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
    class="tooltip-warning"
  >
    Изменения не сохранены
  </div>
</template>

<script>
import store from '@/store'
import { layersMainActions } from '@/store/actions/layersMain'
import toggle from '@/components/icons/toggle.vue'
import Kebab_menu from '@/components/icons/kebab_menu.vue'
import Warning from '@/components/icons/warning.vue'
import { Consts } from '@/consts/index.consts'

export default {
  name: 'TreeItem',
  props: {
    item: { type: Object, required: true },
    selectedIds: { type: Array, default: () => [] },
    truncatedName: { type: Function, required: true },
    isSelected: { type: Function, required: true }
  },
  data() {
    return {
      tooltipTimer: null,
      hoveredLayerId: null,
      dropPosition: null,
      isEditing: false,
      editableName: this.item.name,
      currentItem: null,
      isTooltipVisible: false,
      tooltipPosition: { top: 0, left: 0 },
      timer: null
    }
  },
  emits: [
    'showContextMenu',
    'selectLayer',
    'updateGroupVisibility',
    'updateLeafVisibility',
    'dragStart',
    'dragOver',
    'drop',
    'dragEnd',
    'dragLeave',
    'updateItem'
  ],
  components: {
    Warning,
    Kebab_menu,
    toggle
  },
  computed: {
    Consts() {
      return Consts
    },
    currentItemId() {
      return store.getters['treeItemStore/currentItem']
    },
    selectedLayerMainEdit() {
      return store.state.layersMain?.selectedLayerMainEdit
    },
    selectedLayerMain() {
      return store.state.layersMain?.selectedLayerMain
    },
    isSelectedKebab() {
      return store.getters['treeItemStore/isSelectedKebab']
    },
    isSelectedLegend() {
      return store.getters['treeItemStore/isSelectedLegend']
    },
    hoverLayer() {
      return store.state.layersMain?.hoverLayer
    }
  },
  methods: {
    async hoverItem(item) {
      if (!item.visible || this.selectedLayerMainEdit.id === item.id) {
        return
      }
      if (!this.hoverLayer) {
        await store.commit(`layersMain/${layersMainActions.setHoverLayer}`, item)
        return
      }
      if (this.hoverLayer.id === item.id) {
        return
      }
      await store.commit(`layersMain/${layersMainActions.setHoverLayer}`, item)
    },
    async hideItem(item) {
      if (!item.visible) {
        return
      }
      await store.commit(`layersMain/${layersMainActions.setHoverLayer}`, null)
    },
    handleMouseEnter(event, item) {
      this.mouseMoveListener = (e) => {
        this.tooltipPosition = { top: e.clientY - 80, left: e.clientX - 70 }
      }
      window.addEventListener('mousemove', this.mouseMoveListener)

      this.timer = setTimeout(() => {
        this.isTooltipVisible = true
      }, 500)
    },
    handleMouseLeave() {
      // Убираем событие mousemove и очищаем таймер
      window.removeEventListener('mousemove', this.mouseMoveListener)
      clearTimeout(this.timer)
      this.isTooltipVisible = false // Скрываем тултип
    },
    handleKebabClick(e, item) {
      store.dispatch('treeItemStore/SET_SELECTED_LEGEND', false)
      store.dispatch('treeItemStore/SET_SELECTED_KEBAB', true)
      this.contextMenu(e, item)
    },

    handleLegendClick(e, item) {
      setTimeout(() => {
        store.dispatch('treeItemStore/SET_SELECTED_KEBAB', false)
        store.dispatch('treeItemStore/SET_SELECTED_LEGEND', true)
      }, 1)
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log(`📋 Текст "${text}" скопирован в буфер обмена!`)
        })
        .catch((err) => {
          console.error('Ошибка при копировании текста: ', err)
        })
    },

    showTooltip(id, text) {
      if (text.length > 37) {
        this.tooltipTimer = setTimeout(() => {
          this.hoveredLayerId = id
        }, 1000)
      }
    },

    hideTooltip() {
      if (this.tooltipTimer) {
        clearTimeout(this.tooltipTimer)
        this.tooltipTimer = null
      }
      this.hoveredLayerId = null
    },
    triggerRename() {
      this.isEditing = true // Активируем режим редактирования
      this.$nextTick(() => {
        this.$refs.editInput.focus() // Ставим фокус на поле ввода
      })
    },
    startEditing() {
      this.isEditing = true
      this.$nextTick(() => {
        this.$refs.editInput.focus()
      })
    },
    finishEditing() {
      if (this.editableName.trim() !== this.item.name) {
        const newName = this.editableName.trim()

        // Обновление имени для слоя или группы
        this.item.name = newName

        if (this.item.type === 'group') {
          // Логика для группы
          const oldName = this.item.id // Старое имя группы
          this.item.id = `group_${newName}` // Изменяем id группы для консистентности

          // Обновляем поле group у всех слоев, связанных с этой группой
          const updateGroupRecursively = (group) => {
            group.children.forEach((child) => {
              if (child.type === 'layer-vector' || child.type === 'layer-raster') {
                if (child.group === oldName) {
                  child.group = `group_${newName}`

                  // Сохраняем изменения в Vuex
                  this.$emit('updateItem', {
                    ...child,
                    group: `group_${newName}`
                  })
                }
              } else if (child.type === 'group') {
                updateGroupRecursively(child) // Рекурсивно обновляем вложенные группы
              }
            })
          }

          updateGroupRecursively(this.item)
          console.log(`Группа переименована: ${oldName} -> group_${newName}`)
        } else if (this.item.type === 'layer-vector' || this.item.type === 'layer-raster') {
          // Логика для слоя
          console.log(`Слой переименован: ${this.item.name}`)
        }

        // Сохраняем изменения текущего элемента (группа или слой)
        this.$emit('updateItem', this.item)
      }

      this.isEditing = false // Завершаем редактирование
    },
    toggle() {
      this.item.expanded = !this.item.expanded

      const updatedChildren = [...this.item.children].map((child) => ({
        ...child,
        expanded: this.item.expanded
      }))

      updatedChildren.forEach((child) => {
        store.dispatch(`layersMain/${layersMainActions.updateLayerMain}`, child)
      })
    },
    toggleGroupVisibility(event) {
      const isChecked = event.target.checked
      if (this.item.children && this.item.children.length > 0) {
        const updatedChildren = [...this.item.children].map((child) => ({
          ...child,
          visible: isChecked
        }))

        updatedChildren.forEach((child) => {
          store
            .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, child)
            .catch((err) => console.error('Ошибка при обновлении ребенка:', err))
        })

        // this.$set(this.item, 'children', updatedChildren)
      }
    },
    toggleLayerVisibility() {
      const newVisible = !this.item.visible

      // Обновляем видимость слоя
      this.item.visible = newVisible

      // Передаем изменения слоя в Vuex
      store
        .dispatch(`layersMain/${layersMainActions.updateLayerMain}`, {
          ...this.item,
          visible: newVisible
        })
        .catch((err) => console.error('Ошибка при обновлении слоя:', err))
    },
    contextMenu(e, item) {
      this.$emit('showContextMenu', e, item)
    },
    select(layer) {
      store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMain}`, layer)
    },
    selectEdit(layer) {
      if (layer.visible) {
        store.dispatch(`layersMain/${layersMainActions.setSelectedLayerMainEdit}`, layer)
      } else {
        window.$notify('Cлой не отображен на карте', true)
      }
    },
    handleDragStart(e) {
      e.stopPropagation()
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ id: this.item.id, type: this.item.type })
      )
      e.dataTransfer.effectAllowed = 'move'
      this.$emit('dragStart', { event: e, item: this.item })
    },
    handleDragOver(e) {
      e.preventDefault()
      e.stopPropagation()

      const rect = e.currentTarget.getBoundingClientRect()
      const offset = e.clientY - rect.top
      const height = rect.height

      const zoneHeight = height / 2

      if (offset < zoneHeight) {
        this.dropPosition = 'before'
      } else if (offset > height - zoneHeight) {
        this.dropPosition = 'after'
      } else if (this.item.type === 'group') {
        this.dropPosition = 'inside'
      } else {
        this.dropPosition = 'after'
      }

      if (this.item.type === 'group' && (!this.item.children || this.item.children.length === 0)) {
        this.dropPosition = 'inside'
      }

      e.dataTransfer.dropEffect = 'move'
      this.$emit('dragOver', { event: e, item: this.item, dropPosition: this.dropPosition })
    },
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      this.$emit('drop', {
        event: e,
        targetItem: this.item,
        dropPosition: this.dropPosition
      })
      this.dropPosition = null
    },
    handleDragEnd(e) {
      e.stopPropagation()
      this.dropPosition = null
      this.$emit('dragEnd', { event: e, item: this.item })
    },
    handleDragLeave(e) {
      e.stopPropagation()
      this.dropPosition = null
      this.$emit('dragLeave', { event: e, item: this.item })
    }
  }
}
</script>
<style lang="scss" scoped>
.tooltip-warning {
  z-index: 10;
  position: absolute;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  width: 188px;
  pointer-events: none; /* Чтобы тултип не мешал взаимодействию */
}

.layer-item {
  p {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .icon-warning {
      &:hover {
        * {
          stroke: #fad12e;
        }
      }
    }
  }

  svg {
    margin-right: 20px;
  }
}

.tooltip-text {
  position: absolute;
  top: 50%;
  left: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  transform: translate(0, -50%);
  width: 100% !important;
  height: fit-content !important;
  max-width: 350px;
  text-wrap: wrap;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
  z-index: 10;
}

.disabled-layer {
  //opacity: 0.5; // Делаем слой визуально неактивным
}

.legend {
  height: 25px;
  min-width: 25px;

  &:hover {
    transform: scale(1.15);
  }

  &__active {
    transform: scale(1.15);
  }
}

.draggable-item {
  cursor: grab;
  transition: all 0.2s ease;
}

.sub-layer-item {
  display: flex;
  align-items: center;
}

.sub-layer-item p,
.sub-layer-item input {
  flex: 1;
}

.sub-layer-item.editing p {
  display: none;
}

.layer-header input[type='text'],
.sub-layer-item input[type='text'] {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 0;
  outline: none;
  margin-right: 8px;
}

.sub-layer-item input[type='text'] {
  margin-bottom: -4px;
}

.first-layer {
}

.layer-list {
  padding-left: 0;

  li {
    padding: 8px 10px;
    list-style-type: none;
    flex-direction: column;
    align-items: flex-start !important;

    .layer-header {
      height: 20.5px;
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;

      &:disabled {
        background-color: red !important;
      }

      p {
        user-select: none;
        position: relative;
        cursor: default;
        width: 100%;
        font-size: 17px;
        flex: 1;
      }

      .toggle {
        position: relative;
        cursor: pointer;
        margin-right: 12px;
        min-width: 14px;
        height: 14px;

        &:hover {
          opacity: 0.8;
        }

        &:after {
          content: '';
          position: absolute;
          height: 1.5px;
          width: 8px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &.cancel {
          &:before {
            content: '';
            position: absolute;
            height: 1.5px;
            width: 8px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(90deg);
          }
        }
      }

      input[type='checkbox'] {
        margin-right: 10px;
      }
    }

    .sub-layers {
      width: calc(100% - 34px);
      list-style: none;
      margin-left: 34px;
      opacity: 1;
      transition: 0.4s all ease;
      position: relative;

      li {
        margin-left: 16px;
        display: flex;
        padding: 9px 0;
        align-items: end;
        position: relative;

        &:first-child {
          .legend {
            margin-right: 0;
          }
        }

        p {
          cursor: pointer;
          display: flex;
          align-items: end;
          max-height: 20.5px;
        }

        &:first-child {
          margin-top: 7px;

          //&:after {
          //  top: calc(50% + 8px);
          //}
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
